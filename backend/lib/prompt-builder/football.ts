import { PromptContext } from '.'

export function buildFootballPrompt(context: PromptContext): string {
  const { 
    brandTone, 
    targetAudience, 
    environment, 
    designDescription,
    primaryColor,
    secondaryColor 
  } = context
  
  const colorInfo = primaryColor ? `Team colors: ${primaryColor}${secondaryColor ? ` and ${secondaryColor}` : ''}. ` : ''
  
  return `Dynamic football/sports clothing design in a ${environment.toLowerCase()} setting.
Brand tone: ${brandTone.toLowerCase()}
Target audience: ${targetAudience.toLowerCase()}
${colorInfo}
Design: ${designDescription || 'athletic, performance-focused sportswear'}

Requirements:
- Athletic and dynamic appearance
- Action shots or movement
- Sports environment (stadium, field, training ground)
- Sweat and motion effects
- High-performance fabric texture
- Team or individual focus
- Energetic lighting
- Professional sports photography
- Focus on mobility and performance
- Realistic athlete models
- Dynamic poses showing movement`
}