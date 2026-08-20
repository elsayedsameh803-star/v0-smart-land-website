$lines = Get-Content ".env.local" -ErrorAction SilentlyContinue
if (-not $lines) { Write-Output "NO .env.local FOUND"; exit }
foreach ($line in $lines) {
  if ($line -match "^([A-Za-z_][A-Za-z0-9_]*)\s*=") {
    $key = $Matches[1]
    $val = ($line -split "=", 2)[1]
    $status = if ($val.Trim().Length -eq 0) { "EMPTY" } else { "SET" }
    Write-Output "$key=$status"
  }
}
