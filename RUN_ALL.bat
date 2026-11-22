@echo off
REM Master script to start everything together

echo.
echo ═══════════════════════════════════════════════════════════════
echo        Anywhere Delivery - All In One Starter
echo ═══════════════════════════════════════════════════════════════
echo.
echo This will:
echo 1. Setup database
echo 2. Start backend server (Terminal 1)
echo 3. Start frontend dev server (Terminal 2)
echo 4. Open browser to http://localhost:5173
echo.
echo Make sure MySQL is running!
echo.
pause

REM Root folder of this project. Do not hard-code a drive letter.
set "ROOT=%~dp0"

echo.
echo Step 1: Starting backend, Ollama and ChromaDB (Terminal 1)...
start "Anywhere Backend - Keep Open" cmd /k "cd /d \"%ROOT%\" && mvn spring-boot:run"

echo.
echo Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak

echo.
echo Step 2: Starting frontend (Terminal 2)...
start "Anywhere Frontend - Keep Open" cmd /k "cd /d \"%ROOT%my-react-app\" && npm run dev"

echo.
echo Waiting 10 seconds for frontend to start...
timeout /t 10 /nobreak

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✓ All services are starting!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Opening browser...
timeout /t 3

start http://localhost:5173

echo.
echo ✓ Application should be loading in your browser
echo.
echo Test User:
echo   Email:    demo@gmail.com
echo   Password: 12345
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Keep both terminal windows open while working!
echo.
pause
