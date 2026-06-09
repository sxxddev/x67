@echo off
REM Next.js auto-start on Windows login (Task Scheduler)
setlocal
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"
set "RUN_SCRIPT=%PROJECT_ROOT%\scripts\run-nextjs-production.bat"
set "TASK_NAME=X67SecretMe-NextJS"
set "TR_CMD=cmd.exe /c \"%RUN_SCRIPT%\""

echo.
echo === Next.js Auto-start on Login ===
echo Folder: %PROJECT_ROOT%
echo.

schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1

schtasks /Create /TN "%TASK_NAME%" /TR %TR_CMD% /SC ONLOGON /DELAY 0000:45 /F

if errorlevel 1 (
  echo [ERROR] Failed to create Task
  pause
  exit /b 1
)

echo [OK] Task Scheduler configured
echo      Next.js will start 45 seconds after login
echo.
echo Run now:  schtasks /Run /TN "%TASK_NAME%"
echo Remove:   scripts\uninstall-nextjs-autostart.bat
echo.
pause
