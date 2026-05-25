package handlers

import (
	"fmt"
	"path/filepath"
	"strings"

	"hyper-realm/storage-api/internal/audit" // 🎯 Audit logging framework matrix connection
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

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

		// Extract fallback user identity
		userID := req.UserID
		if userID == "" {
			userID = "abhishek-babu-node" // Safe production fallback
		}

		// 🎯 FIXED: Logging footprints on BOTH source and destination clone keys to avoid empty timeline drop
		audit.LogAction(ctx, userID, "COPY", req.SrcObjectKey, fmt.Sprintf("Cloned asset replica generated at: /%s", destObjectKey))
		audit.LogAction(ctx, userID, "COPY", destObjectKey, fmt.Sprintf("Replica node created via cloning from: /%s", req.SrcObjectKey))

		return c.JSON(fiber.Map{"status": "SUCCESS", "new_copy": destObjectKey})
	}
}
