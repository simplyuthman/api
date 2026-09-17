import { Request, Response, NextFunction } from 'express';
import { buildSuccess } from '../../utils/envelope';
import * as agentsService from './agents.service';
import { AgentQuery } from './agents.schema';

export async function listAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows, meta } = await agentsService.listAgents(req.query as unknown as AgentQuery);
    res.json(buildSuccess(rows, meta));
  } catch (err) {
    next(err);
  }
}

export async function getAgentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const agent = await agentsService.getAgentById(id);
    res.json(buildSuccess(agent));
  } catch (err) {
    next(err);
  }
}

export async function listListingsByAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const { rows, meta } = await agentsService.listListingsByAgent(
      id,
      req.query as unknown as AgentQuery,
    );
    res.json(buildSuccess(rows, meta));
  } catch (err) {
    next(err);
  }
}
