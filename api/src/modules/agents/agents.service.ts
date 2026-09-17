import { prisma } from "../../db/client";
import { ListAgentsQuery } from "./agents.schema";

export async function findAgents(query: ListAgentsQuery) {
  const { limit, offset, sort, order, agencyId } = query;

  const where = agencyId ? { agencyId } : {};
  const orderBy = sort ? { [sort]: order } : { createdAt: "desc" as const };

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.agent.count({ where }),
  ]);

  return {
    data: agents,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export async function findAgentById(id: string) {
  return prisma.agent.findUnique({
    where: { id },
  });
}

export async function findListingsByAgentId(agentId: string, query: { limit: number; offset: number; sort?: string; order: "asc" | "desc" }) {
  const { limit, offset, sort, order } = query;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    return null;
  }

  const orderBy = sort ? { [sort]: order } : { listedAt: "desc" as const };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { agentId },
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.listing.count({
      where: { agentId },
    }),
  ]);

  return {
    data: listings,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}
