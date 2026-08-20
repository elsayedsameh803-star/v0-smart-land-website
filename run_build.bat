@echo off
cd /d c:\Users\Fast\OneDrive\Desktop\new smart land
call npm run build > build4.txt 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> build4.txt
