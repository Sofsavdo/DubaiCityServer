import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as schema from './shared/schema.js';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function migrate() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is required');
      process.exit(1);
    }

    console.log('🔗 Connecting to database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    console.log('📊 Running database migrations...');
    
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);

    console.log('✅ Database migration completed successfully');
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
