# Dockerfile
FROM node:18

# Install ffmpeg for video generation
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire source code
COPY . .

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
