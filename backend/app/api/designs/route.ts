import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'
import { successResponse, errorResponse } from '../../../lib/utils'
import { uploadToPermanentStorage } from '../../../lib/cloudinary'

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth-token')?.value;
  
  // Try Authorization header first, then cookie
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }
  
  if (!token) {
    console.log('No auth token found');
    throw new Error('Unauthorized: No token provided');
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    console.log('Token verification failed');
    throw new Error('Unauthorized: Invalid token');
  }
  
  console.log('Auth verified for user:', payload.userId);
  return payload;
}

export async function GET(request: NextRequest) {
  console.log('=== GET /api/designs ===');
  
  try {
    const user = requireAuth(request);
    console.log('User authenticated:', user.userId);
    
    const { searchParams } = new URL(request.url)
    const brandProfileId = searchParams.get('brandProfileId')
    
    const whereClause: any = { 
      brandProfile: {
        userId: user.userId
      }
    }
    
    if (brandProfileId) {
      whereClause.brandProfileId = brandProfileId
    }
    
    const designs = await prisma.design.findMany({
      where: whereClause,
      include: {
        brandProfile: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found designs:', designs.length);
    return successResponse(designs)

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401)
    }
    console.error('Get designs error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/designs ===');
  
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { 
      title,
      brandProfileId, 
      imageUrl, 
      backImageUrl,
      customPrompt 
    } = body

    // Validation
    if (!brandProfileId || !imageUrl) {
      return errorResponse('Missing required fields: brandProfileId, imageUrl')
    }

    // Verify brand profile belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: brandProfileId,
        userId: user.userId
      }
    })

    if (!profile) {
      return errorResponse('Brand profile not found or unauthorized', 404)
    }

    // Upload design images to Cloudinary if they are base64 data URIs
    // This prevents large payloads from hitting Postgres size limits
    const [storedImageUrl, storedBackImageUrl] = await Promise.all([
      imageUrl.startsWith('data:') ? uploadToPermanentStorage(imageUrl, 'shootly/designs') : Promise.resolve(imageUrl),
      backImageUrl?.startsWith('data:') ? uploadToPermanentStorage(backImageUrl, 'shootly/designs') : Promise.resolve(backImageUrl || null),
    ])

    // Create design
    const design = await prisma.design.create({
      data: {
        brandProfileId,
        title: title || null,
        imageUrl: storedImageUrl,
        backImageUrl: storedBackImageUrl,
        customPrompt: customPrompt || null
      },
      include: {
        brandProfile: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    return successResponse(design, 'Design uploaded successfully')

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401)
    }
    console.error('Upload design error:', error)
    return errorResponse('Internal server error', 500)
  }
}