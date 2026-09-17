# Architecture & Code Quality Rules

This rule enforces code organization, layering, dependency patterns, and TypeScript standards across the codebase.

## 1. Directory Structure

The project MUST strictly maintain the following layout:

```
/api
  /prisma
    schema.prisma
    seed.ts
  /src
    /config
      config.ts              # All pagination + rate limit values, read from env
    /db
      client.ts              # Single shared PrismaClient instance
    /modules
      /agencies
        agencies.routes.ts
        agencies.controller.ts
        agencies.service.ts
        agencies.schema.ts    # Zod validation schemas for agencies
      /agents
        agents.routes.ts
        agents.controller.ts
        agents.service.ts
        agents.schema.ts      # Zod validation schemas for agents
      /listings
        listings.routes.ts
        listings.controller.ts
        listings.service.ts
        listings.schema.ts    # Zod validation schemas for listings
    /middleware
      errorHandler.ts
      rateLimiter.ts
      validateRequest.ts
    /utils
      envelope.ts             # buildSuccess(), buildError() — ONLY place envelopes are constructed
    app.ts                    # Express app, mounts routes and middleware
    server.ts                 # Starts the HTTP server
  .env.example
  package.json
  tsconfig.json
  README.md                   # Full endpoint docs, curl examples, design decisions

/consumer
  index.html                  # Single static file, vanilla JS, no dependencies

AGENTS.md
```

## 2. Layering & Architectural Boundaries

- **One-Way Execution Chain**: `Route` -> `Controller` -> `Service` -> `Prisma Client`.
  - **Routes** register HTTP verbs and middleware (validation, rate limiting).
  - **Controllers** receive `(req, res, next)`, unpack validated params, invoke services, and wrap results with `buildSuccess()`.
  - **Services** encapsulate business logic, Prisma queries, and data shaping.
  - **Never** call Prisma directly from a route or controller.
- **Envelope Centralization**: Envelopes must only be built inside `src/utils/envelope.ts`.
- **Validation Colocation**: Zod schemas live inside each resource module (e.g. `modules/listings/listings.schema.ts`), not in a shared monolithic file.
- **Shared DB Instance**: A single `PrismaClient` instance is exported from `src/db/client.ts` and reused across services.

## 3. Configuration & Environment Management

- **Config Values**: Pagination limits (`PAGINATION_DEFAULT_LIMIT`, `PAGINATION_MAX_LIMIT`) and rate limit settings (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`) must be defined in `src/config/config.ts` and read from `process.env`.
- **No Magic Numbers**: Never hardcode pagination or rate limit values inside route/controller/service code.
- **Environment Files**:
  - Never commit `.env` or real connection strings.
  - Ensure `.env` is listed in `.gitignore`.
  - Provide a clean `.env.example` with placeholder values (e.g. `DATABASE_URL="postgresql://user:password@localhost:5432/property_market"`).

## 4. TypeScript & Code Standards

- **TypeScript Strict Mode**: `tsconfig.json` must have `"strict": true`.
- **No `any`**: Do not use `any` type without an explicit comment explaining why TypeScript's type system cannot express it.
- **Node.js LTS**: Target and pin the active Node.js LTS version in `package.json` engines.
- **Async/Await**: Prefer `async/await` syntax. Ensure unhandled promise rejections are piped to the centralized error handler (`next(err)`).
- **Naming Conventions**:
  - `camelCase` for functions, variables, methods.
  - `PascalCase` for types, interfaces, classes, Prisma models.
  - `kebab-case` for file and directory names (except where standard Express/TypeScript patterns dictate, e.g. `agencies.routes.ts`).
- **Cleanliness**: Zero commented-out dead code, zero debug `console.log` statements in production state.
