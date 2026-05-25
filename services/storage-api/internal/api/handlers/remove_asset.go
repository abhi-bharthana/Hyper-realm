package handlers

import (
	"net/url"

	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleRemoveAsset(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		objectKey, err := url.QueryUnescape(c.Query("object_key"))

		if userID == "" || objectKey == "" || err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id and proper object_key parameters are highly demanded"})
		}

		ctx := c.Context()
		err = storage.Client.RemoveObject(ctx, cfg.BucketName, objectKey, minio.RemoveObjectOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to terminate target object node block", "details": err.Error()})
		}

		return c.JSON(fiber.Map{"status": "PURGED", "object_key": objectKey})
	}
}
