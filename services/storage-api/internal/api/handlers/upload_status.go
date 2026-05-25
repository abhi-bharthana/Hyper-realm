package handlers

import (
	"crypto/md5"
	"fmt"
	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func HandleCheckUploadSession(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		fileName := c.Query("file_name")
		fileSizeStr := c.Query("file_size")

		if userID == "" || fileName == "" || fileSizeStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing metadata identification query values"})
		}

		// Create a unique transmission hash id based on file specification profiles
		uniqueFileToken := fmt.Sprintf("%s_%s_%s", userID, fileName, fileSizeStr)
		fileHash := fmt.Sprintf("%x", md5.Sum([]byte(uniqueFileToken)))

		ctx := c.Context()
		lastSavedChunk, _ := cache.GetUploadProgress(ctx, fileHash)

		return c.JSON(fiber.Map{
			"file_id":          fileHash,
			"resume_from_part": lastSavedChunk, // e.g. If 3, frontend starts transmission straight from part 4
			"status":           "SESSION_ALLOCATED",
		})
	}
}
