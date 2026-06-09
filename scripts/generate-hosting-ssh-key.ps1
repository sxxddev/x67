# Generate SSH key for inwCloud (password login often disabled)
param(
  [string]$KeyPath = (Join-Path $PSScriptRoot "..\deploy\inwcloud_ed25519")
)

$ErrorActionPreference = "Stop"
$keyPath = [System.IO.Path]::GetFullPath($KeyPath)
$pubPath = "$keyPath.pub"
$deployDir = Split-Path $keyPath -Parent

if (-not (Test-Path $deployDir)) {
  New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
}

if (-not (Test-Path $keyPath)) {
  Write-Host "Creating SSH key..." -ForegroundColor Yellow
  ssh-keygen -t ed25519 -f $keyPath -N '""' -C "x67secretme-hosting"
}

$pub = Get-Content $pubPath -Raw
Write-Host ""
Write-Host "=== COPY THIS TO DirectAdmin ===" -ForegroundColor Green
Write-Host ""
Write-Host $pub.Trim()
Write-Host ""
Write-Host "DirectAdmin steps:" -ForegroundColor Cyan
Write-Host "  1. Advanced Features -> SSH Keys"
Write-Host "  2. Tab: Authorized Keys"
Write-Host "  3. Paste Key -> paste line above -> Save"
Write-Host "  4. Run SETUP-HOSTING-REMOTE.bat again"
Write-Host ""
Write-Host "Public key saved: $pubPath"
Write-Host "Private key (keep secret): $keyPath"
Write-Host ""

Set-Clipboard -Value $pub.Trim() -ErrorAction SilentlyContinue
if ($?) {
  Write-Host "Copied public key to clipboard." -ForegroundColor Green
}
