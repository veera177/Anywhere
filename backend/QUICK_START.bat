@echo off
REM Quick Start Script for Backend Only
REM This script starts just the Spring Boot backend

echo.
echo ═══════════════════════════════════════════════════════════════
echo        Anywhere Backend - Quick Start
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check Java
java -version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 11 or higher
    pause
    exit /b
)
echo ✓ Java found

REM Check Maven
mvn -version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Maven is not installed or not in PATH
    echo Please install Maven
    pause
    exit /b
)
echo ✓ Maven found

REM Check MySQL
mysql -u root -p -e "SELECT 1;" >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ MySQL is not running or not accessible
    echo Please start MySQL service
    pause
    exit /b
)
echo ✓ MySQL is running

echo.
cd /d d:\springboot\start-app\start-app

echo ═══════════════════════════════════════════════════════════════
echo Starting Spring Boot Backend...
echo ═══════════════════════════════════════════════════════════════
echo.
echo Backend will be available at: http://localhost:8080
echo Health check: http://localhost:8080/actuator/health
echo.
echo Make sure MySQL database "anywhere" is initialized
echo Run: mysql -u root -p < D:\anywhere\SETUP_DATABASE.sql
echo.

mvn spring-boot:run

pause
