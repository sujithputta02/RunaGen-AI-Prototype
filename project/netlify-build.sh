#!/bin/bash
echo "🚀 Building AI Career Intelligence Platform for Netlify..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
echo "✅ Build verification..."
if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder created"
    ls -la dist/
else
    echo "❌ Build failed - no dist folder found"
    exit 1
fi

echo "🎉 Netlify build complete!"