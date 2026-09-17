import { Router } from "express";
import * as controller from "./agents.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { agentIdParamSchema, listAgentsQuerySchema } from "./agents.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: listAgentsQuerySchema }),
  controller.listAgents
);

router.get(
  "/:id",
  validateRequest({ params: agentIdParamSchema }),
  controller.getAgentById
);

router.get(
  "/:id/listings",
  validateRequest({
    params: agentIdParamSchema,
    query: listAgentsQuerySchema,
  }),
  controller.listListingsByAgentId
);

export default router;
