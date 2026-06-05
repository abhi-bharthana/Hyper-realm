package main

import (
	"log"
	"os"

	"hyper-os/database"
	"hyper-os/handlers"
	"hyper-os/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // 👈 CORS Import kiya
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

	// 🚀 CORS FIX: Ab frontend (Port 3000) ko Port 4000 par hit block nahi milega
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

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

	// 🚀 NAYA: WIDGET ENGINE ROUTES
	api.Get("/os/widgets", handlers.GetWidgets)
	api.Post("/os/widgets/sync", handlers.SyncWidgets)

	// ==========================================
	// 🧮 CALCULATOR APP ROUTES
	// ==========================================
	api.Get("/os/calculator/history", handlers.GetCalculatorHistory)
	api.Post("/os/calculator/history", handlers.SaveCalculation)
	api.Delete("/os/calculator/history", handlers.ClearCalculatorHistory)

	// ==========================================
	// 🛡️ WELLBEING STATE ROUTES
	// ==========================================
	api.Get("/os/wellbeing", handlers.GetWellbeingState)
	api.Post("/os/wellbeing/telemetry", handlers.SyncWellbeingState)

	// ==========================================
	// 📂 HYPER DRIVE (VFS ENGINE) ROUTES
	// ==========================================
	api.Get("/storage/files", handlers.GetFileSystem)
	api.Post("/storage/folder/create", handlers.CreateFolder)
	api.Delete("/storage/folder/purge", handlers.PurgeFolder)
	api.Delete("/storage/asset/remove", handlers.RemoveAsset)

	// ==========================================
	// 🔒 SECURITY & PRIVACY ROUTES
	// ==========================================
	api.Post("/os/permissions/toggle", handlers.TogglePermission)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Starting Hyper-OS Service on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
