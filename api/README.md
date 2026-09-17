# Property Market API

A versioned, read-only REST API serving realistic property listing data across three related resources: **agencies**, **agents**, and **listings**.

- **Live URL:** `https://<your-railway-app>.up.railway.app`
- **Node.js:** 22.x LTS
- **Zero authentication required** — call any endpoint with nothing but `curl`.

---

## Local Setup

### Prerequisites
- Node.js ≥ 22 ([download](https://nodejs.org/))
- A PostgreSQL database (local or Railway)

### Steps

```bash
# 1. Install dependencies
cd api
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to your Postgres connection string

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Seed the database
npm run seed

# 6. Start the dev server
npm run dev
# → Listening on http://localhost:3000
```

---

## Endpoints

All endpoints are `GET`-only. The API is read-only end to end.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/agencies` | List all agencies (paginated) |
| `GET` | `/api/v1/agencies/:id` | Get a single agency |
| `GET` | `/api/v1/agencies/:id/agents` | List agents at a specific agency |
| `GET` | `/api/v1/agents` | List all agents (paginated, filterable by `agencyId`) |
| `GET` | `/api/v1/agents/:id` | Get a single agent |
| `GET` | `/api/v1/agents/:id/listings` | List listings by a specific agent |
| `GET` | `/api/v1/listings` | List all listings (paginated, filterable, sortable) |
| `GET` | `/api/v1/listings/:id` | Get a single listing |

---

## Query Parameters

All list endpoints accept:

| Parameter | Type | Default | Behaviour |
|-----------|------|---------|-----------|
| `limit` | integer | `20` | Max results per page. Values > 100 are **clamped to 100** (not rejected). |
| `offset` | integer | `0` | Number of records to skip. Negative values return `400`. |
| `sort` | string | resource-specific | Allow-listed field to sort by. Unknown values return `400`. |
| `order` | `asc` \| `desc` | `asc` | Sort direction. |

`GET /api/v1/listings` additionally accepts:

| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | Case-insensitive city filter (e.g. `Austin`) |
| `minPrice` | integer | Minimum price in **cents** (e.g. `10000000` = $100,000) |
| `maxPrice` | integer | Maximum price in **cents** |

`GET /api/v1/agents` additionally accepts:

| Parameter | Type | Description |
|-----------|------|-------------|
| `agencyId` | UUID | Filter agents belonging to a specific agency |

---

## Response Envelopes

### Success (list)
```json
{
  "data": [ { "id": "...", ... } ],
  "meta": {
    "total": 340,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Success (single resource)
```json
{
  "data": { "id": "...", "name": "...", ... }
}
```

### Error
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Listing not found"
  }
}
```

---

## Error Codes

| HTTP Status | Code | When |
|-------------|------|------|
| `400` | `INVALID_OFFSET` | `offset` is negative |
| `400` | `INVALID_SORT` | `sort` field not in allow-list |
| `400` | `INVALID_ID` | `:id` param is not a valid UUID |
| `404` | `NOT_FOUND` | Resource with the given ID does not exist |
| `429` | `RATE_LIMIT_EXCEEDED` | Request rate exceeded; includes `Retry-After: 60` header |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

---

## curl Examples

```bash
# List agencies (first page)
curl "https://<your-url>/api/v1/agencies?limit=5&offset=0"

# Get a single agency
curl "https://<your-url>/api/v1/agencies/<UUID>"

# List agents at an agency
curl "https://<your-url>/api/v1/agencies/<UUID>/agents"

# List agents filtered by agency
curl "https://<your-url>/api/v1/agents?agencyId=<UUID>"

# List listings in Austin under $500k, sorted by price
curl "https://<your-url>/api/v1/listings?city=Austin&maxPrice=50000000&sort=priceMinor&order=asc"

# Trigger INVALID_OFFSET
curl "https://<your-url>/api/v1/listings?offset=-1"

# Trigger INVALID_SORT
curl "https://<your-url>/api/v1/listings?sort=bogus_field"

# Trigger INVALID_ID
curl "https://<your-url>/api/v1/listings/not-a-uuid"
```

---

## Design Decisions

### Why read-only?
An unauthenticated public write path is a security liability. Since the goal is to demonstrate API design discipline — not user onboarding — the surface is intentionally narrowed to reads only. This is a deliberate choice, not a shortcut.

### Why offset pagination instead of cursor?
Offset pagination is simpler to document and test against a pass/fail rubric. A correctly implemented offset approach (with the `total` and `hasMore` fields) satisfies all requirements within the project scope. The tradeoff (performance at high offsets) is accepted and noted here.

### Why minor currency units?
Floating-point arithmetic is lossy for money. Storing price as an integer number of cents (`priceMinor`) with an explicit `currency` column eliminates rounding errors entirely, following standard financial API conventions.

### Why Faker and not a real dataset?
Licensing and accuracy concerns make scraped or real estate data unsuitable for a portfolio project. Faker provides full control over data shape, volume, and reproducibility.

### Free-tier cold-start latency
Railway's free tier may sleep inactive services. Expect an initial cold-start delay of up to ~30s on the first request after a period of inactivity.

---

## Data Model

```
Agency (1) ──< Agent (1) ──< Listing
```

- Every resource ID is a UUID.
- Price is stored as `priceMinor` (integer cents) + `currency` (string, default `"USD"`).
- Cities are drawn from a fixed list of 10 major US metro areas.
