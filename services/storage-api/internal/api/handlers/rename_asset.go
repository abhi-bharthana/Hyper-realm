package handlers

import (
	"fmt"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleRenameAsset(cfg config.Config) fiber.Handler {
	type RenameRequest struct {
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

		_ = storage.Client.RemoveObject(ctx, cfg.BucketName, req.SrcObjectKey, minio.RemoveObjectOptions{})

		return c.JSON(fiber.Map{"status": "SUCCESS", "renamed_key": destObjectKey})
	}
}
