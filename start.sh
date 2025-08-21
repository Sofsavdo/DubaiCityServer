#!/bin/bash
# Deployment entry point without "dev" keyword
set -e

echo "Starting MarketPlace Pro production server..."
export NODE_ENV=production

# Build if not exists
if [ ! -f "dist/index.js" ]; then
    echo "Building application..."
    npm run build
fi

# Start production server
echo "Launching production server..."
exec node dist/index.js