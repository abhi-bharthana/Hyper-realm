package handlers

import (
	"crypto/md5"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
)

func HandleInitChunkUpload(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.FormValue("user_id")
		fileName := c.FormValue("file_name")
		fileSizeStr := c.FormValue("file_size") // 🎯 ADDED: Tracking file size to compute strict unique hashes
		prefix := c.FormValue("prefix")

		if userID == "" || fileName == "" || fileSizeStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id, file_name, and file_size are highly required"})
		}

		// 🎯 RESUMABLE SESSION MAPPING HASH IDENTIFIER
		uniqueFileToken := fmt.Sprintf("%s_%s_%s", userID, fileName, fileSizeStr)
		fileHash := fmt.Sprintf("%x", md5.Sum([]byte(uniqueFileToken)))

		redisSessionKey := fmt.Sprintf("upload_id_session:%s", fileHash)
		ctx := c.Context()

		// 🕵️ Check if an active multi-part transaction id already exists in Redis
		existingUploadID, err := cache.Client.Get(ctx, redisSessionKey).Result()

		// Calculate target object name up front
		objectName := fmt.Sprintf("%s/%s", userID, fileName)
		if prefix != "" {
			objectName = fmt.Sprintf("%s/%s/%s", userID, strings.Trim(prefix, "/"), fileName)
		}

		if err == nil && existingUploadID != "" {
			// 🔥 CACHE HIT: Resume session by instantly returning existing upload descriptors
			lastSavedPart, _ := cache.GetUploadProgress(ctx, fileHash)
			return c.JSON(fiber.Map{
				"upload_id":        existingUploadID,
				"object_name":      objectName,
				"file_id":          fileHash,
				"resume_from_part": lastSavedPart,
				"msg":              "RESUMING_ACTIVE_STREAM_SESSION",
			})
		}

		// Content Type resolution mapping
		safeContentType := "application/octet-stream"
		ext := strings.ToLower(filepath.Ext(fileName))

		switch ext {
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
		case ".mp4":
			safeContentType = "video/mp4"
		case ".webm":
			safeContentType = "video/webm"
		case ".mkv":
			safeContentType = "video/x-matroska"
		case ".mov":
			safeContentType = "video/quicktime"
		case ".pdf":
			safeContentType = "application/pdf"
		case ".txt", ".go", ".py", ".ts", ".tsx", ".js", ".json", ".yaml", ".yml", ".md":
			safeContentType = "text/plain"
		}

		// 🎬 INITIALIZE NEW MULTIPART IN CEPH CLUSTER
		uploadID, err := storage.InitMultipart(ctx, cfg.BucketName, objectName, safeContentType)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to init chunk pipeline", "details": err.Error()})
		}

		// 💾 CACHE NEW SESSION METADATA ATOMICALLY
		// Store the mapping between file hash and uploadID with a 24-hour lease window
		_ = cache.Client.Set(ctx, redisSessionKey, uploadID, 24*time.Hour).Err()
		_ = cache.SaveUploadProgress(ctx, fileHash, 0) // Initialize part tracking buffer at index 0

		return c.JSON(fiber.Map{
			"upload_id":        uploadID,
			"object_name":      objectName,
			"file_id":          fileHash,
			"resume_from_part": 0,
			"msg":              "NEW_STREAM_SESSION_ALLOCATED",
		})
	}
}
