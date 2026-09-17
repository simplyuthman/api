---
name: deploy-and-verify
description: >-
  Use this skill when deploying the Property Market API to Railway, the consumer app to Vercel, and capturing evaluation evidence artifacts.
---

# Deploy and Verify Skill

This workflow covers deploying the Node.js/Express/Postgres API to Railway, deploying the static consumer application to Vercel, and collecting submission evidence artifacts.

## 1. Railway API Deployment

1. **Create Railway Project**:
   - Provision a new Railway project with **Managed PostgreSQL**.
   - Connect the GitHub repository or deploy via Railway CLI.
2. **Environment Variables**:
   Set the following variables in Railway project settings:
   - `DATABASE_URL`: Automatically linked from Railway Postgres plugin.
   - `NODE_ENV`: `production`
   - `PORT`: (Set by Railway or default `3000`)
   - `PAGINATION_DEFAULT_LIMIT`: `20`
   - `PAGINATION_MAX_LIMIT`: `100`
   - `RATE_LIMIT_WINDOW_MS`: `60000`
   - `RATE_LIMIT_MAX_REQUESTS`: `100`
3. **Build & Start Commands**:
   - Build: `npm run build` (or `npx prisma generate && tsc`)
   - Start: `npx prisma migrate deploy && npm run seed && node dist/server.js`
4. **Obtain Live Public URL**:
   Generate a public domain in Railway settings (e.g. `https://property-market-api-production.up.railway.app`).

## 2. Consumer App Deployment to Vercel

1. **Configure Live API URL**:
   In `consumer/index.html`, set the public URL constant:
   ```javascript
   const API_BASE_URL = "https://property-market-api-production.up.railway.app/api/v1";
   ```
2. **Deploy with Vercel CLI**:
   ```bash
   cd consumer
   vercel --prod
   ```
3. **Verify Vercel Deployment**:
   Open the deployed Vercel URL and check that listings load from the Railway API over HTTPS.

## 3. Evidence Collection Checklist (PRD Section 10)

Capture and record evidence for grading:
- [ ] **Live API Curl**: Screenshot of terminal executing curl against public Railway URL returning a paginated 200 OK response.
- [ ] **Rate Limiting 429**: Screenshot of terminal hitting rate limit with `Retry-After` header visible.
- [ ] **Consumer App Live Data**: Screenshot of consumer web page rendering property cards fetched from public API.
- [ ] **Consumer App Empty State**: Screenshot of filtered view yielding `"No listings match your filters"`.
- [ ] **Consumer App Error State**: Screenshot of consumer UI handling an intentional network failure / offline mode.
- [ ] **Database Row Counts**: Query screenshot confirming 300+ listings and 10+ agencies in Postgres.
