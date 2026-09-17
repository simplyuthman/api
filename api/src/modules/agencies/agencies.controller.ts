import { Request, Response, NextFunction } from "express";
import * as agenciesService from "./agencies.service";
import { buildSuccess, buildError } from "../../utils/envelope";
import { ListAgenciesQuery } from "./agencies.schema";

export async function listAgencies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListAgenciesQuery;
    const result = await agenciesService.findAgencies(query);
    res.status(200).json(buildSuccess(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getAgencyById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const agency = await agenciesService.findAgencyById(id);

    if (!agency) {
      res.status(404).json(buildError("NOT_FOUND", "Agency not found"));
      return;
    }

    res.status(200).json(buildSuccess(agency));
  } catch (error) {
    next(error);
  }
}

export async function listAgentsByAgencyId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const query = req.query as unknown as ListAgenciesQuery;
    const result = await agenciesService.findAgentsByAgencyId(id, query);

    if (!result) {
      res.status(404).json(buildError("NOT_FOUND", "Agency not found"));
      return;
    }

    res.status(200).json(buildSuccess(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}
