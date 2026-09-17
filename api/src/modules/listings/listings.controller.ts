import { Request, Response, NextFunction } from "express";
import * as listingsService from "./listings.service";
import { buildSuccess, buildError } from "../../utils/envelope";
import { ListListingsQuery } from "./listings.schema";

export async function listListings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListListingsQuery;
    const result = await listingsService.findListings(query);
    res.status(200).json(buildSuccess(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getListingById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const listing = await listingsService.findListingById(id);

    if (!listing) {
      res.status(404).json(buildError("NOT_FOUND", "Listing not found"));
      return;
    }

    res.status(200).json(buildSuccess(listing));
  } catch (error) {
    next(error);
  }
}
