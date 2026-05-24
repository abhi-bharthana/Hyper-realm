package main

import (
	"log"

	"hyper-realm/storage-api/internal/api"
	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // 🎯 NEW: Import CORS middleware
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Dependencies (Ceph & Redis)
	storage.InitCeph(cfg)
	cache.InitRedis(cfg)

	// 3. Setup Fiber Framework
	app := fiber.New(fiber.Config{
		BodyLimit: 100 * 1024 * 1024, // 100MB Max Request Size
	})

	// 🚀 CRITICAL FIX: Explicitly allowed DELETE method inside CORS configuration matrix
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000", // Allow Next.js frontend
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, DELETE, OPTIONS", // 🎯 FIXED: DELETE added to eliminate preflight 405/Network errors
	}))

	app.Use(logger.New())

	// 4. Inject Routes
	api.SetupRoutes(app, cfg)

	// 5. Start Server
	log.Printf("Starting Storage Service on port %s", cfg.Port)
	log.Fatal(app.Listen(cfg.Port))
}
