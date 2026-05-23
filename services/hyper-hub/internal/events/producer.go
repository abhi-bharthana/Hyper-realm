package events

import (
	"context"
	"encoding/json"
	"log"
	"os"

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

// PublishEvent sends a message to Kafka
func PublishEvent(eventType string, data interface{}) error {
	if writer == nil {
		log.Println("❌ Kafka Writer is not initialized!")
		return nil
	}

	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	msg := kafka.Message{
		Key:   []byte(eventType),
		Value: payload,
	}

	err = writer.WriteMessages(context.Background(), msg)
	if err != nil {
		log.Printf("❌ Failed to publish event [%s]: %v", eventType, err)
		return err
	}

	log.Printf("📨 Event Published to Kafka: [%s]", eventType)
	return nil
}
