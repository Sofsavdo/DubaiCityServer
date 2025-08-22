import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './shared/schema.js';

// Configure Neon for Node.js
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.poolQueryViaFetch = true;

async function main() {
  try {
    console.log('🔄 Starting database migration...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create connection pool
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const db = drizzle(pool, { schema });

    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Create tables if they don't exist
    console.log('🏗️ Creating database tables...');
    
    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Sessions table created');

    // Create index for sessions
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    console.log('✅ Sessions index created');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        password_hash VARCHAR NOT NULL,
        username VARCHAR NOT NULL,
        role VARCHAR DEFAULT 'partner' NOT NULL,
        is_approved BOOLEAN DEFAULT false NOT NULL,
        auth_type VARCHAR DEFAULT 'credentials' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Create partners table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        business_name TEXT,
        description TEXT,
        pricing_tier VARCHAR DEFAULT 'basic' NOT NULL,
        fixed_payment DECIMAL(12,2) DEFAULT '0.00',
        commission_rate DECIMAL(5,2) DEFAULT '35.00',
        total_revenue DECIMAL(15,2) DEFAULT '0.00',
        monthly_revenue DECIMAL(15,2) DEFAULT '0.00',
        total_sales DECIMAL(15,2) DEFAULT '0.00',
        monthly_sales DECIMAL(15,2) DEFAULT '0.00',
        total_profit DECIMAL(15,2) DEFAULT '0.00',
        monthly_profit DECIMAL(15,2) DEFAULT '0.00',
        total_bonus DECIMAL(15,2) DEFAULT '0.00',
        monthly_bonus DECIMAL(15,2) DEFAULT '0.00',
        has_analytics BOOLEAN DEFAULT false,
        has_priority_support BOOLEAN DEFAULT false,
        has_custom_integrations BOOLEAN DEFAULT false,
        has_advanced_reports BOOLEAN DEFAULT false,
        max_product_requests INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Partners table created');

    // Create partner_registration_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partner_registration_requests (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        login VARCHAR NOT NULL,
        password VARCHAR NOT NULL,
        business_name TEXT,
        description TEXT,
        contact_info TEXT,
        status VARCHAR DEFAULT 'pending' NOT NULL,
        admin_notes TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Partner registration requests table created');

    // Create default admin user if it doesn't exist
    console.log('👤 Creating default admin user...');
    const bcrypt = await import('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_approved, auth_type)
      VALUES ('admin', 'admin@marketpro.com', $1, 'Admin', 'User', 'admin', true, 'credentials')
      ON CONFLICT (username) DO NOTHING;
    `, [adminPasswordHash]);
    
    console.log('✅ Default admin user created (username: admin, password: admin123)');

    // Create admin partner profile
    const adminUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminUser.rows[0]) {
      await pool.query(`
        INSERT INTO partners (user_id, business_name, description, pricing_tier, has_analytics, has_priority_support, has_custom_integrations, has_advanced_reports, max_product_requests)
        VALUES ($1, 'MarketPro Administration', 'System administration account', 'enterprise', true, true, true, true, -1)
        ON CONFLICT (user_id) DO NOTHING;
      `, [adminUser.rows[0].id]);
      console.log('✅ Admin partner profile created');
    }

    console.log('🎉 Database migration completed successfully!');
    
    // Close connection
    await pool.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
