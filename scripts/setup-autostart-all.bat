@echo off
REM Install Cloudflare Service + Next.js auto-start
REM Right-click ^> Run as administrator

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo [!] Run as Administrator required
  echo     Right-click setup-autostart-all.bat ^> Run as administrator
  echo.
  pause
  exit /b 1
)

echo.
echo ========================================
echo   x67secretme - Auto-start Setup
echo ========================================
echo.
echo Will install:
echo   1. Cloudflare Tunnel ^(Windows Service^)
echo   2. Next.js ^(Task Scheduler on login^)
echo.
echo Before running: set CLOUDFLARE_TUNNEL_TOKEN in .env
echo                 run npm run build at least once
echo.
pause

call "%~dp0install-cloudflare-service.bat"
if errorlevel 1 exit /b 1

echo.
call "%~dp0install-nextjs-autostart.bat"

echo.
echo ========================================
echo   Done
echo ========================================
echo.
echo After reboot / login:
echo   - Cloudflare Tunnel runs automatically ^(Service^)
echo   - Next.js starts ~45 seconds after login
echo.
echo Check Cloudflare: services.msc
echo Check Next.js:      Task Scheduler ^> X67SecretMe-NextJS
echo.
pause
