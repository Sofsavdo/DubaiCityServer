// Production server runner - deployment safe
const { spawn } = require('child_process');

console.log('🚀 MarketPlace Pro Production Launch');

process.env.NODE_ENV = 'production';

// Check if built
const fs = require('fs');
if (!fs.existsSync('dist/index.js')) {
  console.log('Building first...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  build.on('close', (code) => {
    if (code === 0) startServer();
    else process.exit(1);
  });
} else {
  startServer();
}

function startServer() {
  console.log('Starting production server...');
  const server = spawn('node', ['dist/index.js'], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}