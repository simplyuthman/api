---
name: seed-database
description: >-
  Use this skill when implementing, running, or verifying the idempotent Faker-based database seed script for the Property Market API.
---

# Seed Database Skill

This workflow guides the implementation, execution, and verification of idempotent relational property market test data generation.

## 1. Seed Requirements Checklist

Before generating data, verify these specifications:
- [ ] Uses `@faker-js/faker` (seeded with deterministic random generator or predictable keys).
- [ ] 10–20 Agencies across 8–10 major US cities (`Austin`, `Denver`, `Seattle`, `Atlanta`, `Chicago`, `Boston`, `Phoenix`, `Miami`, `Dallas`, `San Francisco`).
- [ ] 3–8 Agents per Agency.
- [ ] 15–40 Listings per Agent.
- [ ] Total listing count >= 300.
- [ ] Prices stored as `priceMinor` (integer cents) with `currency = "USD"`.
- [ ] All primary keys are UUIDs.
- [ ] Idempotent `upsert` queries: Running the seed script twice produces identical row counts with zero duplicate records.

## 2. Execution Steps

1. **Verify Database Connection**:
   Ensure `DATABASE_URL` is configured in `api/.env`:
   ```bash
   cd api
   npx prisma migrate dev --name init
   ```

2. **Run Seed Script**:
   Execute the Prisma seed runner:
   ```bash
   npx prisma db seed
   ```

3. **Verify Idempotency**:
   Run the seed script a second time immediately after:
   ```bash
   npx prisma db seed
   ```

4. **Confirm Record Counts**:
   Run a Prisma Studio or quick script query to verify row counts:
   ```bash
   npx prisma studio
   ```
   Or execute a count check via Node:
   ```typescript
   const agencyCount = await prisma.agency.count();
   const agentCount = await prisma.agent.count();
   const listingCount = await prisma.listing.count();
   console.log({ agencyCount, agentCount, listingCount });
   // listingCount must be >= 300
   ```
