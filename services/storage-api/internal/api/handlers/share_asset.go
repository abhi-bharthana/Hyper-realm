package handlers

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"hyper-realm/storage-api/internal/audit" // 🎯 ADDED: Audit logging framework matrix link
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
)

type ShareRequest struct {
	ObjectKey        string `json:"object_key"`      // e.g., "user1/folder/file.mp4"
	ExpiresInMinutes int    `json:"expires_in_mins"` // e.g., 60, 1440
}

func HandleGenerateShareLink(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req ShareRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload schema"})
		}

		if req.ObjectKey == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "object_key is highly required"})
		}

		// Default expiration to 60 minutes if not specified or invalid
		if req.ExpiresInMinutes <= 0 {
			req.ExpiresInMinutes = 60
		}

		// 🎯 Hard constraint safety: Max sharing limit restricted to 7 Days (10080 minutes)
		if req.ExpiresInMinutes > 10080 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Token duration cannot exceed absolute 7-day window boundary"})
		}

		ctx := c.Context()
		expirationDuration := time.Duration(req.ExpiresInMinutes) * time.Minute

		// Set response headers mapping content disposition configurations if needed
		reqParams := make(url.Values)

		// 🎬 GENERATE CRYPTOGRAPHICALLY SIGNED S3 POINTER
		presignedURL, err := storage.Client.PresignedGetObject(ctx, cfg.BucketName, req.ObjectKey, expirationDuration, reqParams)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to forge secure cryptographic token signature",
				"details": err.Error(),
			})
		}

		// 🎯 FOOTPRINT CAPTURE: Secure public signature sharing audit log
		// Extract user identity cleanly from object namespace path context (e.g., "user_id/file.png")
		userID := "abhishek-babu-node"
		pathParts := strings.Split(strings.TrimPrefix(req.ObjectKey, "/"), "/")
		if len(pathParts) > 0 && pathParts[0] != "" {
			userID = pathParts[0]
		}

		audit.LogAction(ctx, userID, "SHARE", req.ObjectKey, fmt.Sprintf("Lease window signature forged for %d Minutes", req.ExpiresInMinutes))

		return c.JSON(fiber.Map{
			"status":     "SUCCESS",
			"share_url":  presignedURL.String(),
			"expires_at": time.Now().Add(expirationDuration).Format(time.RFC3339),
		})
	}
}
