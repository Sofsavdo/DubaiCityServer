import express from "express";
import type { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { seedDemoData } from "./seedData";
import { sql } from "drizzle-orm";

// NO REPLIT AUTH OR ANY OAUTH - PURE EXPRESS SESSION AUTHENTICATION

const app = express();

// Add trust proxy for Render environment
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration BEFORE session setup
const parseOrigins = (raw?: string): string[] | undefined => {
  if (!raw) return undefined;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const devOrigins = ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'];
const prodOriginsFromEnv = parseOrigins(process.env.FRONTEND_ORIGIN);
const corsOrigins = process.env.NODE_ENV === 'production'
  ? (prodOriginsFromEnv && prodOriginsFromEnv.length > 0 ? prodOriginsFromEnv : ['https://your-domain.com'])
  : devOrigins;

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'Cache-Control'],
  exposedHeaders: ['Set-Cookie'],
}));

// Session configuration with proper store
app.use(session({
  store: storage.sessionStore,
  secret: process.env.SESSION_SECRET || 'marketplace-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: undefined,
  },
}));

// Logging middleware for API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  // Add CORS for frontend-backend communication BEFORE other middleware
  // const parseOrigins = (raw?: string): string[] | undefined => {
  //   if (!raw) return undefined;
  //   return raw
  //     .split(',')
  //     .map((s) => s.trim())
  //     .filter((s) => s.length > 0);
  // };

  // const devOrigins = ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'];
  // const prodOriginsFromEnv = parseOrigins(process.env.FRONTEND_ORIGIN);
  // const corsOrigins = process.env.NODE_ENV === 'production'
  //   ? (prodOriginsFromEnv && prodOriginsFromEnv.length > 0 ? prodOriginsFromEnv : ['https://your-domain.com'])
  //   : devOrigins;

  // app.use(cors({
  //   origin: corsOrigins,
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'Cache-Control'],
  //   exposedHeaders: ['Set-Cookie'],
  // }));

  // Basic health endpoint for Render
  app.get('/healthz', (_req, res) => res.status(200).send('ok'));

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Log the error instead of throwing it
    console.error('Global error handler:', err);
  });

  // Setup frontend serving based on environment
  if (process.env.NODE_ENV === 'production') {
    // Use static files in production
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  } else {
    // Use Vite dev server in development
    await setupVite(app, server);
  }

  const PORT = Number(process.env.PORT) || 5000;
  
  // Auto-setup database schema if enabled
  if (process.env.DATABASE_AUTO_SETUP === 'true') {
    try {
      log('🔄 Setting up database schema...');
      const { db } = await import('./db');
      await db.execute(sql`SELECT 1`); // Test connection
      log('✅ Database connection successful');
    } catch (error) {
      log('⚠️ Database setup failed:', String(error));
      // Continue without database for now
    }
  }
  
  // Only seed demo data in development for testing
  if (process.env.NODE_ENV === 'development' && process.env.SEED_DEMO === 'true') {
    try {
      await seedDemoData();
      log('✅ Demo data seeded successfully (development only)');
    } catch (error) {
      log('⚠️ Demo data seeding failed:', String(error));
    }
  }
  
  server.listen(PORT, '0.0.0.0', () => {
    log(`🚀 Server running on 0.0.0.0:${PORT}`);
    log(`🔒 Authentication: Custom session-based (NO REPLIT AUTH)`);
    log(`🔑 Admin Login: username: admin, password: admin123`);
    log(`🔑 Partner Login: username: testpartner, password: partner123`);
    log(`👥 Partner Registration: /partner-registration`);
    log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`🌍 Replit Domain: ${process.env.REPLIT_DEV_DOMAIN || 'local'}`);
    log(`✅ Port ${PORT} is now accessible for preview`);
  });
  
  server.on('error', (err) => {
    log(`❌ Server error: ${err.message}`, 'error');
    process.exit(1);
  });
  
  // Add graceful shutdown
  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  // Handle other signals that might cause shutdown
  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  // Prevent the process from exiting on unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process - just log the error
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit the process - just log the error
  });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('❌ Unhandled async error:', error);
  process.exit(1);
});