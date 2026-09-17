# AGENTS.md — Property Market API

This file governs how an AI coding agent (running in Antigravity) behaves while building this project. It does not describe the product — that is the PRD's job. This file only gives orders about tools, boundaries, and behavior. If any instruction here conflicts with your own judgment, this file wins.

---

## 1. What Is This Project

You are building a read-only REST API that serves property market data (agencies, agents, listings), deployed to a public URL, plus a minimal static consumer app that calls that live API.

- **Source of truth:** `property-market-api-prd.md`. If this AGENTS.md and the PRD ever conflict on a feature detail, the PRD wins. If they conflict on a tool, process, or behavioral rule, this file wins.
- **Version being built:** the single version described in the PRD. There is no v2, no future phase, no "later we'll add write endpoints." Do not build toward a roadmap that does not exist yet.
- **Audience:** an external developer calling the API from the README alone, and a reviewer checking specific pass/fail evidence. You are not building for end users, and you are not building a consumer product.

---

## 2. What Is Locked

Everything below is a decision that has already been made. Do not swap it, upgrade it, replace it with an alternative you consider better, or introduce a second option "just in case." If you believe one of these choices is wrong, stop and flag it — do not silently substitute your own.

- **Runtime/language:** Node.js, TypeScript. No JavaScript-only files in `/api/src`.
- **Framework:** Express. Do not introduce Fastify, Koa, NestJS, or any other framework.
- **ORM:** Prisma. Do not hand-write raw SQL migrations. Do not swap in TypeORM, Drizzle, or a query builder.
- **Database:** Postgres, managed, on Railway. Do not use SQLite, MongoDB, or a local file DB, even for "quick testing."
- **Validation:** Zod. Do not use Joi, Yup, or manual `if` chains for request validation.
- **Rate limiting:** `express-rate-limit`. Do not hand-roll rate limiting.
- **Data generation:** `@faker-js/faker`. Do not pull in a real or scraped property dataset, and do not use Mockaroo, DummyJSON, or any other source.
- **API deploy target:** Railway (API + Postgres in the same project).
- **Consumer app:** a single static HTML file with vanilla JavaScript. No React, no Vue, no Vite, no bundler, no build step of any kind.
- **Consumer deploy target:** Vercel.
- **Data model:** exactly three resources — `Agency`, `Agent`, `Listing` — in the hierarchy Agency → Agent → Listing, using the Prisma schema already defined in the PRD (Section 9), verbatim. Do not add fields, models, or relations that are not in that schema without flagging it first.

If a package is needed that isn't named above (e.g. a dotenv loader, a logger), pick the most standard, boring, widely-used option for the Node/Express ecosystem. Do not pick anything experimental or unmaintained.

---

## 3. What Must Never Happen

Every rule below is a hard boundary, not a style preference. Breaking any rule on this list means the task has failed, **even if the code runs, even if tests pass, even if the feature looks correct**. Where a PRD section backs the rule, it's cited.

1. **Never add any write endpoint.** No `POST`, `PATCH`, `PUT`, or `DELETE` route anywhere in the API. Every route is `GET`. This API is read-only end to end. *(PRD §3, §5.2)*
2. **Never add authentication or authorization of any kind.** No login, no API keys, no tokens, no middleware that checks identity. This is intentional — do not "improve security" by adding it. *(PRD §3)*
3. **Never store money as a decimal or float.** Every price field is a whole-number integer in minor currency units (e.g. cents), paired with a `currency` column. This applies everywhere money appears, forever, with no exceptions. *(PRD §6, §9)*
4. **Never use sequential integer IDs.** Every resource ID is a UUID, generated via `@default(uuid())` in Prisma. *(PRD §9, §11)*
5. **Never return more than the configured maximum page size.** If `limit` exceeds the configured max, clamp it — do not reject the request, and never return an unbounded result set. *(PRD §5.3, §5.4)*
6. **Never accept a negative `offset`.** Return `400` with the exact error code `INVALID_OFFSET` and the exact message format shown in the PRD. *(PRD §5.4)*
7. **Never sort on a field that isn't explicitly allow-listed.** An unrecognized `sort` value returns `400` with code `INVALID_SORT`. Never silently ignore it or fall back to a default sort. *(PRD §5.4)*
8. **Never let a malformed ID reach the database.** A non-UUID `:id` returns `400` with code `INVALID_ID` before any query runs. Never let this surface as a `500`. *(PRD §5.4)*
9. **Never skip rate limiting.** Every route is subject to the configured rate limit. Exceeding it returns `429` with a `Retry-After` header. *(PRD §5.4, §6)*
10. **Never use a response or error shape other than the two envelopes defined in the PRD.** Every success response uses the `{ data, meta }` envelope. Every error uses the `{ error: { code, message } }` envelope. No endpoint gets a "special" shape. *(PRD §5.3)*
11. **Never hardcode a config value in a handler.** `PAGINATION_DEFAULT_LIMIT`, `PAGINATION_MAX_LIMIT`, `RATE_LIMIT_WINDOW_MS`, and `RATE_LIMIT_MAX_REQUESTS` must live in a config file or environment variable, never as a literal number inside route logic. *(PRD §6)*
12. **Never commit a `.env` file or a real `DATABASE_URL`.** Only `.env.example` with placeholder values is committed. *(PRD §6)*
13. **Never write a seed script that can duplicate rows on re-run.** The seed script must use a deterministic key with `upsert`. Running it twice must produce the same row count as running it once. *(PRD §6)*
14. **Never implement cursor pagination.** Offset pagination is the only pagination method in this version. Do not add cursor pagination "since it's better" — it is explicitly out of scope. *(PRD §3, §11)*
15. **Never add a fourth resource.** The model stops at Agency, Agent, Listing. Do not add "Inquiry," "Review," "Favorite," or anything else, even if it seems like a natural next step. *(PRD §3, §11)*
16. **Never generate data from a real or scraped source.** All data comes from Faker. *(PRD §6, §11)*
17. **Never let the consumer app call `localhost` or a relative path that resolves to it.** The consumer must call the deployed public URL, set as a hardcoded config constant at the top of the file. *(PRD §5.5)*
18. **Never build any UI beyond the consumer app described in the PRD.** No admin panel, no dashboard, no landing page, no second page. *(PRD §3)*

