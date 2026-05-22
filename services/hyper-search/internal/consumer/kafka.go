package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"hyper-search/internal/engine"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func StartKafkaConsumer() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092"
	}

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": broker,
		"group.id":          "hyper-search-indexer",
		"auto.offset.reset": "earliest",
	})

	if err != nil {
		log.Fatalf("Critical: Failed to create Kafka consumer: %v", err)
	}

	// Subscribe to the topic where hyper-hub/id sends user data
	c.SubscribeTopics([]string{"user-events"}, nil)
	log.Println("🎧 [Kafka Consumer] Listening for 'user-events'...")

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			log.Printf("📥 [Event Received] Topic: %s", *msg.TopicPartition.Topic)
			IndexUserToFlash(msg.Value)
		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}

func IndexUserToFlash(data []byte) {
	// 1. JSON parse karo
	var user map[string]interface{}
	if err := json.Unmarshal(data, &user); err != nil {
		log.Println("❌ Failed to parse Kafka event:", err)
		return
	}

	// 2. Typesense ke hisaab se document prepare karo
	document := map[string]interface{}{
		"id":       fmt.Sprintf("%v", user["id"]), // ID hamesha string honi chahiye Typesense mein
		"username": user["username"],
		"role":     user["role"],
	}

	// 3. Typesense mein Insert/Update (Upsert) maaro
	_, err := engine.FlashClient.Collection("users").Documents().Upsert(context.Background(), document)
	if err != nil {
		log.Println("❌ [Flash] Indexing Failed:", err)
	} else {
		log.Printf("⚡ [Flash] User '%v' successfully indexed in milliseconds!", user["username"])
	}
}
