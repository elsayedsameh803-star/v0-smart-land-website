# Smart Land - automated commit & push with full logging
$log = "c:\Users\Fast\OneDrive\Desktop\new smart land\deploy_log.txt"
$root = "c:\Users\Fast\OneDrive\Desktop\new smart land"
Set-Content -LiteralPath $log -Value "DEPLOY_STARTED $(Get-Date -Format 'HH:mm:ss')"
Set-Location -LiteralPath $root

# 1) Remove temporary verification artifacts (never commit them)
$tmp = @("basic_test.txt","_probe.txt","del_check.txt","git_status.txt","git_status2.txt","tsc_check.txt","tsc_out.txt","tsc_exit.txt","tsc_done.txt","tsc_fresh.txt","run_tsc.cmd","start_tsc.cmd","proc_check.ps1","an_page_mid.txt","proc_check.txt")
foreach ($f in $tmp) {
  $p = Join-Path $root $f
  if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue }
}
Add-Content -LiteralPath $log -Value "CLEANUP_DONE"

# 2) Stage everything and show what is being committed
Add-Content -LiteralPath $log -Value "GIT_STATUS_BEFORE:"
git --no-pager status --short 2>&1 | Out-String | Add-Content -LiteralPath $log
git add -A 2>&1 | Out-String | Add-Content -LiteralPath $log
Add-Content -LiteralPath $log -Value "ADD_EXIT_$LASTEXITCODE"

# 3) Commit with a professional message
git commit -m "feat(analytics): unified dashboard + one-click social OAuth connect" -m "- /analytics page: unified summary cards plus per-platform breakdown cards
- UnifiedConnect component (YouTube, Facebook, Instagram, TikTok, Snapchat, LinkedIn)
- OAuth start/callback/disconnect routes for Meta, YouTube, LinkedIn, Snapchat
- /api/analytics/overview aggregates real metrics across all connected platforms
- shared oauth-config/oauth-utils: CSRF state, safe return path, scope registry
- Telegram intentionally deferred to a later phase" 2>&1 | Out-String | Add-Content -LiteralPath $log
Add-Content -LiteralPath $log -Value "COMMIT_EXIT_$LASTEXITCODE"

# 4) Push to GitHub (this also triggers the Vercel Git integration if linked)
git push origin master 2>&1 | Out-String | Add-Content -LiteralPath $log
Add-Content -LiteralPath $log -Value "PUSH_EXIT_$LASTEXITCODE"

Add-Content -LiteralPath $log -Value "DEPLOY_SCRIPT_DONE"
