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
		fileHash := c.FormValue("file_id")

		if uploadID == "" || objectName == "" || partNumberStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "upload_id, object_name, and part_number are required"})
		}

		partNumber, _ := strconv.Atoi(partNumberStr)

		// 🚀 FIX: Better Error Handling for File Header
		fileHeader, err := c.FormFile("chunk")
		if err != nil {
			log.Printf("❌ [FILE_FORM_ERROR] Missing chunk payload: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Binary chunk payload missing or corrupt"})
		}

		// 🚀 FIX: Catch OS level temp file open errors
		file, err := fileHeader.Open()
		if err != nil {
			log.Printf("❌ [FILE_OPEN_ERROR] Could not open chunk buffer: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Server failed to read chunk buffer"})
		}
		defer file.Close()

		ctx := c.Context()
		partInfo, err := storage.UploadChunkPart(ctx, cfg.BucketName, objectName, uploadID, partNumber, file, fileHeader.Size)

		if err != nil {
			log.Printf("❌ [CEPH_REJECTED] Obj: %s, UploadID: %s, Part: %d, Err: %v", objectName, uploadID, partNumber, err)

			// 🚀 SMART RESUME BREAKER (Self-Healing Ecosystem)
			// Agar Ceph MinIO upload session ko bhool chuka hai, toh Redis ka kachra bhi saaf karo!
			if strings.Contains(err.Error(), "NoSuchUpload") || strings.Contains(err.Error(), "InvalidUploadId") {
				if fileHash != "" {
					log.Printf("🧹 [SELF-HEALING] Wiping dead session from Redis for Hash: %s", fileHash)
					cache.Client.Del(ctx, "upload_id_session:"+fileHash)
				}
			}

			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Chunk transaction rejected by Ceph",
				"details": err.Error(),
			})
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
			log.Printf("❌ [CEPH_ASSEMBLY_ERROR] Failed to assemble parts: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ceph cluster rejected parts assembly", "details": err.Error()})
		}

		newUsage := cache.AddStorageUsage(ctx, userID, totalSize)

		// 🚀 THE PRO MOVE: ASYNC KAFKA EVENT TRIGGER ROUTER (SMART DISTRIBUTION)
		ext := strings.ToLower(filepath.Ext(objectName))

		// 🎬 VIDEOS KE LIYE -> MEDIA WORKER (HLS & Whisper AI)
		if ext == ".mkv" || ext == ".mp4" || ext == ".mov" || ext == ".webm" {
			go func() {
				err := events.PublishMediaTask(objectName, objectName)
				if err != nil {
					log.Printf("❌ [KAFKA] Failed to trigger media worker: %v", err)
				} else {
					log.Printf("🎬 [KAFKA] Media Task Dispatched for: %s", objectName)
				}
			}()
		} else if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp" {
			// 🧠 IMAGES KE LIYE -> VISION WORKER (Computer Vision)
			go func() {
				err := events.PublishVisionTask(objectName, objectName)
				if err != nil {
					log.Printf("❌ [KAFKA] Failed to trigger vision worker: %v", err)
				} else {
					log.Printf("🧠 [KAFKA] Vision Task Dispatched for: %s", objectName)
				}
			}()
		}

		return c.JSON(fiber.Map{"status": "Success", "file": objectName, "used_storage_bytes": newUsage})
	}
}
