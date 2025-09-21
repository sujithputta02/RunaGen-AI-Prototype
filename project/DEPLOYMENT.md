# 🚀 RunaGen AI - Full Stack Deployment Guide

Deploy both frontend and backend to Vercel with this comprehensive guide.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- MongoDB Atlas account
- Google Gemini API key

## 🏗️ Project Structure

```
project/
├── src/                    # Frontend (React + TypeScript)
├── server/                 # Backend (Node.js + Express)
├── vercel.json            # Frontend Vercel config
├── vercel-backend.json    # Backend Vercel config
└── package.json           # Frontend dependencies
```

## 🚀 Deployment Steps

### **Step 1: Prepare GitHub Repository**

1. **Initialize Git** (if not done):
   ```bash
   cd project
   git init
   git add .
   git commit -m "Initial commit: RunaGen AI Full Stack"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Create new repository: `runagen-ai-fullstack`
   - Make it **Public**
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/runagen-ai-fullstack.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy Backend to Vercel**

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Create Backend Project**:
   - Click "New Project"
   - Import your repository
   - **Project Name**: `runagen-ai-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `./server`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Go to Settings > Environment Variables
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     GOOGLE_API_KEY=your_gemini_api_key
     NODE_ENV=production
     ```

4. **Deploy Backend**:
   - Click "Deploy"
   - Wait for deployment
   - Note the backend URL: `https://runagen-ai-backend.vercel.app`

### **Step 3: Deploy Frontend to Vercel**

1. **Create Frontend Project**:
   - Click "New Project" again
   - Import the same repository
   - **Project Name**: `runagen-ai-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. **Set Environment Variables**:
   - Go to Settings > Environment Variables
   - Add this variable:
     ```
     VITE_API_URL=https://runagen-ai-backend.vercel.app
     ```

3. **Deploy Frontend**:
   - Click "Deploy"
   - Wait for deployment
   - Note the frontend URL: `https://runagen-ai-frontend.vercel.app`

### **Step 4: Update Frontend API Configuration**

Update your frontend to use the production backend URL:

1. **Check your API calls** in the frontend code
2. **Update any hardcoded localhost URLs** to use `import.meta.env.VITE_API_URL`
3. **Redeploy frontend** if needed

## 🔧 Configuration Files

### **Frontend Vercel Config** (`vercel.json`):
```json
{
  "version": 2,
  "name": "runagen-ai-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Backend Vercel Config** (`vercel-backend.json`):
```json
{
  "version": 2,
  "name": "runagen-ai-backend",
  "builds": [
    {
      "src": "server/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/src/server.js"
    }
  ]
}
```

## 🌐 Environment Variables

### **Backend Environment Variables**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GOOGLE_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

### **Frontend Environment Variables**:
```env
VITE_API_URL=https://runagen-ai-backend.vercel.app
```

## 📱 Custom Domain Setup

1. **Buy a domain** (optional)
2. **In Vercel Dashboard**:
   - Go to your frontend project
   - Settings > Domains
   - Add your domain
   - Follow DNS configuration

## 🔄 Automatic Deployments

- **Every push to main branch** = Automatic deployment
- **Pull requests** = Preview deployments
- **Both frontend and backend** will deploy automatically

## 🐛 Troubleshooting

### **Common Issues**:

1. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

2. **API Connection Issues**:
   - Verify environment variables are set
   - Check CORS settings in backend
   - Ensure MongoDB Atlas allows Vercel IPs

3. **Environment Variables**:
   - Make sure they're set in Vercel dashboard
   - Check variable names match exactly
   - Redeploy after adding new variables

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check serverless function logs
- **Build Logs**: Monitor deployment status

## 🎉 Success!

After deployment, you'll have:
- **Frontend**: `https://runagen-ai-frontend.vercel.app`
- **Backend**: `https://runagen-ai-backend.vercel.app`
- **Automatic deployments** on every push
- **HTTPS certificates** automatically provided
- **Global CDN** for fast loading

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Happy Deploying! 🚀**


