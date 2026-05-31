package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// 5. Start Server asynchronously
	go func() {
		log.Printf("Starting Storage Service on port %s", cfg.Port)
		if err := app.Listen(cfg.Port); err != nil {
			log.Panicf("Storage API server error: %v", err)
		}
	}()

	// 6. Graceful Shutdown Watcher
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("\nGraceful shutdown initiated for Storage API...")

	// Fiber handles the context timeout internally
	if err := app.ShutdownWithTimeout(5 * time.Second); err != nil {
		log.Fatalf("Storage API forced to shutdown: %v", err)
	}

	log.Println("Storage API exited properly.")
}
