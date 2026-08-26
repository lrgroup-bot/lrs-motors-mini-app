@echo off
setlocal
cd /d "%~dp0"
title LRS Motors Server

echo ========================================
echo        LRS MOTORS PC SERVER
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js LTS and run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing application packages...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .next (
  echo Building LRS Motors...
  call npm run build
  if errorlevel 1 goto :error
)

echo.
echo Server starting...
echo This computer: http://localhost:3000
echo Other devices on the same network: http://THIS-PC-IP:3000
echo.
echo Keep this window open while LRS Motors is running.
call npm run server
goto :eof

:error
echo.
echo LRS Motors server could not start. Review the error above.
pause
exit /b 1
