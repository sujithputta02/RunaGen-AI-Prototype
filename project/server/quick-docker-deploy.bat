@echo off
echo 🚀 RunaGen Backend - Quick Docker Deployment
echo ================================================

echo.
echo 📋 Step 1: Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker is installed

echo.
echo 📋 Step 2: Checking Docker Compose...
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Desktop is running
    pause
    exit /b 1
)
echo ✅ Docker Compose is available

echo.
echo 📋 Step 3: Checking environment file...
if not exist .env (
    echo ⚠️  Creating .env template...
    (
        echo # Backend Environment Variables
        echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
        echo GOOGLE_API_KEY=your_gemini_api_key_here
        echo NODE_ENV=production
        echo PORT=3001
        echo.
        echo # Vertex AI Configuration
        echo VERTEX_PROJECT_ID=your_project_id
        echo VERTEX_LOCATION=us-central1
        echo VERTEX_MODEL=gemini-2.5-flash
        echo.
        echo # Optional APIs
        echo YOUTUBE_API_KEY=your_youtube_api_key_here
    ) > .env
    echo 📝 Please update .env with your actual credentials before continuing
    echo Press any key to open .env file for editing...
    pause >nul
    notepad .env
    echo.
    echo Have you updated the .env file with your credentials? (y/n)
    set /p confirm=
    if /i not "%confirm%"=="y" (
        echo ❌ Please update .env file and run this script again
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file exists
)

echo.
echo 📋 Step 4: Building Docker image...
docker build -t runagen-backend:latest .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)
echo ✅ Docker image built successfully

echo.
echo 📋 Step 5: Starting backend service...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start backend service!
    pause
    exit /b 1
)

echo.
echo 📋 Step 6: Waiting for service to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 📋 Step 7: Testing health endpoint...
curl -s http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is healthy and ready!
) else (
    echo ⚠️  Backend may still be starting up...
)

echo.
echo 🎉 Deployment Complete!
echo ================================================
echo 🌐 API URL: http://localhost:3001
echo 🔍 Health Check: http://localhost:3001/health
echo 📊 View logs: docker-compose logs -f backend
echo 🛑 Stop service: docker-compose down
echo.
echo 📋 YouTube Service Fix Applied:
echo ✅ Fixed undefined results error in usetube library
echo ✅ Added proper error handling and fallbacks
echo.

pause