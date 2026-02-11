import { GenerationRequest, generateWithReplicate } from './providers/replicate'
import { generateWithRunway } from './providers/runway'

export async function generateVideo(request: GenerationRequest): Promise<string> {
  try {
    // For video, try Runway first (specialized in video)
    return await generateWithRunway(request)
  } catch (error) {
    console.error('Runway failed, trying Replicate:', error)
    
    // Fallback to Replicate
    return await generateWithReplicate(request)
  }
}

