// Brand categories (matching lib/utils.ts validation)
export type BrandCategory = 
  | 'STREETWEAR' 
  | 'FOOTBALL' 
  | 'GYMWEAR' 
  | 'OLD_MONEY'
  | 'LUXURY'
  | 'MINIMAL'
  | 'VINTAGE'
  | 'MEDICAL_WEAR'
  | 'Y2K'
  | 'TECHWEAR'
  | 'OVERSIZED'
  | 'RETRO_SPORTS'
  | 'PREPPY'

export type BrandTone = 'CLEAN' | 'PROFESSIONAL' | 'PREMIUM' | 'MINIMAL' | 'BOLD'

export type TargetAudience = 
  | 'DOCTORS' 
  | 'NURSES' 
  | 'MEDICAL_STUDENTS' 
  | 'HOSPITAL_STAFF' 
  | 'ATHLETES' 
  | 'GENERAL_PUBLIC'

export type EnvironmentType = 'HOSPITAL' | 'CLINIC' | 'HOME' | 'GYM' | 'OFFICE' | 'STUDIO'

export interface PromptContext {
  category: BrandCategory
  brandTone: BrandTone
  targetAudience: TargetAudience
  environment: EnvironmentType
  designDescription?: string
  customPrompt?: string
  primaryColor?: string
  secondaryColor?: string
}

// Re-export cinematic prompt builder
export { CinematicPromptGenerator, buildCinematicPrompt, buildCinematicPromptWithNegative } from './cinematic-master'
export type { CinematicPromptConfig } from './cinematic-master'

export function buildPrompt(context: PromptContext & { mode?: 'standard' | 'cinematic'; cinematic?: import('./cinematic-master').CinematicPromptConfig }): string {
  const { category, customPrompt, mode } = context

  // Use cinematic generator when mode is cinematic or cinematic config is provided
  if (mode === 'cinematic' || context.cinematic) {
    const { buildCinematicPrompt: buildCinematic } = require('./cinematic-master')
    const cinematicConfig = context.cinematic || {
      category: context.category,
      brandTone: context.brandTone,
      targetAudience: context.targetAudience,
      environment: context.environment,
      designDescription: context.designDescription,
      customPrompt: context.customPrompt,
      primaryColor: context.primaryColor,
      secondaryColor: context.secondaryColor,
    }
    return buildCinematic(cinematicConfig)
  }

  if (customPrompt) {
    return enhanceCustomPrompt(customPrompt, context)
  }

  switch (category) {
    case 'MEDICAL_WEAR':
      return buildMedicalPrompt(context)
    case 'FOOTBALL':
      return buildFootballPrompt(context)
    case 'GYMWEAR':
      return buildGymwearPrompt(context)
    case 'STREETWEAR':
      return buildStreetwearPrompt(context)
    case 'OLD_MONEY':
      return buildOldMoneyPrompt(context)
    default:
      return buildGenericPrompt(context)
  }
}

function enhanceCustomPrompt(customPrompt: string, context: PromptContext): string {
  const { brandTone, targetAudience, environment } = context
  
  return `Professional ${brandTone.toLowerCase()} clothing design for ${targetAudience.toLowerCase()} in ${environment.toLowerCase()} setting. ${customPrompt} High quality, photorealistic, detailed fabric texture, perfect lighting, professional photography.`
}

function buildMedicalPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'white and blue'
  
  return `Professional medical wear clothing design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Clean, hygienic appearance. Colors: ${colors}. High quality scrubs, comfortable fabric, detailed stitching, professional healthcare attire. Photorealistic, perfect lighting, commercial photography.`
}

function buildFootballPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'team colors'
  
  return `Professional football kit design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Athletic sportswear, performance fabric, team colors ${colors}. Dynamic motion, detailed jersey with sponsor logos, matching shorts. Photorealistic, perfect lighting, commercial sports photography.`
}

function buildGymwearPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'black and neon'
  
  return `Premium gymwear fitness clothing design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Athletic performance wear, stretch fabric, colors: ${colors}. Detailed athletic wear with Technical specifications, moisture-wicking material, comfortable fit. Photorealistic, perfect lighting, commercial fitness photography.`
}

function buildStreetwearPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'urban colors'
  
  return `Modern streetwear fashion design, ${brandTone.toLowerCase()} urban style, for ${targetAudience.toLowerCase()}. Contemporary clothing, street fashion aesthetic, colors: ${colors}. Oversized fit, graphic prints, detailed urban wear. Photorealistic, perfect lighting, editorial fashion photography.`
}

function buildOldMoneyPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'classic neutral'
  
  return `Classic old money preppy fashion design, ${brandTone.toLowerCase()} refined style, for ${targetAudience.toLowerCase()}. Traditional elegance, timeless pieces, colors: ${colors}. Quality materials, tailored fit, sophisticated wardrobe essentials. Photorealistic, perfect lighting, luxury lifestyle photography.`
}

function buildGenericPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, environment, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'complementary colors'

  return `Professional ${brandTone.toLowerCase()} clothing design for ${targetAudience.toLowerCase()} suitable for ${environment.toLowerCase()} settings. Colors: ${colors}. High quality fashion, detailed fabric texture, perfect lighting, commercial photography.`
}

// ─── Product Showcase Prompt Builder ─────────────────────────────────

export type ProductAnimation = 'rotation' | 'closeup' | 'pan' | 'lifestyle'

// Category-specific atmosphere for product videos
const CATEGORY_PRODUCT_VIBES: Record<string, string> = {
  MEDICAL_WEAR: 'clean clinical studio, crisp white lighting, professional healthcare product presentation',
  FOOTBALL: 'sports studio with dramatic rim lighting, athletic energy, performance product showcase',
  GYMWEAR: 'high-contrast gym studio lighting, athletic product energy, performance fabric emphasis',
  STREETWEAR: 'urban studio with edgy lighting, raw concrete backdrop accents, street culture product display',
  OLD_MONEY: 'warm elegant studio, soft golden lighting, mahogany accents, heritage luxury presentation',
  LUXURY: 'high-end editorial studio, dramatic gallery lighting, premium product presentation',
  MINIMAL: 'pure white studio, single soft light source, clean minimal product presentation',
  VINTAGE: 'warm tungsten studio lighting, slight film grain, nostalgic product atmosphere',
  Y2K: 'colorful studio with iridescent light accents, pop-culture product energy, bold presentation',
  TECHWEAR: 'dark studio with cool LED accent lighting, futuristic product display, tech-forward',
  OVERSIZED: 'spacious studio with even lighting, architectural product display, volume emphasis',
  RETRO_SPORTS: 'warm vintage studio lighting, retro sports display atmosphere, classic product feel',
  PREPPY: 'bright clean studio, natural warm lighting, collegiate product showcase',
}

const PRODUCT_ANIMATION_PROMPTS: Record<ProductAnimation, (hasBack: boolean) => string> = {
  rotation: (hasBack) => hasBack
    ? 'Garment slowly rotates from front view to back view in one smooth steady turn. The clothing piece turns naturally on an invisible mannequin, transitioning from the front design to the back design. Single clean 180-degree rotation, no wobble, no bounce. All prints, graphics, colors stay EXACTLY as shown — zero changes.'
    : 'Garment slowly rotates from front view turning to reveal the side and back in one smooth steady 180-degree turn. The clothing piece turns naturally on an invisible mannequin. Single clean rotation, no wobble, no bounce. All prints, graphics, colors stay EXACTLY as shown — zero changes.',
  closeup: (_hasBack) =>
    'Slow cinematic macro close-up gliding across the garment surface, revealing fabric weave, stitching quality, print detail, and material texture. Shallow depth of field, 100mm macro lens feel. Every print, graphic, and color stays EXACTLY as the original — zero changes.',
  pan: (_hasBack) =>
    'Elegant smooth top-to-bottom camera pan revealing the complete garment from neckline down to hem. Full design visible, steady slow vertical tracking shot. All prints, graphics, colors, and construction details remain EXACTLY as shown — zero changes.',
  lifestyle: (_hasBack) =>
    'The garment displayed in a curated styled setting with very gentle subtle fabric movement from a light breeze. Warm natural side lighting, shallow depth of field, editorial product photography mood. The garment design, prints, and colors stay EXACTLY as the original — zero changes.',
}

export function buildProductShowcasePrompt(
  animation: ProductAnimation,
  brandName?: string,
  category?: string,
  hasBackImage?: boolean,
): string {
  const parts: string[] = []

  // Animation-specific motion description
  parts.push(PRODUCT_ANIMATION_PROMPTS[animation](!!hasBackImage))

  // Category-specific studio/atmosphere
  const catKey = category || 'STREETWEAR'
  const catVibe = CATEGORY_PRODUCT_VIBES[catKey] || CATEGORY_PRODUCT_VIBES.STREETWEAR
  parts.push(catVibe)

  // Brand name
  if (brandName) {
    parts.push(`${brandName} brand`)
  }

  // Quality suffix
  parts.push('Professional 4K product video, smooth motion, e-commerce quality')

  let prompt = parts.join('. ')

  // Enforce 512-char limit
  if (prompt.length > 512) {
    let truncated = prompt.substring(0, 512)
    const lastBreak = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf(', '))
    if (lastBreak > 400) truncated = truncated.substring(0, lastBreak)
    prompt = truncated
  }

  return prompt
}

