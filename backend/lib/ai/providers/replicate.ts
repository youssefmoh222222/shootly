import Replicate from 'replicate'

// useFileOutput: false returns URL strings instead of FileOutput objects
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
})

// ─── Types ───────────────────────────────────────────────────────────

export interface GenerationRequest {
  prompt: string
  type: 'image' | 'video'
  designUrl?: string
  backDesignUrl?: string
  generationMode?: 'product' | 'cinematic'
  garmentDescription?: string
  brandCategory?: string
}

export interface PromptGenerationInput {
  contentType: 'image' | 'video'
  designImageUrl?: string
  backDesignImageUrl?: string
  brandName: string
  brandCategory: string
  brandTone: string
  targetAudience: string
  environment: string
  primaryColor?: string
  secondaryColor?: string
  designDescription: string
  scenarioName?: string
  scenarioDescription?: string
  scenarioRunwayPrompt?: string
  modelProfileShorthand?: string
  season?: string
  timeOfDay?: string
  demographic?: string
  customDetails?: string
  customPrompt?: string
  lighting?: string
  camera?: string
  colorGrade?: string
  pose?: string
  atmosphere?: string
  background?: string
  framing?: string
  cinematicIntelligence?: string
}

export interface PromptGenerationResult {
  scenePrompt: string
  garmentDescription: string
}

// ─── Retry helper for rate limits ────────────────────────────────────

async function runWithRetry(model: string, input: Record<string, any>, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await replicate.run(model as `${string}/${string}:${string}`, { input })
    } catch (error: any) {
      const is429 = error?.message?.includes('429') || error?.message?.includes('rate limit')
      if (is429 && attempt < maxRetries) {
        const waitSec = attempt * 12
        console.log(`[Replicate] Rate limited (attempt ${attempt}/${maxRetries}), waiting ${waitSec}s...`)
        await new Promise(r => setTimeout(r, waitSec * 1000))
        continue
      }
      throw error
    }
  }
}

// ─── AI Prompt Generator ─────────────────────────────────────────────
// Step 1: LLaVA Vision sees the garment → returns garment description ONLY
// Step 1b: Scene prompt built PROGRAMMATICALLY from brand/category/director data
// This is far more reliable than asking LLaVA to write the full scene prompt

const GARMENT_VISION_PROMPT = `Describe this garment in ONE sentence. Include:
- Type (t-shirt, hoodie, tank top, polo, jacket, etc.)
- Sleeve length (sleeveless, short sleeve, long sleeve)
- Neckline (crew, v-neck, collared, zip-up)
- Fit (slim, regular, oversized, relaxed)
- Main colors
- Fabric type (cotton, polyester, jersey, etc.)
- Any logos, text, graphics, or printed designs (describe their position, size, and content)

Example: "Black oversized short-sleeve crew-neck t-shirt, heavyweight cotton, relaxed fit, with a large white brand logo centered on the chest"

Output ONLY the one-sentence description. No explanation, no preamble.`

// ── Programmatic Scene Prompt Builder ─────────────────────────────────
// Builds photorealistic prompts from structured data — never relies on LLM for scene

const CATEGORY_MODELS: Record<string, string> = {
  MEDICAL_WEAR: 'a confident 30-year-old healthcare professional with composed posture, clean-shaven, neat short hair',
  FOOTBALL: 'an athletic 24-year-old male with muscular build, strong jawline, short textured hair',
  GYMWEAR: 'a fit 26-year-old athletic model with toned physique, defined arms, confident stance',
  STREETWEAR: 'a stylish 23-year-old with urban edge, textured fade haircut, cool effortless demeanor',
  OLD_MONEY: 'a refined 32-year-old with poised elegance, clean grooming, distinguished features',
  LUXURY: 'a striking 27-year-old high-fashion model with sharp cheekbones, intense gaze',
  MINIMAL: 'a clean-featured 28-year-old model with calm expression, natural beauty, minimal makeup',
  VINTAGE: 'a characterful 25-year-old with distinctive features, warm natural expression, retro styling',
  Y2K: 'an energetic 21-year-old with bold expressive style, playful attitude, youthful glow',
  TECHWEAR: 'a sharp-featured 26-year-old with angular jawline, focused gaze, urban edge',
  OVERSIZED: 'a confident 24-year-old with relaxed posture, tall frame, effortless cool',
  RETRO_SPORTS: 'an athletic 25-year-old with classic sportsperson build, warm smile, natural tan',
  PREPPY: 'a well-groomed 27-year-old with collegiate polish, clean parted hair, approachable smile',
}

