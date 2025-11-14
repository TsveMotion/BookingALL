# GlamBooking - Start All Services
Write-Host "🚀 Starting GlamBooking Platform..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend API Starting...' -ForegroundColor Yellow; npm run dev" -PassThru
Write-Host "✅ Backend starting in new window (PID: $($backend.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2

$frontendMain = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-main'; Write-Host '🎨 Main Frontend Starting...' -ForegroundColor Yellow; npm run dev" -PassThru
Write-Host "✅ Main Frontend starting in new window (PID: $($frontendMain.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2

$frontendBeauticians = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-beauticians'; Write-Host '💅 Beauticians Frontend Starting...' -ForegroundColor Yellow; npm run dev" -PassThru
Write-Host "✅ Beauticians Frontend starting in new window (PID: $($frontendBeauticians.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2

$frontendBooking = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-booking'; Write-Host '📅 Public Booking Frontend Starting...' -ForegroundColor Yellow; npm run dev" -PassThru
Write-Host "✅ Public Booking Frontend starting in new window (PID: $($frontendBooking.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 All services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs (will be available shortly):" -ForegroundColor Cyan
Write-Host "   Backend API:      http://localhost:4000" -ForegroundColor White
Write-Host "   Main Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   Beauticians:      http://localhost:3001" -ForegroundColor White
Write-Host "   Public Booking:   http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "💡 Close the terminal windows to stop the services" -ForegroundColor Yellow
