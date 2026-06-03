package main

import (
	"hyper-os/database"
	"hyper-os/handlers"
	"hyper-os/middleware"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	// Connect & Migrate DB
	database.ConnectDB()

	// 🔐 Hardcoded path ki jagah ENV variable use kar
	jwtPath := os.Getenv("JWT_PUBLIC_KEY_PATH")
	if jwtPath == "" {
		jwtPath = "./certs/public_key.pem" // Fallback for local testing without Docker
	}

	err := middleware.InitPublicKey(jwtPath)
	if err != nil {
		log.Fatal("❌ Failed to load JWT Public Key: ", err)
	}
	log.Println("✅ JWT Public Key Loaded from", jwtPath)

	app := fiber.New()
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "hyper-os is live ⚡"})
	})

	// 🚀 CORE API ROUTES (JWT Protected)
	api := app.Group("/api/v1", middleware.JWTProtected())

	// ==========================================
	// 🌐 OS STATE ROUTES
	// ==========================================
	api.Get("/os", handlers.GetOSState)
	api.Post("/os", handlers.SyncOSState)

	// ==========================================
	// 🧮 CALCULATOR APP ROUTES (Naya Add Kiya)
	// ==========================================
	api.Get("/os/calculator/history", handlers.GetCalculatorHistory)
	api.Post("/os/calculator/history", handlers.SaveCalculation)
	api.Delete("/os/calculator/history", handlers.ClearCalculatorHistory)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Starting Hyper-OS Service on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
