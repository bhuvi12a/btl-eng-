# ==============================================================================
# BTL AUTOMOTIVE ENGINEERING - WINDOWS TALLYPRIME CONNECTOR LAUNCHER
# ==============================================================================
# Usage:
#   .\run-connector.ps1
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Starting BTL Windows TallyPrime Connector..." -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if node is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    Exit 1
}

$NodeVersion = node -v
Write-Host "[INFO] Detected Node.js: $NodeVersion" -ForegroundColor Yellow

# Launch connector
Set-Location -Path $ScriptDir
node connector.mjs

