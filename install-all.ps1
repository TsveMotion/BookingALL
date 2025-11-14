# GlamBooking - Automated Installation Script
Write-Host "🚀 GlamBooking Platform - Installation Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Backend Installation
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
npm install

Write-Host ""
Write-Host "🗄️  Setting up Database..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate dev --name init

# Frontend Main Installation
Write-Host ""
Write-Host "📦 Installing Main Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend-main"
npm install

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local for Main Frontend..." -ForegroundColor Green
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BEAUTICIANS_URL=http://localhost:3001
"@ | Out-File -FilePath ".env.local" -Encoding utf8
}

# Frontend Beauticians Installation
Write-Host ""
Write-Host "📦 Installing Beauticians Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend-beauticians"
npm install

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local for Beauticians Frontend..." -ForegroundColor Green
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=http://localhost:3002
"@ | Out-File -FilePath ".env.local" -Encoding utf8
}

# Frontend Booking Installation
Write-Host ""
Write-Host "📦 Installing Booking Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend-booking"
npm install

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local for Booking Frontend..." -ForegroundColor Green
    @"
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
"@ | Out-File -FilePath ".env.local" -Encoding utf8
}

Write-Host ""
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env files with your API keys" -ForegroundColor White
Write-Host "2. Run: .\start-all.ps1 (to start all services)" -ForegroundColor White
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:      http://localhost:4000" -ForegroundColor White
Write-Host "   Main Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   Beauticians:      http://localhost:3001" -ForegroundColor White
Write-Host "   Public Booking:   http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green

Set-Location -Path $PSScriptRoot
