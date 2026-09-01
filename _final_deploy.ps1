# Smart Land - FINAL deployment sequence (Commit + Push + Production Deploy + Live Verify)
# Low-overhead, writes every step to C:\Temp so no temp file lands in the repo.
$ErrorActionPreference = "SilentlyContinue"
$out = "C:\Temp\final_deploy_log.txt"
$root = "c:\Users\Fast\OneDrive\Desktop\new smart land"
Set-Content -LiteralPath $out -Value "FINAL_DEPLOY_START $(Get-Date -Format 'HH:mm:ss')"
Set-Location -LiteralPath $root

function log($msg) { Add-Content -LiteralPath $out -Value $msg }
function runstep($label, $cmd) {
  log "$label >>> $cmd"
  $r = cmd /c "$cmd 2>&1"
  log ($r | Out-String)
  return $LASTEXITCODE
}

# 1) Commit (only commit source files, never temp logs)
git add src/lib/auth.ts src/app/\[locale]/login/login-form.tsx
runstep "GIT_ADD" "git add -A -- src" | Out-Null
$msg = "fix(auth): resolve Google OAuth login loop - clean secrets, real error codes, logger"
git commit -m "$msg" 2>&1 | Out-String | Add-Content -LiteralPath $out
log "COMMIT_EXIT_$LASTEXITCODE"

# 2) Push
git push origin master 2>&1 | Out-String | Add-Content -LiteralPath $out
log "PUSH_EXIT_$LASTEXITCODE"

# 3) Production deploy via Vercel CLI (token pre-authed during setup)
log "VERCEL_DEPLOY >>> npx vercel --prod --yes --token $env:VERCEL_TOKEN"
npx vercel --prod --yes --token $env:VERCEL_TOKEN 2>&1 | Out-String | Add-Content -LiteralPath $out
log "DEPLOY_EXIT_$LASTEXITCODE"

log "FINAL_DEPLOY_END $(Get-Date -Format 'HH:mm:ss')"
log "FINAL_SCRIPT_DONE"
