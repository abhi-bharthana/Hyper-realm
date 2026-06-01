package handlers

import (
	"fmt"
	"path/filepath"
	"strings"

	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func HandleGetStreamInfo(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		objectKey := c.Query("object_key")
		if objectKey == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key is required"})
		}

		// 🧠 File Name Extraction
		// Ex: "abhishek-babu-node/Reacher.S01E08.mkv" -> "Reacher.S01E08"
		fileName := filepath.Base(objectKey)
		ext := filepath.Ext(fileName)
		baseName := strings.TrimSuffix(fileName, ext)

		// 🎬 Python worker saved the chunks in this folder
		hlsPrefix := fmt.Sprintf("%s_hls", baseName)

		// 🌐 Host MinIO URL (Mapped to 7480 in Docker)
		minioBaseURL := "http://localhost:7480/hyper-users-data"

		return c.JSON(fiber.Map{
			"status":       "READY",
			"stream_url":   fmt.Sprintf("%s/%s/master.m3u8", minioBaseURL, hlsPrefix),
			"captions_url": fmt.Sprintf("%s/%s/captions.vtt", minioBaseURL, hlsPrefix),
		})
	}
}
