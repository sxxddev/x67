@echo off
chcp 65001 >nul
setlocal EnableExtensions

:: ต้อง Run as Administrator
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] คลิกขวาไฟล์นี้ แล้วเลือก "Run as administrator"
    pause
    exit /b 1
)

set "MARIADB_ROOT=D:\MariaDB 12.2"
set "MY_INI=%MARIADB_ROOT%\data\my.ini"
set "MYSQLD=%MARIADB_ROOT%\bin\mysqld.exe"
set "DATA_DIR=%MARIADB_ROOT%\data"
set "TC_LOG=%DATA_DIR%\tc.log"

echo ========================================
echo   Fix MariaDB 12.2 - Start Service
echo ========================================
echo.

if not exist "%MYSQLD%" (
    echo [ERROR] ไม่พบ %MYSQLD%
    pause
    exit /b 1
)

echo [INFO] หยุด MariaDB ...
net stop MariaDB >nul 2>&1
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if exist "%TC_LOG%" (
    echo [INFO] พบ tc.log เสีย — backup แล้วลบ (แก้ Bad magic header) ...
    copy /Y "%TC_LOG%" "%TC_LOG%.bak.%RANDOM%" >nul
    del /F /Q "%TC_LOG%"
    echo [OK] ลบ tc.log แล้ว
    echo.
)

sc query MariaDB >nul 2>&1
if errorlevel 1 (
    echo [INFO] ลงทะเบียน service MariaDB 12.2 ...
    "%MYSQLD%" --install MariaDB --defaults-file="%MY_INI%"
) else (
    echo [INFO] ตรวจ service — ชี้ไป MariaDB 12.2 แล้ว
)

echo [INFO] เริ่ม MariaDB ...
net start MariaDB
if errorlevel 1 (
    echo.
    echo [ERROR] Start ไม่สำเร็จ — ลองรัน mysqld แบบ console:
    echo   "%MYSQLD%" --defaults-file="%MY_INI%" --console
    echo.
    echo ดู log: %DATA_DIR%\*.err
    pause
    exit /b 1
)

echo.
echo [OK] MariaDB 12.2 ทำงานแล้ว ^(port 3306^)
echo.
echo ขั้นตอนถัดไป:
echo   1. HeidiSQL: 127.0.0.1 / root / รหัสใน .env
echo   2. setup-database.bat
echo   3. run-server.bat
echo.
pause
