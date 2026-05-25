package cache

import (
	"context"
	"fmt"
	"log"
	"time"

	"hyper-realm/storage-api/internal/config"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

func InitRedis(cfg config.Config) {
	Client = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:6379", cfg.RedisHost),
	})

	if _, err := Client.Ping(context.Background()).Result(); err != nil {
		log.Fatalf("Redis Init Failed: %v", err)
	}
}

func CheckStorageQuota(ctx context.Context, userID string, incomingSize, maxLimit int64) (bool, int64) {
	key := fmt.Sprintf("storage_usage:%s", userID)
	currentUsage, _ := Client.Get(ctx, key).Int64()

	if currentUsage+incomingSize > maxLimit {
		return false, currentUsage
	}
	return true, currentUsage
}

func AddStorageUsage(ctx context.Context, userID string, size int64) int64 {
	key := fmt.Sprintf("storage_usage:%s", userID)
	return Client.IncrBy(ctx, key, size).Val()
}

// 🎯 RESUMABLE UPLOAD MECHANICS - SAVE PROGRESS
func SaveUploadProgress(ctx context.Context, fileID string, lastPartInt int) error {
	redisKey := fmt.Sprintf("upload_session:%s", fileID)
	return Client.Set(ctx, redisKey, lastPartInt, 24*time.Hour).Err()
}

// 🎯 RESUMABLE UPLOAD MECHANICS - RETRIEVE PROGRESS
func GetUploadProgress(ctx context.Context, fileID string) (int, error) {
	redisKey := fmt.Sprintf("upload_session:%s", fileID)
	val, err := Client.Get(ctx, redisKey).Int()
	if err != nil {
		return 0, err
	}
	return val, nil
}

// 🎯 ADDED: RESUMABLE UPLOAD MECHANICS - PURGE SESSION CACHE
// Flushes the transaction identifiers once the multi-part assembly settles successfully
func ClearUploadSession(ctx context.Context, fileID string) {
	sessionKey := fmt.Sprintf("upload_id_session:%s", fileID)
	progressKey := fmt.Sprintf("upload_session:%s", fileID)

	// Execute background drop array logs
	_ = Client.Del(ctx, sessionKey).Err()
	_ = Client.Del(ctx, progressKey).Err()
}
