#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Build process check starting...');

try {
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Check if vite is available
  console.log('🔧 Checking Vite availability...');
  try {
    execSync('npx vite --version', { stdio: 'pipe' });
    console.log('✅ Vite is available');
  } catch (error) {
    console.log('❌ Vite not found, installing...');
    execSync('npm install vite @vitejs/plugin-react', { stdio: 'inherit' });
  }

  // Check if esbuild is available
  console.log('🔧 Checking esbuild availability...');
  try {
    execSync('npx esbuild --version', { stdio: 'pipe' });
    console.log('✅ esbuild is available');
  } catch (error) {
    console.log('❌ esbuild not found, installing...');
    execSync('npm install esbuild', { stdio: 'inherit' });
  }

  // Run build
  console.log('🏗️ Running build...');
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Client build successful');
  
  execSync('npm run build:server', { stdio: 'inherit' });
  console.log('✅ Server build successful');

  // Check if dist folder exists
  if (fs.existsSync('dist')) {
    console.log('✅ Build completed successfully!');
    console.log('📁 Dist folder contents:');
    const files = fs.readdirSync('dist');
    files.forEach(file => {
      const stats = fs.statSync(path.join('dist', file));
      console.log(`  - ${file} (${stats.isDirectory() ? 'dir' : stats.size + ' bytes'})`);
    });
  } else {
    console.log('❌ Dist folder not found');
  }

} catch (error) {
  console.error('❌ Build check failed:', error.message);
  process.exit(1);
} 