const CATEGORY_SCENES: Record<string, string> = {
  MEDICAL_WEAR: 'modern clinical corridor with clean white walls, soft ambient lighting, polished floor with subtle reflections',
  FOOTBALL: 'sports facility with dramatic directional lighting, blurred stadium seating in background, turf texture visible',
  GYMWEAR: 'premium fitness studio with matte black equipment, dramatic rim lighting, mirrors reflecting depth, rubber floor texture',
  STREETWEAR: 'urban alleyway with weathered brick walls, fire escape overhead, concrete texture, scattered fallen leaves, distant city glow',
  OLD_MONEY: 'grand estate library with floor-to-ceiling mahogany bookshelves, leather armchair, warm golden lamp light, Persian rug',
  LUXURY: 'minimalist gallery space with polished marble floor, single spotlight from above, seamless white walls, high ceiling',
  MINIMAL: 'pure white studio with single large window, soft directional daylight, clean negative space, concrete floor',
  VINTAGE: 'cozy record shop interior with wooden shelves, warm tungsten bulb light, vinyl records visible, aged wood floor',
  Y2K: 'colorful retro-futuristic interior with translucent furniture, ring light reflections, chrome accents, bold color walls',
  TECHWEAR: 'dark urban parking structure with cool LED strip lighting, wet concrete floor reflecting lights, steel pillars',
  OVERSIZED: 'expansive concrete loft with floor-to-ceiling industrial windows, exposed steel beams, natural light flooding in',
  RETRO_SPORTS: 'classic gymnasium with polished wooden floor, vintage scoreboard, rope climbing wall, warm overhead lighting',
  PREPPY: 'ivy-covered university courtyard with stone archways, manicured lawn visible, warm afternoon sunlight, aged stone texture',
}

const CATEGORY_LIGHTING: Record<string, string> = {
  MEDICAL_WEAR: 'Clean clinical lighting from overhead panels with soft fill, neutral 5500K color temperature, minimal shadows',
  FOOTBALL: 'Dramatic stadium-style rim lighting from camera-right, strong key light creating defined shadows, high contrast',
  GYMWEAR: 'High-contrast directional lighting with strong rim light on shoulders, deep shadows on opposite side, warm 4000K accent',
  STREETWEAR: 'Mixed urban lighting — warm streetlamp key light from left, cool blue ambient fill from neon signs, natural contrast',
  OLD_MONEY: 'Warm golden lamp light at 3200K from camera-left, soft window fill, gentle Rembrandt lighting pattern on face',
  LUXURY: 'Dramatic single spotlight from above creating a pool of light, deep surrounding shadows, sculpted facial lighting',
  MINIMAL: 'Single large window light from left, soft diffused daylight at 5600K, gentle natural shadows, clean even fill',
  VINTAGE: 'Warm tungsten practical lights at 2800K, slight underexposure for mood, natural shadow play, nostalgic warmth',
  Y2K: 'Colorful mixed lighting — pink and blue accent lights from sides, front ring light for even face illumination, vibrant',
  TECHWEAR: 'Cool LED panel lighting from below and sides at 6500K, cyan accent rim light, dark moody shadows, futuristic glow',
  OVERSIZED: 'Large window natural light flooding from right, architectural shadows from steel beams, soft diffused quality',
  RETRO_SPORTS: 'Warm overhead gymnasium lights with slight flicker quality, warm 3500K tone, nostalgic even illumination',
  PREPPY: 'Warm afternoon sunlight at golden hour, dappled tree shadow pattern, natural warm fill, inviting 4500K warmth',
}

