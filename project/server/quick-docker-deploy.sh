#!/bin/bash

echo "🚀 RunaGen Backend - Quick Docker Deployment"
echo "================================================"

echo ""
echo "📋 Step 1: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker is installed"

echo ""
echo "📋 Step 2: Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not available"
    echo "Please install Docker Compose"
    exit 1
fi
echo "✅ Docker Compose is available"

echo ""
echo "📋 Step 3: Checking environment file..."
if [ ! -f .env ]; then
    echo "⚠️  Creating .env template..."
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
    echo "Opening .env file for editing..."
    ${EDITOR:-nano} .env
    echo ""
    read -p "Have you updated the .env file with your credentials? (y/n): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "❌ Please update .env file and run this script again"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

echo ""
echo "📋 Step 4: Building Docker image..."
docker build -t runagen-backend:latest .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi
echo "✅ Docker image built successfully"

echo ""
echo "📋 Step 5: Starting backend service..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start backend service!"
    exit 1
fi

echo ""
echo "📋 Step 6: Waiting for service to be ready..."
sleep 10

echo ""
echo "📋 Step 7: Testing health endpoint..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is healthy and ready!"
else
    echo "⚠️  Backend may still be starting up..."
fi

echo ""
echo "🎉 Deployment Complete!"
echo "================================================"
echo "🌐 API URL: http://localhost:3001"
echo "🔍 Health Check: http://localhost:3001/health"
echo "📊 View logs: docker-compose logs -f backend"
echo "🛑 Stop service: docker-compose down"
echo ""
echo "📋 YouTube Service Fix Applied:"
echo "✅ Fixed undefined results error in usetube library"
echo "✅ Added proper error handling and fallbacks"
echo ""