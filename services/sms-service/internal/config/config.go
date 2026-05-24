package config

import "os"

// Config struct saare environment variables ko hold karega
type Config struct {
	Port          string
	RedisURL      string
	KafkaBroker   string
	PublicKeyPath string
}

// LoadConfig env vars ko read karke Config object return karta hai
func LoadConfig() Config {
	return Config{
		Port:          getEnv("PORT", ":8002"),
		RedisURL:      getEnv("REDIS_URL", "localhost:6379"),
		KafkaBroker:   getEnv("KAFKA_SERVER", "localhost:9092"),
		PublicKeyPath: getEnv("PUBLIC_KEY_PATH", "./certs/public_key.pem"),
	}
}

// Helper function
func getEnv(key, fallback string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}
	return fallback
}