function buildScenePromptFromContext(garmentType: string, input: PromptGenerationInput, isImage: boolean): string {
  const parts: string[] = []

  // 0. Design preservation mandate — always first
  parts.push('Use the reference image EXACTLY as provided. Do NOT modify, redesign, or alter the jersey in any way. The jersey design, color, pattern, logos, and text must remain 100% identical to the reference image')

  // 1. Quality anchor
  parts.push('Ultra-realistic fashion editorial photograph, indistinguishable from a real photo')

  // 2. Model/person — use profile shorthand if available, else category default
  const modelDesc = input.modelProfileShorthand
    || CATEGORY_MODELS[input.brandCategory]
    || 'a 25-year-old model with natural features and confident posture'
  parts.push(`of ${modelDesc}`)

  // 3. Garment — plain solid-color version for virtual try-on
  const cleanGarmentType = garmentType
    .replace(/with .*/i, '')           // remove "with gold pattern..."
    .replace(/featuring .*/i, '')      // remove "featuring logo..."
    .replace(/\b(black|white|red|blue|green|yellow|pink|purple|orange|grey|gray|navy|beige|brown)\b/gi, '') // remove colors
    .replace(/,.*$/, '')               // take only first clause
    .trim() || 'garment'
  parts.push(`wearing a completely plain solid white ${cleanGarmentType} with zero graphics, zero text, zero logos, zero patterns — entirely blank white fabric, natural drape and fabric weight`)

  // 4. Pose — from director control or default
  const poseDescriptions: Record<string, string> = {
    confident: 'standing with confident stance, shoulders back, direct gaze at camera, weight on left leg',
    walking: 'captured mid-stride walking naturally, relaxed arms, looking slightly off-camera',
    seated: 'seated in relaxed pose with natural posture, one arm resting on knee, effortless composure',
    dynamic: 'dynamic pose full of energy, body angled, arms in motion, peak movement captured',
    candid: 'caught in a candid unposed moment, genuine natural expression, looking away from camera',
    editorial: 'striking editorial pose with angular body line, intense focused gaze, hand touching collar',
  }
  const poseText = (input.pose && poseDescriptions[input.pose]) || 'standing with relaxed confident stance, slight head tilt, natural expression'
  parts.push(poseText)

  // 5. Scene/Background — from director control or category default
  const backgroundDescriptions: Record<string, string> = {
    studio: 'set in a clean professional photography studio with seamless gray backdrop',
    urban: 'set on an urban street with weathered brick walls, concrete textures, and city architecture in background',
    nature: 'set in a natural outdoor location with trees, soft grass, and open sky in background',
    interior: 'set in a designed interior space with curated furniture, architectural details, and warm atmosphere',
    abstract: 'set against an abstract blurred background with soft artistic color wash',
    minimal: 'set against minimal negative space with isolated subject and clean simple background',
  }
  const sceneText = (input.background && backgroundDescriptions[input.background])
    || CATEGORY_SCENES[input.brandCategory]
    || 'set in a professional photography studio with controlled lighting'
  parts.push(sceneText)

  // 6. Lighting — from director control or category default
  const lightingDescriptions: Record<string, string> = {
    natural: 'Soft natural window light from camera-left, gentle diffused shadows, warm ambient fill at 5000K',
    studio: 'Professional studio softbox lighting at 45 degrees, even illumination, controlled shadows, neutral 5500K',
    dramatic: 'Dramatic rim lighting from behind with strong key light from right, deep shadows, high contrast chiaroscuro',
    neon: 'Neon colored lighting with vibrant pink and blue glow from sides, urban night atmosphere, electric mood',
    golden: 'Warm golden hour backlight creating sun flare and long shadows, 3200K golden warmth, rim-lit silhouette edges',
    flash: 'Direct on-camera flash with harsh raw illumination, hard shadows, unfiltered stark lighting',
  }
  const lightText = (input.lighting && lightingDescriptions[input.lighting])
    || CATEGORY_LIGHTING[input.brandCategory]
    || 'Professional photography lighting with key light from 45 degrees, soft fill, subtle rim light'
  parts.push(lightText)

  // 7. Color grade — from director control
  const colorGradeDescriptions: Record<string, string> = {
    clean: 'clean neutral color grade with true-to-life accurate colors',
    warm: 'warm Kodak Portra 400 film tones with rich skin tones and golden highlights',
    cool: 'cool editorial tones with blue-shifted shadows and desaturated palette',
    moody: 'high contrast moody grade with crushed blacks and lifted highlights',
    bw: 'black and white high contrast monochrome with rich tonal range',
    vintage: 'faded vintage film look with organic grain and muted pastels',
  }
  if (input.colorGrade && colorGradeDescriptions[input.colorGrade]) {
    parts.push(colorGradeDescriptions[input.colorGrade])
  }

  // 8. Atmosphere — from director control
  const atmosphereDescriptions: Record<string, string> = {
    clear: 'crisp clear atmosphere with sharp detail throughout',
    haze: 'light atmospheric haze creating soft dreamy depth',
    rain: 'rain-soaked atmosphere with wet reflective surfaces and overcast mood',
    smoke: 'light smoke wisps creating volumetric light beams and atmospheric depth',
    dust: 'floating dust particles catching light beams in warm atmosphere',
    snow: 'gentle snowfall with frosted surfaces and cold visible breath',
  }
  if (input.atmosphere && atmosphereDescriptions[input.atmosphere]) {
    parts.push(atmosphereDescriptions[input.atmosphere])
  }

  // 9. Framing — from director control
  const framingDescriptions: Record<string, string> = {
    fullBody: 'Full body framing showing head to feet with complete outfit visible',
    threeQuarter: 'Three-quarter length framing from head to knees',
    waistUp: 'Waist-up framing focusing on upper body',
    headshot: 'Tight headshot framing on face and shoulders',
    detail: 'Tight detail crop focusing on garment texture and construction',
  }
  if (input.framing && framingDescriptions[input.framing]) {
    parts.push(framingDescriptions[input.framing])
  }

  // 10. Cinematic Intelligence — from director control
  const cinematicDescriptions: Record<string, string> = {
    filmNoir: 'Film noir aesthetic with deep chiaroscuro shadows and smoky mysterious atmosphere',
    goldenHollywood: 'Golden age Hollywood glamour with classic studio glow and soft-focus romance',
    neonCyberpunk: 'Cyberpunk neon aesthetic with rain-slicked reflective streets and electric color palette',
    indieFilm: 'Indie film naturalism with intimate available light and raw emotional authenticity',
    musicVideo: 'Music video stylization with bold saturated colors and performative energy',
    epicCampaign: 'Epic brand campaign with sweeping aspirational grandeur and hero lighting',
  }
  if (input.cinematicIntelligence && cinematicDescriptions[input.cinematicIntelligence]) {
    parts.push(cinematicDescriptions[input.cinematicIntelligence])
  }

  // 11. Season/Time modifiers
  if (input.season) {
    const seasonMods: Record<string, string> = {
      spring: 'spring atmosphere with fresh blooming elements and soft pastel light',
      summer: 'bright summer setting with warm golden sunlight and vibrant tones',
      fall: 'autumn ambiance with warm earth tones and golden hour warmth',
      winter: 'winter atmosphere with cool crisp light and frosted textures',
    }
    if (seasonMods[input.season]) parts.push(seasonMods[input.season])
  }
  if (input.timeOfDay) {
    const timeMods: Record<string, string> = {
      morning: 'soft early morning light with gentle awakening mood',
      midday: 'bright midday illumination with defined sharp shadows',
      evening: 'warm golden-hour evening light with long dramatic shadows',
      night: 'nighttime atmosphere with artificial lighting and moody urban glow',
    }
    if (timeMods[input.timeOfDay]) parts.push(timeMods[input.timeOfDay])
  }

  // 12. User's optional custom tweaks (appended, never overrides structured data)
  if (input.customDetails) parts.push(input.customDetails)
  if (input.customPrompt) parts.push(input.customPrompt)

  // 13. Camera/Technical — from director control or default
  const cameraDescriptions: Record<string, string> = {
    wide: 'Shot on Canon EOS R5 with 35mm wide-angle lens, f/2.8, environmental context visible, deep depth of field',
    standard: 'Shot on Canon EOS R5 with 50mm lens, f/2.0, natural perspective, full body framing',
    portrait: 'Shot on Canon EOS R5 with 85mm f/1.4L portrait lens, creamy circular bokeh dissolving background',
    macro: 'Shot with 100mm macro lens, extreme close-up on fabric detail and texture, razor-thin depth of field',
    cinematic: 'Shot with anamorphic lens, cinematic widescreen framing, distinctive horizontal lens flare',
  }
  const cameraText = (input.camera && cameraDescriptions[input.camera])
    || 'Shot on Canon EOS R5, 85mm f/1.4L, 1/200s, ISO 100, shallow depth of field with smooth bokeh'
  parts.push(cameraText)

  // 13. Quality suffix
  if (isImage) {
    parts.push('Natural skin texture with visible pores, realistic fabric wrinkles, subtle film grain, color graded in Capture One, indistinguishable from real photograph, editorial magazine quality, 8k resolution')
  } else {
    parts.push('photorealistic, editorial quality, 8k resolution')
  }

  return parts.join('. ')
}

