@echo off
set "PATH=C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Users\Public\mimir-hardening-runtime\git\cmd;%PATH%"
cd /d D:\Projects\mimir-task24-windows
node --version
call npm.cmd ci
if errorlevel 1 exit /b 1
echo COMMAND: npm run typecheck
call npm.cmd run typecheck
if errorlevel 1 exit /b 1
echo COMMAND: npm run lint
call npm.cmd run lint
if errorlevel 1 exit /b 1
echo COMMAND: npm run format:check
call npm.cmd run format:check
if errorlevel 1 exit /b 1
echo COMMAND: npm run test
call npm.cmd run test
if errorlevel 1 exit /b 1
echo COMMAND: npm run schemas:check
call npm.cmd run schemas:check
if errorlevel 1 exit /b 1
echo COMMAND: npm run package:smoke
call npm.cmd run package:smoke
if errorlevel 1 exit /b 1
set "npm_execpath="
echo COMMAND: node --test test/npm-cli.test.mjs (npm_execpath unset)
node --test test/npm-cli.test.mjs
if errorlevel 1 exit /b 1
echo COMMAND: node scripts/package-smoke.mjs (npm_execpath unset)
node scripts/package-smoke.mjs
if errorlevel 1 exit /b 1
