# Dockerfile
FROM python:3.9-slim

# Install system packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    git-lfs \
    cmake \
    build-essential \
    python3-dev \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1-mesa-glx \
    && apt-get clean

# Set workdir
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --use-deprecated=legacy-resolver -r requirements.txt

# Copy all code
COPY . .

# Expose port
EXPOSE 5050

# Start the backend
CMD ["python3", "app.py"]
