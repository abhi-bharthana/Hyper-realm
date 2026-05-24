# Build Stage
FROM golang:1.26-alpine AS builder
WORKDIR /app

# Dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o storage-api cmd/server/main.go

# Production Stage (Ultra-light)
FROM alpine:latest  
WORKDIR /root/

# Root certificates for S3/HTTPS communication
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=builder /app/storage-api .

EXPOSE 8001

CMD ["./storage-api"]