package events

import (
	"encoding/json"
	"log"
	"os"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

var Producer *kafka.Producer

func InitKafkaProducer() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092" // Fallback agar local chalaye
	}

	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": broker})
	if err != nil {
		log.Fatalf("❌ Critical: Failed to create Kafka producer: %v", err)
	}

	Producer = p
	log.Println("📢 [Kafka Producer] Ready to push events!")
}

func PublishUserEvent(id string, username string, role string) {
	if Producer == nil {
		log.Println("⚠️ Kafka Producer not initialized")
		return
	}

	topic := "user-events"
	data := map[string]string{
		"id":       id,
		"username": username,
		"role":     role,
	}

	payload, _ := json.Marshal(data)

	err := Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          payload,
	}, nil)

	if err != nil {
		log.Printf("❌ Failed to push event to Kafka: %v", err)
	} else {
		log.Printf("✅ [Event Pushed] New User '%s' sent to Search Engine!", username)
	}
}

// Add this function to internal/events/producer.go
func PublishProfileUpdate(hid string, username string, firstName string, lastName string, nickname string) {
	if Producer == nil {
		log.Println("⚠️ Kafka Producer not initialized")
		return
	}

	topic := "user-events"
	// Search engine ko naye fields chahiye
	data := map[string]interface{}{
		"hid":        hid,
		"username":   username,
		"first_name": firstName,
		"last_name":  lastName,
		"nickname":   nickname,
		"role":       "User",
	}

	payload, _ := json.Marshal(data)

	err := Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          payload,
	}, nil)

	if err != nil {
		log.Printf("❌ Failed to push profile update to Kafka: %v", err)
	} else {
		log.Printf("✅ [Event Pushed] Profile update for '%s' sent to Search Engine!", username)
	}
}
