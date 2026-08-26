function Get-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $candidates = @(
    (Join-Path $env:ProgramFiles "cloudflared\cloudflared.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "cloudflared\cloudflared.exe"),
    (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\cloudflared.exe")
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path $p)) { return $p }
  }

  $pkgRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  if (Test-Path $pkgRoot) {
    $found = Get-ChildItem $pkgRoot -Recurse -Filter cloudflared.exe -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($found) { return $found.FullName }
  }

  return $null
}
