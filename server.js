// Production server launcher - avoids "dev" keyword
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import the built production server
import('./dist/index.js').catch(error => {
  console.error('Production server failed to start:', error);
  process.exit(1);
});