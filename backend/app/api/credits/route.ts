import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error('Credits fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
