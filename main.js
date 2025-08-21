// Main production entry point
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Starting MarketPlace Pro in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // Build if needed
  if (!existsSync('dist') || !existsSync('dist/index.js')) {
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  console.log('🌟 Launching production server...');
  
  // Import and start the production server
  await import('./dist/index.js');
  
} catch (error) {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
}