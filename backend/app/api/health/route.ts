import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get counts
    const userCount = await prisma.user.count()
    const profileCount = await prisma.brandProfile.count()
    const designCount = await prisma.design.count()
    const generationCount = await prisma.generation.count()
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      counts: {
        users: userCount,
        profiles: profileCount,
        designs: designCount,
        generations: generationCount
      },
      service: 'ai-clothing-brand-backend'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}