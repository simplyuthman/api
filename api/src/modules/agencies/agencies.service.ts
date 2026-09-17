import prisma from '../../db/client';
import { AppError } from '../../middleware/errorHandler';
import { AgencyQuery, AgencyNestedAgentsQuery } from './agencies.schema';
import { Meta } from '../../utils/envelope';

/** Return a paginated list of agencies. */
export async function listAgencies(query: AgencyQuery): Promise<{ rows: object[]; meta: Meta }> {
  const { limit, offset, sort = 'createdAt', order = 'asc' } = query;

  const [rows, total] = await Promise.all([
    prisma.agency.findMany({
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.agency.count(),
  ]);

  return {
    rows,
    meta: { total, limit, offset, hasMore: offset + rows.length < total },
  };
}

/** Return a single agency by ID or throw 404. */
export async function getAgencyById(id: string): Promise<object> {
  const agency = await prisma.agency.findUnique({ where: { id } });

  if (!agency) {
    throw new AppError(404, 'NOT_FOUND', 'Agency not found');
  }

  return agency;
}

/** Return a paginated list of agents belonging to an agency. */
export async function listAgentsByAgency(
  agencyId: string,
  query: AgencyNestedAgentsQuery,
): Promise<{ rows: object[]; meta: Meta }> {
  // Verify the parent agency exists first
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) {
    throw new AppError(404, 'NOT_FOUND', 'Agency not found');
  }

  const { limit, offset, sort = 'createdAt', order = 'asc' } = query;

  const [rows, total] = await Promise.all([
    prisma.agent.findMany({
      where: { agencyId },
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.agent.count({ where: { agencyId } }),
  ]);

  return {
    rows,
    meta: { total, limit, offset, hasMore: offset + rows.length < total },
  };
}
