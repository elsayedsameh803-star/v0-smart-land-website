@echo off
cd /d "c:\Users\Fast\OneDrive\Desktop\new smart land"
del /q _tsc3-out.txt _tsc3-status.txt _tsc2-out.txt _tsc2-err.txt _tsc-output.txt _tsc2-done.txt 2>nul
git add -A
git commit -m "fix(connections): stop repeated re-linking - persistent token refresh for Snapchat/YouTube/LinkedIn + fixed TikTok session cookie write + unified health checks" 
git push origin master
(git rev-parse HEAD & git status --porcelain & git log origin/master -1 --oneline) > _git-task-result.txt 2>&1
echo GIT_TASK_DONE >> _git-task-result.txt
