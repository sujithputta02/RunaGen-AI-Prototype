@echo off
echo 🚀 Starting RunaGen Backend with Docker...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found. Creating from template...
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
    echo 📝 Please update .env with your actual credentials
)

REM Run with docker-compose
docker-compose up -d

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend started successfully!
    echo 🌐 API available at: http://localhost:3001
    echo 🔍 Health check: http://localhost:3001/health
    echo.
    echo 📋 Useful commands:
    echo   View logs: docker-compose logs -f backend
    echo   Stop: docker-compose down
    echo   Restart: docker-compose restart backend
) else (
    echo ❌ Failed to start backend!
    exit /b 1
)

pause