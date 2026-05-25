package handlers

import (
	"fmt"
	"strings"

	"hyper-realm/storage-api/internal/audit" // 🎯 ADDED: Audit engine framework
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

type DirManageRequest struct {
	UserID      string `json:"user_id"`
	CurrentPath string `json:"current_path"`  // e.g., "ABHI" ya "ABHI/SUBFOLDER"
	NewPathName string `json:"new_path_name"` // e.g., "ABHI_NEW" ya "TARGET_FOLDER/ABHI"
}

func HandleManageDirectory(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req DirManageRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid directory operational schema"})
		}

		if req.UserID == "" || req.CurrentPath == "" || req.NewPathName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required identification metadata strings"})
		}

		ctx := c.Context()
		srcPrefix := fmt.Sprintf("%s/%s/", req.UserID, strings.Trim(req.CurrentPath, "/"))
		destPrefix := fmt.Sprintf("%s/%s/", req.UserID, strings.Trim(req.NewPathName, "/"))

		if srcPrefix == destPrefix {
			return c.JSON(fiber.Map{"message": "Source mismatch directory identifier already aligned"})
		}

		// 🎯 RECURSIVE SHARD RE-INDEXING LOOP
		objectCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix:    srcPrefix,
			Recursive: true,
		})

		for obj := range objectCh {
			if obj.Err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Stream iterator crashed inside target directory allocation"})
			}

			// Calculate target inner structural path matching destination bounds
			relativeSubKey := strings.TrimPrefix(obj.Key, srcPrefix)
			targetNewKey := destPrefix + relativeSubKey

			srcOpts := minio.CopySrcOptions{Bucket: cfg.BucketName, Object: obj.Key}
			dstOpts := minio.CopyDestOptions{Bucket: cfg.BucketName, Object: targetNewKey}

			// Copy cluster block replica over to updated destination matrix prefix namespace
			_, err := storage.Client.CopyObject(ctx, dstOpts, srcOpts)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Sub-node metadata replication failed"})
			}

			// Drop deep trace legacy record reference immediately
			_ = storage.Client.RemoveObject(ctx, cfg.BucketName, obj.Key, minio.RemoveObjectOptions{})
		}

		// 🎯 FOOTPRINT CAPTURE: Logging whole structural directory modification at once
		audit.LogAction(ctx, req.UserID, "MOVE", req.CurrentPath, fmt.Sprintf("Relocated/Renamed virtual folder architecture block to: %s", req.NewPathName))

		return c.JSON(fiber.Map{"status": "SUCCESS", "allocated_path": req.NewPathName})
	}
}
