# Sakshya Digital Forensics - Firebase Deployment Script (PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -ErrorAction SilentlyContinue

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Sakshya Digital Forensics - Firebase Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Build Frontend Next.js app
Write-Host "`n[1/3] Building Next.js static export..." -ForegroundColor Yellow
Push-Location "$ScriptDir\frontend"
npm run build
$BuildResult = $LASTEXITCODE
Pop-Location

if ($BuildResult -ne 0) {
    Write-Host "[ERROR] Frontend build failed!" -ForegroundColor Red
    exit $BuildResult
}

# Step 2: Check Firebase login status
Write-Host "`n[2/3] Checking Firebase CLI authentication..." -ForegroundColor Yellow
npx -y firebase-tools projects:list

# Step 3: Deploy to Firebase Hosting
Write-Host "`n[3/3] Deploying to Firebase Hosting..." -ForegroundColor Yellow
npx -y firebase-tools deploy --only hosting

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Deployment process complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
