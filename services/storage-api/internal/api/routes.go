package api

import (
	"hyper-realm/storage-api/internal/api/handlers" // 🎯 Imported split handler sub-folder package
	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, cfg config.Config) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	storageGroup := v1.Group("/storage")

	// 🎬 STREAMING ENGINES CORE EXECUTION NODES
	storageGroup.Post("/upload/init", handlers.HandleInitChunkUpload(cfg))
	storageGroup.Post("/upload/chunk", HandleUploadChunk(cfg))       // Keep local if still inside api package
	storageGroup.Post("/upload/complete", HandleCompleteUpload(cfg)) // Keep local if still inside api package

	// 📄 METADATA SYSTEM REAL MANAGEMENT MAPPING
	storageGroup.Get("/files", HandleListFiles(cfg))             // Keep local if still inside api package
	storageGroup.Post("/folder/create", HandleCreateFolder(cfg)) // Keep local if still inside api package

	// 🎯 FIXED: Direct structural endpoint sync mapped with frontend triggers
	storageGroup.Post("/asset/move", handlers.HandleMoveAsset(cfg))
	storageGroup.Delete("/asset/remove", handlers.HandleRemoveAsset(cfg))
	storageGroup.Post("/asset/copy", handlers.HandleCopyAsset(cfg))
	storageGroup.Post("/asset/rename", handlers.HandleRenameAsset(cfg))
	storageGroup.Post("/folder/manage", handlers.HandleManageDirectory(cfg))
	storageGroup.Delete("/folder/purge", handlers.HandlePurgeDirectory(cfg))
	storageGroup.Get("/upload/check-session", handlers.HandleCheckUploadSession(cfg))
}
