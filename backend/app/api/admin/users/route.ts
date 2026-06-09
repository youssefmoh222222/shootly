import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Simple admin gate. Set ADMIN_SECRET in the environment to protect this route.
// The dashboard sends it via the `x-admin-secret` header (or `?secret=` query).
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    // Fail OPEN only in local dev. In production a missing secret means the
    // route stays locked, so we never leak emails because of a config slip.
    return process.env.NODE_ENV !== 'production';
  }
  const provided =
    request.headers.get('x-admin-secret') ||
    request.nextUrl.searchParams.get('secret') ||
    '';
  return provided === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: 'Database not available', users: [], total: 0 },
      { status: 503 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true,
        profiles: {
          select: { name: true },
        },
      },
    });

    const shaped = users.map((u) => ({
      id: u.id,
      email: u.email,
      credits: u.credits,
      createdAt: u.createdAt,
      brands: u.profiles.map((p) => p.name),
    }));

    return NextResponse.json(
      { total: shaped.length, users: shaped },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Admin/Users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', users: [], total: 0 },
      { status: 500 }
    );
  }
}
