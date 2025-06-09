# Use slim Python base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install only essential system packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the Flask port
EXPOSE 5050

# Start the app
CMD ["python", "app.py"]
