@echo off
REM Uninstall Cloudflare Tunnel Service - Run as Administrator

net session >nul 2>&1
if errorlevel 1 (
  echo Right-click ^> Run as administrator
  pause
  exit /b 1
)

set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"

echo Stopping and removing Cloudflared service...
net stop cloudflared 2>nul
"%CLOUDFLARED%" service uninstall 2>nul

echo [OK] Cloudflare service removed
pause
