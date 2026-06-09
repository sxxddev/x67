@echo off
cd /d "%~dp0"
title x67secretme - Remote hosting setup (SSH)
echo.
echo Runs npm install on inwCloud via SSH key.
echo If password failed before: run GENERATE-SSH-KEY-FOR-HOSTING.bat first.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\setup-hosting-remote.ps1
echo.
pause
