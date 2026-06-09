@echo off
REM Install cloudflared as Windows Service - Run as Administrator

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo [!] Right-click ^> Run as administrator
  echo.
  pause
  exit /b 1
)

call "%~dp0_load-cloudflare-token.bat" %*
if errorlevel 1 (
  pause
  exit /b 1
)

set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"

echo.
echo === Install Cloudflare Tunnel Service ===
echo.

if exist "C:\Windows\System32\cloudflared.exe" (
  echo [WARN] Removing broken cloudflared from System32...
  del /f "C:\Windows\System32\cloudflared.exe" 2>nul
)

echo [1/3] Uninstalling old service if any...
"%CLOUDFLARED%" service uninstall 2>nul

echo [2/3] Installing new service...
"%CLOUDFLARED%" service install %CLOUDFLARE_TUNNEL_TOKEN%
if errorlevel 1 (
  echo [ERROR] Install failed - check token in .env
  pause
  exit /b 1
)

echo [3/3] Starting service...
sc start cloudflared 2>nul
net start cloudflared 2>nul

echo.
echo [OK] Cloudflare Tunnel running as Service
echo      Starts automatically on boot
echo.
echo Status:  services.msc  ^>  Cloudflared agent
echo Stop:    net stop cloudflared
echo Remove:  scripts\uninstall-cloudflare-service.bat
echo.
pause
