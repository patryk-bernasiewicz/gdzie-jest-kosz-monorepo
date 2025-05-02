# Gdzie Jest Kosz – Backend

This repository contains the backend service for the mobile app that helps users (especially dog owners) locate nearby trash bins for pet waste disposal.

## Overview

- **Framework:** NestJS (TypeScript)
- **Database:** MySQL (via Prisma ORM)
- **Authentication:** Clerk
- **Geolocation:** Manages and serves geolocation data for bins

## Features

- User authentication and upsert via Clerk
- REST API for reporting and retrieving trash bins
- Geolocation-based bin search
- Modular, scalable codebase (feature-based modules)
- Integration and unit tests (Jest)

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- MySQL database
- Clerk account (for authentication)

### Installation

```bash
npm install
```

Push Prisma schema to database:

```bash
npx prisma db push
```

Generate Prisma types:

```bash
npx prisma generate
```

### Environment Setup

Create a `.env` file with the following variables:

```
DATABASE_URL=mysql://user:password@localhost:3306/dbname
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run start:prod
```

### Testing

```bash
# integration & unit tests
npm run test

# e2e tests
npm run test:e2e
```

## API

- **/user/me** – Upserts and returns the current user (requires Clerk token)
- **/bins** – Get nearby bins (GET), report a new bin (POST, requires authentication)
- **/bins/admin** – Get nearby bins as admin (GET, requires admin role), create a new bin as admin (POST, requires admin role)
- **/bins/admin/:binId/location** – Update bin location as admin (PUT, requires admin role)

### Notes

- Endpoints under `/admin` require the user to have the `admin` role (authorization enforced by AdminGuard).
- CORS support: allowed origins can be configured via the `ALLOWED_ORIGINS` environment variable.

## API Documentation (Swagger)

This project now includes interactive API documentation powered by [Swagger](https://swagger.io/), automatically generated from the codebase using NestJS decorators.

- **Access the docs:**
  - After starting the backend, visit: `http://localhost:3220/api` (or the port set in your environment)
  - The Swagger UI provides a browsable interface for all REST endpoints, request/response schemas, and authentication requirements.
- **Authentication:**
  - Endpoints requiring authentication expect a valid Clerk JWT in the `Authorization` header (as a Bearer token). You can use the "Authorize" button in Swagger UI to provide your token for testing protected endpoints.
- **Versioning:**
  - The API is versioned (currently `v1`). All endpoints are prefixed with `/api/v1/`.

**Note:** The Swagger docs are generated from code annotations using `@nestjs/swagger`. Keep these up to date as you add or modify endpoints.

## Project Structure

- `src/` – Source code (feature-based modules: bins, user, database, clerk)
- `prisma/` – Prisma schema and migrations
- `test/` – Integration and e2e tests

## Development Notes

- Code style: TypeScript, single quotes, semicolons mandatory
- Modular monolith architecture for scalability
- Focus on RESTful API best practices and efficient geolocation queries

## Authentication

Authentication is managed using [Clerk](https://clerk.com/). The backend verifies and manages users via Clerk tokens provided by the mobile app. Key points:

- All endpoints requiring authentication expect a valid Clerk JWT in the `Authorization` header (as a Bearer token).
- The `/user/me` endpoint upserts and returns the current user based on Clerk identity.
- Clerk integration is handled in the `src/clerk/` and `src/user/` modules, including guards and decorators for extracting and validating the current user.
- No user credentials are stored in the backend; all authentication and user management is delegated to Clerk.

## License

MIT
