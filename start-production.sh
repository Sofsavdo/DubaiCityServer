#!/bin/bash
# Production deployment script for MarketPlace Pro
set -e

echo "Building application for production..."
npm run build

echo "Starting production server..."
exec npm start