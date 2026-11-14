import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://scholarflow:scholarflow_dev_password@127.0.0.1:5433/scholarflow?schema=public',
});

const prisma = new PrismaClient({ adapter });

export default prisma;
export { prisma };
