import { PromptContext } from '.'

export function buildGymwearPrompt(context: PromptContext): string {
  const { 
    brandTone, 
    targetAudience, 
    environment, 
    designDescription,
    primaryColor,
    secondaryColor 
  } = context
  
  const colorInfo = primaryColor ? `Colors: ${primaryColor}${secondaryColor ? ` with ${secondaryColor} accents` : ''}. ` : ''
  
  return `Fitness and gym wear design in a ${environment.toLowerCase()} setting.
Brand tone: ${brandTone.toLowerCase()}
Target audience: ${targetAudience.toLowerCase()}
${colorInfo}
Design: ${designDescription || 'modern, functional fitness clothing'}

Requirements:
- Fitness-focused appearance
- Gym or workout environment
- Active lifestyle context
- Muscle definition showing
- Sweat and movement details
- Flexible fabric texture
- Modern fitness aesthetic
- Studio or natural lighting
- Fitness photography style
- Focus on comfort and flexibility
- Realistic active models
- Fitness equipment in background`
}