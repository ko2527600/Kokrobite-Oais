import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize Prisma Client with Accelerate extension
// It will automatically use the DATABASE_URL from .env
const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
