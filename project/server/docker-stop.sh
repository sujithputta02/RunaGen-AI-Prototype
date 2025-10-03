#!/bin/bash

# Docker stop script for RunaGen Backend
echo "🛑 Stopping RunaGen Backend..."

docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ Backend stopped successfully!"
    
    # Optional: Remove volumes (uncomment if needed)
    # echo "🗑️  Removing volumes..."
    # docker-compose down -v
    
    # Show remaining containers
    echo "📋 Remaining containers:"
    docker ps -a --filter "name=runagen"
else
    echo "❌ Failed to stop backend!"
    exit 1
fi