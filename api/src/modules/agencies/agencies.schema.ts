import { z } from "zod";
import { config } from "../../config/config";

const allowedAgencySortFields = ["name", "city", "createdAt"] as const;

export const agencyIdParamSchema = z.object({
  id: z.string().uuid({ message: "id is not a valid identifier" }),
});

export const listAgenciesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return config.pagination.defaultLimit;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) return config.pagination.defaultLimit;
      return Math.min(parsed, config.pagination.maxLimit);
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return config.pagination.defaultOffset;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    })
    .refine((val) => val >= 0, {
      message: "offset must be >= 0",
      params: { errorCode: "INVALID_OFFSET" },
    }),
  sort: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || (allowedAgencySortFields as readonly string[]).includes(val),
      {
        message: "sort field not supported",
        params: { errorCode: "INVALID_SORT" },
      }
    ),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type ListAgenciesQuery = z.infer<typeof listAgenciesQuerySchema>;
