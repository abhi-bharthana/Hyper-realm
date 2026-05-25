package handlers

import (
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/tags"
)

type TagRequest struct {
	UserID    string   `json:"user_id"`
	ObjectKey string   `json:"object_key"` // File name ya Virtual Folder path (e.g., "user1/docs/")
	Tags      []string `json:"tags"`       // e.g., ["Starred", "Work", "Shared"]
}

// HandleSaveAssetTags strictly commits tags into MinIO Object Metadata
func HandleSaveAssetTags(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req TagRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid tagging schema payload"})
		}

		if req.ObjectKey == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key is strictly required"})
		}

		ctx := c.Context()

		// 🎯 FIXED SIGNATURE MATCHING: Passing the raw key-value map and validation bool natively
		tagMap := make(map[string]string)
		if len(req.Tags) > 0 {
			tagMap["custom_tags"] = strings.Join(req.Tags, ",")
		} else {
			tagMap["custom_tags"] = "" // Clear state parameters if blank
		}

		// Signature expects: want (map[string]string, bool)
		otags, err := tags.NewTags(tagMap, false)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to initialize tag matrix mapping allocation"})
		}

		// Inject tagging directly onto the object node
		err = storage.Client.PutObjectTagging(ctx, cfg.BucketName, req.ObjectKey, otags, minio.PutObjectTaggingOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "MinIO object tagging injection rejected", "details": err.Error()})
		}

		return c.JSON(fiber.Map{
			"status":     "SUCCESS",
			"object_key": req.ObjectKey,
			"tags_saved": req.Tags,
		})
	}
}

// HandleGetAssetTags fetches tags directly from MinIO Object Metadata
func HandleGetAssetTags(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		objectKey := c.Query("object_key")
		if objectKey == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key query parameter required"})
		}

		ctx := c.Context()
		resTags, err := storage.Client.GetObjectTagging(ctx, cfg.BucketName, objectKey, minio.GetObjectTaggingOptions{})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read object tags from cluster"})
		}

		tagMap := resTags.ToMap()
		customTagsStr := tagMap["custom_tags"]

		var tagsList []string
		if customTagsStr != "" {
			tagsList = strings.Split(customTagsStr, ",")
		} else {
			tagsList = []string{}
		}

		return c.JSON(fiber.Map{
			"status":     "SUCCESS",
			"object_key": objectKey,
			"tags":       tagsList,
		})
	}
}
