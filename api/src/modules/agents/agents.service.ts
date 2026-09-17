import prisma from '../../db/client';
import { AppError } from '../../middleware/errorHandler';
import { AgentQuery } from './agents.schema';
import { Meta } from '../../utils/envelope';

/** Return a paginated list of agents, optionally filtered by agencyId. */
export async function listAgents(query: AgentQuery): Promise<{ rows: object[]; meta: Meta }> {
  const { limit, offset, sort = 'createdAt', order = 'asc', agencyId } = query;

  const where = agencyId ? { agencyId } : {};

  const [rows, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.agent.count({ where }),
  ]);

  return {
    rows,
    meta: { total, limit, offset, hasMore: offset + rows.length < total },
  };
}

/** Return a single agent by ID or throw 404. */
export async function getAgentById(id: string): Promise<object> {
  const agent = await prisma.agent.findUnique({ where: { id } });

  if (!agent) {
    throw new AppError(404, 'NOT_FOUND', 'Agent not found');
  }

  return agent;
}

/** Return a paginated list of listings belonging to an agent. */
export async function listListingsByAgent(
  agentId: string,
  query: AgentQuery,
): Promise<{ rows: object[]; meta: Meta }> {
  // Verify the parent agent exists
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    throw new AppError(404, 'NOT_FOUND', 'Agent not found');
  }

  const { limit, offset, sort = 'listedAt', order = 'asc' } = query;

  const [rows, total] = await Promise.all([
    prisma.listing.findMany({
      where: { agentId },
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.listing.count({ where: { agentId } }),
  ]);

  return {
    rows,
    meta: { total, limit, offset, hasMore: offset + rows.length < total },
  };
}
