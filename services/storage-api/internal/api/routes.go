package api

import (
	"hyper-realm/storage-api/internal/api/handlers" // 🎯 Imported split sub-package modules
	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, cfg config.Config) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	storageGroup := v1.Group("/storage")

	// 🎬 STREAMING ENGINES CORE LOCAL EXECUTION NODES
	storageGroup.Post("/upload/init", handlers.HandleInitChunkUpload(cfg))
	storageGroup.Post("/upload/chunk", HandleUploadChunk(cfg))
	storageGroup.Post("/upload/complete", HandleCompleteUpload(cfg))

	// 📄 METADATA SYSTEM LOCAL MANAGEMENT MAPPING
	storageGroup.Get("/files", HandleListFiles(cfg))
	storageGroup.Post("/folder/create", HandleCreateFolder(cfg))

	// 🎯 SPLIT SUB-PACKAGE ROUTING TARGET NODES
	storageGroup.Post("/asset/move", handlers.HandleMoveAsset(cfg))
	storageGroup.Delete("/asset/remove", handlers.HandleRemoveAsset(cfg))
	storageGroup.Post("/asset/copy", handlers.HandleCopyAsset(cfg))
	storageGroup.Post("/asset/rename", handlers.HandleRenameAsset(cfg))
	storageGroup.Post("/folder/manage", handlers.HandleManageDirectory(cfg))
	storageGroup.Delete("/folder/purge", handlers.HandlePurgeDirectory(cfg))

	// 🏷️ NATIVE OBJECT TAGGING CONTROLLERS (No DB Dependency)
	storageGroup.Post("/asset/tags", handlers.HandleSaveAssetTags(cfg))
	storageGroup.Get("/asset/tags", handlers.HandleGetAssetTags(cfg))

	// 📊 AUDIT LOGS REAL-TIME TELEMETRY CONNECTORS (🎯 FIXED 404 ROUTE)
	storageGroup.Get("/audit/footprints", handlers.HandleFetchUserFootprints())
}
