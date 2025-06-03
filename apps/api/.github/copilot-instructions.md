# Copilot Instructions

This document provides guidelines for GitHub Copilot to assist effectively in this backend repository. Please adhere to the following instructions and preferences.

---

## 1. Project Overview

- **Purpose**: This repository contains the backend service for a mobile app that helps users, particularly dog owners, locate nearby trash bins for pet waste disposal.
- **Target Audience**: Dog owners (indirectly, via the mobile app).
- **Problem Solved**: Provides backend APIs and data management to support the mobile application’s features.

---

## 2. Technology Stack

### Technologies Used:

- **Backend Framework**: NestJS.
- **Database**: MySQL.
- **Authentication**: Clerk for user authentication.
- **Language**: TypeScript.
- **Geolocation**: Manages and serves geolocation data.

### CI/CD and Hosting:

- No CI/CD pipelines or hosting platforms are in place yet.

---

## 3. Codebase Preferences

- **Language**: TypeScript.
- **Style Preferences**:
  - **Semicolons**: Mandatory wherever applicable.
  - **Quote Marks**: Single quotes are preferred unless backticks are more appropriate.
- **Structure**: Organize the codebase into feature-based modules/domains.
- **Modifiable Areas**: The entire codebase is fresh and can be modified by Copilot.

---

## 4. Collaboration and Workflow

- **Version Control**: Git.
- **Branching Strategy**: Use feature-based branching.
- **Commit Messages**: Copilot should summarize changes and suggest commit messages for user review and editing. Do not auto-generate commit messages.
- **Terminal commands**: Always use either Git Bash on Windows or any Unix-based terminal; therefore, Copilot should default to Unix terminal commands and programs.

---

## 5. Testing and Quality Assurance

- **Testing Framework**: Jest.
- **Priority**: Focus on integration tests. Unit tests are required only for complex components.
- **Coverage**: No specific testing coverage requirements.

---

## 6. Documentation

- **Inline Comments/Docstrings**: Avoid unless necessary for complex code. Favor external documentation.
- **Documentation Updates**: Copilot should summarize major changes and suggest these summaries for inclusion in the changelog and README.
- **Tools**: No documentation generation tools are in use.
- **Formats**: Markdown is the standard format for all documentation.

---

## 7. Standards and Best Practices

- **Domain-Specific Standards**: None currently defined (examples are welcome for evaluation).
- **Accessibility**: Not applicable for backend code.
- **Internationalization**: Not required at this stage.

---

## 8. Performance and Scalability

- Copilot should prioritize performance and scalability in code generation and architectural suggestions.
- Suggest scalable backend patterns (e.g., modular monolith, microservices if appropriate).
- Recommend RESTful API design best practices and efficient database schema approaches.

---

## Suggestions for Copilot

- Propose REST API guidelines and efficient data validation approaches.
- Recommend performance optimizations for handling location-based queries.
- Suggest scalable and modular architectural patterns suitable for a NestJS backend.

---

By following these instructions, GitHub Copilot can align with this backend project's goals and standards, enhancing development productivity.
