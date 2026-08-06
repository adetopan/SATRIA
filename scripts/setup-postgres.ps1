# Buat database SATRIA tanpa mengubah password PostgreSQL.
# Cara pakai (PowerShell biasa sudah cukup):
#   .\scripts\setup-postgres.ps1
# Atau:
#   $env:PGPASSWORD="password_anda"; .\scripts\setup-postgres.ps1

$ErrorActionPreference = "Stop"

$PgRoot = "C:\Program Files\PostgreSQL\18"
$PgBin = Join-Path $PgRoot "bin"
$DbName = "satria"
$DbUser = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
$DbHost = if ($env:PGHOST) { $env:PGHOST } else { "127.0.0.1" }
$DbPort = if ($env:PGPORT) { $env:PGPORT } else { "5432" }

if (-not (Test-Path "$PgBin\psql.exe")) {
  throw "PostgreSQL 18 tidak ditemukan di $PgRoot"
}

if (-not $env:PGPASSWORD) {
  $secure = Read-Host "Masukkan password PostgreSQL untuk user '$DbUser' (tidak akan diubah)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

Write-Host "==> Cek koneksi ke PostgreSQL (password tidak diubah)..."
& "$PgBin\psql.exe" -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT current_user;" | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Gagal login. Pastikan username/password benar. Password PostgreSQL tidak diubah oleh script ini."
}

Write-Host "==> Buat database '$DbName' jika belum ada"
$dbExists = & "$PgBin\psql.exe" -h $DbHost -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName';"
if ($dbExists -ne "1") {
  & "$PgBin\psql.exe" -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName OWNER $DbUser;"
  Write-Host "Database '$DbName' dibuat."
} else {
  Write-Host "Database '$DbName' sudah ada."
}

$encodedPass = [Uri]::EscapeDataString($env:PGPASSWORD)
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env.local"
@"
DATABASE_URL=postgresql://${DbUser}:${encodedPass}@${DbHost}:${DbPort}/${DbName}
SATRIA_SECRET=satria-dev-secret-change-me
"@ | Set-Content -Path $envFile -Encoding utf8

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Selesai. Password PostgreSQL tidak diubah."
Write-Host "User     : $DbUser"
Write-Host "Database : $DbName"
Write-Host "File     : $envFile"
Write-Host ""
Write-Host "Lanjut: npm run db:setup"
