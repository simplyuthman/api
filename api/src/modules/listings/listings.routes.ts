import { Router } from 'express';
import { validateQuery, validateParams } from '../../middleware/validateRequest';
import { listingQuerySchema, uuidParamSchema } from './listings.schema';
import * as listingsController from './listings.controller';

const router = Router();

// GET /api/v1/listings
router.get(
  '/',
  validateQuery(listingQuerySchema),
  listingsController.listListings,
);

// GET /api/v1/listings/:id
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  listingsController.getListingById,
);

export default router;
