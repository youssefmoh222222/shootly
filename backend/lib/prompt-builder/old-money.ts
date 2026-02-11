import { PromptContext } from '.'

export function buildOldMoneyPrompt(context: PromptContext): string {
  const { 
    brandTone, 
    targetAudience, 
    environment, 
    designDescription,
    primaryColor,
    secondaryColor 
  } = context
  
  const colorInfo = primaryColor ? `Elegant color scheme: ${primaryColor}${secondaryColor ? ` with ${secondaryColor} accents` : ''}. ` : ''
  
  return `Classic, sophisticated "old money" aesthetic clothing design in ${environment.toLowerCase()} setting.
Brand tone: ${brandTone.toLowerCase()}
Target audience: ${targetAudience.toLowerCase()}
${colorInfo}
Design: ${designDescription || 'timeless, luxurious classic wear'}

Requirements:
- Timeless, sophisticated elegance
- Luxury and refinement
- ${environment} environment background (luxury interiors, country clubs, etc.)
- Understated wealth and class
- Soft, natural, flattering lighting
- High detail showing premium fabric textures (wool, silk, cashmere)
- Classic fashion photography style
- Models with sophisticated, mature demeanor
- Emphasis on quality craftsmanship and tailoring
- Traditional, heritage styling
- Focus on timelessness, quality, and understated luxury
- Conservative yet stylish appearance`
}