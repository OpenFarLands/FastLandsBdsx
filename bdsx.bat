@echo off

set cwd=%cd%
cd /D "%~dp0"

rem check modules
if not exist "node_modules" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

if not exist "bedrock_server\bedrock_server.exe" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

rem remove junk
del /f bedrock_server\bdsx_shell_data.ini >nul 2>nul

rem loop begin
:_loop

rem shellprepare
call npm run -s shellprepare
if %errorlevel% equ 2 (
    rmdir /s /q .\node_modules
    call update.bat
    goto _loop
)

rem renameMap
node renameMap.js

rem launch
cd bedrock_server
bedrock_server.exe ..
echo exit=%errorlevel% >>bdsx_shell_data.ini
cd ..

@echo. 
@echo. --------------------------------
@echo.             restart
@echo. --------------------------------
@echo. 

rem loop end
goto _loop
:_end

cd /D "%cwd%"
exit /b
