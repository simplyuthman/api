import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { buildError } from "../utils/envelope";

export interface RequestValidationSchema {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

export function validateRequest(schemas: RequestValidationSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        // Check for custom error codes attached to zod issue messages or paths
        const path = firstIssue.path.join(".");
        
        if (firstIssue.code === "custom" && firstIssue.params?.errorCode) {
          res.status(400).json(
            buildError(firstIssue.params.errorCode as string, firstIssue.message)
          );
          return;
        }

        if (path === "id") {
          res.status(400).json(
            buildError("INVALID_ID", "id is not a valid identifier")
          );
          return;
        }

        if (path === "offset") {
          res.status(400).json(
            buildError("INVALID_OFFSET", "offset must be >= 0")
          );
          return;
        }

        if (path === "sort") {
          res.status(400).json(
            buildError("INVALID_SORT", "sort field not supported")
          );
          return;
        }

        res.status(400).json(
          buildError("BAD_REQUEST", firstIssue.message)
        );
        return;
      }
      next(error);
    }
  };
}
