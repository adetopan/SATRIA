# Pasang SATRIA + Cloudflare Tunnel agar nyala otomatis saat user login.
# Tidak perlu Administrator (pakai folder Startup).
#   powershell -ExecutionPolicy Bypass -File .\scripts\install-satria-autostart.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$StartApp = Join-Path $PSScriptRoot "start-satria.ps1"
$RunTunnel = Join-Path $PSScriptRoot "run-satria-tunnel.ps1"
$Startup = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"

if (-not (Test-Path $StartApp)) { throw "Tidak ketemu: $StartApp" }
if (-not (Test-Path $RunTunnel)) { throw "Tidak ketemu: $RunTunnel" }

New-Item -ItemType Directory -Force -Path $Startup | Out-Null

$ps = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

$appCmd = Join-Path $Startup "SATRIA-App.cmd"
$tunnelCmd = Join-Path $Startup "SATRIA-Tunnel.cmd"

@"
@echo off
start "SATRIA App" /min "$ps" -NoProfile -ExecutionPolicy Bypass -File "$StartApp"
"@ | Set-Content -Path $appCmd -Encoding ascii

@"
@echo off
start "SATRIA Tunnel" /min "$ps" -NoProfile -ExecutionPolicy Bypass -File "$RunTunnel"
"@ | Set-Content -Path $tunnelCmd -Encoding ascii

Write-Host "==> Autostart (folder Startup, tanpa admin)"
Write-Host "  $appCmd"
Write-Host "  $tunnelCmd"
Write-Host ""
Write-Host "Akan jalan otomatis saat user ini login."
Write-Host "Jalankan sekarang (dua jendela PowerShell):"
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$StartApp`""
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$RunTunnel`""
