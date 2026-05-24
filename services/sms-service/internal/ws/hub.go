package ws

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/redis/go-redis/v9"
)

type Hub struct {
	mu      sync.RWMutex
	clients map[string]*websocket.Conn
	redis   *redis.Client
}

func NewHub(redisClient *redis.Client) *Hub {
	return &Hub{
		clients: make(map[string]*websocket.Conn),
		redis:   redisClient,
	}
}

// User connect hota hai toh register karo aur Redis listen karo
func (h *Hub) Register(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	h.clients[userID] = conn
	h.mu.Unlock()

	log.Printf("✅ User %s connected to pod", userID)

	// Har user ke liye ek ultra-lightweight Goroutine start karo
	go h.listenToRedis(userID, conn)
}

func (h *Hub) Unregister(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if conn, ok := h.clients[userID]; ok {
		conn.Close()
		delete(h.clients, userID)
		log.Printf("ℹ️ User %s disconnected", userID)
	}
}

// Background Redis Listener (Cross-Pod Communication)
func (h *Hub) listenToRedis(userID string, conn *websocket.Conn) {
	ctx := context.Background()
	pubsub := h.redis.Subscribe(ctx, fmt.Sprintf("user_channel:%s", userID))
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		// Message pod pe aaya, seedha WebSocket me push karo
		h.mu.RLock()
		clientConn, exists := h.clients[userID]
		h.mu.RUnlock()

		if exists {
			if err := clientConn.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
				log.Printf("❌ WS Write Error for %s: %v", userID, err)
				h.Unregister(userID)
				break
			}
		} else {
			break // Client yahan nahi hai ab
		}
	}
}
