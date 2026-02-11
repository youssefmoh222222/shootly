import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log environment for debugging
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('NODE_ENV:', process.env.NODE_ENV);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test connection on first use
export async function testPrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Prisma connection successful');
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    return false;
  }
}

// Check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

