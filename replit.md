# TeleMatic - Telegram Automation Platform

## Overview

TeleMatic is a full-stack Telegram account automation platform built for managing multiple Telegram accounts, sending messages to recipients, and organizing accounts into groups. The application provides a dashboard interface for monitoring account status, managing recipient lists, scheduling message sends, and viewing real-time logs.

The core functionality includes:
- Telegram account authentication via phone code verification
- Bulk recipient management with parsing support (Name — Date — Phone)
- Configurable message delays and scheduling (manual, daily, weekly)
- Multi-language support (English, Ukrainian, Russian)
- Real-time status monitoring and logging

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state with 5-second polling for status updates
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

The frontend follows a page-based structure with reusable components. Dark mode is forced by default. The UI includes Dashboard, Accounts, and Logs pages with a persistent sidebar navigation. Responsive design supported for mobile and desktop.

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Telegram Integration**: GramJS (telegram package) for Telegram MTProto API
- **Session Management**: StringSession for persistent Telegram authentication

The server maintains active Telegram client connections in memory (Map of accountId to TelegramClient) and handles message sending with configurable random delays between min/max seconds.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations in /migrations folder
- **Connection**: node-postgres Pool via DATABASE_URL environment variable

Key tables:
- `accounts`: Telegram account credentials, session strings, status, scheduling config
- `account_groups`: Grouping mechanism with shared message templates
- `recipients`: Per-account recipient lists with send status tracking
- `logs`: System and account activity logs

### Shared Code
The `/shared` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas (via drizzle-zod)
- `routes.ts`: API endpoint definitions with path patterns and response schemas

### Internationalization (i18n)
- **Location**: `client/src/lib/i18n.ts`
- **Languages**: Ukrainian (default), Russian, English
- **Context**: LanguageContext wraps the entire app in App.tsx
- **Storage**: Language preference saved to localStorage
- **Phone Parsing**: `parseRecipientsList()` extracts Russian mobile numbers from formats like "Name — Date — +79001234567" and normalizes them to +7 format

### Scheduling System
Account scheduling options stored in database:
- `scheduleType`: 'manual' | 'daily' | 'weekly'
- `scheduleTime`: Time string like "09:00"
- `scheduleDays`: Array of day codes like ['mon', 'wed', 'fri'] for weekly scheduling

### Build Process
- Development: Vite dev server with HMR proxied through Express
- Production: esbuild bundles server code, Vite builds client to dist/public
- The build script selectively bundles certain dependencies to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but sessions not currently implemented)

### Telegram API
- **GramJS (telegram package)**: MTProto client library for Telegram API access
- **Per-Account API Credentials**: Users can provide custom API ID/Hash during account auth to reduce ban risk
- **Fallback Credentials**: If not provided, uses Telegram Desktop public credentials (higher ban risk for bulk messaging)
- **2FA Password Handling**: Uses SRP protocol via `computeCheck` from GramJS Password module
- **Sessions**: Stored as encrypted StringSession in database with per-account API credentials

### Anti-Ban Safety Features (server/telegram.ts)
- **Enforced Minimum Delays**: At least 30 seconds between messages (configurable higher)
- **Randomized Delays**: Messages sent with random delay between min/max configured values
- **Daily Message Limit**: Max 200 messages per account per day
- **Daily Import Limit**: Max 50 contact imports per account per day
- **Safe Contact Import**: 3-5 second delays before and after each phone number import
- **FLOOD_WAIT Handling**: Automatic backoff with extra delay after wait period ends
- **Gradual Resume**: After flood wait, waits additional minDelay before next message
- **Critical Error Handling**: Stops account on AUTH_KEY, SESSION_REVOKED, USER_DEACTIVATED errors

### UI Components
- **Radix UI**: Headless component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library
- **Recharts**: Data visualization (available for statistics)
- **Embla Carousel**: Carousel component
- **date-fns**: Date formatting utilities

### Deployment
- **Railway**: Configured via railway.json with Nixpacks builder
- Health check endpoint at root path with 300-second timeout