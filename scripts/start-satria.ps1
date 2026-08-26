# Jalankan SATRIA production di PC server (hanya localhost, akses publik lewat cloudflared).
#   powershell -ExecutionPolicy Bypass -File .\scripts\start-satria.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir "satria-app.log"

try {
  $envFile = Join-Path $Root ".env.local"
  if (-not (Test-Path $envFile)) {
    throw "File .env.local belum ada. Jalankan dulu .\scripts\setup-postgres.ps1 lalu npm run db:setup"
  }

  if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    Write-Host "==> npm install"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install gagal" }
  }

  $productionBuild = Test-Path (Join-Path $Root ".next\BUILD_ID")
  if (-not $productionBuild) {
    Write-Host "==> npm run build (wajib production build, bisa 1-3 menit)"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build gagal" }
  }

  Write-Host "==> SATRIA listen di http://127.0.0.1:3000"
  Write-Host "Log: $LogFile"
  npx next start -H 127.0.0.1 -p 3000
  if ($LASTEXITCODE -ne 0) { throw "next start gagal (kode $LASTEXITCODE)" }
} catch {
  $_ | Tee-Object -FilePath $LogFile -Append
  Write-Host ""
  Write-Host "SATRIA gagal start. Perbaiki error di atas, lalu jalankan lagi."
  Read-Host "Tekan Enter untuk menutup"
  exit 1
}
