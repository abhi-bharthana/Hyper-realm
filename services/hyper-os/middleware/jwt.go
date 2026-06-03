package middleware

import (
	"crypto/rsa"
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var PublicKey *rsa.PublicKey

// Public key load karne ke liye
func InitPublicKey(path string) error {
	keyBytes, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	PublicKey, err = jwt.ParseRSAPublicKeyFromPEM(keyBytes)
	return err
}

// Custom Fiber Middleware
func JWTProtected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing or invalid authorization header",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Token Parse aur Verify kar rahe hain
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return PublicKey, nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Claims se 'hid' nikalna
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid claims format"})
		}

		hid, ok := claims["hid"].(string)
		if !ok || hid == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "hid not found in token"})
		}

		// 🔥 Yahan magic hota hai: 'hid' ko request context mein inject kar diya
		c.Locals("hyperID", hid)

		// Next handler pe bhej do
		return c.Next()
	}
}
