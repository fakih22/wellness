# Script untuk restart development server dengan clean cache

Write-Host "🛑 Stopping Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

Write-Host "⏳ Waiting for processes to stop..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🗑️  Removing .next cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "✅ Cache removed!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No cache to remove" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Ready to start!" -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Cyan
