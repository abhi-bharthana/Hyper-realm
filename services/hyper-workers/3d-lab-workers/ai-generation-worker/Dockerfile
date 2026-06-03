# 🚀 Use official PyTorch image with CUDA 12.1 pre-installed
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

# Set working directory
WORKDIR /app

# Install system dependencies required for 3D processing and Kafka
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .

# 🧠 Note: Removed --index-url from requirements since base image has PyTorch
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Create a temporary directory for GLB generation processing
RUN mkdir -p /tmp && chmod 777 /tmp

# Run the worker script
CMD ["python", "src/main.py"]