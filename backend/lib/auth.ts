import jwt from 'jsonwebtoken'
import { cookies, headers } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const SALT_ROUNDS = 10

export interface JWTPayload {
  userId: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function getAuthToken(): Promise<string | null> {
  // First try to get from Authorization header
  const headerStore = await headers()
  const authHeader = headerStore.get('Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Fall back to cookie
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value || null
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken()
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function requireAuth(): Promise<JWTPayload> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('Unauthorized: No token')
  }
  
  const user = verifyToken(token)
  
  if (!user) {
    // Clear the invalid cookie
    await clearAuthCookie()
    throw new Error('Unauthorized: Invalid token')
  }
  
  return user
}
