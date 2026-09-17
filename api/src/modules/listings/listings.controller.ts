import { Request, Response, NextFunction } from 'express';
import { buildSuccess } from '../../utils/envelope';
import * as listingsService from './listings.service';
import { ListingQuery } from './listings.schema';

export async function listListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows, meta } = await listingsService.listListings(req.query as unknown as ListingQuery);
    res.json(buildSuccess(rows, meta));
  } catch (err) {
    next(err);
  }
}

export async function getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const listing = await listingsService.getListingById(id);
    res.json(buildSuccess(listing));
  } catch (err) {
    next(err);
  }
}
