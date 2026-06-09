@echo off
set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"

if not exist "%CLOUDFLARED%" (
  echo cloudflared not found - install from Cloudflare website
  pause
  exit /b 1
)

call "%~dp0_load-cloudflare-token.bat" %*
if errorlevel 1 (
  echo.
  echo Set CLOUDFLARE_TUNNEL_TOKEN in .env first, then run again
  echo Or: scripts\start-cloudflare-tunnel.bat YOUR_TOKEN
  echo.
  pause
  exit /b 1
)

echo.
echo [TIP] One-click start: START-website.bat
echo.

"%CLOUDFLARED%" tunnel run --token %CLOUDFLARE_TUNNEL_TOKEN%
