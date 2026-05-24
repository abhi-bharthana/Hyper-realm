# Build Stage
FROM golang:1.26-bookworm AS builder
WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build (CGO_ENABLED=0 is critical for static binary)
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/server/main.go

# Run Stage (Lightweight Debian)
FROM debian:bookworm-slim
WORKDIR /app

# Copy the compiled binary from builder
COPY --from=builder /app/main .

# Make it executable
RUN chmod +x /app/main 

EXPOSE 8082

# Start the engine
CMD ["./main"]