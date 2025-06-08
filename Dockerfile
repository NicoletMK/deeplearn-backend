# Use Python base image
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
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Download wav2lip.pth directly (avoid Git LFS)
RUN mkdir -p Wav2Lip && \
    curl -L -o Wav2Lip/wav2lip.pth https://zenodo.org/record/5522302/files/wav2lip.pth?download=1

# Copy all app files
COPY . .

# Expose the backend port
EXPOSE 5050

# Start the Flask app
CMD ["python", "app.py"]
