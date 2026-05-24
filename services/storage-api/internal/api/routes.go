package api

import (
	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, cfg config.Config) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	storageGroup := v1.Group("/storage")

	// Streaming Engines Core Execution Nodes
	storageGroup.Post("/upload/init", HandleInitChunkUpload(cfg))
	storageGroup.Post("/upload/chunk", HandleUploadChunk(cfg))
	storageGroup.Post("/upload/complete", HandleCompleteUpload(cfg))

	// Metadata System Real Management Mapping
	storageGroup.Get("/files", HandleListFiles(cfg))
	storageGroup.Post("/folder/create", HandleCreateFolder(cfg))
	storageGroup.Delete("/asset/remove", HandleDeleteAsset(cfg))
}
