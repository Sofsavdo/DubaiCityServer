# MarketPlace Pro - Partner Management Platform

## Overview

MarketPlace Pro is a comprehensive partner management platform that facilitates business relationships between administrators and partners. The application enables partners to manage products, track orders, request new products, and communicate with administrators through an integrated chat system. It features a commission-based revenue model with tiered payment structures and real-time analytics.

The platform is built as a full-stack web application using a modern React frontend with a Node.js/Express backend, designed for the Replit hosting environment with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 19, 2025)

AUTHENTICATION SYSTEM COMPLETELY REWRITTEN - PURE CUSTOM LOGIN/PASSWORD SYSTEM:
- ✅ REPLIT AUTH COMPLETELY REMOVED - Zero external OAuth dependencies
- ✅ Pure session-based authentication with PostgreSQL storage
- ✅ Admin Login: 
  - Asosiy Admin: username: "Medik9298@", password: "Medik@9298" 
  - Default Admin: username: "admin", password: "admin123"
- ✅ Partner Login: Registration + admin approval required first
- ✅ Clean login pages: /login (partners), /admin-login (admin), /partner-registration
- ✅ Landing page buttons properly redirect to login pages
- ✅ Authentication APIs working: /api/auth/login, /api/auth/logout, /api/auth/session
- ✅ Partner registration API tested and functional with JSON responses
- ✅ Database schema optimized for custom credentials only
- ✅ Server-side bcrypt password hashing and session management
- ✅ Frontend useAuth hook using fetch() instead of external auth providers
- ✅ All authentication flows tested and verified working
- ✅ BUILD PROCESS FIXED - All TypeScript errors resolved, successful compilation
- ✅ SERVER RUNNING CLEANLY - No errors in console, all APIs working perfectly
- ✅ CUSTOM ADMIN CREATED - Main admin: "Medik9298@" / "Medik@9298" 
- ✅ TEST PARTNER CREATED - Test login: "testhamkor" / "test123" (approved for testing)

PREVIOUS SYSTEM FEATURES MAINTAINED:
- ✅ Complete Admin Panel ↔ Partner Dashboard integration with real-time data flow
- ✅ WebSocket-based real-time chat system fully functional between admin and partners
- ✅ All API endpoints tested and working (partners, orders, chat, analytics, product-requests)
- ✅ PostgreSQL database fully operational with proper schema and demo data
- ✅ Multi-marketplace commission calculator with SPT cost calculations (2,000 som per item)
- ✅ Revolutionary 4-tier pricing system: Starter Pro (0 som risk-free) to Enterprise Elite (10M som)
- ✅ Real-time chat notifications via WebSocket with online/offline status tracking
- ✅ Professional demo data and statistics for immediate testing
- ✅ Complete Excel report generation for sales, inventory, and profit analysis
- ✅ MySklad warehouse integration simulation with real-time stock tracking

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Uppy file upload system with cloud storage support
- **WebSocket**: Real-time chat functionality using native WebSocket API
- **API Design**: RESTful endpoints with consistent error handling

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: 
  - Users (authentication and profiles)
  - Partners (business profiles with commission tracking)
  - Products (inventory management)
  - Product Requests (partner-initiated product requests)
  - Orders (transaction tracking)
  - Chat Messages (communication system)
  - Sessions (authentication sessions)

### Authentication & Authorization
- **Provider**: PURE custom username/password authentication system (ZERO external dependencies)
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple store
- **Admin Access**: Direct login with username: "admin", password: "admin123" 
- **Partner Access**: 1) Registration via /partner-registration, 2) Admin approval, 3) Login with credentials
- **Role-Based Access**: Admin and Partner role distinction with session-based auth
- **Security**: Bcrypt password hashing, HTTP-only cookies, secure session handling
- **Login Pages**: /login (partners), /admin-login (admins), /partner-registration (new partners)
- **API Endpoints**: /api/auth/login, /api/auth/logout, /api/auth/session for session management
- **NO REPLIT AUTH**: Completely removed all Replit Auth, openid-client, and passport dependencies

### Business Logic
- **Revolutionary 4-Tier Pricing System**: Net profit-based commission structure:
  - **Starter Pro**: 0 som fixed fee (risk-free) + 30-45% commission from net profit
  - **Business Standard**: 3.5M som fixed + 18-25% commission from net profit  
  - **Professional Plus**: 6M som fixed + 15-20% commission from net profit
  - **Enterprise Elite**: 10M som fixed + 12-18% commission from net profit
- **Fixed SPT Costs**: 2,000 som per unit across all tiers (real operational packaging costs)
- **Net Profit Formula**: Sales - Cost Price - SPT (2,000 som) - 3% Tax = Net Profit
- **Commission Calculation**: All commission percentages calculated from net profit after all real costs
- **Revenue Tracking**: Separated partner profits and fulfillment profits with transparent cost structure
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Product Catalog**: Centralized MySklad inventory system with client attribution for each product
- **Request System**: Partner-initiated product requests with admin approval workflow
- **MySklad Integration**: Unified fulfillment warehouse showing product details (name, image, stock, cost price, client attribution)
- **Marketplace Integration**: Real Uzum Market Seller API integration with authenticated product/order sync, admin-managed partner connections

### Real-time Features
- **Chat System**: WebSocket-based messaging between admins and partners
- **Online Status**: Real-time user presence tracking
- **Live Updates**: Automatic UI updates for new orders, messages, and status changes
- **Notifications**: Toast-based notification system for user feedback

### File Management
- **Upload System**: Uppy integration for file uploads
- **Storage Options**: Google Cloud Storage support configured
- **File Processing**: Client-side file handling with progress tracking

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service for user management
- **Hosting**: Replit deployment platform with development tools integration

### Cloud Services
- **File Storage**: Google Cloud Storage for file uploads and media management
- **CDN**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

### Development Tools
- **Monitoring**: Replit development banner and error tracking
- **Build System**: ESBuild for production bundling
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### UI/UX Libraries
- **Component Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS-based animations with Tailwind utilities
- **Forms**: React Hook Form with Zod validation schemas
- **Charts**: Recharts for data visualization (configured but implementation pending)

### Communication
- **WebSockets**: Native WebSocket API for real-time messaging
- **HTTP Client**: Fetch API with custom request handling and error management
- **Session Management**: Connect-PG-Simple for PostgreSQL session storage

The architecture emphasizes type safety, real-time capabilities, and scalable design patterns suitable for a growing partner ecosystem with complex business logic requirements.