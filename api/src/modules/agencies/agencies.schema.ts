import { z } from 'zod';
import { config } from '../../config/config';

/** Reusable UUID schema with the exact error code required by PRD §5.4. */
export const uuidParamSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'id is not a valid identifier' })
    .describe('INVALID_ID'),
});

/** Allow-listed sort fields for Agency. */
const AGENCY_SORT_FIELDS = ['name', 'city', 'createdAt'] as const;
type AgencySortField = (typeof AGENCY_SORT_FIELDS)[number];

/** Allow-listed sort fields when listing agents nested under an agency. */
const NESTED_AGENT_SORT_FIELDS = ['name', 'email', 'createdAt'] as const;
type NestedAgentSortField = (typeof NESTED_AGENT_SORT_FIELDS)[number];

/** Shared pagination + sort query schema for Agency list endpoints. */
export const agencyQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(config.pagination.defaultLimit)
      .transform((v) => Math.min(v, config.pagination.maxLimit)), // clamp, never reject
    offset: z.coerce.number().int().default(0),
    sort: z
      .enum(AGENCY_SORT_FIELDS as unknown as [AgencySortField, ...AgencySortField[]])
      .default('createdAt')
      .optional(),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
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

export type AgencyQuery = z.infer<typeof agencyQuerySchema>;

/** Query schema for the nested GET /agencies/:id/agents route. */
export const agencyNestedAgentsQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(config.pagination.defaultLimit)
      .transform((v) => Math.min(v, config.pagination.maxLimit)),
    offset: z.coerce.number().int().default(0),
    sort: z
      .enum(NESTED_AGENT_SORT_FIELDS as unknown as [NestedAgentSortField, ...NestedAgentSortField[]])
      .default('createdAt')
      .optional(),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
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

export type AgencyNestedAgentsQuery = z.infer<typeof agencyNestedAgentsQuerySchema>;
