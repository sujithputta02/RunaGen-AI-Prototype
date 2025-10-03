#!/bin/bash

# Docker run script for RunaGen Backend
echo "🚀 Starting RunaGen Backend with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cat > .env << EOF
# Backend Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GOOGLE_API_KEY=your_gemini_api_key_here
NODE_ENV=production
PORT=3001

# Vertex AI Configuration
VERTEX_PROJECT_ID=your_project_id
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-2.5-flash

# Optional APIs
YOUTUBE_API_KEY=your_youtube_api_key_here
EOF
    echo "📝 Please update .env with your actual credentials"
fi

# Run with docker-compose
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Backend started successfully!"
    echo "🌐 API available at: http://localhost:3001"
    echo "🔍 Health check: http://localhost:3001/health"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker-compose logs -f backend"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart backend"
else
    echo "❌ Failed to start backend!"
    exit 1
fi