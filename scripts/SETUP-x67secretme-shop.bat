@echo off
echo.
echo ============================================================
echo   x67secretme.shop - Auto-start Setup (one time)
echo ============================================================
echo.
echo Step 1: Right-click install-x67-cloudflare.bat
echo         ^> Run as administrator
echo         ^(installs Cloudflare Tunnel as Windows Service^)
echo.
echo Step 2: Double-click install-nextjs-autostart.bat
echo         ^(Next.js starts on Windows login^)
echo.
echo Step 3: Check Cloudflare Dashboard
echo         Zero Trust ^> Networks ^> Tunnels
echo         Public Hostname: x67secretme.shop -^> http://localhost:3000
echo.
echo Step 4: Run build once if needed
echo         npm run build
echo.
echo Quick start anytime: double-click START-website.bat
echo.
pause
start "" "%~dp0install-x67-cloudflare.bat"
