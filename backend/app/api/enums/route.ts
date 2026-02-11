import { NextRequest } from 'next/server'
import { successResponse } from '../../../lib/utils'

export async function GET(request: NextRequest) {
  const enums = {
    brandCategories: [
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
    ],
    brandSubCategories: [
      'CASUAL',
      'FORMAL',
      'ATHLETIC',
      'PROFESSIONAL'
    ],
    brandTones: [
      'CLEAN',
      'PROFESSIONAL',
      'PREMIUM',
      'MINIMAL',
      'BOLD'
    ],
    targetAudiences: [
      'DOCTORS',
      'NURSES',
      'MEDICAL_STUDENTS',
      'HOSPITAL_STAFF',
      'ATHLETES',
      'GENERAL_PUBLIC'
    ],
    environments: [
      'HOSPITAL',
      'CLINIC',
      'HOME',
      'GYM',
      'OFFICE',
      'STUDIO'
    ],
    generationTypes: [
      'IMAGE',
      'VIDEO',
      'BOTH'
    ]
  }

  return successResponse(enums)
}
