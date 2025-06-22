FROM python:3.10-slim

# Install ffmpeg and any other system dependencies
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Expose port used by Flask
ENV PORT=10000
EXPOSE 10000

# Start Flask app using gunicorn (for production)
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
