package handlers

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleListFiles(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		currentFolder := c.Query("folder")

		searchPrefix := userID + "/"
		if currentFolder != "" {
			searchPrefix = userID + "/" + strings.Trim(currentFolder, "/") + "/"
		}

		ctx := c.Context()
		objectCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix:    searchPrefix,
			Recursive: false,
		})

		var activeFiles []FileResponse
		var activeFolders []DirectoryResponse
		var totalStats int64
		fileIndex := 1

		for object := range objectCh {
			if strings.HasSuffix(object.Key, "/") {
				parts := strings.Split(strings.TrimSuffix(object.Key, "/"), "/")
				activeFolders = append(activeFolders, DirectoryResponse{Name: parts[len(parts)-1], NodeCount: 1})
				continue
			}

			parts := strings.Split(object.Key, "/")
			fileName := parts[len(parts)-1]
			if fileName == "" || fileName == ".placeholder" {
				continue
			}

			totalStats += object.Size
			activeFiles = append(activeFiles, FileResponse{
				ID: strconv.Itoa(fileIndex), FileName: fileName, ObjectName: object.Key,
				FileSize: object.Size, CreatedAt: object.LastModified.Format("2006-01-02T15:04:05Z"),
			})
			fileIndex++
		}

		allObjectsCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix: userID + "/", Recursive: true,
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
			"files": activeFiles, "directories": activeFolders,
			"stats": StreamStatsResponse{UsedStorageBytes: aggregateGlobalBytes, TotalFilesCount: aggregateFilesCount},
		})
	}
}

func HandleCreateFolder(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			UserID     string `json:"user_id"`
			FolderName string `json:"folder_name"`
			ParentPath string `json:"parent_path"`
		}
		c.BodyParser(&req)

		placeholderKey := fmt.Sprintf("%s/%s/.placeholder", req.UserID, req.FolderName)
		if req.ParentPath != "" {
			placeholderKey = fmt.Sprintf("%s/%s/%s/.placeholder", req.UserID, strings.Trim(req.ParentPath, "/"), req.FolderName)
		}

		ctx := c.Context()
		_, err := storage.Client.PutObject(ctx, cfg.BucketName, placeholderKey, strings.NewReader(""), 0, minio.PutObjectOptions{
			ContentType: "application/x-directory",
		})
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Folder creation failed"})
		}
		return c.JSON(fiber.Map{"status": "Success", "folder": req.FolderName})
	}
}
