# Jalankan SATRIA production di PC server (hanya localhost, akses publik lewat cloudflared).
#   powershell -ExecutionPolicy Bypass -File .\scripts\start-satria.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$envFile = Join-Path $Root ".env.local"
if (-not (Test-Path $envFile)) {
  throw "File .env.local belum ada. Jalankan dulu .\scripts\setup-postgres.ps1 lalu npm run db:setup"
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Host "==> npm install"
  npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install gagal" }
}

if (-not (Test-Path (Join-Path $Root ".next"))) {
  Write-Host "==> npm run build"
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build gagal" }
}

Write-Host "==> SATRIA listen di http://127.0.0.1:3000"
npm run start
