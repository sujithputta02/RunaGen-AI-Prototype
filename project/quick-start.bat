@echo off
echo 🚀 Starting AI Career Intelligence Platform for Hackathon Demo
echo.

echo 📁 Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm start"
timeout /t 3

echo 🎨 Starting Frontend Application...
cd ..
start "Frontend App" cmd /k "npm run dev"
timeout /t 3

echo 🌐 Opening Demo URLs...
start http://localhost:3001/health
start http://localhost:5174

echo.
echo ✅ Platform is starting up!
echo 🎪 Backend: http://localhost:3001
echo 🎨 Frontend: http://localhost:5174
echo.
echo 🏆 Ready for hackathon demo!
pause