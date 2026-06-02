# Stage 1: Build the Go binary
FROM golang:alpine AS builder
WORKDIR /app

# Dependencies download karo
COPY go.mod go.sum ./
RUN go mod download

# Code copy karke build maro
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o hyper-os .

# Stage 2: Create the minimal production image
FROM alpine:latest  

WORKDIR /root/

# Builder stage se sirf binary copy kar rahe hain (Super optimized!)
COPY --from=builder /app/hyper-os .

# Ports and Execution
EXPOSE 4000

# Jab docker run hoga, ye seedha binary execute karega aur DB auto-migrate karega
CMD ["./hyper-os"]