package cache

import (
	"context"
	"fmt"
	"log"

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
