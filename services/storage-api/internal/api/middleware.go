package api

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Hyper-ID JWT Token Required"})
		}

		// JWT verify karke claims se user_id nikalne ka logic yahan aayega
		// Abhi ke liye aage badhate hain
		return c.Next()
	}
}
