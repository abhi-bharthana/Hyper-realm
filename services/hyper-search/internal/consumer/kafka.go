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
	var event map[string]interface{}
	if err := json.Unmarshal(data, &event); err != nil {
		log.Println("❌ Failed to parse Kafka event:", err)
		return
	}

	// 1. HID/ID map karo (Dono cases handle karo: 'hid' ya 'id')
	userID := ""
	if val, ok := event["hid"]; ok {
		userID = fmt.Sprintf("%v", val)
	} else if val, ok := event["id"]; ok {
		userID = fmt.Sprintf("%v", val)
	}

	// 2. Role handling (Default to "User" agar missing hai)
	role := "User"
	if val, ok := event["role"]; ok {
		role = fmt.Sprintf("%v", val)
	}

	// 3. Document structure prepare karo (Defensive Mapping)
	document := map[string]interface{}{
		"id":         userID,
		"username":   event["username"],
		"role":       role,
		"first_name": event["first_name"], // Naye fields add kiye
		"last_name":  event["last_name"],
		"nickname":   event["nickname"],
	}

	// 4. Typesense Upsert
	_, err := engine.FlashClient.Collection("users").Documents().Upsert(context.Background(), document)
	if err != nil {
		log.Printf("❌ [Flash] Indexing Failed for ID %s: %v", userID, err)
	} else {
		log.Printf("⚡ [Flash] User '%v' (ID: %s) successfully indexed!", event["username"], userID)
	}
}
