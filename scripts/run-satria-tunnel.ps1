# Tunggu SATRIA di port 3000, lalu jalankan Cloudflare Tunnel.

$ErrorActionPreference = "Stop"
$TunnelName = "satria"

. (Join-Path $PSScriptRoot "cloudflared-path.ps1")

$bin = Get-Cloudflared
if (-not $bin) {
  throw "cloudflared.exe tidak ketemu. Install: winget install --id Cloudflare.cloudflared -e"
}

Write-Host "==> Menunggu SATRIA di 127.0.0.1:3000 ..."
$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect("127.0.0.1", 3000)
    $client.Close()
    $ready = $true
    break
  } catch {
    $detik = $i * 2
    Write-Host "  belum siap (${detik}s)"
    Start-Sleep -Seconds 2
  }
}

if (-not $ready) {
  Write-Host ""
  Write-Host "SATRIA belum listen di port 3000."
  Write-Host "Jalankan dulu: .\scripts\start-satria.ps1"
  Read-Host "Tekan Enter untuk menutup"
  exit 1
}

Write-Host "==> cloudflared tunnel run $TunnelName"
& $bin tunnel run $TunnelName
