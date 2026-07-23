# Rules.md

# INVOISEN Engineering Rules

> Single source of truth for developing and maintaining the INVOISEN
> SaaS.

## 1. General Principles

-   Build production-ready code only.
-   Prefer readability over cleverness.
-   Keep frontend and backend loosely coupled.
-   Follow feature-based architecture.
-   Never leave TODOs in production code.
-   Keep documentation synchronized with implementation.

------------------------------------------------------------------------

## 2. Tech Stack

### Frontend

-   React + TypeScript + Vite
-   Tailwind CSS
-   TanStack Router
-   TanStack Query
-   Radix UI
-   shadcn/ui
-   Framer Motion

### Backend

-   Node.js
-   Express
-   TypeScript
-   MongoDB
-   Mongoose
-   Zod
-   JWT

------------------------------------------------------------------------

## 3. Folder Rules

-   One feature = one module.
-   No business logic inside UI components.
-   Services contain business logic.
-   Controllers remain thin.
-   Validate every request with Zod.
-   Reusable utilities belong in `lib/` or `utils/`.

------------------------------------------------------------------------

## 4. API Rules

-   Version every API (`/api/v1`).
-   Use REST conventions.
-   Return consistent JSON.
-   Never expose internal errors.
-   Paginate large datasets.
-   Soft-delete invoices by default.

Whenever API routes, schemas, controllers, middleware, request/response
bodies, status codes, or endpoint behavior changes: - Update
`API_DOCUMENTATION.md`. - Update the Postman route reference and
collection. - Keep frontend integrations synchronized.

------------------------------------------------------------------------

## 5. Authentication

-   Email/password authentication.
-   JWT access token.
-   HTTP-only refresh cookie.
-   Role-based access control.
-   Protect all private routes.

------------------------------------------------------------------------

## 6. Security

-   Helmet
-   CORS
-   Rate limiting
-   Password hashing
-   Input validation
-   XSS protection
-   CSRF protection
-   Secure cookies
-   Environment validation

Never commit: - .env - Secrets - API keys - Tokens

------------------------------------------------------------------------

## 7. Database

-   MongoDB Atlas
-   Indexed collections
-   Soft deletes where appropriate
-   Audit timestamps
-   Optimized queries

------------------------------------------------------------------------

## 8. Frontend

-   Mobile-first.
-   Responsive.
-   Accessible (WCAG AA).
-   Lazy load heavy routes.
-   Use TanStack Query for server state.
-   Keep components reusable.

------------------------------------------------------------------------

## 9. Backend

-   Feature-based modules.
-   Thin controllers.
-   Service layer only for business logic.
-   Centralized error handler.
-   Structured logging.
-   Background jobs isolated.

------------------------------------------------------------------------

## 10. AI Features

-   AI Invoice Generator
-   AI Product Description
-   AI Tax Suggestions
-   AI Client Autofill
-   AI Insights

AI responses must always be validated before persistence.

------------------------------------------------------------------------

## 11. UI/UX

Maintain one adaptive design system: - ☀️ Light - 🌙 Dark - ✨ Purple AI

Keep layouts identical across themes.

------------------------------------------------------------------------

## 12. Performance

-   Cache expensive queries.
-   Optimize Mongo indexes.
-   Compress assets.
-   Optimize images.
-   Paginate lists.

------------------------------------------------------------------------

## 13. Git Rules

-   Small commits.
-   Meaningful commit messages.
-   No generated files unless required.
-   Pull before pushing.
-   Keep PRs focused.

------------------------------------------------------------------------

## 14. Documentation Rules

Update documentation whenever implementation changes: - PRD -
Architecture - API Documentation - Project Plan - Design System -
Postman Collection - Rules

Documentation must never lag behind code.

------------------------------------------------------------------------

## 15. Testing

-   Unit tests
-   Integration tests
-   API tests
-   End-to-end tests
-   Regression tests before release

------------------------------------------------------------------------

## 16. Deployment

Frontend: Vercel

Backend: Render/Railway

Database: MongoDB Atlas

Monitor: - Errors - Logs - Performance - Availability

------------------------------------------------------------------------

## 17. Coding Standards

-   TypeScript strict mode.
-   No `any` unless justified.
-   Use ESLint and Prettier.
-   Prefer composition over duplication.
-   Keep functions focused.
-   Name things clearly.

------------------------------------------------------------------------

## 18. Definition of Done

A feature is complete only when: - Code is implemented. - Tests pass. -
Documentation updated. - API docs updated if applicable. - UI is
responsive. - Security reviewed. - Performance acceptable. - No critical
bugs remain.
