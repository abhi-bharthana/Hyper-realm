package handlers

import (
	"encoding/json"
	"log"
	"path/filepath"
	"strconv"
	"strings"

	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/events"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

// HandleUploadChunk handles incoming binary shards for active multipart sessions
func HandleUploadChunk(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		uploadID := c.FormValue("upload_id")
		objectName := c.FormValue("object_name")
		partNumberStr := c.FormValue("part_number")
		fileHash := c.FormValue("file_id") // 🚀 NAYA: Front-end se resume tracking ke liye

		if uploadID == "" || objectName == "" || partNumberStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "upload_id, object_name, and part_number are required"})
		}

		partNumber, _ := strconv.Atoi(partNumberStr)
		fileHeader, err := c.FormFile("chunk")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Binary chunk payload missing"})
		}

		file, _ := fileHeader.Open()
		defer file.Close()

		ctx := c.Context()
		partInfo, err := storage.UploadChunkPart(ctx, cfg.BucketName, objectName, uploadID, partNumber, file, fileHeader.Size)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Chunk transaction rejected by Ceph"})
		}

		// 🚀 CACHE: Update progress for resumable uploads
		if fileHash != "" {
			_ = cache.SaveUploadProgress(ctx, fileHash, partNumber)
		}

		return c.JSON(fiber.Map{"part_number": partNumber, "etag": partInfo.ETag})
	}
}

// HandleCompleteUpload finalizes the multipart stream and triggers Kafka AI Workers
func HandleCompleteUpload(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		uploadID := c.Query("upload_id")
		objectName := c.Query("object_name")
		totalSizeStr := c.Query("total_size")

		totalSize, _ := strconv.ParseInt(totalSizeStr, 10, 64)
		ctx := c.Context()

		allowed, currentUsage := cache.CheckStorageQuota(ctx, userID, totalSize, cfg.MaxUploadGB)
		if !allowed {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "5GB Storage Limit Exceeded!", "current_usage": currentUsage})
		}

		var parts []minio.CompletePart
		if err := c.BodyParser(&parts); err != nil && len(c.Body()) > 0 {
			_ = json.Unmarshal(c.Body(), &parts)
		}

		_, err := storage.CompleteMultipart(ctx, cfg.BucketName, objectName, uploadID, parts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ceph cluster rejected parts assembly"})
		}

		newUsage := cache.AddStorageUsage(ctx, userID, totalSize)

		// 🚀 THE PRO MOVE: ASYNC KAFKA EVENT TRIGGER FOR MEDIA WORKER
		ext := strings.ToLower(filepath.Ext(objectName))
		if ext == ".mkv" || ext == ".mp4" || ext == ".mov" || ext == ".webm" {
			go func() {

				err := events.PublishVisionTask(objectName, objectName)
				if err != nil {
					log.Printf("❌ [KAFKA] Failed to trigger media worker: %v", err)
				} else {
					log.Printf("🎬 [KAFKA] Media Task Dispatched for: %s", objectName)
				}
			}()
		}

		return c.JSON(fiber.Map{"status": "Success", "file": objectName, "used_storage_bytes": newUsage})
	}
}
