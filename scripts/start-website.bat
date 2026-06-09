@echo off
title x67secretme - Start Website
cd /d "%~dp0.."
set "ROOT=%CD%"

echo.
echo ========================================
echo   x67secretme.shop - Start Website
echo ========================================
echo.

set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"
if not exist "%CLOUDFLARED%" (
  echo [ERROR] cloudflared not found at "%CLOUDFLARED%"
  echo         Download: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
  pause
  exit /b 1
)

set "CLOUDFLARE_TUNNEL_TOKEN="
if exist "%ROOT%\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b /c:"CLOUDFLARE_TUNNEL_TOKEN=" "%ROOT%\.env" 2^>nul`) do (
    set "CLOUDFLARE_TUNNEL_TOKEN=%%B"
  )
)
set "CLOUDFLARE_TUNNEL_TOKEN=%CLOUDFLARE_TUNNEL_TOKEN:"=%"
set "CLOUDFLARE_TUNNEL_TOKEN=%CLOUDFLARE_TUNNEL_TOKEN: =%"

if not "%~1"=="" set "CLOUDFLARE_TUNNEL_TOKEN=%~1"

if "%CLOUDFLARE_TUNNEL_TOKEN%"=="" (
  echo [ERROR] CLOUDFLARE_TUNNEL_TOKEN not found in .env
  pause
  exit /b 1
)

if not exist "%ROOT%\node_modules\" (
  echo [ERROR] node_modules not found - run npm install first
  pause
  exit /b 1
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [INFO] Stopping old Next.js on port 3000...
  for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>&1
  )
  timeout /t 2 /nobreak >nul
)

echo [INFO] Building latest changes...
call npm run build
if errorlevel 1 (
  echo [ERROR] build failed
  pause
  exit /b 1
)

echo [1/2] Starting Next.js...
start "x67secretme NextJS" cmd /k "cd /d %ROOT% & npm start"

echo [INFO] Waiting for http://localhost:3000 ...
set /a WAIT=0
:wait_next
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 goto start_tunnel
set /a WAIT+=2
if %WAIT% GEQ 90 (
  echo [ERROR] Next.js did not start within 90 seconds
  pause
  exit /b 1
)
goto wait_next

:start_tunnel
echo [2/2] Starting Cloudflare Tunnel...
start "x67secretme Tunnel" cmd /k "cd /d %ROOT% & call scripts\start-cloudflare-tunnel.bat"

echo.
echo [OK] Website started
echo      Local:  http://localhost:3000
echo      Public: https://x67secretme.shop
echo.
echo To stop: close both windows or run scripts\stop-website.bat
echo.
pause
