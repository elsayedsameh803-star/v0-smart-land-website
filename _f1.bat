@echo off
setlocal
cd /d "c:\Users\Fast\OneDrive\Desktop\new smart land"
set LOG=_fout.txt
echo STARTED_F > %LOG%
git add -A >> %LOG% 2>&1
git commit -m "fix(auth): resolve Google OAuth login-loop - clean secrets, real NextAuth error codes, server-side logger" >> %LOG% 2>&1
echo COMMIT_DONE>> %LOG%
git push origin master >> %LOG% 2>&1
echo PUSH_DONE>> %LOG%
npx vercel --prod --yes --token "%VERCEL_TOKEN%" >> %LOG% 2>&1
echo DEPLOY_DONE>> %LOG%
powershell -c "try{(iwr -UseBasicParsing -Uri 'https://smart-land-theta.vercel.app/api/auth/providers' -TimeoutSec 20).StatusCode}else{'probe_failed'}" >> %LOG% 2>&1
echo LIVE_DONE>> %LOG%
echo ALL_COMPLETE>> %LOG%

