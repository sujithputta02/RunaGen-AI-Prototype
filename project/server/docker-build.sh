#!/bin/bash

# Docker build script for RunaGen Backend
echo "🐳 Building RunaGen Backend Docker Image..."

# Build the Docker image
docker build -t runagen-backend:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "📦 Image: runagen-backend:latest"
    
    # Show image size
    echo "📊 Image size:"
    docker images runagen-backend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
else
    echo "❌ Docker build failed!"
    exit 1
fi