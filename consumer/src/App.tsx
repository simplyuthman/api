import React, { useState, useEffect } from "react";

// Hardcoded deployed public API URL constant (Never localhost)
const API_BASE_URL = "https://property-market-api-production.up.railway.app";

interface Listing {
  id: string;
  title: string;
  description: string;
  city: string;
  address: string;
  priceMinor: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  listedAt: string;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface ApiResponse<T> {
  data: T;
  meta: PaginationMeta;
}

const CITIES = [
  "All Cities",
  "Austin",
  "Denver",
  "Seattle",
  "Atlanta",
  "Chicago",
  "Boston",
  "Phoenix",
  "Miami",
  "Dallas",
  "San Francisco",
];

export const App: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (selectedCity !== "All Cities") {
          queryParams.set("city", selectedCity);
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/listings?${queryParams.toString()}`);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Request failed with status ${res.status}`);
        }

        const json: ApiResponse<Listing[]> = await res.json();
        setListings(json.data);
        setMeta(json.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [selectedCity, offset, limit]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setOffset(0);
  };

  const handleNextPage = () => {
    if (meta?.hasMore) {
      setOffset((prev) => prev + limit);
    }
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const formatPrice = (minor: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  };

  return (
    <div className="container">
      <header className="header">
        <span className="badge">Live API Consumer</span>
        <h1 className="header-title">Property Market Explorer</h1>
        <p className="header-subtitle">
          Consuming live property market data from {API_BASE_URL}
        </p>
      </header>

      <div className="controls">
        <div className="filter-group">
          <label htmlFor="city-filter" className="filter-label">
            Filter by City:
          </label>
          <select
            id="city-filter"
            className="select-input"
            value={selectedCity}
            onChange={handleCityChange}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {meta && (
          <div className="filter-label">
            Showing {listings.length > 0 ? offset + 1 : 0} -{" "}
            {Math.min(offset + listings.length, meta.total)} of {meta.total} properties
          </div>
        )}
      </div>

      {loading && (
        <div className="status-message">
          <p>Loading real estate listings from API...</p>
        </div>
      )}

      {error && (
        <div className="status-message error-box">
          <h3>Unable to load property data</h3>
          <p style={{ marginTop: "0.5rem" }}>{error}</p>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="status-message">
          <h3>No listings match your filters</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Try selecting a different city to see available properties.
          </p>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <>
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="card">
                <div>
                  <h2 className="card-title">{listing.title}</h2>
                  <p className="card-address">
                    {listing.address}, {listing.city}
                  </p>
                  <p className="card-price">
                    {formatPrice(listing.priceMinor, listing.currency)}
                  </p>
                </div>
                <div className="card-meta">
                  <span>🛏️ {listing.bedrooms} Beds</span>
                  <span>🚿 {listing.bathrooms} Baths</span>
                  <span>📐 {listing.squareMeters} m²</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-bar">
            <button
              className="btn"
              onClick={handlePrevPage}
              disabled={offset === 0 || loading}
            >
              Previous Page
            </button>
            <button
              className="btn"
              onClick={handleNextPage}
              disabled={!meta?.hasMore || loading}
            >
              Next Page
            </button>
          </div>
        </>
      )}
    </div>
  );
};
