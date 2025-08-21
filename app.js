// Main entry point for Replit deployment
// This file tricks the .replit configuration
console.log('🚀 MarketPlace Pro - Starting...');

const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';

if (isProduction) {
  console.log('🌟 Production mode detected');
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  // Import production server
  import('./dist/index.js').catch(async (error) => {
    console.log('Build not found, building now...');
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    await import('./dist/index.js');
  });
} else {
  console.log('🔧 Development mode');
  // Development server
  import('./server/index.ts').catch(() => {
    console.log('Starting with tsx...');
    const { execSync } = require('child_process');
    execSync('npx tsx server/index.ts', { stdio: 'inherit' });
  });
}