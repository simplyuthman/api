# Database & Seeding Rules

This rule enforces Prisma schema integrity, data modeling constraints, and idempotent database seeding procedures.

## 1. Prisma Data Model Constraints

The Prisma schema in `api/prisma/schema.prisma` must match PRD Section 9 **verbatim**. Do not add, remove, or rename models, fields, or relations.

- **Primary Keys**: Every model must use UUIDs generated via `@default(uuid())`. Sequential integer IDs are prohibited.
- **Monetary Values**: All price fields must be stored as integers representing minor currency units (e.g., `priceMinor Int` for cents) accompanied by a `currency String @default("USD")` field. Never use floats or decimals for currency.
- **Resource Model Hierarchy**: Exactly three models in a strict one-to-many hierarchy:
  1. `Agency` (has many `Agent`)
  2. `Agent` (belongs to `Agency`, has many `Listing`)
  3. `Listing` (belongs to `Agent`)
- **Database Engine**: PostgreSQL managed instance on Railway. Do not substitute SQLite or MongoDB.

## 2. Prisma Schema Specification

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

## 3. Seeding Standards

- **Library**: Use `@faker-js/faker` for realistic property, name, address, and description generation.
- **No External / Scraped Datasets**: Do not import Mockaroo or scrape external listings.
- **Idempotency**:
  - The seed script (`api/prisma/seed.ts`) must use deterministic IDs or keys and Prisma `upsert` queries.
  - Running the seed script twice must result in the exact same row count with zero duplicates.
- **Volume Targets**:
  - **Agencies**: 10 – 20 agencies.
  - **Agents**: 3 – 8 agents per agency.
  - **Listings**: 15 – 40 listings per agent (minimum total listings: **300+**).
- **Geographic Distribution**:
  - City data must be drawn from a fixed list of 8–10 major US metro areas (e.g., `Austin`, `Denver`, `Seattle`, `Atlanta`, `Chicago`, `Boston`, `Phoenix`, `Miami`, `Dallas`, `San Francisco`) to ensure meaningful city filtering in the consumer app.
