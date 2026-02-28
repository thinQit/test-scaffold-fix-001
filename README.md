# DataPulse Landing Page (Next.js 14)

A foundational scaffold for the DataPulse marketing site. Includes a modern Next.js 14 setup with Tailwind, Prisma (SQLite), testing configuration, and reusable UI components.

## Features
- Responsive marketing layout foundation
- Global providers for auth and toast notifications
- Tailwind CSS design system
- Prisma schema for leads, features, and pricing tiers
- Ready-to-extend API utilities
- Jest + React Testing Library + Playwright config

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Jest + React Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
```

Windows PowerShell:
```powershell
./install.ps1
```

Then start the dev server:
```bash
npm run dev
```

## Environment Variables
Create a `.env` file (copied from `.env.example` by install scripts):
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/
  app/                 # App Router pages and global layout
  components/          # Reusable UI components
  providers/           # Global context providers
  lib/                 # Utilities and API client
  types/               # Shared TypeScript types
prisma/                # Prisma schema
```

## API Endpoints (Planned)
- `GET /api/health`
- `GET /api/features`
- `GET /api/pricing`
- `POST /api/leads`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run Playwright E2E tests

## Testing
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright

Run tests:
```bash
npm run test
npm run test:e2e
```
