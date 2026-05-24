package config

import "os"

// Config struct saare environment variables hold karega storage-api ke liye
type Config struct {
	Port        string
	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
	RedisHost   string
	MaxUploadGB int64
	BucketName  string
}

// LoadConfig env vars ko read karega (ya defaults dega)
func LoadConfig() Config {
	return Config{
		Port:        getEnv("PORT", ":8001"),
		S3Endpoint:  getEnv("S3_ENDPOINT", "192.168.29.67:7480"),         // Ceph/MinIO URL
		S3AccessKey: getEnv("AWS_ACCESS_KEY_ID", "7KF1I2CYE25G2R7HWCVL"), // Production me .env se aayega
		S3SecretKey: getEnv("AWS_SECRET_ACCESS_KEY", "2BYAzXng14JMBfjB3ZCj6SoHlSJqqzDL8Ke5LnBE"),
		RedisHost:   getEnv("REDIS_HOST", "localhost"),
		MaxUploadGB: 5 * 1024 * 1024 * 1024, // 5GB limit in bytes
		BucketName:  "hyper-users-data",
	}
}

// Helper function
func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
