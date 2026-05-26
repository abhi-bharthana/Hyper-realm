package events

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/segmentio/kafka-go"
)

type VisionJob struct {
	JobID   string `json:"job_id"`
	FileKey string `json:"file_key"`
}

func PublishVisionTask(jobID string, fileKey string) error {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "kafka:9092"
	}

	// Kafka Writer Configuration
	w := &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    "job.vision.process",
		Balancer: &kafka.LeastBytes{},
	}
	defer w.Close()

	// JSON Payload banayenge (exactly waise hi jaise terminal se bheja tha)
	job := VisionJob{
		JobID:   jobID,
		FileKey: fileKey,
	}
	msgBytes, _ := json.Marshal(job)

	// Kafka topic par message push
	err := w.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(jobID),
			Value: msgBytes,
		},
	)
	if err != nil {
		log.Printf("❌ Failed to publish Kafka message: %v", err)
		return err
	}

	log.Printf("✅ Vision Task Published to Kafka! Job ID: %s | File: %s", jobID, fileKey)
	return nil
}
