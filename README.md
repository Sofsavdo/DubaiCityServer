# MarketPro - Marketplace Management Platform

## 🚀 Render Deployment Guide

### Prerequisites
- Render account (free tier available)
- Neon PostgreSQL database (free tier available)
- GitHub repository

### 1. Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy the connection string (DATABASE_URL)
4. Save it for later use

### 2. Render Deployment

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `marketpro` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=your-neon-database-url
   SESSION_SECRET=your-super-secret-key-2024
   FRONTEND_ORIGIN=https://your-service.onrender.com
   DATABASE_AUTO_SETUP=true
   AUTO_SEED_ADMIN=true
   ADMIN_USERNAME=admin
   ADMIN_EMAIL=admin@marketpro.com
   ADMIN_PASSWORD=admin123
   RENDER=true
   RENDER_EXTERNAL_URL=https://your-service.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Your app will be available at `https://your-service.onrender.com`

### 3. Default Login Credentials

- **Admin Panel**: `/admin-login`
  - Username: `admin`
  - Password: `admin123`

- **Partner Dashboard**: `/partner-dashboard`
  - Username: `testpartner`
  - Password: `partner123`

### 4. Features

✅ **Admin Panel**
- User management
- Partner approval
- Product management
- Analytics dashboard

✅ **Partner Dashboard**
- Product requests
- Commission tracking
- Marketplace integration

✅ **Authentication**
- Session-based auth
- Role-based access control
- Secure password handling

### 5. Troubleshooting

**Common Issues:**

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure Neon database is active
   - Verify SSL settings

2. **Build Failed**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check build logs in Render

3. **Authentication Issues**
   - Clear browser cookies
   - Check session configuration
   - Verify CORS settings

4. **Static Files Not Loading**
   - Ensure build completed successfully
   - Check Vite build output
   - Verify file paths

### 6. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run database migration
npm run db:setup
```

### 7. Project Structure

```
MarketPro/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Database schema
├── render.yaml      # Render configuration
└── migrate.js       # Database setup script
```

### 8. Support

For issues or questions:
1. Check Render build logs
2. Verify environment variables
3. Test database connection
4. Review server logs

---

**Note**: This platform is designed for marketplace management with partner onboarding, product fulfillment, and commission tracking. All authentication is session-based and secure.
