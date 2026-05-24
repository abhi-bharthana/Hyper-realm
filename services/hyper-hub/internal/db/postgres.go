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
	// 1. Environment Variables Configuration
	dbHost := getEnv("DB_HOST", "hyper-db")
	dbUser := getEnv("DB_USER", "abhi")
	dbPass := getEnv("DB_PASSWORD", "Abhi@5511")
	dbName := getEnv("DB_NAME", "Hyper-ID")
	dbPort := getEnv("DB_PORT", "5432")

	// 2. Connection String
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ DB Connection Failed:", err)
	}

	// 3. Retry Logic for Startup
	fmt.Printf("⏳ Connecting to Postgres at %s...\n", dbHost)
	for i := 1; i <= 10; i++ {
		if err = DB.Ping(); err == nil {
			fmt.Println("🚀 Connected to Database:", dbName)
			break
		}
		log.Printf("⚠️ Attempt %d: Waiting for DB... (%v)", i, err)
		time.Sleep(3 * time.Second)
		if i == 10 {
			log.Fatal("❌ DB Ping Failed.")
		}
	}

	// 4. Eager Initialization: Tables ensure karo
	createFriendshipTable()
	createFollowsTable() // 🚀 Ye naya function call
}

func createFriendshipTable() {
	query := `
    CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
    );
    CREATE INDEX IF NOT EXISTS idx_sender ON friendships(sender_id);
    CREATE INDEX IF NOT EXISTS idx_receiver ON friendships(receiver_id);
    `
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatalf("❌ Failed to create friendships table: %v", err)
	}
	fmt.Println("✅ Friendship table ready.")
}

func createFollowsTable() {
	query := `
    CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
    );
    CREATE INDEX IF NOT EXISTS idx_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_following ON follows(following_id);
    `
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatalf("❌ Failed to create follows table: %v", err)
	}
	fmt.Println("✅ Follows table ready.")
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

type User struct {
	ID        string `json:"id"`
	HID       string `json:"hid"`
	Nickname  string `json:"nickname"`
	Bio       string `json:"bio"`
	Rank      string `json:"rank"`
	AvatarURL string `json:"avatar_url"`
}

func GetUserByHID(hid string) (*User, error) {
	var user User

	// 🔥 'WHERE hid = $1' (UUID error fix)
	query := `
		SELECT id, hid, nickname, bio, rank, avatar_url 
		FROM users 
		WHERE hid = $1 
		LIMIT 1
	`

	err := DB.QueryRow(query, hid).Scan(
		&user.ID,
		&user.HID,
		&user.Nickname,
		&user.Bio,
		&user.Rank,
		&user.AvatarURL,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}
