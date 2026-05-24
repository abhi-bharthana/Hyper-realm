package broker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

// Global Kafka Writer (Producer)
var writer *kafka.Writer

// 1. Initialize Kafka Producer
func InitKafkaProducer(brokerURL string) {
	writer = &kafka.Writer{
		Addr:     kafka.TCP(brokerURL),
		Topic:    "chat-messages",
		Balancer: &kafka.LeastBytes{}, // Load balancing across partitions
	}
	log.Println("🚀 Kafka Producer initialized successfully")
}

// 2. Publish Message to Kafka (Called from WebSocket Handler)
func PublishChatMessage(ctx context.Context, msg []byte) error {
	return writer.WriteMessages(ctx, kafka.Message{
		Value: msg,
	})
}

// 3. Start Kafka Consumer (Runs in Background)
func StartKafkaConsumer(brokerURL string, redisClient *redis.Client) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{brokerURL},
		GroupID: "chat-go-group",
		Topic:   "chat-messages",
	})

	log.Println("🎧 Kafka Consumer started listening to 'chat-messages'...")

	// Ek background goroutine jo hamesha naye messages sunti rahegi
	go func() {
		for {
			m, err := reader.ReadMessage(context.Background())
			if err != nil {
				log.Printf("❌ Kafka Read Error: %v", err)
				continue
			}

			// Payload decode karo
			var data map[string]interface{}
			if err := json.Unmarshal(m.Value, &data); err != nil {
				log.Printf("⚠️ Invalid message format: %v", err)
				continue
			}

			// Receiver check karo
			receiver, ok := data["receiver"].(string)
			if !ok {
				log.Println("⚠️ Message skipped: No valid receiver found")
				continue
			}

			// Message ko format karo jo frontend pe jayega
			formattedMsg, _ := json.Marshal(map[string]interface{}{
				"from":      data["sender"],
				"msg":       data["content"],
				"timestamp": data["timestamp"],
			})

			channelName := fmt.Sprintf("user_channel:%s", receiver)

			// 🚦 THE ROUTING LOGIC (Check if user is Online in cluster)
			subs, err := redisClient.PubSubNumSub(context.Background(), channelName).Result()
			if err != nil {
				log.Printf("❌ Redis PubSub Error: %v", err)
				continue
			}

			if count, ok := subs[channelName]; ok && count > 0 {
				// CASE 1: User ONLINE hai. Redis me daal do, wahan se seedha WS me jayega.
				err = redisClient.Publish(context.Background(), channelName, string(formattedMsg)).Err()
				if err != nil {
					log.Printf("❌ Redis Publish Error for %s: %v", receiver, err)
				} else {
					log.Printf("✅ Message routed to active user: %s", receiver)
				}
			} else {
				// CASE 2: User OFFLINE hai. Push Notification trigger karo!
				log.Printf("📱 User %s is OFFLINE. Triggering Push Notification...", receiver)

				sender := ""
				if s, ok := data["sender"].(string); ok {
					sender = s
				}
				content := ""
				if c, ok := data["content"].(string); ok {
					content = c
				}

				triggerPushEvent(receiver, sender, content)
			}
		}
	}()
}

// 4. Push Notification Trigger Logic
func triggerPushEvent(toUser string, fromUser string, messageText string) {
	// Yahan par hum ideally ek naye Kafka topic "push-events" me event daalenge
	// jise 'notification-service' handle karegi.
	// Abhi ke liye ye console pe print karega ki FCM bhejna hai.

	pushPayload := map[string]string{
		"target_user_id": toUser,
		"title":          fmt.Sprintf("New message from %s", fromUser),
		"body":           messageText,
	}

	payloadBytes, _ := json.Marshal(pushPayload)

	// Example: Agar tu isko direct alag topic me daalna chahe:
	// publishToTopic("push-notifications", payloadBytes)

	fmt.Printf("🔔 [FCM/APNs ALERT] -> Bhejo: %s\n", string(payloadBytes))
}
