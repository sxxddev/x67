@echo off
title x67secretme - Next.js
cd /d "%~dp0.."

if not exist "node_modules\" (
  echo [ERROR] node_modules not found - run npm install first
  pause
  exit /b 1
)

if not exist ".next\BUILD_ID" (
  echo [INFO] No build found - running npm run build...
  call npm run build
  if errorlevel 1 (
    echo [ERROR] build failed
    pause
    exit /b 1
  )
)

echo [INFO] Starting Next.js at http://localhost:3000
call npm start
