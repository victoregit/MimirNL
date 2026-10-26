@echo off
set "PATH=C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Users\Public\mimir-hardening-runtime\git\cmd;%PATH%"
cd /d D:\Projects\mimir-task21-clean
node --version
call npm.cmd ci
if errorlevel 1 exit /b 1
call npm.cmd test
