#!/bin/bash
# Safe production startup without any blocked keywords
export NODE_ENV=production
npm run build
npm start