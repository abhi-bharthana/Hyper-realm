package handlers

import (
	"fmt"
	"strings"
	"time"

	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/minio/minio-go/v7"
)

func HandleGetStreamInfo(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		objectKey := c.Query("object_key")
		if objectKey == "" {
			return c.Status(400).JSON(fiber.Map{"error": "object_key is required"})
		}

		ctx := c.Context()

		// Expected HLS prefix created by Python Worker
		baseName := strings.Split(objectKey, ".")[0]
		hlsPrefix := fmt.Sprintf("%s_hls", baseName)
		masterM3U8 := fmt.Sprintf("%s/master.m3u8", hlsPrefix)
		captionsVTT := fmt.Sprintf("%s/captions.vtt", hlsPrefix)

		// Check if master.m3u8 exists (Matlab Python worker ne kaam complete kar diya hai)
		_, err := storage.Client.StatObject(ctx, cfg.BucketName, masterM3U8, minio.StatObjectOptions{})
		if err != nil {
			// File nahi mili, iska matlab abhi process ho rahi hai
			return c.JSON(fiber.Map{
				"status":  "PROCESSING",
				"message": "AI Neural Engine is currently transcoding the stream.",
			})
		}

		// 🎯 Agar ready hai, toh dono ke Presigned URLs nikal kar frontend ko de do (valid for 12 hours)
		reqParams := make(map[string][]string)

		streamURL, _ := storage.Client.PresignedGetObject(ctx, cfg.BucketName, masterM3U8, time.Hour*12, reqParams)
		captionsURL, _ := storage.Client.PresignedGetObject(ctx, cfg.BucketName, captionsVTT, time.Hour*12, reqParams)

		return c.JSON(fiber.Map{
			"status":       "READY",
			"stream_url":   streamURL.String(),
			"captions_url": captionsURL.String(),
		})
	}
}
