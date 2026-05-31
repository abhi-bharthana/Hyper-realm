# Build Stage
FROM golang:1.25-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git build-base pkgconf

# Copy files
COPY go.mod go.sum ./

# Use Google proxy
ENV GOPROXY=https://proxy.golang.org,direct
RUN go mod download

# Copy source code
COPY . .

# Build
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o storage-api cmd/server/main.go

# Production Stage
FROM alpine:latest  
WORKDIR /root/
RUN apk --no-cache add ca-certificates libc6-compat
COPY --from=builder /app/storage-api .
EXPOSE 8001
CMD ["./storage-api"]