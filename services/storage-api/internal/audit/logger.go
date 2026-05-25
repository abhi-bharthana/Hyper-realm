package audit

import (
	"context"
	"encoding/json"
	"fmt"
	"hyper-realm/storage-api/internal/cache"
	"time"
)

// UserFootprint represents a single immutable activity record inside the cluster
type UserFootprint struct {
	EventID   string    `json:"event_id"`
	UserID    string    `json:"user_id"`
	Action    string    `json:"action"`   // UPLOAD, DELETE, RENAME, MOVE, COPY, SHARE, VIEW
	Target    string    `json:"target"`   // File or Directory object name
	Metadata  string    `json:"metadata"` // Extra contextual info (e.g., "Size: 5MB", "New Name: x.mp4")
	Timestamp time.Time `json:"timestamp"`
}

// LogAction pushes a structured footprint event straight into Redis time-series lists
func LogAction(ctx context.Context, userID, action, target, metadata string) {
	eventToken := fmt.Sprintf("evt_%d", time.Now().UnixNano())

	footprint := UserFootprint{
		EventID:   eventToken,
		UserID:    userID,
		Action:    action,
		Target:    target,
		Metadata:  metadata,
		Timestamp: time.Now(),
	}

	// Serialize footprint layout object to JSON string string bytes
	data, err := json.Marshal(footprint)
	if err != nil {
		fmt.Printf("Failed to marshal footprint event logs: %v\n", err)
		return
	}

	// Push to a Redis List specific to the user for fast chronological retrieval
	redisKey := fmt.Sprintf("user_footprints:%s", userID)

	// LPUSH keeps the latest entries at the top of the array stack
	_ = cache.Client.LPush(ctx, redisKey, data).Err()

	// 🎯 Retention Cap Optimization: Trim the logs to save memory space (Keep last 500 footprints)
	_ = cache.Client.LTrim(ctx, redisKey, 0, 499).Err()
}
