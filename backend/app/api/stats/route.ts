import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ signupCount: 0, spotsLeft: 20, earlyAdopterFull: false });
    }

    const signupCount = await prisma.user.count();
    const EARLY_ADOPTER_LIMIT = 20;
    const spotsLeft = Math.max(0, EARLY_ADOPTER_LIMIT - signupCount);
    const earlyAdopterFull = signupCount >= EARLY_ADOPTER_LIMIT;

    return NextResponse.json(
      { signupCount, spotsLeft, earlyAdopterFull },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('[Stats] Error:', error);
    return NextResponse.json({ signupCount: 0, spotsLeft: 20, earlyAdopterFull: false });
  }
}
