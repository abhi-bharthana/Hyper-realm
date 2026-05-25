package handlers

import (
	"fmt"
	"path/filepath"

	"hyper-realm/storage-api/internal/audit"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleMoveAsset(cfg config.Config) fiber.Handler {
	type MoveRequest struct {
		UserID       string `json:"user_id"`
		SrcObjectKey string `json:"src_object_key"`
		TargetFolder string `json:"target_folder"`
		FileName     string `json:"file_name"`
	}

	return func(c *fiber.Ctx) error {
		var req MoveRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payload invalid"})
		}

		// Compute the exact target destination path in the cluster
		var destObjectKey string
		if req.TargetFolder == "" {
			destObjectKey = req.FileName
		} else {
			destObjectKey = fmt.Sprintf("%s/%s", req.TargetFolder, req.FileName)
		}

		ctx := c.Context()
		srcOpts := minio.CopySrcOptions{Bucket: cfg.BucketName, Object: req.SrcObjectKey}
		dstOpts := minio.CopyDestOptions{Bucket: cfg.BucketName, Object: destObjectKey}

		// 1. Copy object to the new structural destination cluster path
		_, err := storage.Client.CopyObject(ctx, dstOpts, srcOpts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to relocate asset cluster block"})
		}

		// 2. Remove the old legacy source file node from MinIO bucket
		err = storage.Client.RemoveObject(ctx, cfg.BucketName, req.SrcObjectKey, minio.RemoveObjectOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to purge source node replica"})
		}

		userID := req.UserID
		if userID == "" {
			userID = "abhishek-babu-node" // Fallback guard
		}

		// 🎯 FIXED: Saving tracking footprints on BOTH paths so timeline remains completely unbroken
		audit.LogAction(ctx, userID, "MOVE", req.SrcObjectKey, fmt.Sprintf("Asset shifted out to folder path: /%s", req.TargetFolder))
		audit.LogAction(ctx, userID, "MOVE", destObjectKey, fmt.Sprintf("Asset received via relocation from: /%s", filepath.Dir(req.SrcObjectKey)))

		return c.JSON(fiber.Map{
			"status":      "SUCCESS",
			"message":     "Asset relocated cleanly",
			"destination": destObjectKey,
		})
	}
}
