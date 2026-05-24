package main

import (
	"context"
	"log"

	"hyper-realm/sms-service/internal/auth"
	"hyper-realm/sms-service/internal/broker"
	"hyper-realm/sms-service/internal/config"
	"hyper-realm/sms-service/internal/ws"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

func main() {
	// 1. Load Configuratons
	cfg := config.LoadConfig()

	// 2. Load Hyper-ID Public Key
	if err := auth.InitPublicKey(cfg.PublicKeyPath); err != nil {
		log.Printf("⚠️ Warning: Could not load Public Key: %v", err)
	}

	// 3. Init Redis
	redisClient := redis.NewClient(&redis.Options{Addr: cfg.RedisURL})
	if _, err := redisClient.Ping(context.Background()).Result(); err != nil {
		log.Fatalf("❌ Redis Error: %v", err)
	}

	// 4. Init Kafka & WS Hub
	broker.InitKafkaProducer(cfg.KafkaBroker)
	broker.StartKafkaConsumer(cfg.KafkaBroker, redisClient)
	hub := ws.NewHub(redisClient)

	// 5. Setup Fiber
	app := fiber.New()

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// 6. WebSocket Route
	app.Get("/ws/:user_id", websocket.New(func(c *websocket.Conn) {
		userID := c.Params("user_id")
		token := c.Query("token")

		if token == "" {
			c.Close()
			return
		}

		hid, err := auth.VerifyToken(token)
		if err != nil || hid != userID {
			log.Printf("🚫 Unauthorized WS attempt for %s", userID)
			c.Close()
			return
		}

		hub.Register(userID, c)
		defer hub.Unregister(userID)

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				break
			}
			broker.PublishChatMessage(context.Background(), msg)
		}
	}))

	log.Printf("🚀 SMS Service running on port %s", cfg.Port)
	log.Fatal(app.Listen(cfg.Port))
}
