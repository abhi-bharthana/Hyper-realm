package main

import (
	"log"

	"hyper-realm/storage-api/internal/api"
	"hyper-realm/storage-api/internal/cache"
	"hyper-realm/storage-api/internal/config"
	"hyper-realm/storage-api/internal/storage"

	"github.com/gofiber/fiber/v2"
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

	app.Use(logger.New())

	// 4. Inject Routes
	api.SetupRoutes(app, cfg)

	// 5. Start Server
	log.Printf("Starting Storage Service on port %s", cfg.Port)
	log.Fatal(app.Listen(cfg.Port))
}
