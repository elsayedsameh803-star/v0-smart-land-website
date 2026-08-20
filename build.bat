@echo off
cd /d "c:\Users\Fast\OneDrive\Desktop\new smart land"
echo BUILD_START:%date% %time% > build.log
call npm run build >> build.log 2>&1
echo BUILD_END:%date% %time% >> build.log

