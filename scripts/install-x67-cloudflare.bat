@echo off
REM Install Cloudflare Tunnel for x67secretme.shop
REM Right-click > Run as administrator

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo [!] Run as Administrator required
  echo     Right-click install-x67-cloudflare.bat ^> Run as administrator
  echo.
  pause
  exit /b 1
)

set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"
cd /d "%~dp0.."

call "%~dp0_load-cloudflare-token.bat"
if errorlevel 1 (
  echo Add CLOUDFLARE_TUNNEL_TOKEN to .env first
  pause
  exit /b 1
)

echo.
echo ========================================
echo   x67secretme.shop - Cloudflare Tunnel
echo ========================================
echo   Tunnel ID: 31872c21-1dbe-47c6-bd82-93de46e65b11
echo   Domain:    https://x67secretme.shop
echo   Target:    http://localhost:3000
echo ========================================
echo.

if exist "C:\Windows\System32\cloudflared.exe" (
  echo [1] Removing broken cloudflared from System32...
  del /f "C:\Windows\System32\cloudflared.exe" 2>nul
)

echo [2] Uninstalling old service...
"%CLOUDFLARED%" service uninstall 2>nul

echo [3] Installing Windows Service...
"%CLOUDFLARED%" service install %CLOUDFLARE_TUNNEL_TOKEN%
if errorlevel 1 (
  echo [ERROR] Install failed
  pause
  exit /b 1
)

echo [4] Starting service...
sc config cloudflared start= auto >nul
net start cloudflared

echo.
echo [OK] Cloudflare Tunnel installed - runs on boot
echo.
sc query cloudflared | findstr STATE
echo.
echo Next: run scripts\install-nextjs-autostart.bat
echo       or START-website.bat to start now
echo.
pause
