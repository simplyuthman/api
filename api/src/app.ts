import express from "express";
import cors from "cors";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { buildError } from "./utils/envelope";

import agenciesRoutes from "./modules/agencies/agencies.routes";
import agentsRoutes from "./modules/agents/agents.routes";
import listingsRoutes from "./modules/listings/listings.routes";

export const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

// API v1 Routes
app.use("/api/v1/agencies", agenciesRoutes);
app.use("/api/v1/agents", agentsRoutes);
app.use("/api/v1/listings", listingsRoutes);

// Health check / root endpoint
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json(buildError("NOT_FOUND", "Endpoint not found"));
});

// Central Error Handler
app.use(errorHandler);
