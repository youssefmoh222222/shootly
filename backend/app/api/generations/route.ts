import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    const { searchParams } = new URL(request.url);
    const brandProfileId = searchParams.get('brandId');

    // Get user's brand profiles
    const brandProfiles = await prisma.brandProfile.findMany({
      where: { userId: payload.userId }
    });

    const brandIds = brandProfiles.map((bp: any) => bp.id);

    let whereClause: any = {
      brandProfileId: { in: brandIds }
    };

    // Filter by specific brand if provided
    if (brandProfileId) {
      whereClause.brandProfileId = brandProfileId;
    }

    // Get generations ordered by creation date
    const generations = await prisma.generation.findMany({
      where: whereClause,
      include: {
        brandProfile: {
          select: { name: true }
        },
        design: {
          select: { imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by design and format response
    const groupedGenerations = generations.reduce((acc: Record<string, any>, gen: any) => {
      const designId = gen.designId || 'direct';
      if (!acc[designId]) {
        acc[designId] = {
          designId: gen.designId,
          designImage: gen.design?.imageUrl,
          brandName: gen.brandProfile.name,
          brandCategory: gen.brandProfile.category,
          generations: []
        };
      }
      acc[designId].generations.push({
        id: gen.id,
        type: gen.type,
        resultUrl: gen.resultUrl,
        promptUsed: gen.promptUsed,
        createdAt: gen.createdAt
      });
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: Object.values(groupedGenerations)
    });

  } catch (error) {
    console.error('Fetch generations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

