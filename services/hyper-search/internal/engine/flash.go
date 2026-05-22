package engine

import (
	"context"
	"log"
	"os"

	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
)

var FlashClient *typesense.Client

func InitFlash() {
	url := os.Getenv("TYPESENSE_URL")
	if url == "" {
		url = "http://localhost:8108"
	}

	FlashClient = typesense.NewClient(
		typesense.WithServer(url),
		typesense.WithAPIKey("hyper_flash_key_5511"),
	)
	log.Println("⚡ [Flash Engine] Typesense initialized successfully!")

	// Create required schemas on startup
	SetupCollections()
}

func SetupCollections() {
	// Define "users" collection schema
	schema := &api.CollectionSchema{
		Name: "users",
		Fields: []api.Field{
			{Name: "id", Type: "string"},
			{Name: "username", Type: "string"},
			{Name: "role", Type: "string", Optional: pointerToBool(true)},
		},
	}

	_, err := FlashClient.Collections().Create(context.Background(), schema)
	if err != nil {
		log.Println("Note: 'users' collection already exists or skipped.")
	} else {
		log.Println("✅ [Flash Engine] 'users' collection created!")
	}
}

// Helper function
func pointerToBool(b bool) *bool { return &b }
