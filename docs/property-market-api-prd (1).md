# Property Market API — Product Requirements Document (Final)

**Resolution note:** This version resolves every open question from the previous draft with a sensible default, so the PRD is now build-ready with no pending decisions. Each resolved item is marked `[RESOLVED]` where it replaces a prior open question, so you can see exactly what changed and override anything before building.

## 1. Product Summary

A versioned, read-only REST API serving realistic property listing data across three related resources: agencies, agents, and listings. The API is deployed to a public URL, requires no authentication, and is the product itself — there is no dashboard, no admin tool, no marketing surface. A minimal single-page consumer app calls the live deployed API (never localhost) to prove the API works from outside its own codebase.

## 2. Problem Statement

Junior engineers routinely build APIs that work only on their own machine, against their own client, with no proof anyone else can call them. This project forces the opposite: an API that a stranger can call from a terminal with nothing but the README, that survives bad input and abuse, and that a separate untrusted client consumes over the public internet. The deliverable is evidence of API design discipline, not a feature list.

## 3. Goals and Non-Goals

**Goals**
- Serve three related resources (agencies, agents, listings) with realistic relational data.
- Deploy the API to a public URL callable by anyone, with no auth required.
- Build a minimal consumer app that proves the API works from outside its own codebase.
- Handle pagination, filtering, sorting, and bad input correctly and consistently.
- Produce documentation good enough that a developer who has never spoken to the author can use the API from the README alone.

**Non-Goals**
- No authentication or authorization on any endpoint.
- No write endpoints of any kind. `[RESOLVED — previously open]` The API is read-only end to end (GET only). This matches Task 1's framing that "the API is the product" and removes the abuse surface of an unauthenticated public write path.
- No admin panel or internal management UI.
- No landing page or marketing site.
- No interface beyond the minimal consumer app described below.
- No mobile app, no SEO, no analytics dashboard.
- No cursor pagination in this submission. `[RESOLVED — previously open]` Offset pagination is implemented fully and correctly, with the tradeoff against cursor pagination explained in the README's "Design decisions" section. This targets the Pass band cleanly rather than risking a half-correct cursor implementation.
- No fourth resource. `[RESOLVED — previously open]` The three-resource chain (agency → agent → listing) is sufficient to satisfy Task 1's relational requirement and keeps scope inside the 12–16 hour budget.

## 4. User Personas

| Persona | Description | What they need from this product |
|---|---|---|
| External developer | A stranger on the internet who finds the API's README and wants to build something with it | Clear docs, predictable pagination, consistent error shapes, a live curl example that works on the first try |
| Bootcamp reviewer | Grades the work against Task 1's pass/excellent bands | Evidence artifacts (screenshots, live URL, seed script), a README that proves design decisions were deliberate |
| The engineer (you) | Builds this to prove competence and publish about it | A working system they can defend line by line, and one design decision worth writing a public post about |

## 5. Functional Requirements

### 5.1 Resources

| Resource | Belongs to | Has many | Notes |
|---|---|---|---|
| Agency | — | Agents | Top of the hierarchy |
| Agent | Agency | Listings | Middle of the hierarchy |
| Listing | Agent | — | Leaf resource, carries price and location |

### 5.2 Endpoints (all read-only)

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | /api/v1/agencies | List agencies | Paginated |
| GET | /api/v1/agencies/:id | Get one agency | 404 if missing |
| GET | /api/v1/agencies/:id/agents | Nested: agents at this agency | Paginated |
| GET | /api/v1/agents | List agents | Paginated, filterable by agencyId |
| GET | /api/v1/agents/:id | Get one agent | 404 if missing |
| GET | /api/v1/agents/:id/listings | Nested: listings by this agent | Paginated |
| GET | /api/v1/listings | List listings | Paginated, filterable, sortable |
| GET | /api/v1/listings/:id | Get one listing | 404 if missing |

`[RESOLVED — previously open]` POST, PATCH, and DELETE on listings have been removed entirely. The API surface is now 100% read-only, eliminating the earlier open question about whether write endpoints should be public.

### 5.3 List endpoint contract (applies to every list endpoint above)

