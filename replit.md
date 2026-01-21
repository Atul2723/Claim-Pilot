# Expensify - Enterprise Expense Management

## Overview

Expensify is a full-stack expense management application for enterprise teams. It enables employees to submit expense claims with receipts, managers and finance teams to approve/reject expenses through a multi-stage workflow, and administrators to manage companies and user roles. The application features role-based access control (employee, manager, finance, admin) and supports both internal company expenses and billable client expenses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Authentication**: Replit Auth via OpenID Connect (OIDC) with Passport.js
- **Session Management**: Express-session with PostgreSQL session store (connect-pg-simple)

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with schema defined in `shared/schema.ts`
- **Migrations**: Drizzle Kit for schema migrations (`drizzle-kit push`)

### File Upload Architecture
- **Storage**: Google Cloud Storage via Replit Object Storage integration
- **Upload Flow**: Presigned URL pattern - client requests upload URL, then uploads directly to storage
- **Client Library**: Uppy for file upload UI with AWS S3 plugin (compatible with GCS)

### Key Design Patterns
- **Shared Types**: Schema and route definitions in `shared/` directory are used by both frontend and backend
- **Role-Based Access Control**: Four roles (employee, manager, finance, admin) with hierarchical permissions
- **Multi-Stage Approval Workflow**: Expenses flow through pending → approved_manager → approved_finance states
- **Separation of Concerns**: Replit integrations (auth, object storage) are modularized in `server/replit_integrations/`

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Session storage in `sessions` table
- User data synced from Replit Auth to `users` table

### Authentication
- Replit Auth (OpenID Connect)
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### File Storage
- Replit Object Storage (Google Cloud Storage)
- Accessed via local sidecar endpoint at `http://127.0.0.1:1106`
- Supports presigned URL uploads for receipts

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM
- **passport**: Authentication middleware
- **@uppy/core**: File upload handling
- **zod**: Runtime type validation