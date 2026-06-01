# Base Image: Lightweight Python
FROM python:3.10-slim

# System Dependencies (FFmpeg for video, libgl1 for AI)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Setup Working Directory
WORKDIR /app

# Copy Requirements & Install (Cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual brain (Code)
COPY src/ /app/src/

# Prevent Python from buffering logs (Realtime console output)
ENV PYTHONUNBUFFERED=1

# Run the God-Level Worker
CMD ["python", "src/main.py"]