- Query params: `limit` (default 20, max 100, clamped not rejected), `offset` (default 0, negative returns 400), `sort` (allow-listed fields only, unknown value returns 400), `order` (`asc` or `desc`, default `asc`).
- Listings additionally accept: `city`, `minPrice`, `maxPrice`.
- Response envelope:
```json
{
  "data": [ ... ],
  "meta": { "total": 340, "limit": 20, "offset": 0, "hasMore": true }
}
```
- Error envelope:
```json
{ "error": { "code": "NOT_FOUND", "message": "Listing not found" } }
```

### 5.4 Input validation rules

| Condition | Response |
|---|---|
| `limit` > 100 | Clamp to 100, do not reject |
| `offset` < 0 | 400, `{"error":{"code":"INVALID_OFFSET","message":"offset must be >= 0"}}` |
| `sort` field not in allow-list | 400, `{"error":{"code":"INVALID_SORT","message":"sort field not supported"}}` |
| Malformed UUID in `:id` | 400, `{"error":{"code":"INVALID_ID","message":"id is not a valid identifier"}}` |
| Rate limit exceeded | 429, header `Retry-After: 60` |

### 5.5 Consumer app

`[RESOLVED — previously open]` Built as a single static HTML file (vanilla JS, no build step, no framework). This removes the earlier open question about Vite vs. plain HTML — a static file is the fastest to ship and the easiest to share as a standalone artifact.

- Displays a paginated list of listings from `GET /api/v1/listings` on the deployed URL.
- One filter control (city dropdown).
- A "next page" button that increments `offset` by `limit`.
- Must render an empty state ("No listings match your filters") and an error state (API unreachable or 4xx/5xx) — required for the Excellent grading band.
- Must call the public deployed URL, hardcoded in a config constant at the top of the file, never `localhost`.

## 6. Technical Requirements

**Recommended stack:** Node.js with Express, Prisma ORM, Postgres, Zod for validation, deployed on Railway with Railway's managed Postgres. Consumer app as a single static HTML file, deployed on Vercel.

| Layer | Choice | Reasoning |
|---|---|---|
| Language/runtime | Node.js (TypeScript) | Fastest path to a working REST API in 12–16 hours, and TypeScript catches shape mismatches in the envelope contract before runtime |
| Framework | Express | Minimal, unopinionated, no fighting a framework's conventions to get the exact envelope shape required |
| ORM | Prisma | Generates typed client from schema, migrations are a single command, and constraint definitions (unique, foreign key) live directly in the schema file |
| Validation | Zod | Schemas double as TypeScript types, so query param validation and typing live in one file per resource |
| Data generation | @faker-js/faker | Full control over data shape and volume, regenerable without an external service dependency |
| Rate limiting | express-rate-limit, config-driven | Well-maintained, supports `Retry-After` header out of the box, values pulled from a `config.js`/env vars rather than hardcoded in the handler |
| Database | Postgres (managed) | Required for real constraint enforcement (foreign keys, unique fields) that a file-based DB cannot guarantee under concurrent access |
| API deploy target | Railway | Single push-to-deploy flow with managed Postgres in the same project, avoids wiring a separate DB provider |
| Consumer app | Single static HTML file, deployed on Vercel | No build step needed for one page with a list, a filter, and a button; keeps the "prove it from outside" story as simple as possible |

**Configuration requirements**
- `PAGINATION_DEFAULT_LIMIT`, `PAGINATION_MAX_LIMIT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` all live in a config file or env vars, never inline in a handler.
- `DATABASE_URL` via env var, never committed.
- `.env.example` committed with placeholder values; `.env` excluded via `.gitignore`.

**Seed script requirements**
- Idempotent: uses `upsert` keyed on a deterministic field (a fixed seed UUID list) so re-running never duplicates rows.
- Generates: 10–20 agencies, 3–8 agents per agency, 15–40 listings per agent (target: 300+ listings total).
- `[RESOLVED — previously open]` Data source is Faker-generated only, not a real or scraped dataset, to avoid licensing and accuracy concerns for a portfolio project. City data spans a mix of 8–10 major US metro areas (e.g. Austin, Denver, Seattle, Atlanta, Chicago) so filtering by city produces meaningfully different result sets.

## 7. Business Model

