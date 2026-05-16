# Manual sync script for syncing EasWay repo to ko2527600 repo

Write-Host "🔄 Syncing repositories..." -ForegroundColor Cyan

# Fetch latest from origin
Write-Host "Fetching from origin (EasWay)..." -ForegroundColor Yellow
git fetch origin

# Pull latest changes
Write-Host "Pulling latest changes..." -ForegroundColor Yellow
git pull origin main

# Push to upstream
Write-Host "Pushing to upstream (ko2527600)..." -ForegroundColor Yellow
git push upstream main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully synced to upstream repository" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to sync to upstream" -ForegroundColor Red
    exit 1
}
