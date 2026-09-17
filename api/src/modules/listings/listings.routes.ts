import { Router } from "express";
import * as controller from "./listings.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { listingIdParamSchema, listListingsQuerySchema } from "./listings.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: listListingsQuerySchema }),
  controller.listListings
);

router.get(
  "/:id",
  validateRequest({ params: listingIdParamSchema }),
  controller.getListingById
);

export default router;
