import { z } from 'zod';
import { config } from '../../config/config';

/** Reusable UUID schema with the exact error code required by PRD §5.4. */
export const uuidParamSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'id is not a valid identifier' })
    .describe('INVALID_ID'),
});

/** Allow-listed sort fields for Listing (PRD §5.3, AGENTS.md §3 rule 7). */
const LISTING_SORT_FIELDS = [
  'priceMinor',
  'bedrooms',
  'bathrooms',
  'squareMeters',
  'listedAt',
  'createdAt',
  'city',
] as const;
type ListingSortField = (typeof LISTING_SORT_FIELDS)[number];

/** Query schema for listing list endpoints. */
export const listingQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(config.pagination.defaultLimit)
      .transform((v) => Math.min(v, config.pagination.maxLimit)), // clamp, never reject (PRD §5.4)
    offset: z.coerce.number().int().default(0),
    sort: z
      .enum(LISTING_SORT_FIELDS as unknown as [ListingSortField, ...ListingSortField[]])
      .default('listedAt')
      .optional(),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
    /** Filter by city (case-insensitive contains). */
    city: z.string().optional(),
    /** Filter by minimum price in minor units (cents). */
    minPrice: z.coerce.number().int().min(0).optional(),
    /** Filter by maximum price in minor units (cents). */
    maxPrice: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.offset < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'offset must be >= 0',
        path: ['offset'],
        params: { code: 'INVALID_OFFSET' },
      });
    }
  });

export type ListingQuery = z.infer<typeof listingQuerySchema>;
