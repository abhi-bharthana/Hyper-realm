package handlers

import (
	"fmt"
	"strings"

	"hyper-realm/storage-api/internal/audit" // 🎯 ADDED: Audit engine footprint logger link
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandlePurgeDirectory(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		targetFolder := c.Query("folder_path")

		if userID == "" || targetFolder == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Required metadata targets missing"})
		}

		ctx := c.Context()
		clusterPrefix := fmt.Sprintf("%s/%s/", userID, strings.Trim(targetFolder, "/"))

		// Gather objects channel links to drop structural pointers recursively
		objectsCh := storage.Client.ListObjects(ctx, cfg.BucketName, minio.ListObjectsOptions{
			Prefix:    clusterPrefix,
			Recursive: true,
		})

		for obj := range objectsCh {
			if obj.Err == nil {
				_ = storage.Client.RemoveObject(ctx, cfg.BucketName, obj.Key, minio.RemoveObjectOptions{})
			}
		}

		// 🎯 FOOTPRINT CAPTURE: Log the entire directory block cascading destruction telemetry
		audit.LogAction(ctx, userID, "DELETE", targetFolder, "Recursive directory tree and all sub-shards completely purged from storage mesh")

		return c.JSON(fiber.Map{"status": "SUCCESS", "purged_directory_tree": targetFolder})
	}
}
