package handlers

import (
	"fmt"
	"log"
	"strings"

	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

type MoveRequest struct {
	UserID       string `json:"user_id"`
	SrcObjectKey string `json:"src_object_key"`
	TargetFolder string `json:"target_folder"`
	FileName     string `json:"file_name"`
}

func HandleMoveAsset(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req MoveRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload parameters"})
		}

		if req.UserID == "" || req.SrcObjectKey == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id and src_object_key are required"})
		}

		var destObjectKey string
		if req.TargetFolder == "" {
			destObjectKey = fmt.Sprintf("%s/%s", req.UserID, req.FileName)
		} else {
			destObjectKey = fmt.Sprintf("%s/%s/%s", req.UserID, strings.Trim(req.TargetFolder, "/"), req.FileName)
		}

		if req.SrcObjectKey == destObjectKey {
			return c.JSON(fiber.Map{"message": "Asset is already present in target node"})
		}

		ctx := c.Context()
		srcOpts := minio.CopySrcOptions{Bucket: cfg.BucketName, Object: req.SrcObjectKey}
		dstOpts := minio.CopyDestOptions{Bucket: cfg.BucketName, Object: destObjectKey}

		_, err := storage.Client.CopyObject(ctx, dstOpts, srcOpts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to shift asset node", "details": err.Error()})
		}

		err = storage.Client.RemoveObject(ctx, cfg.BucketName, req.SrcObjectKey, minio.RemoveObjectOptions{})
		if err != nil {
			log.Printf("[⚠️ EXCEPTION] Old node purge failed: %v", err)
		}

		return c.JSON(fiber.Map{"status": "SUCCESS", "new_object_name": destObjectKey})
	}
}
