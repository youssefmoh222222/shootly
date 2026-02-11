import { PromptContext } from '.'

export function buildStreetwearPrompt(context: PromptContext): string {
  const { 
    brandTone, 
    targetAudience, 
    environment, 
    designDescription,
    primaryColor,
    secondaryColor 
  } = context
  
  const colorInfo = primaryColor ? `Color palette: ${primaryColor}${secondaryColor ? ` and ${secondaryColor}` : ''}. ` : ''
  
  return `Urban streetwear fashion design in ${environment.toLowerCase()} setting.
Brand tone: ${brandTone.toLowerCase()}
Target audience: ${targetAudience.toLowerCase()}
${colorInfo}
Design: ${designDescription || 'modern urban streetwear'}

Requirements:
- Urban, trendy streetwear aesthetic
- Fashion-forward styling
- ${environment} environment background (street, urban landscape, etc.)
- Dynamic, youthful energy
- Natural or dramatic urban lighting
- High detail showing fabric texture and quality
- Street fashion photography style
- Models with contemporary urban style
- Emphasis on fit, drape, and silhouette
- Modern accessories and styling
- Authentic urban environment details
- Focus on comfort, style, and street credibility`
}