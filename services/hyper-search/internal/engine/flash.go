package engine

import (
	"context"
	"log"
	"os"

	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
)

// FlashClient is the global Typesense client
var FlashClient *typesense.Client

// InitFlash initializes the Typesense client and prepares collections
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

// / SetupCollections defines and creates the necessary collections in Typesense
func SetupCollections() {
	// Schema update kar diya hai taaki hid aur nickname index ho sakein
	schema := &api.CollectionSchema{
		Name: "users",
		Fields: []api.Field{
			{Name: "id", Type: "string"},
			{Name: "hid", Type: "string", Facet: pointerToBool(true)}, // Search ke liye
			{Name: "username", Type: "string"},
			{Name: "nickname", Type: "string"}, // Nickname add kiya
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

// SearchFlash: QueryBy update kar diya
func SearchFlash(query string) (*api.SearchResult, error) {
	searchParams := &api.SearchCollectionParams{
		Q:       query,
		QueryBy: "username,nickname,hid", // Ab ye fields search honge
	}

	result, err := FlashClient.Collection("users").Documents().Search(context.Background(), searchParams)
	if err != nil {
		log.Printf("❌ [Flash Engine] Search query failed: %v", err)
		return nil, err
	}

	return result, nil
}

// Helper function
func pointerToBool(b bool) *bool { return &b }
