# Base image with Python 3.9
FROM python:3.9-slim

# Install system dependencies for dlib, ffmpeg, and Git LFS
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-python-dev \
    git-lfs \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Enable Git LFS (required for Wav2Lip model files)
RUN git lfs install

# Set working directory
WORKDIR /app

# Copy backend files to container
COPY . .

# Install Python packages
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose backend port
EXPOSE 5050

# Start the Flask app
CMD ["python", "app.py"]
