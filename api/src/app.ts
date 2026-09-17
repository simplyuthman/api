import express from 'express';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import agenciesRouter from './modules/agencies/agencies.routes';
import agentsRouter from './modules/agents/agents.routes';
import listingsRouter from './modules/listings/listings.routes';

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────

app.use(express.json());

// Rate limiting applied to every route (PRD §5.4, §6; AGENTS.md §3 rule 9)
app.use(rateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/v1/agencies', agenciesRouter);
app.use('/api/v1/agents', agentsRouter);
app.use('/api/v1/listings', listingsRouter);

// ── Error handling (must be last) ─────────────────────────────────────────────

app.use(errorHandler);

export default app;
