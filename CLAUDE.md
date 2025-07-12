# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for the "Gdzie Jest Kosz" (Where Is The Bin) project - a mobile application that helps dog owners find nearby trash bins for pet waste disposal. The project consists of three main applications:

- **API** (`@gjk/backend`) - NestJS backend with MySQL/Prisma
- **Dashboard** (`@gjk/dashboard`) - React/Vite admin dashboard
- **Mobile** (`@gjk/mobile`) - React Native/Expo mobile app

## Development Commands

### Monorepo Commands (from root)

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm dev:mobile     # Mobile app
pnpm dev:dashboard  # Dashboard
pnpm dev:backend    # API backend

# Run tests across all apps
pnpm test

# Build all apps
pnpm build

# Lint all apps
pnpm lint
pnpm lint:fix

# Format code
pnpm format
pnpm format:check
```

### Backend/API Commands

```bash
# From apps/api/ directory
npm run dev              # Development mode
npm run build            # Build for production
npm run test             # Run tests
npm run test:e2e         # Run e2e tests
npm run lint             # ESLint
npm run lint:fix         # Fix linting issues

# Prisma commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:db:push   # Push schema to database
```

### Dashboard Commands

```bash
# From apps/dashboard/ directory
npm run dev          # Development server
npm run build        # Build for production
npm run lint         # ESLint
npm run lint:fix     # Fix linting issues
npm run preview      # Preview built app
```

### Mobile Commands

```bash
# From apps/mobile/ directory
npm run dev          # Start Expo development server
npm run start        # Start Expo development server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint
npm run lint:fix     # Fix linting issues
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## Architecture & Key Components

### Backend (NestJS)

- **Authentication**: Clerk-based JWT authentication
- **Database**: MySQL with Prisma ORM
- **Key Modules**:
  - `BinsModule` - Manages trash bin locations and operations
  - `UserModule` - User management and authentication
  - `ClerkModule` - Clerk authentication integration
  - `DatabaseModule` - Prisma database service
- **API Endpoints**:
  - `/api/v1/user/me` - User profile management
  - `/api/v1/bins` - Bin operations (GET/POST)
  - `/api/v1/bins/admin` - Admin bin operations
- **Geolocation**: Uses bounding box search (±0.01° delta) for nearby bins

### Dashboard (React/Vite)

- **Map Integration**: Leaflet maps for bin management
- **Authentication**: Clerk (login only)
- **Key Features**:
  - Drag & drop bin editing
  - Admin/moderator access controls
  - Real-time bin location updates
- **State Management**: Jotai for state management

### Mobile (React Native/Expo)

- **Navigation**: Expo Router with file-based routing
- **Map Integration**: Leaflet via react-native-leaflet-ts
- **Authentication**: Clerk Expo integration
- **Key Features**:
  - Real-time location tracking
  - Bin discovery and reporting
  - Context menus for new bin submission
- **State Management**: Zustand
- **API Integration**: React Query (@tanstack/react-query)

## Project Structure Patterns

### Feature-Based Organization

- Mobile app uses feature-based structure (`feature/auth/`, `feature/bins/`, `feature/map/`, etc.)
- Each feature contains its own hooks, components, types, utils, and tests
- Shared utilities are in `ui/` and `utils/` directories

### Shared Utilities

- `@gjk/shared-utils` package for code shared between apps
- Workspace dependencies using `workspace:*` protocol

## Environment Setup

### API Backend

Requires `.env` file with:

- `DATABASE_URL` - MySQL connection string
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `ALLOWED_ORIGINS` - CORS origins

### Mobile App

Requires `.env` file with:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `EXPO_PUBLIC_BACKEND_URL` - Backend base URL
- `EXPO_PUBLIC_BACKEND_API_PREFIX` - API prefix (usually `api/v1`)

## Testing

- All apps use Jest for testing
- Mobile app uses Testing Library for React Native
- Backend has both unit and e2e tests
- Tests run with `--silent` flag to reduce console noise
- Pre-commit hooks run all tests before allowing commits

## Code Quality

- **ESLint**: Flat config format, separate configs per app
- **Prettier**: Root-level configuration for consistent formatting
- **Husky**: Pre-commit hooks run tests and linting
- **Lint-staged**: Formats and lints only staged files before commit
- **TypeScript**: Strict mode enabled across all apps

## Key Dependencies

- **Authentication**: Clerk (different packages per platform)
- **Maps**: Leaflet (react-leaflet for dashboard, react-native-leaflet-ts for mobile)
- **Database**: Prisma ORM with MySQL
- **State Management**: Jotai (dashboard), Zustand (mobile)
- **API**: React Query for data fetching
- **Styling**: Tailwind CSS (dashboard), React Native built-in styles (mobile)

## Development Notes

- Node.js 20+ required
- Uses pnpm with workspace protocol
- Turbo for monorepo task orchestration
- All apps share common Prettier and ESLint configurations
- Database schema managed through Prisma migrations
- API documentation available via Swagger at `/api` endpoint

## Standard workflow

1. First think through the problem, search the codebase for relevant files. Write a plan to a todo markdown file:

- first, search the folder `tasks/` for todo markdown file that already exists for the given task at hand. If it already exists, first check if the previously existing todos are already done. If they are, append your new todos to the file.
- if previously created file does not exist, create a new one, prefixed with `todo-` and a brief (four or five words max), kebab-case description of the task.

2. The plan should have a list of todo items taht you can check off as you complete them.
3. Treat each todo as a checkpoint and remember what changes you've made for each one, so that we can rollback to any of them at any given time.
4. Before you begin working, check in with me and I will verify the plan.
5. Then, begin working on the todo items, marking them as complete as you go.
6. Please every step of the way just give me a high level explanation of what changes you made.
7. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
8. Thoroughfuly and thoughtfuly follow the standards, patterns and code style that currently lives in the existing code.
9. Finally, add a review section to the task todo file, with a summary of the changes you made and any other relevant information.
10. With every thing you do, remind the user to always stick to three steps to success with you: 1. Use plan mode, 2. Execute, 3. Perform security check with your assistance.
11. For any commands like `pnpm build`, `pnpm install`, `pnpm add` - ask User to do it. You are running in WSL environment, while the user might be working on Windows, MacOS, Linux, or anything else. We need 100% compatibility while working with npm packages and package managers.
