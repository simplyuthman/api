import { Prisma } from '@prisma/client';
import prisma from '../../db/client';
import { AppError } from '../../middleware/errorHandler';
import { ListingQuery } from './listings.schema';
import { Meta } from '../../utils/envelope';

/** Return a paginated, filtered, sorted list of listings. */
export async function listListings(query: ListingQuery): Promise<{ rows: object[]; meta: Meta }> {
  const { limit, offset, sort = 'listedAt', order = 'asc', city, minPrice, maxPrice } = query;

  const where: Prisma.ListingWhereInput = {};

  if (city) {
    // Case-insensitive city match
    where.city = { equals: city, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceMinor = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    rows,
    meta: { total, limit, offset, hasMore: offset + rows.length < total },
  };
}

/** Return a single listing by ID or throw 404. */
export async function getListingById(id: string): Promise<object> {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) {
    throw new AppError(404, 'NOT_FOUND', 'Listing not found');
  }

  return listing;
}
