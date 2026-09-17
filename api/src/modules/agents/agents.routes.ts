import { Router } from 'express';
import { validateQuery, validateParams } from '../../middleware/validateRequest';
import { agentQuerySchema, uuidParamSchema } from './agents.schema';
import * as agentsController from './agents.controller';

const router = Router();

// GET /api/v1/agents
router.get(
  '/',
  validateQuery(agentQuerySchema),
  agentsController.listAgents,
);

// GET /api/v1/agents/:id
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  agentsController.getAgentById,
);

// GET /api/v1/agents/:id/listings
router.get(
  '/:id/listings',
  validateParams(uuidParamSchema),
  validateQuery(agentQuerySchema),
  agentsController.listListingsByAgent,
);

export default router;
