# ViViD Global Services - Subscription Manager

## Overview

This is an internal web application for ViViD Global Services to manage customer software subscriptions, resellers, and automated renewals. The system provides a comprehensive dashboard for tracking subscription lifecycles, managing customer relationships, and handling reseller commissions.

The application is built as a full-stack TypeScript solution with a React frontend and Express.js backend, using PostgreSQL for data persistence and includes automated email reminder functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom brand colors (Dark Purple #6E2E9A, Pink/Magenta #D33E89, Orange #F7941E, Dark Blue/Purple #53438A)
- **Forms**: React Hook Form with Zod for validation
- **Theme**: Dark/light mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Middleware**: CORS, request logging, error handling
- **Build System**: esbuild for production bundling

### Data Storage
- **Database**: PostgreSQL using Neon serverless database
- **Schema Management**: Drizzle migrations with schema-first approach
- **Tables**: Users, customers, resellers, software catalog, subscriptions, email reminders, and sessions
- **Relationships**: Subscriptions link customers to software with reseller assignments and commission tracking

### Authentication & Authorization
- **Primary**: Replit Auth with Google OAuth integration
- **Session Storage**: PostgreSQL-backed sessions with 1-week TTL
- **Access Control**: Role-based access for internal team members only
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

### Key Features Architecture
- **Dashboard Metrics**: Real-time subscription status tracking with color-coded indicators
- **Subscription Lifecycle**: Complete CRUD operations with status transitions (active, expiring, overdue, renewed)
- **Customer Management**: Profile management with subscription history and communication logs
- **Reseller System**: Commission tracking, payment status, and performance analytics
- **Email Automation**: Gmail API integration for automated renewal reminders (30, 15, 7, 1 day intervals)
- **Reporting**: Revenue and profit analytics with export functionality
- **Responsive Design**: Mobile-first approach with sidebar navigation

## External Dependencies

- **Database**: Neon PostgreSQL serverless database via @neondatabase/serverless
- **Authentication**: Replit Auth service using openid-client
- **Email Service**: Gmail API integration for automated reminders (planned)
- **UI Framework**: Radix UI components (@radix-ui/react-*)
- **Development**: Vite build system with React plugin
- **Deployment**: Replit hosting environment with automatic HTTPS
- **Session Storage**: connect-pg-simple for PostgreSQL session management
- **Date Handling**: date-fns for date manipulation and formatting
- **Validation**: Zod schema validation library
- **HTTP Client**: Native fetch API with custom wrapper functions

The system is designed for internal use only with authenticated access required for all functionality. All data operations go through the Express API layer with proper error handling and logging.