---

## 4. How the Work Is Arranged

Use this exact folder structure. Do not reorganize it, do not add extra top-level folders, and do not merge the API and consumer app into one codebase — they are deployed separately and must stay separable.

```
/api
  /prisma
    schema.prisma
    seed.ts
  /src
    /config
      config.ts              # all pagination + rate limit values, read from env
    /db
      client.ts              # single shared PrismaClient instance
    /modules
      /agencies
        agencies.routes.ts
        agencies.controller.ts
        agencies.service.ts
        agencies.schema.ts    # Zod schemas for this resource only
      /agents
        agents.routes.ts
        agents.controller.ts
        agents.service.ts
        agents.schema.ts
      /listings
        listings.routes.ts
        listings.controller.ts
        listings.service.ts
        listings.schema.ts
    /middleware
      errorHandler.ts
      rateLimiter.ts
      validateRequest.ts
    /utils
      envelope.ts             # buildSuccess(), buildError() — the ONLY place envelopes are constructed
    app.ts                    # Express app, mounts routes and middleware
    server.ts                 # starts the HTTP server
  .env.example
  package.json
  tsconfig.json
  README.md                    # full endpoint docs, curl examples, design decisions

/consumer
  index.html                   # single static file, vanilla JS, no dependencies

AGENTS.md
```

Rules for this structure:
- Each resource (`agencies`, `agents`, `listings`) gets its own folder under `/modules`. Route → controller → service is a one-way chain: routes call controllers, controllers call services, services talk to Prisma. Never let a route file query the database directly.
- All Zod schemas live beside the resource they validate, never in a shared "schemas" dump file.
- Response and error envelopes are built in exactly one place (`utils/envelope.ts`) and imported everywhere else. Never construct the envelope shape inline in a controller.
- The consumer app has zero shared code, zero shared `node_modules`, and zero build step tying it to `/api`. It is one HTML file that could be dragged onto any static host and work.

---

## 5. How the Code Should Look

- Use the current Node.js **LTS** version. Pin it in `package.json` (`engines`) and note it in the README.
- TypeScript in `strict: true` mode. No `any` unless you leave a comment explaining exactly why nothing else works.
- Prefer `async/await` over `.then()` chains. Every `await` that can reject is wrapped in a `try/catch` or handled by the central error-handling middleware.
- No magic numbers or strings in logic — pagination defaults, rate limit values, and error codes all come from `config.ts` or a constants file, never typed inline twice in two places.
- Functions do one thing. If a service function is doing validation, querying, and formatting, split it.
- Comment only where the "why" isn't obvious from the code itself. Don't narrate what the code already says.
- Consistent naming: `camelCase` for variables and functions, `PascalCase` for types and Prisma models, `kebab-case` for file names except where a framework convention says otherwise.
- No dead code, no commented-out blocks, no leftover `console.log` debugging statements in the final state.

---

## 6. What Counts as Done

Before considering any task complete, produce a checklist covering every item below, and confirm each one explicitly — not just "looks done."

- [ ] The project builds and starts with **zero TypeScript errors** and zero runtime errors on boot.
- [ ] Every endpoint in PRD §5.2 exists, is `GET`-only, and is versioned under `/api/v1/`.
- [ ] Pagination, filtering, and sorting work exactly as specified in PRD §5.3, including the clamp-not-reject behavior on `limit`.
- [ ] All four bad-input cases in PRD §5.4 return the exact status code and error shape specified — tested and shown, not assumed.
- [ ] Rate limiting is live, config-driven, and returns `429` with `Retry-After` once verified by exceeding the limit.
- [ ] The seed script has been run twice in a row with no increase in row count the second time.
- [ ] The Prisma schema matches PRD §9 exactly — no added, removed, or renamed fields.
- [ ] The consumer app renders live data, an empty state, and an error state, and never references `localhost`.
- [ ] `.env` is not committed; `.env.example` is present and accurate.
- [ ] The README documents every endpoint with method, path, query params, a curl example, and a sample response, plus a "Design decisions" section.
- [ ] Nothing exists in the repo that isn't called for by the PRD or this file (no extra routes, no extra models, no extra pages).

If any box can't be checked, the task is not done — say so plainly instead of reporting success.

---

## 7. What the Agent Does When Unsure

- **Never invent a feature, field, endpoint, or resource that isn't in the PRD or this file**, even if it seems obviously useful or "small." If you think something is missing, name it explicitly as a gap and stop for confirmation — do not build it speculatively.
- **Never expand scope to make a feature "more complete."** If the PRD says three resources, build three. If it says read-only, do not add a write path "for convenience while testing."
- **When a requirement is ambiguous, choose the narrowest, safest interpretation** — the one that adds the least surface area — implement only that, and state the assumption you made in plain language.
- **Never paper over uncertainty with placeholder or speculative code.** No `TODO: figure this out later` left in a state you're calling done. No fake data standing in for a feature you didn't actually build. No silently swallowed errors to make a test pass.
- **If you're stuck between two locked-in choices seeming to conflict, stop and ask** rather than picking one and quietly overriding the other.
- When in doubt: do less, be explicit about what you skipped and why, and never let "it works" substitute for "it matches the spec."