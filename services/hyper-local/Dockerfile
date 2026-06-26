# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go application
RUN go build -o hyper-local-engine ./cmd/api/main.go

# Final Runtime Stage (Lightweight)
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/hyper-local-engine .

EXPOSE 8085

# Start the application
CMD ["./hyper-local-engine"]
