package api

import (
	"hyper-realm/storage-api/internal/api/handlers" // 🎯 Modular package import
	"hyper-realm/storage-api/internal/config"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, cfg config.Config) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	storageGroup := v1.Group("/storage")

	// 🎬 UPLOAD ENGINES (Resumable + Kafka Trigger)
	storageGroup.Post("/upload/init", handlers.HandleInitChunkUpload(cfg))
	storageGroup.Post("/upload/chunk", handlers.HandleUploadChunk(cfg))
	storageGroup.Post("/upload/complete", handlers.HandleCompleteUpload(cfg))

	// 📄 DIRECTORY & FILESYSTEM
	storageGroup.Get("/files", handlers.HandleListFiles(cfg))
	storageGroup.Post("/folder/create", handlers.HandleCreateFolder(cfg))
	storageGroup.Post("/folder/manage", handlers.HandleManageDirectory(cfg))

	// 🎯 ASSET MUTATIONS
	storageGroup.Post("/asset/move", handlers.HandleMoveAsset(cfg))
	storageGroup.Delete("/asset/remove", handlers.HandleDeleteAsset(cfg))
	// 🎬 AI MEDIA STREAMING ROUTES
	storageGroup.Get("/stream/info", handlers.HandleGetStreamInfo(cfg))

	// (Agar inke naye modular handlers ready hain toh un-comment kar lena)
	// storageGroup.Post("/asset/copy", handlers.HandleCopyAsset(cfg))
	// storageGroup.Post("/asset/rename", handlers.HandleRenameAsset(cfg))
	// storageGroup.Delete("/folder/purge", handlers.HandlePurgeDirectory(cfg))

	// 🏷️ TAGS & AUDIT (In progress)
	// storageGroup.Post("/asset/tags", handlers.HandleSaveAssetTags(cfg))
	// storageGroup.Get("/asset/tags", handlers.HandleGetAssetTags(cfg))
	// storageGroup.Get("/audit/footprints", handlers.HandleFetchUserFootprints())
}
