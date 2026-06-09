@echo off
chcp 65001 >nul
setlocal EnableExtensions

cd /d "%~dp0"
title x67secretme - Set Admin Role

echo ========================================
echo   ตั้งสิทธิ์ ADMIN ให้บัญชีผู้ใช้
echo ========================================
echo.

set /p USERNAME=ชื่อผู้ใช้ (username): 
if "%USERNAME%"=="" (
    echo [ERROR] ต้องใส่ username
    pause
    exit /b 1
)

set "MYSQL="
if exist "D:\MariaDB 12.2\bin\mysql.exe" set "MYSQL=D:\MariaDB 12.2\bin\mysql.exe"
if not defined MYSQL if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL=C:\xampp\mysql\bin\mysql.exe"
if not defined MYSQL (
    where mysql >nul 2>&1 && set "MYSQL=mysql"
)

if not defined MYSQL (
    echo [ERROR] ไม่พบ mysql.exe
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if "%%A"=="DATABASE_URL" set "DATABASE_URL=%%B"
)
set "DATABASE_URL=%DATABASE_URL:"=%"

for /f "tokens=1,2 delims=@" %%A in ("%DATABASE_URL%") do set "REST=%%B"
for /f "tokens=1,2 delims=:" %%A in ("%REST%") do (
    set "DB_USER=%%A"
    set "REST2=%%B"
)
for /f "tokens=1,2 delims=@" %%A in ("%REST2%") do set "DB_PASS=%%A"
for /f "tokens=1 delims=/" %%A in ("%REST2%") do set "DB_HOSTPORT=%%A"
for /f "tokens=1,2 delims=:" %%A in ("%DB_HOSTPORT%") do (
    set "DB_HOST=%%A"
    set "DB_PORT=%%B"
)
for /f "tokens=2 delims=/" %%A in ("%DATABASE_URL%") do set "DB_NAME=%%A"

echo [INFO] อัปเดต role เป็น ADMIN สำหรับ: %USERNAME%
"%MYSQL%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "UPDATE user SET role='ADMIN' WHERE username='%USERNAME%'; SELECT id, username, role FROM user WHERE username='%USERNAME%';"

if errorlevel 1 (
    echo [ERROR] อัปเดตไม่สำเร็จ — ตรวจ MariaDB และ .env
    pause
    exit /b 1
)

echo.
echo [OK] ถ้าเห็น role = ADMIN แล้ว เข้า http://localhost:3000/admin ได้
echo      ออกจากระบบแล้ว login ใหม่ 1 ครั้ง
echo.
pause
