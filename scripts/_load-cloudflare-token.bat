@echo off
setlocal
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"

set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"

if not exist "%CLOUDFLARED%" (
  echo [ERROR] cloudflared not found at "%CLOUDFLARED%"
  exit /b 1
)

set "CLOUDFLARE_TUNNEL_TOKEN="
if exist "%PROJECT_ROOT%\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b /c:"CLOUDFLARE_TUNNEL_TOKEN=" "%PROJECT_ROOT%\.env" 2^>nul`) do (
    set "CLOUDFLARE_TUNNEL_TOKEN=%%B"
  )
)
set "CLOUDFLARE_TUNNEL_TOKEN=%CLOUDFLARE_TUNNEL_TOKEN:"=%"
set "CLOUDFLARE_TUNNEL_TOKEN=%CLOUDFLARE_TUNNEL_TOKEN: =%"

if not "%~1"=="" set "CLOUDFLARE_TUNNEL_TOKEN=%~1"

if "%CLOUDFLARE_TUNNEL_TOKEN%"=="" (
  echo [ERROR] CLOUDFLARE_TUNNEL_TOKEN not found
  echo Add it to .env or pass as argument
  exit /b 1
)

endlocal & set "CLOUDFLARE_TUNNEL_TOKEN=%CLOUDFLARE_TUNNEL_TOKEN%" & set "CLOUDFLARED=%CLOUDFLARED%"
exit /b 0
