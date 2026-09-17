# API Contract & Validation Rules

This rule defines the strict interface contract, error shapes, validation requirements, and endpoint behavior for the Property Market API.

## 1. General API Principles
- **Read-Only**: Every endpoint in the API is `GET` only. Never create `POST`, `PUT`, `PATCH`, or `DELETE` endpoints.
- **Versioning**: All API routes must be prefixed with `/api/v1/`.
- **Zero Authentication**: No API keys, JWTs, sessions, or auth middleware. The API is publicly callable.

## 2. Standard Endpoints
The API serves exactly three resources (`Agency`, `Agent`, `Listing`) across these 8 endpoints:

| Method | Path | Description | Query Parameters / Filters |
|---|---|---|---|
| `GET` | `/api/v1/agencies` | List agencies | `limit`, `offset`, `sort`, `order` |
| `GET` | `/api/v1/agencies/:id` | Get single agency | None (404 if not found) |
| `GET` | `/api/v1/agencies/:id/agents` | List agents in an agency | `limit`, `offset`, `sort`, `order` |
| `GET` | `/api/v1/agents` | List agents | `limit`, `offset`, `sort`, `order`, `agencyId` |
| `GET` | `/api/v1/agents/:id` | Get single agent | None (404 if not found) |
| `GET` | `/api/v1/agents/:id/listings` | List listings by an agent | `limit`, `offset`, `sort`, `order` |
| `GET` | `/api/v1/listings` | List listings | `limit`, `offset`, `sort`, `order`, `city`, `minPrice`, `maxPrice` |
| `GET` | `/api/v1/listings/:id` | Get single listing | None (404 if not found) |

## 3. Response & Error Envelopes

All responses MUST be formatted using the helper functions in `src/utils/envelope.ts`. Never construct envelope shapes inline in controllers.

### Success Response Shape
- **List Endpoints**:
  ```json
  {
    "data": [ ... ],
    "meta": {
      "total": 340,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
  ```
- **Single Resource Endpoints**:
  ```json
  {
    "data": { ... }
  }
  ```

### Error Response Shape
All error responses (4xx, 5xx) must adhere strictly to:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description"
  }
}
```

## 4. Query Parameter Validation & Error Specifications

Validation must be performed using Zod schemas located in each resource module (`modules/<resource>/<resource>.schema.ts`).

| Condition | Status Code | Exact Error Code | Exact Message Format | Notes |
|---|---|---|---|---|
| `limit > PAGINATION_MAX_LIMIT` | `200 OK` | N/A | N/A | **Clamp to max limit** (default 100). Do NOT reject. |
| `offset < 0` | `400 Bad Request` | `INVALID_OFFSET` | `"offset must be >= 0"` | Must reject negative offsets immediately. |
| Unrecognized `sort` field | `400 Bad Request` | `INVALID_SORT` | `"sort field not supported"` | Only allow-listed model fields are valid. Never fall back silently. |
| Non-UUID `:id` param | `400 Bad Request` | `INVALID_ID` | `"id is not a valid identifier"` | Must validate UUID before querying database. |
| Resource not found | `404 Not Found` | `NOT_FOUND` | `"<Resource> not found"` | E.g. `"Listing not found"`, `"Agent not found"`. |
| Rate limit exceeded | `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | `"Too many requests, please try again later."` | Must include `Retry-After: 60` HTTP header. |

## 5. Sorting & Filtering Rules
- `sort`: Must be validated against an explicit whitelist for each resource.
- `order`: Must be either `asc` or `desc` (defaults to `asc`).
- `limit`: Defaults to `PAGINATION_DEFAULT_LIMIT` (20), capped at `PAGINATION_MAX_LIMIT` (100).
- `offset`: Defaults to `0`. If `offset >= total`, return `data: []` with valid `meta` (`hasMore: false`), not an error.
- Listing filters:
  - `city`: Case-insensitive string match.
  - `minPrice`: Integer >= 0 (in minor currency units).
  - `maxPrice`: Integer >= 0 (in minor currency units).
