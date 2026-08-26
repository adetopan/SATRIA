# Pasang Cloudflare Tunnel agar SATRIA tampil di https://izinsatria.my.id
# Domain harus sudah ada di akun Cloudflare yang sama.
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-cloudflare-tunnel.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Hostname = "izinsatria.my.id"
$TunnelName = "satria"
$CfDir = Join-Path $env:USERPROFILE ".cloudflared"
$ConfigPath = Join-Path $CfDir "config.yml"

. (Join-Path $PSScriptRoot "cloudflared-path.ps1")

Write-Host "==> Cek cloudflared"
$bin = Get-Cloudflared
if (-not $bin) {
  Write-Host "Menginstal Cloudflare cloudflared..."
  winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
    [System.Environment]::GetEnvironmentVariable("Path", "User")
  $bin = Get-Cloudflared
  if (-not $bin) {
    throw "cloudflared belum ketemu. Tutup dan buka ulang PowerShell, lalu jalankan script ini lagi."
  }
}

Write-Host "cloudflared : $bin"
& $bin --version

New-Item -ItemType Directory -Force -Path $CfDir | Out-Null

$cert = Join-Path $CfDir "cert.pem"
if (-not (Test-Path $cert)) {
  Write-Host ""
  Write-Host "Login Cloudflare akan membuka browser."
  Write-Host "Pilih domain $Hostname (harus sudah ditambahkan ke Cloudflare)."
  Write-Host ""
  & $bin tunnel login
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $cert)) {
    throw "Login Cloudflare gagal. Pastikan domain $Hostname ada di dashboard Cloudflare."
  }
}

Write-Host "==> Buat / pakai tunnel '$TunnelName'"
$tunnelsJson = & $bin tunnel list --output json 2>$null
$tunnelId = $null
if ($tunnelsJson) {
  try {
    $list = $tunnelsJson | ConvertFrom-Json
    $existing = @($list) | Where-Object { $_.name -eq $TunnelName } | Select-Object -First 1
    if ($existing) { $tunnelId = [string]$existing.id }
  } catch {
    # fallback ke teks
  }
}

if (-not $tunnelId) {
  $createOut = & $bin tunnel create $TunnelName 2>&1 | Out-String
  Write-Host $createOut
  if ($createOut -match "([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})") {
    $tunnelId = $Matches[1]
  }
}

if (-not $tunnelId) {
  $files = Get-ChildItem $CfDir -Filter "*.json" | Where-Object { $_.Name -ne "cert.pem" }
  if ($files.Count -eq 1) {
    $tunnelId = $files[0].BaseName
  }
}

if (-not $tunnelId) {
  throw "Tidak dapat menentukan Tunnel ID. Cek: cloudflared tunnel list"
}

$cred = Join-Path $CfDir "$tunnelId.json"
if (-not (Test-Path $cred)) {
  throw "Credentials tunnel tidak ketemu: $cred"
}

Write-Host "Tunnel ID : $tunnelId"

$config = @"
tunnel: $tunnelId
credentials-file: $cred

ingress:
  - hostname: $Hostname
    service: http://127.0.0.1:3000
  - hostname: www.$Hostname
    service: http://127.0.0.1:3000
  - service: http_status:404
"@

Set-Content -Path $ConfigPath -Value $config -Encoding utf8
Write-Host "==> Config ditulis ke $ConfigPath"

Write-Host "==> Pasang DNS $Hostname -> tunnel"
& $bin tunnel route dns --overwrite-dns $TunnelName $Hostname
& $bin tunnel route dns --overwrite-dns $TunnelName "www.$Hostname"

Write-Host ""
Write-Host "Tunnel siap."
Write-Host "1. Pastikan SATRIA sudah jalan: .\scripts\start-satria.ps1"
Write-Host "2. Di jendela lain: cloudflared tunnel run $TunnelName"
Write-Host "3. Atau pasang autostart: .\scripts\install-satria-autostart.ps1"
Write-Host "4. Buka https://$Hostname"
Write-Host ""
Write-Host "Jika DNS gagal, di Cloudflare Dashboard tambahkan CNAME:"
Write-Host "  $Hostname  ->  $tunnelId.cfargotunnel.com  (Proxied)"
