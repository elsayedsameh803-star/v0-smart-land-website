@echo off
cd /d "C:\Users\Fast\OneDrive\Desktop\new smart land"
echo === node === >> toolchain_result.txt
node --version >> toolchain_result.txt 2>&1
echo RC_NODE=%ERRORLEVEL% >> toolchain_result.txt
echo === npm === >> toolchain_result.txt
npm --version >> toolchain_result.txt 2>&1
echo RC_NPM=%ERRORLEVEL% >> toolchain_result.txt
echo === git HEAD === >> toolchain_result.txt
git --no-pager rev-parse --short HEAD >> toolchain_result.txt 2>&1
echo DONE >> toolchain_result.txt
