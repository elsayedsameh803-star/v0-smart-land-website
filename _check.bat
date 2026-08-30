@echo off
cd /d "C:\Users\Fast\OneDrive\Desktop\new smart land"
echo === tsc === > _check_out.txt
npx tsc --noEmit >> _check_out.txt 2>&1
echo TSC_RC=%ERRORLEVEL% >> _check_out.txt
echo === eslint === >> _check_out.txt
npx next lint >> _check_out.txt 2>&1
echo LINT_RC=%ERRORLEVEL% >> _check_out.txt
echo === build === >> _check_out.txt
npm run build >> _check_out.txt 2>&1
echo BUILD_RC=%ERRORLEVEL% >> _check_out.txt