This is a portfolio/bootcamp deliverable, not a commercial product. There is no pricing, no monetization, and no user acquisition funnel. "Success" is defined by two audiences: the bootcamp reviewer grading against the pass/excellent bands, and hiring managers who read the published post and check whether the live URL and curl example actually work. The API's ongoing cost (hosting, managed Postgres) should be covered by free tiers on Railway and Vercel for the duration of grading and any post-publication traffic spike from readers testing the curl command.

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Free-tier hosting sleeps or gets rate-limited under review traffic | Reviewer or reader hits a cold-start delay or downtime | Confirm the free tier's cold-start behavior before submission; note expected latency in README |
| Seed script run against production twice creates duplicates | Data integrity broken, evidence screenshots become unreliable | Enforce idempotent upsert keys, test by running seed twice before deploy |
| Reviewer tests page 50 of a 30-page resource | Naive offset queries return empty array, could look like a bug | Explicitly return an empty `data` array with correct `meta`, document this behavior in README |
| Read-only scope looks thin next to peers who built write endpoints | Perceived as less complete | README's "Design decisions" section explicitly states why the API is read-only (security surface reduction) as a deliberate choice, not a shortcut |
| Rate limit alone is not enough to stop scraping of full dataset | Someone could paginate through everything | Acceptable for this project since data is public and non-sensitive; noted as an accepted tradeoff, not fixed |

## 9. Prisma Data Model

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Agency {
  id        String   @id @default(uuid())
  name      String
  city      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  agents    Agent[]

  @@index([city])
}

model Agent {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String
  agencyId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  agency    Agency    @relation(fields: [agencyId], references: [id])
  listings  Listing[]

  @@index([agencyId])
}

model Listing {
  id            String   @id @default(uuid())
  title         String
  description   String
  city          String
  address       String
  priceMinor    Int      // price stored in minor currency units (e.g. cents)
  currency      String   @default("USD")
  bedrooms      Int
  bathrooms     Int
  squareMeters  Int
  agentId       String
  listedAt      DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agent         Agent    @relation(fields: [agentId], references: [id])

  @@index([agentId])
  @@index([city])
  @@index([priceMinor])
  @@index([listedAt])
}
```

## 10. Success Metrics

| Metric | Target | Evidence artifact |
|---|---|---|
| API reachable from outside | 200 response from a non-author machine | Screenshot of curl hitting the live URL, showing a paginated response |
| Rate limiting enforced | 429 returned after exceeding threshold | Screenshot of the 429 response with `Retry-After` header visible |
| Consumer proves external consumption | Listings render from the live URL, not localhost | Screenshot of the consumer app displaying live data |
| Seed data volume | 300+ listings across 10+ agencies | Seed script committed, row counts visible in a query screenshot |
| Documentation completeness | A developer can call every endpoint using only the README | README reviewed against "no undocumented endpoint" checklist |
| Error handling correctness | All four bad-input cases in section 5.4 return the specified code | Manual test log or automated test output for each case |

## 11. Assumptions

- Three-resource minimum is satisfied by agencies → agents → listings.
- Faker is the data source, not Mockaroo or an external dataset.
- Offset pagination is the only pagination method implemented; cursor pagination is explicitly out of scope for this submission.
- The API is fully read-only; no write endpoints exist anywhere in this version.
- Currency defaults to USD for all generated listings.
- Generated cities are drawn from a fixed list of 8–10 major US metro areas, not a global or randomly unbounded set.

## 12. Phased Roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| 1. Design | Resource table, ERD, endpoint list, envelope shapes written in README | Design reviewed against Task 1 Step 1 checklist |
| 2. Data | Prisma schema written, seed script built and run twice locally with no duplicates | 300+ listings, 10+ agencies seeded locally |
| 3. Core API | All GET endpoints built, validation middleware in place | All 4 bad-input cases return correct codes locally |
| 4. Hardening | Rate limiting added, config extracted to env vars | 429 reproducible locally with correct header |
| 5. Deploy | Pushed to Railway, seed run against production DB | Live curl call from a second machine succeeds |
| 6. Consumer | Static HTML page built, pointed at live URL, deployed to Vercel | Empty and error states verified manually |
| 7. Evidence and post | Screenshots captured, README finalized, post written | All Section 10 artifacts collected and linked |

## 13. Open Questions

All prior open questions have been resolved with defaults in this version (see `[RESOLVED]` tags throughout). None remain outstanding. If you want to revisit any resolved decision — for example, reintroducing write endpoints, adding cursor pagination, or using a real property dataset — flag it and this PRD can be revised accordingly.
