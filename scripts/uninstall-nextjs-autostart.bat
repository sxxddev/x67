@echo off
set "TASK_NAME=X67SecretMe-NextJS"

schtasks /End /TN "%TASK_NAME%" /F >nul 2>&1
schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1

echo [OK] Next.js auto-start removed
pause
