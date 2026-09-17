import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { ListListingsQuery } from "./listings.schema";

export async function findListings(query: ListListingsQuery) {
  const { limit, offset, sort, order, city, minPrice, maxPrice } = query;

  const where: Prisma.ListingWhereInput = {};

  if (city) {
    where.city = {
      equals: city,
      mode: "insensitive",
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceMinor = {};
    if (minPrice !== undefined && !isNaN(minPrice)) {
      where.priceMinor.gte = minPrice;
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      where.priceMinor.lte = maxPrice;
    }
  }

  const orderBy = sort ? { [sort]: order } : { listedAt: "desc" as const };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    data: listings,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export async function findListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      agent: {
        include: {
          agency: true,
        },
      },
    },
  });
}
