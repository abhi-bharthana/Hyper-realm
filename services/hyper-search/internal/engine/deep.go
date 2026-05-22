package engine

import (
	"log"
	"os"

	"github.com/typesense/typesense-go/typesense"
)

// DeepClient is the global Typesense client
var DeepClient *typesense.Client

func InitDeep() {
	// Agar Docker network mein hai toh typesense:8108, warna localhost:8108
	url := os.Getenv("TYPESENSE_URL")
	if url == "" {
		url = "http://localhost:8108"
	}

	DeepClient = typesense.NewClient(
		typesense.WithServer(url),
		typesense.WithAPIKey("hyper_deep_key_5511"), // Jo humne docker-compose mein di thi
	)

	log.Println("⚡ [Deep Engine] Typesense initialized successfully!")
}
