package handlers

import (
	"encoding/json"
	"fmt"
	"hyper-realm/storage-api/internal/cache"

	"github.com/gofiber/fiber/v2"
)

func HandleFetchUserFootprints() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("user_id")
		objectKey := c.Query("object_key") // 🎯 ADDED: Tracking target specification filters

		if userID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id tracking identifier required"})
		}

		ctx := c.Context()
		redisKey := fmt.Sprintf("user_footprints:%s", userID)

		// Fetch top 50 logs from chronological list stack
		logStrings, err := cache.Client.LRange(ctx, redisKey, 0, 49).Result()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to stream audit footprint tracks"})
		}

		var logs []fiber.Map
		for _, logStr := range logStrings {
			var item map[string]interface{}
			if err := json.Unmarshal([]byte(logStr), &item); err == nil {
				// 🎯 SMART FILTER MATRIX: If objectKey is requested, slice and retain only matching target footprints
				if objectKey != "" {
					targetVal, exists := item["target"].(string)
					if exists && targetVal == objectKey {
						logs = append(logs, item)
					}
				} else {
					// Otherwise pull full global log histories stream
					logs = append(logs, item)
				}
			}
		}

		return c.JSON(fiber.Map{
			"status":     "SUCCESS",
			"user_id":    userID,
			"footprints": logs,
		})
	}
}
