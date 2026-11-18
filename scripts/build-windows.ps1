$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Install Node.js 20+ first." }
npm install
npm run dist
Write-Host "Installer output is in .\release"
