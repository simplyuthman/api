import { Request, Response, NextFunction } from 'express';
import { buildSuccess } from '../../utils/envelope';
import * as agenciesService from './agencies.service';
import { AgencyQuery, AgencyNestedAgentsQuery } from './agencies.schema';

export async function listAgencies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows, meta } = await agenciesService.listAgencies(req.query as unknown as AgencyQuery);
    res.json(buildSuccess(rows, meta));
  } catch (err) {
    next(err);
  }
}

export async function getAgencyById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const agency = await agenciesService.getAgencyById(id);
    res.json(buildSuccess(agency));
  } catch (err) {
    next(err);
  }
}

export async function listAgentsByAgency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const { rows, meta } = await agenciesService.listAgentsByAgency(
      id,
      req.query as unknown as AgencyNestedAgentsQuery,
    );
    res.json(buildSuccess(rows, meta));
  } catch (err) {
    next(err);
  }
}
