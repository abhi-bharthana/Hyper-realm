package database

import (
	"hyper-os/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	// Docker run karte time DATABASE_URL env pass karenge
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("❌ Failed to connect to database! \n", err)
	}

	log.Println("✅ Database Connected Successfully!")

	// 🔥 THE MAGIC: Auto Migrate (Agar table nahi hai, toh khud banayega)
	log.Println("🚀 Running Auto-Migrations...")

	// 🚀 NAYA ADDITION: OSState aur CalculatorHistory ke saath WellbeingState ko bhi add kar diya!
	err = db.AutoMigrate(
		&models.OSState{},
		&models.CalculatorHistory{},
		&models.WellbeingState{},
		&models.VFSNode{},
		&models.SystemPermission{},
		&models.AuditLog{},
		&models.WidgetState{},
	)

	if err != nil {
		log.Fatal("❌ Migration failed! \n", err)
	}
	log.Println("✨ Database Migrated & Ready!")

	DB = db
}
