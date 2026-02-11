import { GenerationRequest, generateWithReplicate } from './providers/replicate'

export async function generateImage(request: GenerationRequest): Promise<string> {
  return await generateWithReplicate(request)
}

