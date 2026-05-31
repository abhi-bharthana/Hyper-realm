package handlers

import (
	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleDeleteAsset(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		objectKey := c.Query("object_key")
		userID := c.Query("user_id")

		if objectKey == "" || userID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key and user_id required"})
		}

		ctx := c.Context()
		objInfo, err := storage.Client.StatObject(ctx, cfg.BucketName, objectKey, minio.StatObjectOptions{})
		var size int64 = 0
		if err == nil {
			size = objInfo.Size
		}

		err = storage.Client.RemoveObject(ctx, cfg.BucketName, objectKey, minio.RemoveObjectOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Delete failed in cluster"})
		}

		_ = cache.AddStorageUsage(ctx, userID, -size)
		return c.JSON(fiber.Map{"status": "Success", "deleted_node": objectKey})
	}
}
