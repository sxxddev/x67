@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title x67secretme - Prepare Hosting Deploy

echo.
echo ============================================================
echo   x67secretme - Pack for inwCloud / DirectAdmin hosting
echo ============================================================
echo.
echo This will:
echo   1. npm run build
echo   2. Export MySQL database (if mysqldump found)
echo   3. Create deploy\x67secretme-hosting.zip
echo.
echo Make sure MariaDB/MySQL is running on this PC.
echo.

set "HOSTING_DATABASE_URL="
echo Optional: hosting MySQL URL for .env on server
echo Example: mysql://user:pass@localhost:3306/dbname
echo Press Enter to skip and edit .env on hosting later.
set /p HOSTING_DATABASE_URL=Hosting DATABASE_URL: 

echo.
echo [1/2] Building and packing...
set "HOSTING_DATABASE_URL=%HOSTING_DATABASE_URL%"
node scripts\prepare-hosting-deploy.mjs
if errorlevel 1 (
  echo.
  echo [FAILED] See errors above.
  pause
  exit /b 1
)

echo.
echo [2/2] Opening deploy folder...
if exist "deploy\x67secretme-hosting.zip" (
  echo.
  echo SUCCESS: deploy\x67secretme-hosting.zip
  echo Upload this zip to DirectAdmin File Manager.
  echo Extract to: /domains/x67secretme.shop/nextjs/
  echo Then run setup.sh — see deploy\ทำบน-SERVER-3-ขั้น.txt
  echo.
  start "" "%~dp0deploy"
) else (
  echo Zip not found - check errors above.
)

pause
