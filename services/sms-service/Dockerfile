# Build Stage
FROM golang:1.26-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o sms-service cmd/server/main.go

# Production Stage (Ultra-light)
FROM alpine:latest  
WORKDIR /root/

# Need certs for JWT and Kafka TLS if used
RUN apk --no-cache add ca-certificates

# Copy binary and public key
COPY --from=builder /app/sms-service .
COPY --from=builder /app/certs ./certs

EXPOSE 8002

CMD ["./sms-service"]