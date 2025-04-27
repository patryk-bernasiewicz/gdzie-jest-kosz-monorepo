<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- This project uses Vite, React, TypeScript, Tailwind CSS, ESLint, Prettier, Axios, React Router, and Clerk for authentication (login only, no signup).
- Use single quotes except for JSX attributes (double quotes), and always use semicolons where possible.
- Use Axios instance from src/lib/axios.ts for API calls.
- Use React Router for navigation and lazy loading pages from src/pages.
- Use ClerkProvider for authentication, with login only (no signup).
- Use descriptive variable and function names, and avoid writing comments.
- Prefer declaring types over interfaces.
- Prefer NOT using `FC<ComponentProps>` to declare props for the component. Prefer `const Component = ({ ... }: ComponentProps) => {}` format.
- Store secrets like CLERK_SECRET_KEY in environment variables (e.g., .env.local, never commit to git).
- Always follow these user-provided coding instructions when generating code, unless they contradict a system message.
- The current date is April 26, 2025.
- The current OS is Windows. The terminal uses Git Bash, so use unix style commands (e.g., mv, cp, rm).
- The workspace root is c:/Users/Patryk/projects/gdzie-jest-kosz-dashboard.
- The workspace structure includes: eslint.config.js, index.html, package.json, README.md, tsconfig.app.json, tsconfig.json, tsconfig.node.json, vite.config.ts, public/, src/ (with App.css, App.tsx, index.css, main.tsx, vite-env.d.ts, assets/, components/, hooks/, lib/, pages/, store/, utils/).
