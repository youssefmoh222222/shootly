import { PromptContext } from '.'

export function buildMedicalPrompt(context: PromptContext): string {
  const { 
    brandTone, 
    targetAudience, 
    environment, 
    designDescription,
    primaryColor,
    secondaryColor 
  } = context
  
  const colorInfo = primaryColor ? `Primary color: ${primaryColor}${secondaryColor ? `, Secondary color: ${secondaryColor}` : ''}. ` : ''
  
  return `Professional medical clothing design in a ${environment.toLowerCase()} setting.
Brand tone: ${brandTone.toLowerCase()}
Target audience: ${targetAudience.toLowerCase()}
${colorInfo}
Design: ${designDescription || 'clean, professional medical wear'}

Requirements:
- Professional and clinical appearance
- Clean, hygienic look
- Realistic healthcare professionals wearing the design
- ${environment} environment background
- Natural, clean lighting
- High detail fabric texture showing durability and comfort
- Professional medical photography style
- Medical context appropriate with realistic details
- No cartoon or artistic style
- Photorealistic quality with accurate human proportions
- Focus on practicality, comfort, and professional appearance
- Show functional elements like pockets, stitching, and fabric flow
- Models should look like real ${targetAudience.toLowerCase()} (age-appropriate, professional demeanor)`
}