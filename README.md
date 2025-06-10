# Monorepo Overview

## Project Description

This repository contains the unified codebase for multiple applications that were previously maintained as separate repositories. Each app now resides in its own directory within this monorepo, but retains its own documentation and specific configuration where necessary.

### Applications

- [API](./apps/api/README.md) - `@gjk/backend`
- [Dashboard](./apps/dashboard/README.md) - `@gjk/dashboard`
- [Mobile](./apps/mobile/README.md) - `@gjk/mobile`

### Packages

- [shared-utils](./packages/shared-utils) - `@gjk/shared-utils`

## Reasons for Migrating to a Monorepo

This project has been migrated to a single monorepo from what was previously three separate repositories. I wanted to have just one place to manage the entire project, make it easier for deployment when it reaches production ready state, and allow sharing utilities, functions, classes and types between multiple apps.

### Old regular repos

- [Backend/API](https://github.com/patryk-bernasiewicz/gdzie-jest-kosz-backend)
- [Dashboard](https://github.com/patryk-bernasiewicz/gdzie-jest-kosz-admin-dashboard)
- [Mobile](https://github.com/patryk-bernasiewicz/gdzie-jest-kosz)

## Code Style

A single Prettier configuration is maintained at the root of the repository to ensure consistent formatting across all projects. App-level Prettier configs have been removed for simplicity; they can be reintroduced if project-specific formatting is required in the future.

## Code quality assurance

### Husky

A `.husky/pre-commit` hook has been added, which automatically runs all tests (`pnpm test`) and then lints staged files (`pnpm lint-staged`) before any commit is accepted. This ensures that only code passing all checks can be committed, helping maintain code quality and consistency.

### Eslint

- The project uses ESLint flat config (`eslint.config.js`).
- File and folder ignores are now managed in the `ignores` array within this config.
- Patterns for test files, setup scripts, and build outputs have been added.
- The legacy `.eslintignore` file is no longer used or needed.

### Prettier

- Prettier ensures consistency in code style. Ensure you're using "Format on save" option when editing code to keep it consistent all of the time. Any edited file will still get formatted automatically before commiting. 

### Test Case Reliability

- Test scripts now run with `--silent` to reduce console noise.
- Test files mock or silence logging to improve clarity.
- Mobile app tests use a dedicated `.env.test` and `jest.setup.js` for environment consistency.
- Improved isolation and reliability of test suites.