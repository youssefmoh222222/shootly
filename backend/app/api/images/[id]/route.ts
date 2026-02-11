import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic';

/**
 * GET /api/images/[id]
 * Serves a design's base64 image as a binary HTTP response.
 * No auth required — design IDs are CUIDs (unguessable).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Missing design ID' }, { status: 400 })
  }

  const design = await prisma.design.findUnique({
    where: { id },
    select: { imageUrl: true },
  })

  if (!design || !design.imageUrl) {
    return NextResponse.json({ error: 'Design not found' }, { status: 404 })
  }

  const dataUri = design.imageUrl

  // If it's not a data URI, redirect to the URL directly
  if (!dataUri.startsWith('data:')) {
    return NextResponse.redirect(dataUri)
  }

  // Parse data URI: data:<mime>;base64,<data>
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 500 })
  }

  const mimeType = match[1]
  const base64Data = match[2]
  const buffer = Buffer.from(base64Data, 'base64')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
