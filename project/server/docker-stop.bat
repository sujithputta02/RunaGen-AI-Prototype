@echo off
echo 🛑 Stopping RunaGen Backend...

docker-compose down

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend stopped successfully!
    
    REM Optional: Remove volumes (uncomment if needed)
    REM echo 🗑️  Removing volumes...
    REM docker-compose down -v
    
    REM Show remaining containers
    echo 📋 Remaining containers:
    docker ps -a --filter "name=runagen"
) else (
    echo ❌ Failed to stop backend!
    exit /b 1
)

pause