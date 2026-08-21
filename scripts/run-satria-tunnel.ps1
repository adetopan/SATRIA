# Tunggu SATRIA di port 3000, lalu jalankan Cloudflare Tunnel.
# Dipakai task "SATRIA Tunnel".

$ErrorActionPreference = "Stop"
$TunnelName = "satria"

function Get-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $guess = Join-Path $env:ProgramFiles "cloudflared\cloudflared.exe"
  if (Test-Path $guess) { return $guess }
  throw "cloudflared tidak ditemukan. Jalankan .\scripts\setup-cloudflare-tunnel.ps1"
}

$bin = Get-Cloudflared

Write-Host "==> Menunggu SATRIA di 127.0.0.1:3000 ..."
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect("127.0.0.1", 3000)
    $client.Close()
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $ready) {
  throw "SATRIA belum listen di port 3000. Pastikan task SATRIA App / start-satria.ps1 sudah jalan."
}

Write-Host "==> cloudflared tunnel run $TunnelName"
& $bin tunnel run $TunnelName
