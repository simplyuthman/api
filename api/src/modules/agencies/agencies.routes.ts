import { Router } from 'express';
import { validateQuery, validateParams } from '../../middleware/validateRequest';
import { agencyQuerySchema, agencyNestedAgentsQuerySchema, uuidParamSchema } from './agencies.schema';
import * as agenciesController from './agencies.controller';

const router = Router();

// GET /api/v1/agencies
router.get(
  '/',
  validateQuery(agencyQuerySchema),
  agenciesController.listAgencies,
);

// GET /api/v1/agencies/:id
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  agenciesController.getAgencyById,
);

// GET /api/v1/agencies/:id/agents
router.get(
  '/:id/agents',
  validateParams(uuidParamSchema),
  validateQuery(agencyNestedAgentsQuerySchema),
  agenciesController.listAgentsByAgency,
);

export default router;
