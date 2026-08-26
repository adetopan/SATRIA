# Pasang DNS izinsatria.my.id ke tunnel satria.
#   powershell -ExecutionPolicy Bypass -File .\scripts\route-dns.ps1

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "cloudflared-path.ps1")

$bin = Get-Cloudflared
if (-not $bin) {
  throw "cloudflared.exe tidak ketemu. Install: winget install --id Cloudflare.cloudflared -e"
}

Write-Host "cloudflared: $bin"
& $bin tunnel route dns --overwrite-dns satria izinsatria.my.id
& $bin tunnel route dns --overwrite-dns satria www.izinsatria.my.id
Write-Host "Selesai. Tunggu 1-5 menit, lalu buka https://izinsatria.my.id/login"
