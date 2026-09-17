---
name: verify-api-contract
description: >-
  Use this skill when verifying the Property Market API endpoints against the PRD contract, envelope shapes, edge cases, error codes, and rate limits.
---

# Verify API Contract Skill

This skill provides step-by-step procedures to validate all 8 read-only endpoints, response envelope formats, error handling specifications, and rate limiting behavior.

## 1. Endpoints Verification Test Plan

Ensure the local or deployed API server is running (e.g. `http://localhost:3000` or Railway URL).

### Standard Resource Listing
```bash
# 1. List agencies
curl -s -i "http://localhost:3000/api/v1/agencies?limit=5&offset=0"

# 2. List agents
curl -s -i "http://localhost:3000/api/v1/agents?limit=5&offset=0"

# 3. List listings
curl -s -i "http://localhost:3000/api/v1/listings?limit=5&offset=0"
```
**Expected Response Format**:
Status `200 OK`, JSON body containing `data` array and `meta: { total, limit, offset, hasMore }`.

### Nested Routes & Filtering
```bash
# 4. Nested agents by agency
curl -s -i "http://localhost:3000/api/v1/agencies/<AGENCY_ID>/agents"

# 5. Nested listings by agent
curl -s -i "http://localhost:3000/api/v1/agents/<AGENT_ID>/listings"

# 6. Listing filters (city, minPrice, maxPrice)
curl -s -i "http://localhost:3000/api/v1/listings?city=Austin&minPrice=20000000&maxPrice=80000000"
```

## 2. Edge Case & Error Handling Verification

Test all 4 mandatory input validation cases:

### Case 1: Limit Clamping (Limit > Max Limit)
```bash
curl -s "http://localhost:3000/api/v1/listings?limit=200"
```
- **Expected Status**: `200 OK`
- **Expected Behavior**: Result `meta.limit` is clamped to `100` (does not return 400).

### Case 2: Negative Offset
```bash
curl -s "http://localhost:3000/api/v1/listings?offset=-5"
```
- **Expected Status**: `400 Bad Request`
- **Expected Body**:
  ```json
  { "error": { "code": "INVALID_OFFSET", "message": "offset must be >= 0" } }
  ```

### Case 3: Invalid Sort Field
```bash
curl -s "http://localhost:3000/api/v1/listings?sort=invalid_column"
```
- **Expected Status**: `400 Bad Request`
- **Expected Body**:
  ```json
  { "error": { "code": "INVALID_SORT", "message": "sort field not supported" } }
  ```

### Case 4: Non-UUID Identifier
```bash
curl -s "http://localhost:3000/api/v1/listings/abc-123-invalid"
```
- **Expected Status**: `400 Bad Request`
- **Expected Body**:
  ```json
  { "error": { "code": "INVALID_ID", "message": "id is not a valid identifier" } }
  ```

### Case 5: Missing Resource (Valid UUID not found)
```bash
curl -s "http://localhost:3000/api/v1/listings/00000000-0000-0000-0000-000000000000"
```
- **Expected Status**: `404 Not Found`
- **Expected Body**:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Listing not found" } }
  ```

## 3. Rate Limiting Verification

Send requests exceeding `RATE_LIMIT_MAX_REQUESTS` in a tight loop:
```bash
for i in {1..105}; do curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/v1/listings?limit=1"; done
```
- **Expected Result**: Consecutive `429 Too Many Requests` responses.
- **Expected Header**: `Retry-After: 60`.
