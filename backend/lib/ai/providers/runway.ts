import { GenerationRequest } from './replicate'

const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1'
const RUNWAY_API_VERSION = '2024-11-06'
const POLL_INTERVAL_MS = 5000
const MAX_POLL_TIME_MS = 120000 // 2 minutes max wait (Replicate fallback exists)
const MAX_THROTTLED_POLLS = 6 // bail after 30s of THROTTLED status

interface RunwayTaskResponse {
  id: string
}

interface RunwayTaskStatus {
  id: string
  status: 'PENDING' | 'RUNNING' | 'THROTTLED' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'
  output?: string[]
  failure?: string
  failureCode?: string
}

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Runway-Version': RUNWAY_API_VERSION,
  }
}

async function pollTaskUntilDone(taskId: string): Promise<RunwayTaskStatus> {
  const startTime = Date.now()
  let throttledCount = 0

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`[Runway] Failed to poll task ${taskId}: ${response.status} ${errText}`)
    }

    const task: RunwayTaskStatus = await response.json()

    console.log(`[Runway] Task ${taskId} status: ${task.status}`)

    if (task.status === 'SUCCEEDED') {
      return task
    }

    if (task.status === 'FAILED' || task.status === 'CANCELLED') {
      throw new Error(`[Runway] Task ${task.status}: ${task.failure || task.failureCode || 'unknown error'}`)
    }

    // Bail early if stuck in THROTTLED — account is rate-limited / low credits
    if (task.status === 'THROTTLED') {
      throttledCount++
      console.warn(`[Runway] Task ${taskId} THROTTLED (${throttledCount}/${MAX_THROTTLED_POLLS})`)
      if (throttledCount >= MAX_THROTTLED_POLLS) {
        throw new Error(`[Runway] Task ${taskId} stuck in THROTTLED state — account is rate-limited. Falling back.`)
      }
    } else {
      throttledCount = 0 // reset if we get a non-throttled status
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error(`[Runway] Task ${taskId} timed out after ${MAX_POLL_TIME_MS / 1000}s`)
}

export async function generateWithRunway(request: GenerationRequest): Promise<string> {
  const runwayApiKey = process.env.RUNWAY_API_KEY

  console.log('[Runway] API Key present:', !!runwayApiKey)
  console.log('[Runway] Generation mode:', request.generationMode || 'default')

  if (!runwayApiKey) {
    throw new Error('[Runway] No RUNWAY_API_KEY configured. Set RUNWAY_API_KEY in your environment.')
  }

  let endpoint: string
  let body: Record<string, any>

  // Build prompt based on mode
  let promptText = request.prompt

  // Product mode: prompt is already built by buildProductShowcasePrompt with animation-specific and brand-specific content
  // No override needed — use the prompt as-is

  // Runway hard-limits promptText to 512 characters – truncate gracefully
  if (promptText.length > 512) {
    console.warn(`[Runway] Prompt is ${promptText.length} chars, truncating to 512`)
    promptText = promptText.substring(0, 509) + '...'
  }

  console.log(`[Runway] Final prompt (${promptText.length} chars):`, promptText)

  // Use image_to_video whenever we have a design image
  const useImageToVideo = !!request.designUrl

  if (useImageToVideo) {
    // Use gen4_turbo for image_to_video
    endpoint = `${RUNWAY_API_BASE}/image_to_video`
    body = {
      model: 'gen4_turbo',
      promptImage: request.designUrl,
      promptText,
      ratio: '720:1280',  // Portrait for clothing
      duration: 10,
    }

    // Add end image for front-to-back transition if available
    if (request.backDesignUrl) {
      body.promptImageEnd = request.backDesignUrl
      console.log('[Runway] Using front→back transition with end image')
    }

    const isDataUri = request.designUrl!.startsWith('data:')
    console.log('[Runway] Using image_to_video (gen4_turbo) with design:', isDataUri ? `data URI (${Math.round(request.designUrl!.length / 1024)}KB)` : request.designUrl)
  } else {
    // text_to_video with gen4_turbo
    endpoint = `${RUNWAY_API_BASE}/text_to_video`
    body = {
      model: 'gen4_turbo',
      promptText,
      ratio: '720:1280',
      duration: 10,
    }
    console.log('[Runway] Using text_to_video (gen4_turbo, 10s duration)')
  }

  console.log('[Runway] Submitting task to:', endpoint)

  let submitResponse: Response
  try {
    submitResponse = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
  } catch (fetchError: any) {
    console.error('[Runway] Network error:', fetchError.message)
    throw new Error(`[Runway] Network error: ${fetchError.message}`)
  }

  let submitData: any
  try {
    submitData = await submitResponse.json()
  } catch {
    const text = await submitResponse.text().catch(() => '')
    throw new Error(`[Runway] Invalid response (${submitResponse.status}): ${text}`)
  }

  if (!submitResponse.ok) {
    console.error('[Runway] Submit error:', submitResponse.status, JSON.stringify(submitData))
    // Check for credit/billing errors specifically
    const errMsg = submitData?.error || submitData?.message || JSON.stringify(submitData)
    throw new Error(`[Runway] Submit failed (${submitResponse.status}): ${errMsg}`)
  }

  const taskId = submitData.id
  console.log('[Runway] Task submitted successfully, id:', taskId)

  const result = await pollTaskUntilDone(taskId)

  if (result.output && result.output.length > 0) {
    console.log('[Runway] Video generated successfully:', result.output[0])
    return result.output[0]
  }

  throw new Error('[Runway] Task succeeded but no output URL found')
}

// Keep for backward compatibility
interface BrandProfileData {
  name: string
  category: string
  subCategories: string[]
  brandTone: string
  targetAudience: string
  environment: string
  primaryColor: string | null
  secondaryColor: string | null
}

export function generateBrandPrompt(basePrompt: string, brand: BrandProfileData): string {
  const brandContext = [
    `Brand: ${brand.name}`,
    `Style: ${brand.category.replace(/_/g, ' ').toLowerCase()}`,
    `Tone: ${brand.brandTone.toLowerCase()}`,
    `Target: ${brand.targetAudience.replace(/_/g, ' ').toLowerCase()}`,
    `Setting: ${brand.environment.toLowerCase()}`,
  ].join(', ')

  return `${basePrompt}. Brand context: ${brandContext}. Professional fashion photography, commercial quality.`
}
