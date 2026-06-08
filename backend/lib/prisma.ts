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

// Check if database is available.
// Retries a few times so a serverless DB waking from auto-suspend (e.g. Neon
// free tier) doesn't surface as "Database not available" on the first hit.
export async function isDatabaseAvailable(retries = 4, delayMs = 1500): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.warn(`[DB] Connection check failed (attempt ${attempt}/${retries})`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

