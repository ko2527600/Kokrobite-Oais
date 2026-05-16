#!/bin/bash
# Manual sync script for syncing EasWay repo to ko2527600 repo

echo "🔄 Syncing repositories..."

# Fetch latest from origin
echo "Fetching from origin (EasWay)..."
git fetch origin

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Push to upstream
echo "Pushing to upstream (ko2527600)..."
git push upstream main

if [ $? -eq 0 ]; then
    echo "✓ Successfully synced to upstream repository"
else
    echo "✗ Failed to sync to upstream"
    exit 1
fi
