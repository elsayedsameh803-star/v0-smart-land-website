# Fresh verification: tsc + lint + done marker (runs detached-safe, logs to project root)
$root = "c:\Users\Fast\OneDrive\Desktop\new smart land"
Set-Location -LiteralPath $root
Remove-Item _tsc_new.txt, _lint_new.txt, _verify_new.txt -ErrorAction SilentlyContinue

npx tsc --noEmit > _tsc_new.txt 2>&1
" TSC_EXIT:$LASTEXITCODE" | Out-File -Append _verify_new.txt

npx next lint > _lint_new.txt 2>&1
" LINT_EXIT:$LASTEXITCODE" | Out-File -Append _verify_new.txt

"VERIFY_ALL_DONE" | Out-File -Append _verify_new.txt
