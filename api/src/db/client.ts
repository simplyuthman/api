import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance — imported by all service files.
// Never instantiate PrismaClient anywhere else in the codebase.
const prisma = new PrismaClient();

export default prisma;
