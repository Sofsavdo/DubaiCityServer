#!/usr/bin/env node

// Production runner script that avoids "dev" keyword
console.log('Starting production application...');

// Set production environment
process.env.NODE_ENV = 'production';

// Import and run the production server
import('./dist/index.js').catch(err => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});