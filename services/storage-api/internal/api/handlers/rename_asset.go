package handlers

import (
	"fmt"
	"path/filepath"
	"strings"

	"hyper-realm/storage-api/internal/audit"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleRenameAsset(cfg config.Config) fiber.Handler {
	type RenameRequest struct {
		UserID       string `json:"user_id"`
		SrcObjectKey string `json:"src_object_key"`
		NewName      string `json:"new_name"`
	}

	return func(c *fiber.Ctx) error {
		var req RenameRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payload invalid"})
		}

		dirPath := filepath.Dir(req.SrcObjectKey)
		destObjectKey := fmt.Sprintf("%s/%s", dirPath, req.NewName)

		ctx := c.Context()
		srcOpts := minio.CopySrcOptions{Bucket: cfg.BucketName, Object: req.SrcObjectKey}
		dstOpts := minio.CopyDestOptions{Bucket: cfg.BucketName, Object: destObjectKey}

		_, err := storage.Client.CopyObject(ctx, dstOpts, srcOpts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Rename replica copy block execution rejected"})
		}

		// Drop old source legacy object from the bucket array topology
		_ = storage.Client.RemoveObject(ctx, cfg.BucketName, req.SrcObjectKey, minio.RemoveObjectOptions{})

		// Extract fallback parsing if client tracking context misses the variable parameter
		userID := req.UserID
		if userID == "" {
			pathParts := strings.Split(strings.TrimPrefix(req.SrcObjectKey, "/"), "/")
			if len(pathParts) > 0 && pathParts[0] != "" {
				userID = pathParts[0]
			} else {
				userID = "abhishek-babu-node"
			}
		}

		// 🎯 FIXED: Saving audit logs on BOTH old and new target paths so context never breaks
		audit.LogAction(ctx, userID, "RENAME", req.SrcObjectKey, fmt.Sprintf("File name mutated to: %s", req.NewName))
		audit.LogAction(ctx, userID, "RENAME", destObjectKey, fmt.Sprintf("File created via rename from legacy shard: %s", filepath.Base(req.SrcObjectKey)))

		return c.JSON(fiber.Map{"status": "SUCCESS", "renamed_key": destObjectKey})
	}
}
