# Pasang SATRIA + Cloudflare Tunnel agar nyala otomatis saat Windows login.
# Jalankan sekali di PC server (PowerShell sebagai Administrator disarankan):
#   powershell -ExecutionPolicy Bypass -File .\scripts\install-satria-autostart.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$StartApp = Join-Path $PSScriptRoot "start-satria.ps1"
$RunAll = Join-Path $PSScriptRoot "run-satria-tunnel.ps1"

$ps = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$appArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$StartApp`""
$tunnelArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$RunAll`""

Write-Host "==> Task SATRIA (Next.js)"
schtasks /Create /TN "SATRIA App" /TR "`"$ps`" $appArgs" /SC ONLOGON /RL LIMITED /F | Out-Null

Write-Host "==> Task SATRIA Tunnel (cloudflared)"
schtasks /Create /TN "SATRIA Tunnel" /TR "`"$ps`" $tunnelArgs" /SC ONLOGON /RL LIMITED /F | Out-Null

Write-Host ""
Write-Host "Autostart terpasang (saat user login)."
Write-Host "Agar PC server tidak perlu login manual, aktifkan auto-logon Windows."
Write-Host ""
Write-Host "Jalankan sekarang:"
Write-Host "  schtasks /Run /TN `"SATRIA App`""
Write-Host "  schtasks /Run /TN `"SATRIA Tunnel`""
