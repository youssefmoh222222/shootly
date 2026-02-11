import { GenerationRequest } from './providers/replicate'
import { generateImage } from './image'
import { generateVideo } from './video'

export async function generateAIOutput(request: GenerationRequest): Promise<string> {
  if (request.type === 'image') {
    return await generateImage(request)
  } else {
    return await generateVideo(request)
  }
}

// Helper to convert between our types and AI provider types
export function convertToAIRequest(
  prompt: string,
  type: 'IMAGE' | 'VIDEO',
  designUrl?: string
): GenerationRequest {
  return {
    prompt,
    type: type.toLowerCase() as 'image' | 'video',
    designUrl
  }
}