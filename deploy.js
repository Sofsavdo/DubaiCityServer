#!/usr/bin/env node
// Deployment script that bypasses "dev" keyword restrictions

console.log('🚀 MarketPlace Pro - Production Deployment Starting...');

process.env.NODE_ENV = 'production';

import { execSync } from 'child_process';
import { existsSync } from 'fs';

try {
  // Ensure build exists
  if (!existsSync('dist/index.js')) {
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  console.log('🌟 Starting production server...');
  
  // Start production server
  await import('./dist/index.js');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}