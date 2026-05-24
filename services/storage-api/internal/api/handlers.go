package api

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

type FileResponse struct {
	ID         string `json:"id"`
	FileName   string `json:"file_name"`
	ObjectName string `json:"object_name"`
	FileSize   int64  `json:"file_size"`
	CreatedAt  string `json:"created_at"`
}

type DirectoryResponse struct {
	Name      string `json:"name"`
	NodeCount int    `json:"node_count"`
	TotalSize int64  `json:"total_size"`
}

type StreamStatsResponse struct {
	UsedStorageBytes int64 `json:"used_storage_bytes"`
	TotalFilesCount  int   `json:"total_files_count"`
}

func HandleInitChunkUpload(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.FormValue("user_id")
		fileName := c.FormValue("file_name")
		prefix := c.FormValue("prefix")

		if userID == "" || fileName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id and file_name are required"})
		}

		objectName := fmt.Sprintf("%s/%s", userID, fileName)
		if prefix != "" {
			objectName = fmt.Sprintf("%s/%s/%s", userID, strings.Trim(prefix, "/"), fileName)
		}

		// Default fallback for binary streams
		safeContentType := "application/octet-stream"
		ext := strings.ToLower(filepath.Ext(fileName))

		switch ext {
		// 🖼️ IMAGES EXTENSIONS
		case ".png":
			safeContentType = "image/png"
		case ".jpg", ".jpeg":
			safeContentType = "image/jpeg"
		case ".gif":
			safeContentType = "image/gif"
		case ".svg":
			safeContentType = "image/svg+xml"
		case ".webp":
			safeContentType = "image/webp"
		case ".ico":
			safeContentType = "image/x-icon"

		// 🎬 VIDEOS & MEDIA STREAMING STREAM
		case ".mp4":
			safeContentType = "video/mp4"
		case ".webm":
			safeContentType = "video/webm"
		case ".ogv":
			safeContentType = "video/ogg"
		case ".mkv":
			safeContentType = "video/x-matroska"
		case ".mov":
			safeContentType = "video/quicktime"
		case ".mp3":
			safeContentType = "audio/mpeg"
		case ".wav":
			safeContentType = "audio/wav"

		// 📄 DOCUMENTS & PORTABLE FORMATS
		case ".pdf":
			safeContentType = "application/pdf"
		case ".txt":
			safeContentType = "text/plain"

		// 💻 SOURCE CODE FILES & DEVELOPER COMPILER STRUCT (Forces clean rendering layout inside browser plain context)
		case ".json":
			safeContentType = "application/json"
		case ".xml":
			safeContentType = "application/xml"
		case ".html", ".htm":
			safeContentType = "text/html"
		case ".css":
			safeContentType = "text/css"
		case ".js", ".mjs":
			safeContentType = "application/javascript"
		case ".ts", ".tsx":
			safeContentType = "text/plain" // Browser easily shows TS files as clean text
		case ".go":
			safeContentType = "text/plain" // Shows Golang source matrix directly in windows
		case ".py":
			safeContentType = "text/plain" // Python script data preview
		case ".yaml", ".yml":
			safeContentType = "text/plain" // Hyper-Realm cluster configurations
		case ".md":
			safeContentType = "text/plain" // Markdowns layout read out
		case ".sh", ".bash":
			safeContentType = "text/plain" // Shell script arrays
		}

		ctx := c.Context()
		uploadID, err := storage.InitMultipart(ctx, cfg.BucketName, objectName, safeContentType)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to init chunk pipeline", "details": err.Error()})
		}

		return c.JSON(fiber.Map{"upload_id": uploadID, "object_name": objectName})
	}
}

// 2️⃣ CHUNK UPLOAD TRANSACTIONS HANDLE
func HandleUploadChunk(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		uploadID := c.FormValue("upload_id")
		objectName := c.FormValue("object_name")
		partNumberStr := c.FormValue("part_number")

		if uploadID == "" || objectName == "" || partNumberStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "upload_id, object_name, and part_number are required"})
		}

		partNumber, err := strconv.Atoi(partNumberStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid part_number format"})
		}

		fileHeader, err := c.FormFile("chunk")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Binary chunk payload missing"})
		}

		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to open chunk stream"})
		}
		defer file.Close()

		ctx := c.Context()
		partInfo, err := storage.UploadChunkPart(ctx, cfg.BucketName, objectName, uploadID, partNumber, file, fileHeader.Size)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Chunk transaction rejected by Ceph"})
		}

		return c.JSON(fiber.Map{"part_number": partNumber, "etag": partInfo.ETag})
	}
}

// 3️⃣ COMPLETE MULTIPART COMPOSITION ASSEMBLE
func HandleCompleteUpload(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		uploadID := c.Query("upload_id")
		objectName := c.Query("object_name")
		totalSizeStr := c.Query("total_size")

		if userID == "" || uploadID == "" || objectName == "" || totalSizeStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required query parameters"})
		}

		totalSize, err := strconv.ParseInt(totalSizeStr, 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid total_size format"})
		}

		ctx := c.Context()
		allowed, currentUsage := cache.CheckStorageQuota(ctx, userID, totalSize, cfg.MaxUploadGB)
		if !allowed {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "5GB Storage Limit Exceeded!", "current_usage": currentUsage})
		}

		var parts []minio.CompletePart
		if err := c.BodyParser(&parts); err != nil {
			if len(c.Body()) > 0 {
				_ = json.Unmarshal(c.Body(), &parts)
			}
		}

		_, err = storage.CompleteMultipart(ctx, cfg.BucketName, objectName, uploadID, parts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ceph cluster rejected parts assembly"})
		}

		newUsage := cache.AddStorageUsage(ctx, userID, totalSize)
		return c.JSON(fiber.Map{"status": "Success", "file": objectName, "used_storage_bytes": newUsage})
	}
}