export async function generatePromptWithAI(input: PromptGenerationInput): Promise<PromptGenerationResult> {
  const isImage = input.contentType === 'image'

  console.log('[Replicate] ── Step 1: Garment Analysis + Scene Building ──')
  console.log('[Replicate] Content type:', input.contentType)
  console.log('[Replicate] Design image provided:', !!input.designImageUrl)
  console.log('[Replicate] Brand:', input.brandName, input.brandCategory)
  console.log('[Replicate] Model profile:', input.modelProfileShorthand || 'using category default')

  // ── Step 1a: Use LLaVA ONLY for garment type description ──
  let garmentDescription = input.designDescription || 'clothing garment'

  if (input.designImageUrl) {
    try {
      console.log('[Replicate] Using LLaVA to identify garment type...')
      const output = await runWithRetry(
        "yorickvp/llava-v1.6-vicuna-13b:0603dec596080fa084e26f0ae6d605fc5788ed2b1a0358cd25010619487eae63",
        {
          prompt: GARMENT_VISION_PROMPT,
          image: input.designImageUrl,
          max_tokens: 120,
          temperature: 0.3,
          top_p: 0.9,
        }
      )

      let visionResult: string
      if (Array.isArray(output)) {
        visionResult = output.join('')
      } else if (typeof output === 'string') {
        visionResult = output
      } else {
        const chunks: string[] = []
        for await (const chunk of output as AsyncIterable<string>) {
          chunks.push(String(chunk))
        }
        visionResult = chunks.join('')
      }

      visionResult = visionResult.trim()
      // Strip any labels/preamble LLaVA might add
      visionResult = visionResult
        .replace(/^(The |This |It's a |Here is |Description:?\s*)/i, '')
        .replace(/\n[\s\S]*/, '') // Only take first line
        .trim()

      // Detect degeneration
      const repetitionMatch = visionResult.match(/(.{8,40})\1{2,}/)
      if (repetitionMatch) {
        const loopStart = visionResult.indexOf(repetitionMatch[0])
        if (loopStart > 20) {
          visionResult = visionResult.substring(0, loopStart).trim()
          console.warn('[Replicate] Trimmed degenerate LLaVA output')
        }
      }

      if (visionResult.length > 10 && visionResult.length < 300) {
        garmentDescription = visionResult
        console.log('[Replicate] LLaVA garment description:', garmentDescription)
      } else {
        console.warn('[Replicate] LLaVA output invalid, using fallback description:', input.designDescription)
      }
    } catch (visionError: any) {
      console.warn('[Replicate] LLaVA failed, using fallback description:', visionError.message)
    }
  }

  // ── Step 1b: Build scene prompt PROGRAMMATICALLY ──
  const scenePrompt = buildScenePromptFromContext(garmentDescription, input, isImage)

  // Enforce character limits
  const maxPromptChars = isImage ? 1200 : 512
  let finalPrompt = scenePrompt
  if (finalPrompt.length > maxPromptChars) {
    let truncated = finalPrompt.substring(0, maxPromptChars)
    const lastBreak = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf(', '))
    if (lastBreak > maxPromptChars * 0.8) truncated = truncated.substring(0, lastBreak)
    finalPrompt = truncated
  }

  console.log(`[Replicate] Garment description: ${garmentDescription}`)
  console.log(`[Replicate] Scene prompt (${finalPrompt.length} chars): ${finalPrompt.substring(0, 200)}...`)

  return { scenePrompt: finalPrompt, garmentDescription }
}

// ─── Image Generation: 3-Step Pipeline ───────────────────────────────
// Step 2: FLUX.2 generates model/person in scene (plain clothing)
// Step 3: IDM-VTON swaps clothing with the EXACT garment design

export async function generateWithReplicate(request: GenerationRequest): Promise<string> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  console.log('[Replicate] ── Content Generation ──');
  console.log('[Replicate] Generation type:', request.type);
  console.log('[Replicate] Design image present:', !!request.designUrl);

  if (!replicateToken) {
    throw new Error('[Replicate] No REPLICATE_API_TOKEN configured.');
  }

  if (request.type === 'image') {
    if (request.generationMode === 'product' && request.designUrl) {
      // ── PRODUCT MODE: Enhance the product image ──
      console.log('[Replicate] ── Product Image: Upscaling design ──');
      const isDataUri = request.designUrl.startsWith('data:')
      console.log('[Replicate] Design image:', isDataUri ? `data URI (${Math.round(request.designUrl.length / 1024)}KB)` : request.designUrl)

      // Use Real-ESRGAN to upscale and enhance the product image
      const upscaleOutput = await runWithRetry(
        "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
        {
          image: request.designUrl,
          scale: 2,
          face_enhance: false,
        }
      )

      const enhancedUrl = Array.isArray(upscaleOutput) ? upscaleOutput[0] : String(upscaleOutput)
      if (!enhancedUrl || enhancedUrl.length < 10) {
        throw new Error(`[Replicate] Real-ESRGAN returned invalid output: ${enhancedUrl}`)
      }

      console.log('[Replicate] Product image enhanced:', enhancedUrl);
      return enhancedUrl

    } else {
      // ── CINEMATIC MODE: Generate person + virtual try-on ──
      // Generate for both front and back if back image is provided
      const resultUrls: string[] = [];

      // Build back-view prompt: prepend a dominant back-view directive so FLUX.2
      // generates a rear-facing person, then strip any front-facing language.
      function buildBackPrompt(basePrompt: string): string {
        // Strong rear-view directive — must be first so FLUX.2 weights it highest
        const rearDirective = 'REAR VIEW. Model standing with their back completely facing the camera. Posterior view. Back of the body visible. Model facing away from camera'

        // Strip all front-facing language from the base prompt
        let back = basePrompt
          .replace(/direct gaze at camera[^,.]*/gi, 'facing away from camera')
          .replace(/gaze at camera[^,.]*/gi, 'looking away')
          .replace(/standing with relaxed confident stance[^,.]*/gi, 'standing upright with back to camera')
          .replace(/standing with confident stance[^,.]*/gi, 'standing upright with back to camera')
          .replace(/standing confident[^,.]*/gi, 'standing with back to camera')
          .replace(/slight head tilt, natural expression/gi, 'back of head visible')
          .replace(/intense focused gaze[^,.]*/gi, 'back of head visible')
          .replace(/looking (?:slightly )?(?:off-camera|at camera)[^,.]*/gi, 'facing away from camera')
          .replace(/\bfront view\b/gi, 'back view')

        return `${rearDirective}. ${back}. Full rear view, back of garment completely visible to camera`
      }

      // Helper function to generate one image
      async function generateOneImage(designUrl: string, label: string): Promise<string> {
        console.log(`[Replicate] ── Generating ${label} image ──`);

        const promptForThisView = label === 'BACK'
          ? buildBackPrompt(request.prompt)
          : request.prompt

        // Step 2: Generate person in scene
        console.log('[Replicate] ── Step 2: Generate person in scene (FLUX.2 Pro) ──');
        console.log('[Replicate] Prompt:', promptForThisView.substring(0, 100) + '...');

        const raw = await runWithRetry(
          "black-forest-labs/flux-2-pro",
          {
            prompt: promptForThisView,
            aspect_ratio: 'custom',
            width: 1024,
            height: 1344,
            output_format: "webp",
            output_quality: 100,
            safety_tolerance: 5,
          }
        )

        const personImageUrl = Array.isArray(raw) ? raw[0] : String(raw)
        if (!personImageUrl || personImageUrl.length < 10) {
          throw new Error(`[Replicate] FLUX.2 returned invalid output for ${label}`)
        }
        console.log(`[Replicate] Person image (${label}) generated:`, personImageUrl);

        // Step 3: Virtual try-on
        console.log(`[Replicate] ── Step 3: Virtual Try-On (${label}) ──`);
        const isDataUri = designUrl.startsWith('data:')
        console.log('[Replicate] Garment image:', isDataUri ? `data URI (${Math.round(designUrl.length / 1024)}KB)` : designUrl)

        const baseDesc = request.garmentDescription || 'clothing garment'
        const sideLabel = label === 'BACK' ? 'back side of the' : ''
        const vtonGarmentDesc = `${sideLabel} ${baseDesc}. Copy every detail of this garment exactly onto the person: all colors, all logos, all printed text, all graphics, all patterns must appear sharp and undistorted. Do not invent, remove, or modify any design element.`.trim()

        const vtonOutput = await runWithRetry(
          "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          {
            garm_img: designUrl,
            human_img: personImageUrl,
            garment_des: vtonGarmentDesc,
            category: 'upper_body',
            crop: false,
            steps: 50,
            seed: 42,
          }
        )

        const tryonUrl = Array.isArray(vtonOutput) ? vtonOutput[0] : String(vtonOutput)
        if (!tryonUrl || tryonUrl.length < 10) {
          throw new Error(`[Replicate] IDM-VTON returned invalid output for ${label}`)
        }
        console.log(`[Replicate] Virtual try-on (${label}) success:`, tryonUrl);
        return tryonUrl
      }

      // Generate front image
      if (request.designUrl) {
        const frontUrl = await generateOneImage(request.designUrl, 'FRONT');
        resultUrls.push(frontUrl);
      }

      // Generate back image if provided
      if (request.backDesignUrl) {
        console.log('[Replicate] Back design provided, generating back view...');
        const backUrl = await generateOneImage(request.backDesignUrl, 'BACK');
        resultUrls.push(backUrl);
      }

      if (resultUrls.length === 0) {
        throw new Error('[Replicate] No design images provided')
      }

      // Return comma-separated URLs if multiple, single URL if one
      const result = resultUrls.join(',');
      console.log(`[Replicate] Generated ${resultUrls.length} image(s):`, result);
      return result
    }

  } else {
    // Video generation
    if (request.designUrl) {
      const isDataUri = request.designUrl.startsWith('data:')

      if (request.generationMode === 'product') {
        // ── PRODUCT MODE ──
        console.log('[Replicate] ── Product Video ──');
        console.log('[Replicate] Front image:', isDataUri ? `data URI (${Math.round(request.designUrl.length / 1024)}KB)` : request.designUrl)
        console.log('[Replicate] Back image:', request.backDesignUrl ? 'provided' : 'not provided')
        console.log('[Replicate] Product prompt:', request.prompt.substring(0, 200))

        let videoOutput: string

        if (request.backDesignUrl) {
          // ── Front + Back: Use Kling v1.6 Pro (supports start_image + end_image) ──
          console.log('[Replicate] Using Kling v1.6 Pro for front→back transition (start_image + end_image)')
          const backIsDataUri = request.backDesignUrl.startsWith('data:')
          console.log('[Replicate] Back image:', backIsDataUri ? `data URI (${Math.round(request.backDesignUrl.length / 1024)}KB)` : request.backDesignUrl)

          videoOutput = await runWithRetry(
            "kwaivgi/kling-v2.1",
            {
              prompt: request.prompt,
              start_image: request.designUrl,
              end_image: request.backDesignUrl,
              mode: 'pro',
              duration: 10,
              negative_prompt: "blur, distort, low quality, deformed, changing colors, modified design, altered graphics, wrong pattern, extra logos, missing logos, morphing fabric, added text, removed text, logo distortion, smeared text, warped graphics, melting logo, blurry print, stretched logo, deformed text, incorrect lettering",
            }
          ) as unknown as string
        } else {
          // ── Front only: Use MiniMax (good single-frame quality) ──
          console.log('[Replicate] Using MiniMax video-01 for single-frame product video')

          // Append logo preservation to the prompt for MiniMax
          const miniMaxPrompt = request.prompt + '. CRITICAL: All logos, text, and graphics on the garment must remain perfectly sharp, undistorted, and identical to the starting frame throughout the entire video.'

          videoOutput = await runWithRetry(
            "minimax/video-01",
            {
              prompt: miniMaxPrompt.length > 512 ? miniMaxPrompt.substring(0, 512) : miniMaxPrompt,
              first_frame_image: request.designUrl,
              prompt_optimizer: false,
            }
          ) as unknown as string
        }

        if (!videoOutput) {
          throw new Error('[Replicate] Product video returned empty output')
        }

        console.log('[Replicate] Product video success:', videoOutput);
        return videoOutput

      } else {
        // ── CINEMATIC MODE: 4-step pipeline ──
        console.log('[Replicate] ── Cinematic Video Pipeline: 4 Steps ──');

        // Step 2: Generate person in scene with plain clothing
        console.log('[Replicate] ── Step 2: Generate person (FLUX.2 Pro) ──');
        console.log('[Replicate] Prompt:', request.prompt.substring(0, 200));

        const personRaw = await runWithRetry(
          "black-forest-labs/flux-2-pro",
          {
            prompt: request.prompt,
            aspect_ratio: 'custom',
            width: 1024,
            height: 1344,
            output_format: "webp",
            output_quality: 100,
            safety_tolerance: 5,
          }
        )

        const personImageUrl = Array.isArray(personRaw) ? personRaw[0] : String(personRaw)
        if (!personImageUrl || personImageUrl.length < 10) {
          throw new Error(`[Replicate] FLUX.2 returned invalid output: ${personImageUrl}`)
        }
        console.log('[Replicate] Person image generated:', personImageUrl);

        // Step 3: Virtual try-on
        console.log('[Replicate] ── Step 3: Virtual Try-On (IDM-VTON) ──');
        console.log('[Replicate] Garment image:', isDataUri ? `data URI (${Math.round(request.designUrl.length / 1024)}KB)` : request.designUrl)

        const videoVtonGarmentDesc = `${request.garmentDescription || 'Clothing garment'}. Preserve all logos, text, graphics, and printed designs exactly as they appear on the original garment — no distortion, no removal, no modification.`

        const vtonOutput = await runWithRetry(
          "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          {
            garm_img: request.designUrl,
            human_img: personImageUrl,
            garment_des: videoVtonGarmentDesc,
            category: 'upper_body',
            crop: true,
            steps: 40,
            seed: 0,
          }
        )

        const tryonUrl = Array.isArray(vtonOutput) ? vtonOutput[0] : String(vtonOutput)
        if (!tryonUrl || tryonUrl.length < 10) {
          throw new Error(`[Replicate] IDM-VTON returned invalid output: ${tryonUrl}`)
        }
        console.log('[Replicate] Virtual try-on success:', tryonUrl);

        // Step 4: Animate the final image with Kling (high quality, 10 seconds)
        console.log('[Replicate] ── Step 4: Animate image (Kling v1.6) ──');

        // Category-specific subtle motion that preserves the garment
        const categoryMotions: Record<string, string> = {
          MEDICAL_WEAR: 'The healthcare professional shifts weight slightly, turns head with calm composed expression, subtle breathing, professional clinical environment, steady camera',
          FOOTBALL: 'The athlete flexes shoulders subtly, confident head turn, slight body rotation to show outfit, stadium atmosphere, steady camera',
          GYMWEAR: 'The athlete takes a slow confident breath, slight shoulder roll, subtle weight shift, gym environment, steady slow-motion camera',
          STREETWEAR: 'The model turns head slowly with cool expression, subtle hand movement, gentle body sway, urban atmosphere, slow tracking camera',
          OLD_MONEY: 'The model adjusts cuff subtly, slow elegant head turn, refined minimal movement, warm golden atmosphere, steady camera',
          LUXURY: 'The model turns slowly with editorial grace, subtle wind in hair, commanding presence, premium atmosphere, smooth dolly camera',
          MINIMAL: 'The model breathes naturally, very subtle head tilt, minimal calm movement, clean atmosphere, still camera with slight drift',
          VINTAGE: 'The model looks around naturally, gentle nostalgic movement, warm expression, vintage atmosphere, steady camera',
          Y2K: 'The model strikes a playful subtle pose, slight head bob, youthful energy, colorful atmosphere, dynamic camera',
          TECHWEAR: 'The model shifts stance with purpose, subtle shoulder rotation, focused expression, futuristic atmosphere, smooth camera',
          OVERSIZED: 'The model shifts weight with relaxed ease, fabric moves naturally with body, effortless cool, architectural space, steady camera',
          RETRO_SPORTS: 'The athlete adjusts stance confidently, slight bounce, warm sporty energy, retro gymnasium, steady camera',
          PREPPY: 'The model adjusts collar subtly, warm genuine smile, slight weight shift, collegiate atmosphere, steady camera',
        }

        const categoryMotion = (request.brandCategory && categoryMotions[request.brandCategory]) || 'The model moves subtly with gentle body sway, natural breathing, slight confident head turn'

        const motionPrompt = `Cinematic fashion video, real person, photorealistic. ${categoryMotion}. CRITICAL: All logos, text, graphics, prints, colors, and every garment detail must remain PERFECTLY IDENTICAL and undistorted throughout every frame — the design on the clothing never changes, warps, fades, smears, or morphs. Smooth slow-motion, soft cinematic lighting, luxury brand advertisement quality.`

        const videoOutput = await runWithRetry(
          "kwaivgi/kling-v2.6",
          {
            prompt: motionPrompt,
            start_image: tryonUrl,
            duration: 10,
            aspect_ratio: "9:16",
            negative_prompt: "blur, distort, low quality, deformed, cartoon, anime, painting, 3D render, changing clothes, different clothing, modified clothing, wardrobe change, sleeve length change, new pattern, altered graphics, color change, morphing fabric, disappearing design, fading print, extra logos, missing logos, wrong neckline, plastic skin, unrealistic, CGI, logo distortion, smeared text, warped graphics, melting logo, blurry print, stretched logo, deformed text, incorrect lettering",
            generate_audio: false,
          }
        ) as unknown as string

        if (!videoOutput) {
          throw new Error('[Replicate] Kling video returned empty output')
        }

        console.log('[Replicate] Video animation success:', videoOutput);
        return videoOutput
      }

    } else {
      // No design image — text-to-video only
      console.log('[Replicate] Mode: text-to-video (MiniMax)');
      console.log('[Replicate] Prompt:', request.prompt.substring(0, 200));

      const output = await runWithRetry(
        "minimax/video-01",
        {
          prompt: request.prompt,
          prompt_optimizer: true,
        }
      ) as unknown as string

      if (!output) {
        throw new Error('[Replicate] video generation returned empty output')
      }

      console.log('[Replicate] video success:', output);
      return output
    }
  }
}
