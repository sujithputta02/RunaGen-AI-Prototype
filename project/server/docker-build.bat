@echo off
echo 🐳 Building RunaGen Backend Docker Image...

REM Build the Docker image
docker build -t runagen-backend:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker image built successfully!
    echo 📦 Image: runagen-backend:latest
    
    REM Show image size
    echo 📊 Image size:
    docker images runagen-backend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
) else (
    echo ❌ Docker build failed!
    exit /b 1
)

pause