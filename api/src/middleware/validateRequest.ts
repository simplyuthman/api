import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssueCode } from 'zod';
import { buildError } from '../utils/envelope';

/**
 * Derives the PRD error code from a Zod validation issue.
 *
 * Mapping logic:
 *  - custom issue on path "offset"  → INVALID_OFFSET  (PRD §5.4)
 *  - invalid_enum_value on "sort"   → INVALID_SORT    (PRD §5.4)
 *  - uuid failure on "id"           → INVALID_ID      (PRD §5.4)
 *  - anything else                  → VALIDATION_ERROR
 */
function deriveCode(issue: { code: string; path: (string | number)[] }): { code: string; message?: string } {
  const field = String(issue.path[0] ?? '');

  if (issue.code === ZodIssueCode.custom && field === 'offset') return { code: 'INVALID_OFFSET' };
  if (issue.code === ZodIssueCode.invalid_enum_value && field === 'sort') return { code: 'INVALID_SORT', message: 'sort field not supported' };
  if (field === 'id') return { code: 'INVALID_ID' };
  return { code: 'VALIDATION_ERROR' };
}

/**
 * Returns an Express middleware that validates req.query against the provided Zod schema.
 * On validation failure, sends the first error as a 400 with the standard error envelope.
 * On success, replaces req.query with the parsed (coerced) value.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const { code, message: msgOverride } = deriveCode(firstIssue);
      res.status(400).json(buildError(code, msgOverride ?? firstIssue.message));
      return;
    }

    // Replace raw query string values with Zod-coerced ones so controllers
    // receive the correct types.
    req.query = result.data as Record<string, string>;
    next();
  };
}

/**
 * Returns an Express middleware that validates req.params against the provided Zod schema.
 * A non-UUID :id returns 400 INVALID_ID before any database query runs. (PRD §5.4)
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      res.status(400).json(buildError('INVALID_ID', firstIssue.message));
      return;
    }

    next();
  };
}
