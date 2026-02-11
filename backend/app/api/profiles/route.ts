import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'
import {
  successResponse,
  errorResponse,
  isValidBrandCategory,
  isValidBrandTone,
  isValidTargetAudience,
  isValidEnvironment,
  parseSubCategories,
  mapCategoryToApi
} from '../../../lib/utils'

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== GET /api/profiles ===');
  
  try {
    const user = await requireAuth();
    
    const profiles = await prisma.brandProfile.findMany({
      where: { userId: user.userId },
      include: {
        _count: {
          select: {
            designs: true,
            generations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found profiles:', profiles.length);
    return successResponse(profiles)

  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      // Return empty array instead of error for unauthenticated users
      console.log('No authentication, returning empty profiles');
      return successResponse([])
    }
    console.error('Get profiles error:', error);
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { 
      name, 
      description,
      category, 
      subCategories, 
      brandTone, 
      targetAudience, 
      environment,
      primaryColor,
      secondaryColor
    } = body

    // Validation
    if (!name || !category || !brandTone || !targetAudience || !environment) {
      return errorResponse('Missing required fields: name, category, brandTone, targetAudience, environment')
    }

    if (!isValidBrandCategory(category)) {
      return errorResponse('Invalid category value')
    }

    if (!isValidBrandTone(brandTone)) {
      return errorResponse('Invalid brand tone value')
    }

    if (!isValidTargetAudience(targetAudience)) {
      return errorResponse('Invalid target audience value')
    }

    if (!isValidEnvironment(environment)) {
      return errorResponse('Invalid environment value')
    }

    const validSubCategories = parseSubCategories(subCategories)

    // Create brand profile
    const profile = await prisma.brandProfile.create({
      data: {
        userId: user.userId,
        name,
        description: description || null,
        category,
        subCategories: validSubCategories,
        brandTone,
        targetAudience,
        environment,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null
      },
      include: {
        _count: {
          select: {
            designs: true,
            generations: true
          }
        }
      }
    })

    return successResponse(profile, 'Brand profile created successfully')

  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized', 401)
    }
    console.error('Create profile error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { 
      id,
      name, 
      description,
      category, 
      subCategories, 
      brandTone, 
      targetAudience, 
      environment,
      primaryColor,
      secondaryColor
    } = body

    // Validation
    if (!id) {
      return errorResponse('Profile ID is required')
    }

    if (!name || !category || !brandTone || !targetAudience || !environment) {
      return errorResponse('Missing required fields: name, category, brandTone, targetAudience, environment')
    }

    if (!isValidBrandCategory(category)) {
      return errorResponse('Invalid category value')
    }

    if (!isValidBrandTone(brandTone)) {
      return errorResponse('Invalid brand tone value')
    }

    if (!isValidTargetAudience(targetAudience)) {
      return errorResponse('Invalid target audience value')
    }

    if (!isValidEnvironment(environment)) {
      return errorResponse('Invalid environment value')
    }

    // Check if profile exists and belongs to user
    const existingProfile = await prisma.brandProfile.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!existingProfile) {
      return errorResponse('Brand profile not found or unauthorized', 404)
    }

    const validSubCategories = parseSubCategories(subCategories)

    // Update brand profile
    const profile = await prisma.brandProfile.update({
      where: { id },
      data: {
        name,
        description: description || null,
        category,
        subCategories: validSubCategories,
        brandTone,
        targetAudience,
        environment,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null
      },
      include: {
        _count: {
          select: {
            designs: true,
            generations: true
          }
        }
      }
    })

    return successResponse(profile, 'Brand profile updated successfully')

  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized', 401)
    }
    console.error('Update profile error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('Profile ID is required')
    }

    // Check if profile exists and belongs to user
    const existingProfile = await prisma.brandProfile.findFirst({
      where: {
        id,
        userId: user.userId
      },
      include: {
        _count: {
          select: {
            designs: true,
            generations: true
          }
        }
      }
    })

    if (!existingProfile) {
      return errorResponse('Brand profile not found or unauthorized', 404)
    }

    // Check if profile has designs or generations
    if (existingProfile._count.designs > 0 || existingProfile._count.generations > 0) {
      return errorResponse('Cannot delete profile that has designs or generations. Please delete them first.', 400)
    }

    // Delete brand profile
    await prisma.brandProfile.delete({
      where: { id }
    })

    return successResponse(
      { id, deleted: true },
      'Brand profile deleted successfully'
    )

  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized', 401)
    }
    console.error('Delete profile error:', error)
    return errorResponse('Internal server error', 500)
  }
}