@echo off
chcp 65001 >nul
setlocal EnableExtensions

echo ========================================
echo   ล้างไฟล์ขยะ C: (ปลอดภัย)
echo ========================================
echo.

for /f %%a in ('powershell -NoProfile -Command "(Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\").FreeSpace"') do set FREE_BEFORE=%%a

echo [1/7] Temp folders ...
del /f /s /q "%TEMP%\*" >nul 2>&1
for /d %%x in ("%TEMP%\*") do rd /s /q "%%x" >nul 2>&1
del /f /s /q "%LOCALAPPDATA%\Temp\*" >nul 2>&1
for /d %%x in ("%LOCALAPPDATA%\Temp\*") do rd /s /q "%%x" >nul 2>&1
echo [OK]

echo [2/7] Recycle Bin ...
powershell -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"
echo [OK]

echo [3/7] npm / pnpm cache ...
where pnpm >nul 2>&1 && call pnpm store prune >nul 2>&1
where npm >nul 2>&1 && call npm cache clean --force >nul 2>&1
echo [OK]

echo [4/7] Browser / Discord / Cursor cache ...
powershell -NoProfile -Command ^
  "$paths = @(" ^
  "'$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache'," ^
  "'$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache'," ^
  "'$env:LOCALAPPDATA\Google\Chrome\User Data\Default\GPUCache'," ^
  "'$env:LOCALAPPDATA\Discord\Cache'," ^
  "'$env:LOCALAPPDATA\Discord\Code Cache'," ^
  "'$env:APPDATA\Cursor\Cache'," ^
  "'$env:APPDATA\Cursor\CachedData'," ^
  "'$env:APPDATA\Cursor\logs'," ^
  "'$env:LOCALAPPDATA\Microsoft\Windows\INetCache'" ^
  "); foreach ($p in $paths) { if (Test-Path $p) { Remove-Item $p -Recurse -Force -EA SilentlyContinue } }"
echo [OK]

echo [5/7] Visual Studio .ipch cache (IntelliSense) ...
powershell -NoProfile -Command ^
  "Get-ChildItem '%USERPROFILE%' -Recurse -File -Filter *.ipch -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue"
echo [OK]

echo [6/7] Windows Update cache (ต้อง Admin) ...
net session >nul 2>&1
if not errorlevel 1 (
    net stop wuauserv >nul 2>&1
    del /f /s /q "C:\Windows\SoftwareDistribution\Download\*" >nul 2>&1
    for /d %%x in ("C:\Windows\SoftwareDistribution\Download\*") do rd /s /q "%%x" >nul 2>&1
    net start wuauserv >nul 2>&1
    echo [OK]
) else (
    echo [SKIP] รันแบบ Administrator เพื่อล้าง Windows Update cache
)

echo [7/7] Disk Cleanup ...
cleanmgr /d C /VERYLOWDISK >nul 2>&1
echo [OK]
echo.

powershell -NoProfile -Command ^
  "$d = Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\";" ^
  "$free = [math]::Round($d.FreeSpace/1GB,2);" ^
  "$pct = [math]::Round(100*$d.FreeSpace/$d.Size,1);" ^
  "Write-Host ('C: ว่าง ' + $free + ' GB (' + $pct + '%%)')"

echo.
echo ถ้ายังแดง: ย้าย Videos/Downloads/Desktop ไป D: ^(ว่าง 377 GB^)
echo Settings ^> System ^> Storage ^> Temporary files ^> ลบทั้งหมด
echo.
pause
