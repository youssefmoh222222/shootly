import { NextResponse } from 'next/server'

// Response helpers
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data
  }, { status: 200 })
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    message,
    data: null
  }, { status })
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function isValidBrandCategory(category: string): boolean {
  const validCategories = [
    'STREETWEAR', 
    'FOOTBALL', 
    'GYMWEAR', 
    'OLD_MONEY',
    'LUXURY',
    'MINIMAL',
    'VINTAGE',
    'MEDICAL_WEAR',
    'Y2K',
    'TECHWEAR',
    'OVERSIZED',
    'RETRO_SPORTS',
    'PREPPY'
  ]
  return validCategories.includes(category)
}

export function mapCategoryToApi(category: string): string {
  const categoryMap: Record<string, string> = {
    'streetwear': 'STREETWEAR',
    'football': 'FOOTBALL',
    'gymwear': 'GYMWEAR',
    'old-money': 'OLD_MONEY',
    'luxury': 'LUXURY',
    'minimal': 'MINIMAL',
    'vintage': 'VINTAGE',
    'medical-wear': 'MEDICAL_WEAR',
    'y2k': 'Y2K',
    'techwear': 'TECHWEAR',
    'oversized': 'OVERSIZED',
    'retro-sports': 'RETRO_SPORTS',
    'preppy': 'PREPPY'
  }
  return categoryMap[category] || 'STREETWEAR'
}

export function isValidBrandTone(tone: string): boolean {
  const validTones = ['CLEAN', 'PROFESSIONAL', 'PREMIUM', 'MINIMAL', 'BOLD']
  return validTones.includes(tone)
}

export function isValidTargetAudience(audience: string): boolean {
  const validAudiences = ['DOCTORS', 'NURSES', 'MEDICAL_STUDENTS', 'HOSPITAL_STAFF', 'ATHLETES', 'GENERAL_PUBLIC']
  return validAudiences.includes(audience)
}

export function isValidEnvironment(environment: string): boolean {
  const validEnvironments = ['HOSPITAL', 'CLINIC', 'HOME', 'GYM', 'OFFICE', 'STUDIO']
  return validEnvironments.includes(environment)
}

export function parseSubCategories(subCategories: any): string {
  if (!subCategories) return ''
  if (typeof subCategories === 'string') {
    return subCategories
  }
  if (Array.isArray(subCategories)) {
    return subCategories.join(',')
  }
  return ''
}
