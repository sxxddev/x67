@echo off
title x67secretme - Stop Website

echo.
echo Stopping Next.js and Cloudflare Tunnel...
echo.

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)

taskkill /IM cloudflared.exe /F >nul 2>&1

echo [OK] Stopped
echo.
pause
