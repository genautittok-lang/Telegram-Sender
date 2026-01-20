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
- Requires per-account `apiId` and `apiHash` from Telegram's developer portal
- Sessions stored as encrypted strings in database

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