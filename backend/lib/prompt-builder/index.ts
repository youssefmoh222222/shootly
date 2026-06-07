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

const DESIGN_PRESERVATION = 'Use the reference image EXACTLY as provided. Do NOT modify, redesign, or alter the jersey in any way. The jersey design, color, pattern, logos, and text must remain 100% identical to the reference image.'

function enhanceCustomPrompt(customPrompt: string, context: PromptContext): string {
  const { brandTone, targetAudience, environment } = context

  return `${DESIGN_PRESERVATION} Professional ${brandTone.toLowerCase()} clothing design for ${targetAudience.toLowerCase()} in ${environment.toLowerCase()} setting. ${customPrompt} High quality, photorealistic, detailed fabric texture, perfect lighting, professional photography.`
}

function buildMedicalPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'white and blue'
  
  return `${DESIGN_PRESERVATION} Professional medical wear clothing design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Clean, hygienic appearance. Colors: ${colors}. High quality scrubs, comfortable fabric, detailed stitching, professional healthcare attire. Photorealistic, perfect lighting, commercial photography.`
}

function buildFootballPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'team colors'
  
  return `${DESIGN_PRESERVATION} Professional football kit design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Athletic sportswear, performance fabric, team colors ${colors}. Dynamic motion, detailed jersey with sponsor logos, matching shorts. Photorealistic, perfect lighting, commercial sports photography.`
}

function buildGymwearPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'black and neon'
  
  return `${DESIGN_PRESERVATION} Premium gymwear fitness clothing design, ${brandTone.toLowerCase()} style, for ${targetAudience.toLowerCase()}. Athletic performance wear, stretch fabric, colors: ${colors}. Detailed athletic wear with Technical specifications, moisture-wicking material, comfortable fit. Photorealistic, perfect lighting, commercial fitness photography.`
}

function buildStreetwearPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'urban colors'
  
  return `${DESIGN_PRESERVATION} Modern streetwear fashion design, ${brandTone.toLowerCase()} urban style, for ${targetAudience.toLowerCase()}. Contemporary clothing, street fashion aesthetic, colors: ${colors}. Oversized fit, graphic prints, detailed urban wear. Photorealistic, perfect lighting, editorial fashion photography.`
}

function buildOldMoneyPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'classic neutral'
  
  return `${DESIGN_PRESERVATION} Classic old money preppy fashion design, ${brandTone.toLowerCase()} refined style, for ${targetAudience.toLowerCase()}. Traditional elegance, timeless pieces, colors: ${colors}. Quality materials, tailored fit, sophisticated wardrobe essentials. Photorealistic, perfect lighting, luxury lifestyle photography.`
}

function buildGenericPrompt(context: PromptContext): string {
  const { brandTone, targetAudience, environment, primaryColor, secondaryColor } = context
  const colors = [primaryColor, secondaryColor].filter(Boolean).join(' and ') || 'complementary colors'

  return `${DESIGN_PRESERVATION} Professional ${brandTone.toLowerCase()} clothing design for ${targetAudience.toLowerCase()} suitable for ${environment.toLowerCase()} settings. Colors: ${colors}. High quality fashion, detailed fabric texture, perfect lighting, commercial photography.`
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
  // 360-degree turntable: camera orbits the garment as a rigid 3D object. Framed as
  // CAMERA motion (not pixel morph) so mid-frames stay clean.
  rotation: (hasBack) => hasBack
    ? 'Professional e-commerce product shot. ONE single slow 180-degree rotation only — the garment turns exactly half a turn, starting on the front in the very first frame and ending on the back in the very last frame, and stopping there. NO second rotation, NO full 360 spin, NO repeated turning. Smooth constant slow speed, like a single half-revolution on a turntable. The garment rotates as a solid rigid 3D object on an invisible mannequin — no warp, no morph. All logos, crests, numbers, text, stripes, colors, and patterns stay pixel-perfect and rotate rigidly with the garment.'
    : 'Professional e-commerce product shot. ONE single slow 180-degree rotation only — the garment turns exactly half a turn from the front view through the side to the back view, and stops there. NO second rotation, NO full 360 spin, NO repeated turning. Smooth constant slow speed, like a single half-revolution on a turntable. The garment rotates as a solid rigid 3D object on an invisible mannequin — no warp, no morph. All logos, crests, numbers, text, stripes, colors, and patterns stay pixel-perfect and rotate rigidly with the garment.',
  // Macro detail glide: locked focus on print/fabric detail
  closeup: (_hasBack) =>
    'Cinematic macro product reveal. A 100mm macro lens slowly glides across the garment surface, revealing fabric weave, stitching, embroidery thread, print sharpness, logo edge crispness, and material texture. Razor-thin depth of field, soft focus falloff. The garment stays still — only the camera moves. Every logo, crest, number, text element, color, and pattern remains pixel-perfect and identical to the source image throughout every frame, with no morphing or distortion.',
  // Locked-tripod vertical tracking shot
  pan: (_hasBack) =>
    'Elegant top-to-bottom vertical tracking shot. A locked tripod camera slowly tilts (or cranes) downward from the neckline to the hem, revealing the full garment in one smooth continuous move at constant speed. The garment hangs still — only the camera moves. All logos, crests, numbers, text, stripes, colors, and construction details remain pixel-perfect and identical to the source image throughout every frame, with no warping, no morphing, no design change.',
  // Editorial lifestyle: subtle fabric motion only
  lifestyle: (_hasBack) =>
    'Editorial lifestyle product video. The garment is presented in a curated styled scene with very subtle natural motion — only a soft breeze gently moving the fabric drape, no pose change, no camera pan. Warm directional side lighting, soft shadows, shallow depth of field. The garment stays anchored in frame. All logos, crests, numbers, text, colors, and patterns remain pixel-perfect and identical to the source image throughout every frame — fabric ripples gently but never warps the print.',
}

export function buildProductShowcasePrompt(
  animation: ProductAnimation,
  brandName?: string,
  category?: string,
  hasBackImage?: boolean,
): string {
  const parts: string[] = []

  // Design preservation mandate
  parts.push('Use the reference image EXACTLY as provided. Do NOT modify, redesign, or alter the jersey in any way. The jersey design, color, pattern, logos, and text must remain 100% identical to the reference image')

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

