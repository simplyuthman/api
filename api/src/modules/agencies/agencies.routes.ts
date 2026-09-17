import { Router } from "express";
import * as controller from "./agencies.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { agencyIdParamSchema, listAgenciesQuerySchema } from "./agencies.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: listAgenciesQuerySchema }),
  controller.listAgencies
);

router.get(
  "/:id",
  validateRequest({ params: agencyIdParamSchema }),
  controller.getAgencyById
);

router.get(
  "/:id/agents",
  validateRequest({
    params: agencyIdParamSchema,
    query: listAgenciesQuerySchema,
  }),
  controller.listAgentsByAgencyId
);

export default router;
