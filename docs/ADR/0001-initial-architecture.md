# 0001-initial-architecture

## Status

Accepted

## Context

We need to establish a foundational architecture for the DoggieGrowl application that supports scalability, maintainability, and a rich user experience. The application will consist of a web frontend, a backend API, and shared components/types.

## Decision

We will adopt a pnpm monorepo structure with the following key components:

- **Frontend (apps/web):** Next.js 14 (App Router) for server-side rendering, routing, and API routes. Tailwind CSS for styling, shadcn/ui for pre-built accessible components, and React Query for data fetching and caching.
- **Backend (apps/api):** Express.js for the RESTful API. Zod for schema validation on all incoming requests. Mongoose for MongoDB object modeling. Socket.IO for real-time features like chat and presence.
- **Shared Packages:**
  - `packages/ui`: Reusable React components (e.g., buttons, cards) to maintain design consistency.
  - `packages/types`: Centralized TypeScript types and Zod schemas for data consistency between frontend and backend.
  - `packages/config`: Shared ESLint, Prettier, and TypeScript configurations to enforce code quality and consistency.
  - `packages/gamification`: Business logic for gamification features (XP, streaks, badges).
  - `packages/db-seed`: Script for populating the database with initial/demo data.
- **Database:** MongoDB for its flexibility and scalability, managed locally with Docker Compose for development and MongoDB Atlas for production.
- **Authentication:** JWT-based authentication with access and refresh tokens, stored in HTTP-only, SameSite=Lax cookies. CSRF protection where cookies are used.
- **Real-time Communication:** Socket.IO with dedicated namespaces for chat and presence, including rate-limiting.

## Consequences

- **Benefits:**
  - **Code Reusability:** Shared packages reduce duplication and promote consistency.
  - **Simplified Dependency Management:** pnpm workspaces efficiently manage dependencies across the monorepo.
  - **Consistent Tooling:** Shared configurations ensure uniform code style and quality.
  - **Scalability:** Modular architecture allows independent development and scaling of frontend and backend.
  - **Developer Experience:** Next.js provides a strong framework for web development, and TypeScript enhances code reliability.
- **Drawbacks:**
  - **Initial Setup Complexity:** Monorepos can have a steeper learning curve for initial setup and tooling.
  - **Build Times:** Potentially longer build times for the entire monorepo, mitigated by pnpm's caching and incremental builds.
