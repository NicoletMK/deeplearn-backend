# Use an image that already includes dlib or install dlib via apt
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY requirements.txt .

# Install Python dependencies (remove dlib from requirements.txt!)
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Download wav2lip.pth directly (avoid Git LFS + quota issues)
COPY Wav2Lip/wav2lip.pth Wav2Lip/wav2lip.pth


# Copy rest of the app
COPY . .

# Expose Flask port
EXPOSE 5050

# Start the Flask app
CMD ["python", "app.py"]
