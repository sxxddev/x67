@echo off
cd /d "%~dp0"
title x67secretme - SSH Key for inwCloud
echo.
echo inwCloud often blocks SSH password. Use SSH key instead.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\generate-hosting-ssh-key.ps1
echo.
pause
