# Run npm install on inwCloud via SSH (key or password)
param(
  [string]$HostName = "103.70.5.234",
  [string]$User = "in8lx67secre",
  [string]$AppDir = "domains/x67secretme.shop/nextjs",
  [string]$KeyPath = (Join-Path $PSScriptRoot "..\deploy\inwcloud_ed25519")
)

$ErrorActionPreference = "Stop"
$keyPath = [System.IO.Path]::GetFullPath($KeyPath)

Write-Host ""
Write-Host "=== x67secretme remote hosting setup ===" -ForegroundColor Cyan
Write-Host "Host: $User@$HostName"
Write-Host ""

if (-not (Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue | Where-Object { $_.Version -ge [version]"2.8.5.201" })) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
}

if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
  Write-Host "Installing Posh-SSH (one time)..." -ForegroundColor Yellow
  Install-Module Posh-SSH -Scope CurrentUser -Force -AllowClobber -Confirm:$false
}
Import-Module Posh-SSH

function Connect-SshSession {
  if (Test-Path $keyPath) {
    Write-Host "Connecting with SSH key..." -ForegroundColor Yellow
    $empty = New-Object System.Security.SecureString
    $cred = New-Object System.Management.Automation.PSCredential($User, $empty)
    return New-SSHSession -ComputerName $HostName -Credential $cred -KeyFile $keyPath -AcceptKey -ConnectionTimeout 25 -ErrorAction SilentlyContinue
  }
  return $null
}

$session = Connect-SshSession

if (-not $session) {
  if (-not (Test-Path $keyPath)) {
    Write-Host "No SSH key found. Run GENERATE-SSH-KEY-FOR-HOSTING.bat first." -ForegroundColor Red
    exit 1
  }
  Write-Host "SSH key login failed." -ForegroundColor Red
  Write-Host ""
  Write-Host "Check:" -ForegroundColor Yellow
  Write-Host "  1. Pasted public key in DirectAdmin -> SSH Keys -> Authorized Keys"
  Write-Host "  2. inwCloud enabled SSH for your account (contact support)"
  Write-Host "  3. Or use Extra Features -> Setup Node.js App -> Run NPM Install"
  Write-Host ""
  Write-Host "Support message: deploy\INWCLOUD-SUPPORT-TH.txt"
  exit 1
}

$cmd = @"
cd ~/$AppDir && \
chmod +x install-on-server.sh 2>/dev/null; \
if [ -f install-on-server.sh ]; then ./install-on-server.sh; else npm install --omit=dev && npx prisma generate; fi && \
echo '--- DONE ---' && node -v && test -x node_modules/.bin/next && echo next_ok
"@

Write-Host "Running npm install on server (may take several minutes)..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 900
Write-Host $result.Output
if ($result.Error) { Write-Host $result.Error -ForegroundColor Yellow }
Remove-SSHSession -SessionId $session.SessionId | Out-Null

if ($result.ExitStatus -ne 0) {
  Write-Host "Remote command failed (exit $($result.ExitStatus))" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "OK. Next in DirectAdmin:" -ForegroundColor Green
Write-Host "  Extra Features -> Setup Node.js App"
Write-Host "  Root: /domains/x67secretme.shop/nextjs"
Write-Host "  Startup file: server.js"
Write-Host "  Restart App"
Write-Host ""
