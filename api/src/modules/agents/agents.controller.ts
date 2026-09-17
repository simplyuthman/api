import { Request, Response, NextFunction } from "express";
import * as agentsService from "./agents.service";
import { buildSuccess, buildError } from "../../utils/envelope";
import { ListAgentsQuery } from "./agents.schema";

export async function listAgents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListAgentsQuery;
    const result = await agentsService.findAgents(query);
    res.status(200).json(buildSuccess(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getAgentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const agent = await agentsService.findAgentById(id);

    if (!agent) {
      res.status(404).json(buildError("NOT_FOUND", "Agent not found"));
      return;
    }

    res.status(200).json(buildSuccess(agent));
  } catch (error) {
    next(error);
  }
}

export async function listListingsByAgentId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const query = req.query as unknown as ListAgentsQuery;
    const result = await agentsService.findListingsByAgentId(id, query);

    if (!result) {
      res.status(404).json(buildError("NOT_FOUND", "Agent not found"));
      return;
    }

    res.status(200).json(buildSuccess(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}
