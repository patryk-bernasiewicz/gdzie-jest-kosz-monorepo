# Monorepo Overview

## Project Description

This repository contains the unified codebase for multiple applications that were previously maintained as separate repositories. Each app now resides in its own directory within this monorepo, but retains its own documentation and specific configuration where necessary.

### Applications

- [API](./apps/api/README.md)
- [Dashboard](./apps/dashboard/README.md)
- [Mobile](./apps/mobile/README.md)

## Code Style

A single Prettier configuration is maintained at the root of the repository to ensure consistent formatting across all projects. App-level Prettier configs have been removed for simplicity; they can be reintroduced if project-specific formatting is required in the future.
