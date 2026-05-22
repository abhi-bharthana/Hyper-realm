package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq" // Postgres driver
)

var DB *sql.DB

func InitDB(host, port, user, password, dbname string) error {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// --- RETRY LOGIC (Crucial for Docker) ---
	fmt.Printf("⏳ [Hyper-ID] Connecting to DB at %s:%s...\n", host, port)

	for i := 1; i <= 10; i++ {
		err = DB.Ping()
		if err == nil {
			fmt.Printf("✅ [Hyper-ID] Successfully connected to database: %s\n", dbname)
			return nil
		}

		log.Printf("⚠️  [Hyper-ID] Attempt %d: DB not ready. Retrying in 2s...", i)
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("❌ [Hyper-ID] Could not connect to DB after 10 attempts: %v", err)
}
