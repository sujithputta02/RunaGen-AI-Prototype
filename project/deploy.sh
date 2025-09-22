#!/bin/bash

# RunaGen AI Deployment Script
echo "🚀 RunaGen AI Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: RunaGen AI Full Stack"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub remote origin:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/runagen-ai-fullstack.git"
    echo "git branch -M main"
    echo "git push -u origin main"
else
    echo "✅ Remote origin already configured"
    echo "📤 Pushing to GitHub..."
    git add .
    git commit -m "Update: Ready for deployment"
    git push origin main
    echo "✅ Code pushed to GitHub"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Create TWO projects:"
echo "   - Backend: Root directory './project/server'"
echo "   - Frontend: Root directory './'"
echo "4. Set environment variables in Vercel dashboard"
echo "5. Deploy both projects"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo "🎉 Happy Deploying!"


