@echo off
REM Double-click: open window that stays open. From CMD: run-server.bat [--skip-db]
if /i not "%~1"=="_go" (
    start "x67secretme" cmd /k call "%~f0" _go %*
    exit /b 0
)

setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1

cd /d "%~dp0"
title x67secretme - Web Server

set "SKIP_DB=0"
if /i "%~2"=="--skip-db" set "SKIP_DB=1"
if /i "%~2"=="/skip-db" set "SKIP_DB=1"

echo ========================================
echo   x67secretme - Start Web Server
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    goto :fail
)

for /f "delims=" %%V in ('node -v 2^>nul') do set "NODE_VER=%%V"
echo [OK] Node !NODE_VER!
echo.

set "PM=npm"
where pnpm >nul 2>&1
if not errorlevel 1 set "PM=pnpm"

echo [INFO] Package manager: !PM!
echo.

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example ...
        copy /Y ".env.example" ".env" >nul
        echo [WARN] Edit .env: DATABASE_URL and AUTH_SECRET
    ) else (
        echo [WARN] .env missing - create it before login/shop
    )
    echo.
)

if exist "node_modules\.package-lock.json" (
    echo [INFO] Removing npm node_modules, reinstall with !PM!...
    rmdir /s /q "node_modules" 2>nul
    echo.
)

echo [INFO] Installing dependencies...
if /i "!PM!"=="pnpm" (
    call pnpm install
) else (
    call npm install
)
if errorlevel 1 (
    if not exist "node_modules\next\" (
        echo [ERROR] Install failed. Delete node_modules and retry.
        goto :fail
    )
    echo [WARN] Install had warnings, continuing...
)
echo.

echo [INFO] prisma generate ...
if /i "!PM!"=="pnpm" (
    call pnpm exec prisma generate
) else (
    call npx prisma generate
)
if errorlevel 1 (
    echo [ERROR] prisma generate failed.
    goto :fail
)
echo.

if "!SKIP_DB!"=="1" (
    echo [INFO] Skipping db push --skip-db
    echo.
) else (
    echo [INFO] prisma db push ...
    if /i "!PM!"=="pnpm" (
        call pnpm exec prisma db push
    ) else (
        call npx prisma db push
    )
    if errorlevel 1 (
        echo.
        echo [ERROR] Database connection failed.
        echo   - Start MariaDB / MySQL / XAMPP
        echo   - Run setup-database.bat
        echo   - Fix DATABASE_URL in .env
        echo.
        echo [TIP] Skip DB: run-server.bat --skip-db
        echo.
        goto :fail
    )
    echo [OK] Database connected.
    echo.
)

if exist "fivem-ac-monitor\fivem-cache.json" (
    echo [OK] FiveM cache ready
) else (
    echo [INFO] /program-status may load slow on first visit
)
echo.

echo [INFO] Starting dev server...
echo.
echo   Home            http://localhost:3000
echo   Program status  http://localhost:3000/program-status
echo   API docs        http://localhost:3000/api-docs
echo.
echo [INFO] Bundler: webpack (Turbopack opt-out)
echo.
echo   Press Ctrl+C to stop
echo ========================================
echo.

if /i "!PM!"=="pnpm" (
    call pnpm exec next dev --webpack
) else (
    call npx next dev --webpack
)

if errorlevel 1 (
    echo.
    echo [ERROR] Dev server exited with error.
    goto :fail
)

goto :end

:fail
echo.
echo Press any key to close...
pause >nul
exit /b 1

:end
echo.
echo Server stopped. Press any key to close...
pause >nul
exit /b 0
