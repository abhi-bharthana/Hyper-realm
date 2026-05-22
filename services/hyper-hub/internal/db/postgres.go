package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	// 1. Environment Variables uthao (Docker Compose se aayenge)
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost" // Local machine par chalane ke liye
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = "Abhi@5511"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "Hyper-ID"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	// 2. Dynamic Connection String
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ DB Open Failed:", err)
	}

	// 3. RETRY LOGIC: Docker DNS ya DB initialization mein time lag sakta hai
	fmt.Printf("⏳ Connecting to DB at %s:%s...\n", dbHost, dbPort)

	for i := 1; i <= 10; i++ {
		err = DB.Ping()
		if err == nil {
			fmt.Println("🚀 Hyper Hub connected to Database:", dbName)
			return
		}
		log.Printf("⚠️  Attempt %d: DB not ready (%v). Retrying in 2s...", i, err)
		time.Sleep(2 * time.Second)
	}

	log.Fatal("❌ DB Ping Failed after 10 attempts. Exiting.")
}
