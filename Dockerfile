# Use official Python slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies: ffmpeg, git-lfs, and libraries needed for OpenCV and PyTorch
RUN apt-get update && apt-get install -y \
    git \
    git-lfs \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Set up Git LFS
RUN git lfs install

# Copy everything into container
COPY . .

# Pull any LFS-tracked files (e.g., wav2lip.pth)
RUN git lfs pull

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask port
EXPOSE 5050

# Start the Flask app
CMD ["python", "app.py"]
