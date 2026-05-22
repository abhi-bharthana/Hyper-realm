# Build Stage (Switched to Debian Bookworm for CGO & Kafka support)
FROM golang:1.26-bookworm AS builder
WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the Go app with CGO explicitly enabled
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/server/main.go

# Run Stage (Lightweight Debian)
FROM debian:bookworm-slim
WORKDIR /app

# Install ca-certificates (Crucial for Google OAuth HTTPS verification)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from builder
COPY --from=builder /app/main .

# Expose API port
EXPOSE 8080

# Start the engine
CMD ["./main"]