// 4️⃣ DYNAMIC LIVE CLUSTER OBJECTS SCANNER
func HandleListFiles(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		currentFolder := c.Query("folder") // Target subdirectory path navigation

		if userID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id is required"})
		}

		// Calculate exact system recursive prefix search bounds
		searchPrefix := userID + "/"
		if currentFolder != "" {
			searchPrefix = userID + "/" + strings.Trim(currentFolder, "/") + "/"
		}

		ctx := c.Context()
		objectCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix:    searchPrefix,
			Recursive: false, // Set false to cleanly separate immediate child folders
		})

		var activeFiles []FileResponse
		var activeFolders []DirectoryResponse
		var totalStats int64
		fileIndex := 1

		for object := range objectCh {
			if object.Err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read storage cluster nodes"})
			}

			// Clean Folder processing check
			if strings.HasSuffix(object.Key, "/") {
				parts := strings.Split(strings.TrimSuffix(object.Key, "/"), "/")
				folderName := parts[len(parts)-1]
				activeFolders = append(activeFolders, DirectoryResponse{
					Name:      folderName,
					NodeCount: 1, // Scaled automatically via virtual mappings
					TotalSize: 0,
				})
				continue
			}

			// File Processing mapping
			parts := strings.Split(object.Key, "/")
			fileName := parts[len(parts)-1]
			if fileName == "" || fileName == ".placeholder" {
				continue
			}

			totalStats += object.Size
			activeFiles = append(activeFiles, FileResponse{
				ID:         strconv.Itoa(fileIndex),
				FileName:   fileName,
				ObjectName: object.Key,
				FileSize:   object.Size,
				CreatedAt:  object.LastModified.Format("2006-01-02T15:04:05Z"),
			})
			fileIndex++
		}

		// Calculate overall global stats for metrics synchronizations
		allObjectsCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix:    userID + "/",
			Recursive: true,
		})

		var aggregateGlobalBytes int64
		var aggregateFilesCount int
		for obj := range allObjectsCh {
			if !strings.HasSuffix(obj.Key, "/") && filepath.Base(obj.Key) != ".placeholder" {
				aggregateGlobalBytes += obj.Size
				aggregateFilesCount++
			}
		}

		return c.JSON(fiber.Map{
			"files":       activeFiles,
			"directories": activeFolders,
			"stats": StreamStatsResponse{
				UsedStorageBytes: aggregateGlobalBytes,
				TotalFilesCount:  aggregateFilesCount,
			},
		})
	}
}

// 5️⃣ INITIALIZE VIRTUAL FOLDER NODE
func HandleCreateFolder(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			UserID     string `json:"user_id"`
			FolderName string `json:"folder_name"`
			ParentPath string `json:"parent_path"`
		}
		if err := c.BodyParser(&req); err != nil || req.UserID == "" || req.FolderName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload validation schemas"})
		}

		// S3 creates empty virtual paths via standard .placeholder empty content key injection
		placeholderKey := fmt.Sprintf("%s/%s/.placeholder", req.UserID, req.FolderName)
		if req.ParentPath != "" {
			placeholderKey = fmt.Sprintf("%s/%s/%s/.placeholder", req.UserID, strings.Trim(req.ParentPath, "/"), req.FolderName)
		}

		ctx := c.Context()
		emptyReader := strings.NewReader("")
		_, err := storage.Client.PutObject(ctx, cfg.BucketName, placeholderKey, emptyReader, 0, minio.PutObjectOptions{
			ContentType: "application/x-directory",
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to map network folder node allocation"})
		}

		return c.JSON(fiber.Map{"status": "Success", "folder": req.FolderName})
	}
}

// 6️⃣ REJECT/DELETE ASSET ARCHIVE NODE
func HandleDeleteAsset(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		objectKey := c.Query("object_key")
		userID := c.Query("user_id")
		if objectKey == "" || userID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key and user_id are required parameters"})
		}

		ctx := c.Context()

		// Fetch size before dump to decrement cache synchronization records safely
		objInfo, err := storage.Client.StatObject(ctx, cfg.BucketName, objectKey, minio.StatObjectOptions{})
		var sizeToDecrement int64 = 0
		if err == nil {
			sizeToDecrement = objInfo.Size
		}

		err = storage.Client.RemoveObject(ctx, cfg.BucketName, objectKey, minio.RemoveObjectOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ceph backend refused node deletion cycle"})
		}

		// Sync current byte values inside Redis Cache pool negative increment offset
		_ = cache.AddStorageUsage(ctx, userID, -sizeToDecrement)

		return c.JSON(fiber.Map{"status": "Success", "deleted_node": objectKey})
	}
}
