import { z } from 'zod';
import { config } from '../../config/config';

/** Reusable UUID schema with the exact error code required by PRD §5.4. */
export const uuidParamSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'id is not a valid identifier' })
    .describe('INVALID_ID'),
});

/** Allow-listed sort fields for Agent. */
const AGENT_SORT_FIELDS = ['name', 'email', 'createdAt'] as const;
type AgentSortField = (typeof AGENT_SORT_FIELDS)[number];

/** Query schema for agent list endpoints. */
export const agentQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(config.pagination.defaultLimit)
      .transform((v) => Math.min(v, config.pagination.maxLimit)),
    offset: z.coerce.number().int().default(0),
    sort: z
      .enum(AGENT_SORT_FIELDS as unknown as [AgentSortField, ...AgentSortField[]])
      .default('createdAt')
      .optional(),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
    /** Filter agents by their parent agency. */
    agencyId: z
      .string()
      .uuid({ message: 'agencyId is not a valid identifier' })
      .optional(),
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

export type AgentQuery = z.infer<typeof agentQuerySchema>;
