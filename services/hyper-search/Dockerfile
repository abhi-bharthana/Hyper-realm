# Build Stage (Version updated to 1.26 to match go.mod)
FROM golang:1.26-bookworm AS builder
WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN go build -o main ./cmd/server/main.go

# Run Stage (Lightweight Debian)
FROM debian:bookworm-slim
WORKDIR /app

# Copy the compiled binary from builder
COPY --from=builder /app/main .

# Expose API port
EXPOSE 8082

# Start the engine
CMD ["./main"]