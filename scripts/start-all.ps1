# Jalankan SATRIA dulu, tunggu port 3000, baru buka Cloudflare Tunnel.
#   powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1

$ErrorActionPreference = "Stop"
$ps = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$StartApp = Join-Path $PSScriptRoot "start-satria.ps1"
$RunTunnel = Join-Path $PSScriptRoot "run-satria-tunnel.ps1"

function Wait-SatriaPort {
  param([int]$Seconds = 180)
  for ($i = 1; $i -le [math]::Ceiling($Seconds / 2); $i++) {
    try {
      $client = New-Object System.Net.Sockets.TcpClient
      $client.Connect("127.0.0.1", 3000)
      $client.Close()
      return $true
    } catch {
      Write-Host "  masih menunggu Next.js ... ($($i * 2)s)"
      Start-Sleep -Seconds 2
    }
  }
  return $false
}

Write-Host "==> Start SATRIA App (jendela baru, biarkan tetap terbuka)"
Start-Process -FilePath $ps -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $StartApp
)

Write-Host "==> Menunggu http://127.0.0.1:3000"
if (-not (Wait-SatriaPort)) {
  throw @"
SATRIA belum listen di port 3000.
Lihat jendela 'SATRIA App' / PowerShell yang baru dibuka.
Kalau jendela itu sudah tertutup, jalankan manual:
  powershell -ExecutionPolicy Bypass -File `"$StartApp`"
"@
}

Write-Host "==> Port 3000 siap. Start Cloudflare Tunnel"
Start-Process -FilePath $ps -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $RunTunnel
)

Write-Host ""
Write-Host "Siap. Buka https://izinsatria.my.id"
Write-Host "Jangan tutup dua jendela PowerShell SATRIA."
