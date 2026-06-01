package events

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/segmentio/kafka-go"
)

// ==========================================
// 1️⃣ VISION WORKER LOGIC (For Images)
// ==========================================
type VisionJob struct {
	JobID   string `json:"job_id"`
	FileKey string `json:"file_key"`
}

func PublishVisionTask(jobID string, fileKey string) error {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "kafka:9092"
	}

	w := &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    "job.vision.process",
		Balancer: &kafka.LeastBytes{},
	}
	defer w.Close()

	job := VisionJob{
		JobID:   jobID,
		FileKey: fileKey,
	}
	msgBytes, _ := json.Marshal(job)

	err := w.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(jobID),
			Value: msgBytes,
		},
	)
	if err != nil {
		log.Printf("❌ Failed to publish Vision task: %v", err)
		return err
	}

	log.Printf("✅ Vision Task Published to Kafka! Job ID: %s | File: %s", jobID, fileKey)
	return nil
}

// ==========================================
// 2️⃣ MEDIA WORKER LOGIC (For Videos & Subtitles) - 🚀 NEW UPDATE
// ==========================================
type MediaJob struct {
	JobID     string `json:"job_id"`
	ObjectKey string `json:"object_key"` // 🚀 FIX: Python worker yehi key expect kar raha tha
}

func PublishMediaTask(jobID string, objectKey string) error {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "kafka:9092"
	}

	w := &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    "media.transcode.tasks", // 🚀 FIX: Sahi topic jo tera media-worker sun raha hai
		Balancer: &kafka.LeastBytes{},
	}
	defer w.Close()

	job := MediaJob{
		JobID:     jobID,
		ObjectKey: objectKey,
	}
	msgBytes, _ := json.Marshal(job)

	err := w.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(jobID),
			Value: msgBytes,
		},
	)
	if err != nil {
		log.Printf("❌ Failed to publish Media task: %v", err)
		return err
	}

	log.Printf("🎬 ✅ Media Task Published to Kafka! File: %s", objectKey)
	return nil
}
