# Build Stage
FROM golang:1.25-alpine AS builder
WORKDIR /app

# 🚀 Install required C-compiler and Git for Kafka (librdkafka)
RUN apk add --no-cache git build-base pkgconf

COPY go.mod go.sum ./

# 🚀 FIX 1: Official Google Proxy instead of goproxy.io (fixes DNS timeout)
ENV GOPROXY=https://proxy.golang.org,direct

RUN go mod download

COPY . .

# 🚀 FIX 2: CGO_ENABLED=1 and '-tags musl' is STRICTLY required for Kafka on Alpine
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o sms-service cmd/server/main.go

# Production Stage (Ultra-light)
FROM alpine:latest  
WORKDIR /root/

# 🚀 FIX 3: Added libc6-compat for CGO compiled binaries to run on Alpine
RUN apk --no-cache add ca-certificates libc6-compat

# Copy binary and public key
COPY --from=builder /app/sms-service .
COPY --from=builder /app/certs ./certs

EXPOSE 8002

CMD ["./sms-service"]