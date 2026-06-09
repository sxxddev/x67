@echo off
chcp 65001 >nul
setlocal EnableExtensions

cd /d "%~dp0"
title MQ Demo - Setup Database

echo ========================================
echo   MQ Demo - Setup Database
echo ========================================
echo.
echo ตั้งค่า DATABASE_URL ใน .env และ import ข้อมูลตัวอย่าง
echo.

set "DB_HOST=localhost"
set "DB_PORT=3306"
set "DB_USER=root"
set "DB_NAME=x67projectofficial"

set /p DB_USER=MySQL user [%DB_USER%]: 
if "%DB_USER%"=="" set "DB_USER=root"

set /p DB_PASS=MySQL password (รหัสจริงของ %DB_USER%): 
if "%DB_PASS%"=="" (
    echo [ERROR] ต้องใส่รหัสผ่าน
    pause
    exit /b 1
)

echo.
echo [INFO] Writing .env ...

if not exist ".env" (
    if exist ".env.example" (
        copy /Y ".env.example" ".env" >nul
    ) else (
        echo AUTH_SECRET="mq-demo-local-secret"> ".env"
    )
)

set "SETUP_DB_PASS=%DB_PASS%"
set "SETUP_DB_USER=%DB_USER%"
powershell -NoProfile -Command ^
  "$url = 'mysql://' + $env:SETUP_DB_USER + ':' + [uri]::EscapeDataString($env:SETUP_DB_PASS) + '@%DB_HOST%:%DB_PORT%/%DB_NAME%';" ^
  "$lines = Get-Content '.env' -ErrorAction SilentlyContinue;" ^
  "if (-not $lines) { $lines = @() };" ^
  "$found = $false;" ^
  "$out = foreach ($line in $lines) { if ($line -match '^DATABASE_URL=') { 'DATABASE_URL=\"' + $url + '\"'; $found = $true } else { $line } };" ^
  "if (-not $found) { $out = @('DATABASE_URL=\"' + $url + '\"') + $out };" ^
  "if (-not ($out -match '^AUTH_SECRET=')) { $out += 'AUTH_SECRET=\"mq-demo-local-secret\"' };" ^
  "$out | Set-Content '.env' -Encoding UTF8"
set "SETUP_DB_PASS="
set "SETUP_DB_USER="

echo [OK] DATABASE_URL updated in .env
echo.

set "MYSQL_CMD="
where mysql >nul 2>&1
if not errorlevel 1 set "MYSQL_CMD=mysql"

if not defined MYSQL_CMD if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_CMD=C:\xampp\mysql\bin\mysql.exe"
if not defined MYSQL_CMD if exist "C:\Program Files\MariaDB 11.6\bin\mysql.exe" set "MYSQL_CMD=C:\Program Files\MariaDB 11.6\bin\mysql.exe"
if not defined MYSQL_CMD if exist "C:\Program Files\MariaDB 10.11\bin\mysql.exe" set "MYSQL_CMD=C:\Program Files\MariaDB 10.11\bin\mysql.exe"
if not defined MYSQL_CMD if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_CMD=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if defined MYSQL_CMD (
    echo [INFO] Importing mq_sql_demo.sql ...
    "%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% < "mq_sql_demo.sql"
    if errorlevel 1 (
        echo [WARN] SQL import failed. Check password and that MariaDB/MySQL is running.
    ) else (
        echo [OK] Database imported.
    )
    echo.
) else (
    echo [WARN] mysql.exe not found in PATH.
    echo        Import mq_sql_demo.sql manually in HeidiSQL / phpMyAdmin / DBeaver
    echo.
)

where pnpm >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Syncing Prisma schema ...
    call pnpm exec prisma db push
    if errorlevel 1 (
        echo [ERROR] prisma db push failed. Check MariaDB/MySQL service is running.
        pause
        exit /b 1
    )
    echo [OK] Prisma schema synced.
) else (
    echo [WARN] pnpm not found. Run run-server.bat after installing Node/pnpm.
)

echo.
echo [DONE] Database ready. Run run-server.bat to start the website.
echo.
pause
