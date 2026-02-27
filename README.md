# Task Manager Scaffold

A foundational Next.js 14 + TypeScript scaffold for a task manager web app with authentication, task CRUD, and a dashboard summary.

## Features
- Next.js 14 App Router foundation
- Tailwind CSS styling
- Auth provider and toast notifications
- Shared UI components (Button, Input, Card, Modal, Badge, Spinner)
- Prisma schema for SQLite
- Testing setup (Jest + Playwright)
- ESLint configuration

## Tech Stack
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** SQLite (Prisma ORM)
- **UI:** Tailwind CSS
- **Testing:** Jest + React Testing Library + Playwright

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+

## Quick Start

### macOS/Linux
```bash
bash install.sh
```

### Windows (PowerShell)
```powershell
./install.ps1
```

## Environment Variables
Copy `.env.example` to `.env` and update values as needed:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/
  app/               # App Router routes and layouts
  components/        # UI components and layout pieces
  lib/               # Utilities and API client
  providers/         # Auth and toast providers
  types/             # Shared TypeScript types
prisma/              # Prisma schema and migrations
```

## API Endpoints
Planned endpoints:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/dashboard/summary`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client and build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit and component tests use Jest + React Testing Library.
- E2E tests use Playwright.

## Notes
This scaffold focuses on foundational structure and shared components. Add API routes, hooks, and feature pages in subsequent development steps.
