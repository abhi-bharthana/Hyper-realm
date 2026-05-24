package events

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/segmentio/kafka-go"
)

var writer *kafka.Writer

// InitKafkaProducer initializes the Kafka Producer
func InitKafkaProducer() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092" // fallback for local testing
	}

	writer = &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    "user-events",
		Balancer: &kafka.LeastBytes{},
	}
	log.Println("✅ Kafka Producer initialized for topic: user-events")
}

// PublishEvent sends a message to Kafka with a 2-second timeout
func PublishEvent(eventType string, data interface{}) error {
	if writer == nil {
		return fmt.Errorf("❌ Kafka Writer is not initialized")
	}

	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// 2 seconds ka context timeout set kar diya
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	msg := kafka.Message{
		Key:   []byte(eventType),
		Value: payload,
	}

	// Context ke sath writeMessage
	err = writer.WriteMessages(ctx, msg)
	if err != nil {
		log.Printf("❌ Failed to publish event [%s]: %v", eventType, err)
		return err
	}

	log.Printf("📨 Event Published to Kafka: [%s]", eventType)
	return nil
}
