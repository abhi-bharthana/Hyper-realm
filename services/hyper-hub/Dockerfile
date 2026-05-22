# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Dependencies handle karo
COPY go.mod go.sum ./
RUN go mod download

# Baki saara code copy karo
COPY . .

# Binary build karo
RUN go build -o main cmd/server/main.go

# Final Stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .

# Certs ke liye jagah (RSA keys ke liye)
RUN mkdir -p /app/certs

EXPOSE 8081

CMD ["./main"]
