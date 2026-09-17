import { prisma } from "../../db/client";
import { ListAgenciesQuery } from "./agencies.schema";

export async function findAgencies(query: ListAgenciesQuery) {
  const { limit, offset, sort, order } = query;

  const orderBy = sort ? { [sort]: order } : { createdAt: "desc" as const };

  const [agencies, total] = await Promise.all([
    prisma.agency.findMany({
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.agency.count(),
  ]);

  return {
    data: agencies,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export async function findAgencyById(id: string) {
  return prisma.agency.findUnique({
    where: { id },
  });
}

export async function findAgentsByAgencyId(agencyId: string, query: ListAgenciesQuery) {
  const { limit, offset, sort, order } = query;

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agency) {
    return null;
  }

  const orderBy = sort ? { [sort]: order } : { createdAt: "desc" as const };

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where: { agencyId },
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.agent.count({
      where: { agencyId },
    }),
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
