# Replit Agent Guide — Satis Consulting DUERP App

## Overview

This is a full-stack web application for **Satis Consulting**, a French occupational risk assessment platform. It helps businesses create and manage **DUERP** (Document Unique d'Évaluation des Risques Professionnels) assessments following the **INRS ED 840** standard and **OiRA** (Online interactive Risk Assessment) sector-specific questionnaires.

Core functionality:
- Manage companies (CRUD with SIRET, contact info, industry sector)
- Conduct risk assessments via guided workflows tied to industry-specific questionnaires
- Browse 46 OiRA industry sectors with 1145 enriched questions (25-42 per sector)
- Reference 20 risk categories per the ED 840 standard
- Track assessment status (draft, in-progress, completed)
- OiRA-compliant action plan fields: responsible, deadline, budget, existing measures, action status
- 4-tab OiRA report: Rapport DUERP, Vue d'ensemble risques, Plan d'action, Vue d'ensemble mesures
- Prevention knowledge base with 102+ INRS prevention sheets
- TutoPrév' Pédagogie section (10 sector-specific training guides)
- TutoPrév' Accueil section (14 sector-specific onboarding guides)
- Employer risks page with legal sanctions and jurisprudence

The UI is entirely in French. User prefers responses in French.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **React 18** with **TypeScript**, built using **Vite**
- **Routing**: `wouter` (lightweight client-side router)
- **State/Data**: `@tanstack/react-query` for server state management with a centralized `apiRequest` helper and `queryClient` configuration
- **Forms**: `react-hook-form` with `zod` validation via `@hookform/resolvers`
- **UI Components**: Full **shadcn/ui** component library (new-york style) using Radix UI primitives, Tailwind CSS, and `class-variance-authority`
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support). Custom color scheme with sidebar-specific tokens. Theme toggle persists to localStorage.
- **Icons**: `lucide-react`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Express 5** (ESM) running on Node.js with TypeScript via `tsx`
- **HTTP server**: Node `http.createServer` wrapping Express (allows future WebSocket support)
- **API pattern**: RESTful JSON API under `/api/` prefix with standard CRUD endpoints
- **Validation**: Request bodies validated with Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Storage layer**: `IStorage` interface implemented by `DatabaseStorage` class, providing a clean abstraction over the database. All route handlers use `storage` instance, not direct DB queries.

### Database
- **PostgreSQL** accessed via `pg` (node-postgres) connection pool
- **ORM**: Drizzle ORM with `drizzle-orm/node-postgres` driver
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` definitions. All table IDs use `varchar` with `gen_random_uuid()` defaults.
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Connection**: Requires `DATABASE_URL` environment variable

### Key Database Tables
- `users` — Basic auth (username/password)
- `companies` — Client businesses with contact info and sector linkage
- `industry_sectors` — OiRA sector catalog (45+ pre-seeded entries)
- `risk_categories` — ED 840 risk families (20 categories)
- `sector_questions` — Sector-specific assessment questions organized by modules
- `assessments` — Risk assessment sessions linked to companies
- `risk_evaluations` — Individual risk scores within assessments
- `question_responses` — Answers to sector questions within assessments

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production build**: `script/build.ts` runs Vite for client and esbuild for server, outputting to `dist/`. Server bundles key dependencies to reduce cold start times.
- **Output**: Client → `dist/public/`, Server → `dist/index.cjs`

### API Endpoints
All under `/api/`:
- `GET/POST /companies`, `GET/PATCH/DELETE /companies/:id`
- `GET /sectors`, `GET /sectors/:id`, `GET /sectors/:id/questions`
- `GET /risk-categories`, `GET /risk-categories/:id`
- `GET/POST /assessments`, `GET/PATCH/DELETE /assessments/:id`
- `GET /companies/:id/assessments`
- `GET/POST /assessments/:id/evaluations`, `PATCH /evaluations/:id`
- `GET/POST /assessments/:id/responses`, `PATCH/DELETE /responses/:id`

### Seeding
- `server/seed.ts` contains pre-configured data for 45+ industry sectors with icons, categories, and descriptions

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection string via `DATABASE_URL` environment variable. Uses `connect-pg-simple` for session storage.

### Key NPM Packages
- **ORM/DB**: `drizzle-orm`, `drizzle-kit`, `pg`, `drizzle-zod`
- **Server**: `express` v5, `express-session`, `passport`, `passport-local`
- **Client**: `react`, `react-dom`, `wouter`, `@tanstack/react-query`, `react-hook-form`, `zod`
- **UI**: Full shadcn/ui stack (30+ Radix UI primitives), `tailwindcss`, `lucide-react`, `recharts`, `embla-carousel-react`, `vaul` (drawer), `cmdk` (command palette), `react-day-picker`
- **Build**: `vite`, `esbuild`, `tsx`, `typescript`
- **Replit-specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`

### Notable Build Dependencies in Allowlist
The build script bundles these into the server for faster cold starts: `express`, `drizzle-orm`, `pg`, `passport`, `passport-local`, `express-session`, `connect-pg-simple`, `zod`, `nanoid`, `jsonwebtoken`, `nodemailer`, `openai`, `@google/generative-ai`, `stripe`, `multer`, `xlsx`, `ws`