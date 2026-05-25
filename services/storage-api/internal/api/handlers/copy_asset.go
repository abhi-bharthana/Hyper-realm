package handlers

import (
	"fmt"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleCopyAsset(cfg config.Config) fiber.Handler {
	type CopyRequest struct {
		UserID       string `json:"user_id"`
		SrcObjectKey string `json:"src_object_key"`
		TargetFolder string `json:"target_folder"` // Can be "" (root) or subpaths "ABHI/SUB"
		FileName     string `json:"file_name"`
	}

	return func(c *fiber.Ctx) error {
		var req CopyRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payload invalid"})
		}

		var destObjectKey string
		if req.TargetFolder == "" {
			destObjectKey = fmt.Sprintf("%s/%s", req.UserID, req.FileName)
		} else {
			destObjectKey = fmt.Sprintf("%s/%s/%s", req.UserID, strings.Trim(req.TargetFolder, "/"), req.FileName)
		}

		// Agar target space me duplicate path ban raha ho toh postfix mapping trigger kardo
		if req.SrcObjectKey == destObjectKey {
			ext := filepath.Ext(req.FileName)
			base := strings.TrimSuffix(req.FileName, ext)
			if req.TargetFolder == "" {
				destObjectKey = fmt.Sprintf("%s/%s_copy%s", req.UserID, base, ext)
			} else {
				destObjectKey = fmt.Sprintf("%s/%s/%s_copy%s", req.UserID, strings.Trim(req.TargetFolder, "/"), base, ext)
			}
		}

		ctx := c.Context()
		srcOpts := minio.CopySrcOptions{Bucket: cfg.BucketName, Object: req.SrcObjectKey}
		dstOpts := minio.CopyDestOptions{Bucket: cfg.BucketName, Object: destObjectKey}

		_, err := storage.Client.CopyObject(ctx, dstOpts, srcOpts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clone object target node namespace"})
		}

		return c.JSON(fiber.Map{"status": "SUCCESS", "new_copy": destObjectKey})
	}
}
