# Consumer App Rules

This rule enforces constraints, architecture, and behavior for the static consumer application.

## 1. Zero Build & Framework Restrictions
- **Single Static File**: The consumer app is exactly one file located at `consumer/index.html`.
- **Vanilla Only**: Use standard HTML5, CSS3, and vanilla JavaScript.
- **No Bundlers / Frameworks**: No React, Vue, Svelte, Vite, Webpack, Babel, or npm dependencies.
- **No Shared Code**: The consumer app must have zero shared code or imports from the `/api` directory. It must run independently on any static web host.

## 2. Network & Public URL Constraints
- **Public API Target**: The consumer app must fetch data from the live public deployed API URL (e.g. on Railway).
- **Hardcoded Config Constant**: Define `const API_BASE_URL = "https://<your-railway-app>.up.railway.app/api/v1"` at the very top of the script.
- **Never Use Localhost**: Never call `localhost`, `127.0.0.1`, or relative paths (e.g. `/api/v1/...`).

## 3. UI Features & UX Requirements
- **Listing Display**: Renders a list/grid of property listings fetched from `GET /api/v1/listings`. Display key fields (title, address, city, formatted price from `priceMinor`, bedrooms, bathrooms, squareMeters).
- **Filter Control**: Provide a City filter dropdown populated with the supported metro areas to filter listings.
- **Pagination**: Provide a "Next Page" (or Prev/Next) button that increments `offset` by `limit` to fetch the next set of listings.
- **Required UI States**:
  1. **Loading State**: Visual indicator (spinner or skeleton) while network requests are in-flight.
  2. **Live Data State**: Clean, responsive layout of property listing cards.
  3. **Empty State**: Clear message (e.g. `"No listings match your filters"`) when `data` is empty.
  4. **Error State**: User-friendly error message when the API is unreachable, rate limited (429), or returns a 4xx/5xx error.

## 4. Deployment Target
- Deploy the consumer static page to **Vercel** as a standalone static deployment.
