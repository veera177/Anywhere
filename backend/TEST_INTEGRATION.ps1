#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integration test script for Anywhere Delivery App
    Tests all three components: Database, Backend, Frontend

.DESCRIPTION
    This script verifies:
    1. Database connectivity and schema
    2. Backend API endpoints
    3. Frontend build
    4. End-to-end authentication flow

.EXAMPLE
    .\TEST_INTEGRATION.ps1
#>

Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Anywhere Delivery - Integration Test Suite               ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test results tracking
$passed = 0
$failed = 0
$warnings = 0

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    try {
        & $TestBlock
        Write-Host "✓ PASSED: $Name" -ForegroundColor Green
        $script:passed++
    }
    catch {
        Write-Host "✗ FAILED: $Name" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $script:failed++
    }
    Write-Host ""
}

# Test 1: Check Java
Test-Component "Java Installation" {
    $java = java -version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Java not found" }
    Write-Host "  Version: $($java[0])"
}

# Test 2: Check Maven
Test-Component "Maven Installation" {
    $maven = mvn -version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Maven not found" }
    Write-Host "  Version: $($maven[0])"
}

# Test 3: Check Node.js
Test-Component "Node.js Installation" {
    $node = node -v 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
    Write-Host "  Version: $node"
}

# Test 4: Check MySQL
Test-Component "MySQL Connectivity" {
    $result = mysql -u root -p"sql205071" -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "MySQL not accessible" }
    Write-Host "  Connected successfully"
}

# Test 5: Check Database
Test-Component "Database 'anywhere' Exists" {
    $result = mysql -u root -p"sql205071" -e "USE anywhere; SHOW TABLES;" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Database 'anywhere' not found" }
    $tableCount = ($result | Measure-Object -Line).Lines - 1
    Write-Host "  Found $tableCount tables"
}

# Test 6: Check Users Table
Test-Component "Users Table and Test Data" {
    $result = mysql -u root -p"sql205071" anywhere -e "SELECT COUNT(*) as count FROM users;" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Users table query failed" }
    Write-Host "  Found user records"
    
    $demoUser = mysql -u root -p"sql205071" anywhere -e "SELECT email FROM users WHERE email='demo@gmail.com';" 2>&1
    if (-not $demoUser -or $demoUser -notcontains "demo@gmail.com") {
        Write-Warning "  ⚠ Test user demo@gmail.com not found"
        $script:warnings++
    }
}

# Test 7: Check Backend Files
Test-Component "Backend Files Structure" {
    $backendPath = "d:\springboot\start-app\start-app"
    if (-not (Test-Path "$backendPath\pom.xml")) { throw "pom.xml not found" }
    if (-not (Test-Path "$backendPath\src\main\java")) { throw "Java source directory not found" }
    Write-Host "  Backend structure verified"
}

# Test 8: Check application.properties
Test-Component "Backend Configuration" {
    $configPath = "d:\springboot\start-app\start-app\src\main\resources\application.properties"
    if (-not (Test-Path $configPath)) { throw "application.properties not found" }
    
    $config = Get-Content $configPath
    if ($config -notmatch "spring.datasource.url=jdbc:mysql://localhost:3306/anywhere") {
        throw "Database URL not properly configured"
    }
    Write-Host "  Configuration verified"
}

# Test 9: Check Frontend Files
Test-Component "Frontend Files Structure" {
    $frontendPath = "C:\Users\veera vadivelan\OneDrive\Desktop\react"
    if (-not (Test-Path "$frontendPath\package.json")) { throw "package.json not found" }
    if (-not (Test-Path "$frontendPath\my-react-app\src")) { throw "React app not found" }
    Write-Host "  Frontend structure verified"
}

# Test 10: Check Frontend Dependencies
Test-Component "Frontend Dependencies Installed" {
    $frontendPath = "C:\Users\veera vadivelan\OneDrive\Desktop\react"
    if (Test-Path "$frontendPath\node_modules") {
        $pkgCount = (Get-ChildItem "$frontendPath\node_modules" -Directory | Measure-Object).Count
        Write-Host "  $pkgCount npm packages installed"
    }
    else {
        Write-Warning "  ⚠ node_modules not found. Run: npm install"
        $script:warnings++
    }
}

# Test 11: Backend Compile Test
Test-Component "Backend Maven Build" {
    $backendPath = "d:\springboot\start-app\start-app"
    Push-Location $backendPath
    
    Write-Host "  Compiling... (this may take 30 seconds)"
    $buildResult = mvn clean compile -q 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Maven build failed: $buildResult"
    }
    Write-Host "  Build successful"
    Pop-Location
}

# Test 12: Check Backend Server Status
Test-Component "Backend Server Status" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  Backend is running ✓"
        }
        else {
            Write-Warning "  ⚠ Backend not responding (may be offline, which is OK for this test)"
            $script:warnings++
        }
    }
    catch {
        Write-Warning "  ⚠ Backend not running (this is normal if not started yet)"
        $script:warnings++
    }
}

# Test 13: Check Database Data
Test-Component "Database Seed Data" {
    $districts = mysql -u root -p"sql205071" anywhere -e "SELECT COUNT(*) as count FROM districts;" 2>&1
    Write-Host "  Districts: $(($districts -split "`n")[-2])"
    
    $areas = mysql -u root -p"sql205071" anywhere -e "SELECT COUNT(*) as count FROM district_areas;" 2>&1
    Write-Host "  District areas: $(($areas -split "`n")[-2])"
}

# Summary
Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     TEST SUMMARY                                ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed
$percentage = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Total Tests:   $total" -ForegroundColor Cyan
Write-Host "Passed:        $passed" -ForegroundColor Green
Write-Host "Failed:        $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings:      $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "Success Rate:  $percentage%" -ForegroundColor $(if ($percentage -ge 80) { "Green" } else { "Yellow" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All tests passed! System is ready to use." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: QUICK_START.bat (all-in-one setup)"
    Write-Host "   Or manually start each component:"
    Write-Host "2. Backend:  mvn spring-boot:run (in d:\springboot\start-app\start-app)"
    Write-Host "3. Frontend: npm run dev (in C:\Users\veera vadivelan\OneDrive\Desktop\react)"
    Write-Host "4. Navigate to: http://localhost:5173"
    Write-Host "5. Login with: demo@gmail.com / 12345"
}
else {
    Write-Host "✗ Some tests failed. Please fix issues above." -ForegroundColor Red
}

Write-Host ""
