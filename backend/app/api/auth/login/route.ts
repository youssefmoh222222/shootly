import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setAuthCookie, generateToken } from '@/lib/auth'
import { validateEmail, successResponse, errorResponse } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return errorResponse('Missing email or password')
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format')
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return successResponse(
      { user: userWithoutPassword, token },
      'Login successful'
    )

  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}