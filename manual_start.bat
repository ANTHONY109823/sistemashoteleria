@echo off
echo Starting Hotel System...

:: Start Backend
start "HotelSystem API" /d "src\HotelSystem.API" dotnet run

:: Wait a bit for backend to start
timeout /t 5 /nobreak >nul

:: Start Frontend with Host flag
start "HotelSystem Web" /d "src\HotelSystem.Web" npm run dev -- --host

echo Services started!
echo API: http://localhost:5036/swagger
echo Web: http://localhost:5173
pause
