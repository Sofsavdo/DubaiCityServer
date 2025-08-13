# MarketPlace Pro - Partner Management Platform

## Overview

MarketPlace Pro is a comprehensive partner management platform that facilitates business relationships between administrators and partners. The application enables partners to manage products, track orders, request new products, and communicate with administrators through an integrated chat system. It features a commission-based revenue model with tiered payment structures and real-time analytics.

The platform is built as a full-stack web application using a modern React frontend with a Node.js/Express backend, designed for the Replit hosting environment with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Admin and Partner role distinction
- **Approval Workflow**: Admin approval required for partner accounts
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

### Business Logic
- **Commission System**: Tiered commission structure with fixed base payment and percentage-based bonuses
- **Revenue Tracking**: Separated partner profits and fulfillment profits with accurate calculation formula: (sales price - marketplace commission - marketplace fees - 3% tax - cost price) = net profit
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Product Catalog**: Centralized MySklad inventory system with client attribution for each product
- **Request System**: Partner-initiated product requests with admin approval workflow
- **MySklad Integration**: Unified fulfillment warehouse showing product details (name, image, stock, cost price, client attribution)

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