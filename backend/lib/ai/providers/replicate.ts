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
  productAnimation?: 'rotation' | 'closeup' | 'pan' | 'lifestyle'
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

const GARMENT_VISION_PROMPT = `Describe this garment in 2-3 sentences packed with precise visual detail. Include:
- Type (t-shirt, jersey, hoodie, tank top, polo, jacket, etc.) and sleeve length
- Neckline style (crew, v-neck, collared polo, zip-up, button-up)
- Fit (slim, regular, oversized, relaxed)
- Base color(s) and any stripe/pattern (describe stripe direction, width, colors)
- EVERY logo: brand name, exact position (left chest / right chest / centered / sleeve), approximate size, color
- EVERY crest or badge: position, shape, dominant colors, and what it depicts (e.g. "gold embroidered crest on left chest showing a shield")
- EVERY number or letter: position, font style, color, and size
- Any small sponsor patches, tags, or secondary graphics

Example: "White and light-blue vertically-striped short-sleeve football jersey with a black ribbed collar featuring three black stripes on the shoulders. Silver Adidas logo on the right chest. Gold embroidered AFA crest on the left chest. Large black number 9 centered below the Adidas logo."

Output ONLY the description. No preamble, no meta-commentary.`

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

  // 0. Quality anchor
  parts.push('Ultra-realistic fashion editorial photograph, indistinguishable from a real photo')

  // 2. Model/person — use profile shorthand if available, else category default
  const modelDesc = input.modelProfileShorthand
    || CATEGORY_MODELS[input.brandCategory]
    || 'a 25-year-old model with natural features and confident posture'
  parts.push(`of ${modelDesc}`)

  // 3. Garment — plain solid-color version for virtual try-on
  // Extract sleeve length BEFORE stripping so FLUX.2 generates the right garment shape
  const sleeveMatch = garmentType.match(/\b(sleeveless|short[- ]sleeve|long[- ]sleeve|short sleeve|long sleeve)\b/i)
  const sleeveHint = sleeveMatch ? sleeveMatch[0].toLowerCase() : 'short sleeve'
  const cleanGarmentType = garmentType
    .replace(/with .*/i, '')           // remove "with gold pattern..."
    .replace(/featuring .*/i, '')      // remove "featuring logo..."
    .replace(/\b(black|white|red|blue|green|yellow|pink|purple|orange|grey|gray|navy|beige|brown)\b/gi, '') // remove colors
    .replace(/,.*$/, '')               // take only first clause
    .trim() || 'jersey'
  parts.push(`wearing a completely plain solid white ${sleeveHint} ${cleanGarmentType} with zero graphics, zero text, zero logos, zero patterns — entirely blank white fabric, natural drape and fabric weight`)

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
          max_tokens: 300,
          temperature: 0.2,
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
        .replace(/\n\n[\s\S]*/, '') // Strip anything after a blank line
        .replace(/\n/g, ' ')        // Collapse single newlines into spaces
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

      if (visionResult.length > 10 && visionResult.length < 900) {
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

      // ── FLUX Kontext Max (primary) ───────────────────────────────────────
      // Multi-image reference VTON — takes person + garment photo, produces
      // person wearing the exact garment. BFL's FLUX Kontext has best-in-class
      // typography/logo fidelity compared to IDM-VTON and other GAN-based VTON.
      async function runFluxKontextTryon(personImageUrl: string, garmentUrl: string, garmentDesc: string, label: string): Promise<string> {
        console.log(`[FluxKontext] Running ${label} try-on...`)
        const viewHint = label === 'BACK' ? 'back view' : 'front view'
        const kontextPrompt = `Replace the plain white shirt on the person in image 1 with the EXACT garment shown in image 2 (${viewHint}). The garment in image 2 is: ${garmentDesc}. You MUST copy EVERY feature from image 2 onto the person, including: the complete collar and neckline style, every stripe and color pattern, EVERY embroidered crest or badge (reproduce crests at their exact position, size, colors, and internal detail — do not simplify or omit them), EVERY brand logo at its exact position, EVERY printed or embroidered number and letter with identical font and position, all sleeve stripes, and all small sponsor patches. Render crests, numbers, and logos sharp and legible — never drop a feature because it is small. Keep the person's face, pose, body proportions, and background from image 1 unchanged. Natural fabric drape, realistic lighting matching image 1.`
        const output = await runWithRetry(
          "flux-kontext-apps/multi-image-kontext-max:aa37e77197b933892f690e7e30418d971d091966490781b0f6caecff5bd1c7fb",
          {
            prompt: kontextPrompt,
            input_image_1: personImageUrl,
            input_image_2: garmentUrl,
            aspect_ratio: 'match_input_image',
            output_format: 'png',
            safety_tolerance: 2,
          }
        )
        const url = Array.isArray(output) ? output[0] : String(output)
        if (!url || url.length < 10) throw new Error(`FluxKontext returned invalid output for ${label}`)
        console.log(`[FluxKontext] ${label} try-on complete:`, url)
        return url
      }

      // ── FLUX Fill + Redux Try-On (last-resort fallback) ─────────────────
      async function runFluxFillTryon(personImageUrl: string, garmentUrl: string, garmentDesc: string, label: string): Promise<string> {
        console.log(`[FluxFill] Running ${label} try-on...`)
        const preservationPrompt = `A model wearing this exact garment: ${garmentDesc}. All logos, text, graphics, colors, and patterns must be reproduced exactly as shown in the clothing image. Zero modifications to the design.`
        const output = await runWithRetry(
          "cedoysch/flux-fill-redux-try-on:cf5cb07a25e726fe2fac166a8c5ab52ddccd48657741670fb09d9954d4d8446f",
          {
            person_photo: personImageUrl,
            clothing_image: garmentUrl,
            garment_category: 'upper wear',
            prompt: preservationPrompt,
          }
        )
        const url = Array.isArray(output) ? output[0] : String(output)
        if (!url || url.length < 10) throw new Error(`FluxFill returned invalid output for ${label}`)
        console.log(`[FluxFill] ${label} try-on complete:`, url)
        return url
      }

      // ── IDM-VTON (primary) ───────────────────────────────────────────────
      async function runIDMVTON(personImageUrl: string, garmentUrl: string, garmentDesc: string, label: string): Promise<string> {
        console.log(`[IDM-VTON] Running ${label} try-on...`)
        const output = await runWithRetry(
          "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          {
            garm_img: garmentUrl,
            human_img: personImageUrl,
            garment_des: garmentDesc,
            category: 'upper_body',
            crop: false,
            steps: 40,
            seed: 42,
          }
        )
        const url = Array.isArray(output) ? output[0] : String(output)
        if (!url || url.length < 10) throw new Error(`IDM-VTON returned invalid output for ${label}`)
        console.log(`[IDM-VTON] ${label} try-on complete:`, url)
        return url
      }

      // ── Nano Banana 2 (Google Gemini 2.5 Flash Image, primary) ──────────
      // SOTA subject/detail preservation. Takes the garment photo as a reference
      // and places it exactly on a person in the described scene. Unlike FLUX
      // Kontext which reinterprets the garment, Nano Banana preserves reference
      // pixels — crests, numbers, logos, patterns reproduce faithfully.
      async function runNanoBananaOneShot(designUrl: string, scenePrompt: string, garmentDesc: string, label: string): Promise<string> {
        console.log(`[NanoBanana] Running ${label}...`)
        const viewHint = label === 'BACK' ? 'from behind, back of the garment visible' : 'from the front, front of the garment fully visible'
        const oneShotPrompt = `Generate a photorealistic fashion photograph. Dress the person in the EXACT garment shown in the reference image — preserve every pixel of the garment's design: stripes, colors, logos, embroidered crests, badges, numbers, letters, collar style, sleeve length, sponsor patches, and all printed/embroidered details must appear IDENTICAL to the reference. Do not redesign, simplify, recolor, or reinterpret any element of the garment. The garment identity is: ${garmentDesc}. View: the person is shown ${viewHint}. SCENE: ${scenePrompt}. The garment should drape naturally on the body with realistic lighting matching the scene, but every design feature must be a pixel-faithful copy of the reference.`
        const output = await runWithRetry(
          "google/nano-banana-2:71516450bdbeafc41df33ad538bc8cc6a90f80038a563b1260531c02d694f4fd",
          {
            prompt: oneShotPrompt,
            image_input: [designUrl],
            aspect_ratio: '3:4',
            resolution: '2K',
            output_format: 'png',
          }
        )
        const url = Array.isArray(output) ? output[0] : String(output)
        if (!url || url.length < 10) throw new Error(`NanoBanana returned invalid output for ${label}`)
        console.log(`[NanoBanana] ${label} complete:`, url)
        return url
      }

      // ── FLUX Kontext Max (single-image, fallback) ───────────────────────
      async function runFluxKontextOneShot(designUrl: string, scenePrompt: string, garmentDesc: string, label: string): Promise<string> {
        console.log(`[FluxKontext-OneShot] Running ${label}...`)
        const viewHint = label === 'BACK' ? 'from behind, back of the garment visible' : 'from the front, front of the garment visible'
        const oneShotPrompt = `USE THE REFERENCE GARMENT IN THIS IMAGE WITHOUT CHANGING ANY DETAIL. Place this exact garment on a person and render the complete photo described below. The garment is: ${garmentDesc}. Preserve every single feature of the reference garment exactly as shown — every stripe, color, logo, crest, badge, number, letter, pattern, collar style, sleeve length, and sponsor patch must appear identically on the person's garment. Do not modify, simplify, recolor, reposition, or omit any design element. SCENE: ${scenePrompt}. The person is shown ${viewHint}. The garment must match the reference pixel-for-pixel in design, while naturally draping on the body with realistic lighting matching the scene.`
        const output = await runWithRetry(
          "black-forest-labs/flux-kontext-max:8389ed8e4b16016c44fcdcc3ad142cf1e182e0a1ecaf0347b3e5254303f2beac",
          {
            prompt: oneShotPrompt,
            input_image: designUrl,
            aspect_ratio: '3:4',
            output_format: 'png',
            safety_tolerance: 2,
            prompt_upsampling: false,
          }
        )
        const url = Array.isArray(output) ? output[0] : String(output)
        if (!url || url.length < 10) throw new Error(`FluxKontext-OneShot returned invalid output for ${label}`)
        console.log(`[FluxKontext-OneShot] ${label} complete:`, url)
        return url
      }

      // Helper: generate one image (front or back)
      async function generateOneImage(designUrl: string, label: string): Promise<string> {
        console.log(`[Replicate] ── Generating ${label} image ──`)

        const promptForThisView = label === 'BACK'
          ? buildBackPrompt(request.prompt)
          : request.prompt

        const baseDesc = request.garmentDescription || 'clothing garment'
        const garmentDesc = `${label === 'BACK' ? 'Back side of: ' : ''}${baseDesc}`

        // Primary: Nano Banana 2 (Gemini 2.5 Flash Image) — pixel-faithful reference preservation
        try {
          return await runNanoBananaOneShot(designUrl, promptForThisView, garmentDesc, label)
        } catch (nanoErr: any) {
          console.warn(`[Replicate] Nano Banana failed (${nanoErr.message}), falling back to FLUX Kontext one-shot`)
        }

        // Fallback 1: FLUX Kontext Max one-shot (scene prompt + garment reference → final image)
        try {
          return await runFluxKontextOneShot(designUrl, promptForThisView, garmentDesc, label)
        } catch (oneShotErr: any) {
          console.warn(`[Replicate] One-shot FluxKontext failed (${oneShotErr.message}), falling back to 2-step pipeline`)
        }

        // Fallback: FLUX.2 Pro person → multi-image Kontext VTON → IDM-VTON → FluxFill
        console.log('[Replicate] ── Fallback: FLUX.2 Pro — person in scene ──')
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
          throw new Error(`FLUX.2 returned invalid output for ${label}`)
        }

        const vtonGarmentDesc = `${garmentDesc}. Copy every detail exactly: all colors, logos, printed text, graphics, patterns — sharp and undistorted.`
        try {
          return await runFluxKontextTryon(personImageUrl, designUrl, vtonGarmentDesc, label)
        } catch (kontextErr: any) {
          console.warn(`[Replicate] FluxKontext VTON failed (${kontextErr.message}), falling back to IDM-VTON`)
          try {
            return await runIDMVTON(personImageUrl, designUrl, vtonGarmentDesc, label)
          } catch (idmErr: any) {
            console.warn(`[Replicate] IDM-VTON failed (${idmErr.message}), falling back to FluxFill`)
            return await runFluxFillTryon(personImageUrl, designUrl, vtonGarmentDesc, label)
          }
        }
      }

      // Generate front + back in parallel (independent pipelines, no reason to wait)
      const imageJobs: Promise<string>[] = []
      if (request.designUrl) imageJobs.push(generateOneImage(request.designUrl, 'FRONT'))
      if (request.backDesignUrl) {
        console.log('[Replicate] Back design provided, generating FRONT + BACK in parallel...')
        imageJobs.push(generateOneImage(request.backDesignUrl, 'BACK'))
      }
      if (imageJobs.length === 0) {
        throw new Error('[Replicate] No design image was provided to generate from')
      }

      const settled = await Promise.allSettled(imageJobs)
      const failures: string[] = []
      for (const result of settled) {
        if (result.status === 'fulfilled') resultUrls.push(result.value)
        else {
          const msg = result.reason?.message || String(result.reason)
          console.error('[Replicate] One image job failed:', msg)
          failures.push(msg)
        }
      }

      if (resultUrls.length === 0) {
        // Surface the real underlying error (e.g. Replicate billing / model errors)
        // instead of a misleading generic message.
        throw new Error(failures[0] || '[Replicate] Image generation failed')
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
        // Routes by animation type:
        //   rotation + hasBack → Kling v2.1 start+end turntable (only morphs for 180° spin)
        //   rotation + no back → Kling v2.6 single-image with partial-orbit prompt
        //   closeup / pan / lifestyle → Kling v2.6 single-image, camera-only motion
        const animation = request.productAnimation || 'rotation'
        console.log(`[Replicate] ── Product Video (animation=${animation}) ──`)
        console.log('[Replicate] Front image:', isDataUri ? `data URI (${Math.round(request.designUrl.length / 1024)}KB)` : request.designUrl)
        console.log('[Replicate] Back image:', request.backDesignUrl ? 'provided' : 'not provided')
        console.log('[Replicate] Prompt:', request.prompt.substring(0, 200))

        // Use the prompt that buildProductShowcasePrompt built (already animation-specific)
        // Just enforce 512-char limit since Kling truncates.
        const productPrompt = request.prompt.length > 512 ? request.prompt.substring(0, 512) : request.prompt

        const productNegativePrompt = "multiple rotations, double rotation, 360 spin, full turn, repeated rotation, second rotation, spinning back, returning to front, oscillating, bouncing rotation, fast rotation, morph, morphing, pixel blending, dissolve, fade, cross-fade, melting fabric, warping fabric, changing design, modified logo, distorted crest, smeared text, blurry print, color shift, design mutation, extra logos, missing logos, sleeve change, neckline change, fabric distortion, low quality, deformed, cartoon, anime, 3D render, CGI, watermark, text overlay"

        let videoOutput: string

        if (animation === 'rotation' && request.backDesignUrl) {
          // 180° turntable: only path that uses both images. Kling v2.1 supports end_image.
          // 5s duration forces a SINGLE clean half-turn (10s tempts the model into multiple rotations).
          console.log('[Replicate] Kling v2.1 turntable (start=front, end=back, 5s pro mode, single 180°)')
          videoOutput = await runWithRetry(
            "kwaivgi/kling-v2.1",
            {
              prompt: productPrompt,
              start_image: request.designUrl,
              end_image: request.backDesignUrl,
              mode: 'pro',
              duration: 5,
              negative_prompt: productNegativePrompt,
            }
          ) as unknown as string
        } else {
          // Single-image path: Kling v2.6 (best image_to_video quality on Replicate)
          // Used for: rotation w/o back, closeup, pan, lifestyle
          console.log(`[Replicate] Kling v2.6 single-image (${animation}, 10s)`)
          videoOutput = await runWithRetry(
            "kwaivgi/kling-v2.6",
            {
              prompt: productPrompt,
              start_image: request.designUrl,
              duration: 10,
              aspect_ratio: '9:16',
              negative_prompt: productNegativePrompt,
              generate_audio: false,
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

        // Step 2: Build the starting frame using Nano Banana 2 (Gemini 2.5 Flash Image)
        // — pixel-faithful reference preservation. Send garment photo + scene prompt → photorealistic person wearing the exact garment.
        console.log('[Replicate] ── Step 2: Starting frame (Nano Banana 2 one-shot) ──');
        console.log('[Replicate] Garment image:', isDataUri ? `data URI (${Math.round(request.designUrl.length / 1024)}KB)` : request.designUrl)

        const videoGarmentDesc = request.garmentDescription || 'clothing garment'
        const videoVtonGarmentDesc = `${videoGarmentDesc}. Preserve all logos, text, graphics, and printed designs exactly as they appear on the original garment — no distortion, no removal, no modification.`

        let tryonUrl: string
        try {
          const nanoPrompt = `Generate a photorealistic fashion photograph. Dress the person in the EXACT garment shown in the reference image — preserve every pixel of the garment's design: stripes, colors, logos, embroidered crests, badges, numbers, letters, collar style, sleeve length, sponsor patches, and all printed/embroidered details must appear IDENTICAL to the reference. Do not redesign, simplify, recolor, or reinterpret any element of the garment. The garment identity is: ${videoGarmentDesc}. SCENE: ${request.prompt}. The garment should drape naturally on the body with realistic lighting matching the scene, but every design feature must be a pixel-faithful copy of the reference.`
          const nanoOut = await runWithRetry(
            "google/nano-banana-2:71516450bdbeafc41df33ad538bc8cc6a90f80038a563b1260531c02d694f4fd",
            {
              prompt: nanoPrompt,
              image_input: [request.designUrl],
              aspect_ratio: '3:4',
              resolution: '2K',
              output_format: 'png',
            }
          )
          tryonUrl = Array.isArray(nanoOut) ? nanoOut[0] : String(nanoOut)
          if (!tryonUrl || tryonUrl.length < 10) throw new Error(`Nano Banana returned invalid output: ${tryonUrl}`)
          console.log('[Replicate] Nano Banana starting frame success:', tryonUrl);
        } catch (nanoErr: any) {
          console.warn('[Replicate] Nano Banana failed, falling back to FLUX Kontext one-shot:', nanoErr.message)

          try {
            const oneShotPrompt = `USE THE REFERENCE GARMENT IN THIS IMAGE WITHOUT CHANGING ANY DETAIL. Place this exact garment on a person and render the complete photo described below. The garment is: ${videoGarmentDesc}. Preserve every single feature of the reference garment exactly as shown — every stripe, color, logo, crest, badge, number, letter, pattern, collar style, sleeve length, and sponsor patch must appear identically on the person's garment. SCENE: ${request.prompt}. The garment must match the reference pixel-for-pixel in design.`
            const oneShotOut = await runWithRetry(
              "black-forest-labs/flux-kontext-max:8389ed8e4b16016c44fcdcc3ad142cf1e182e0a1ecaf0347b3e5254303f2beac",
              {
                prompt: oneShotPrompt,
                input_image: request.designUrl,
                aspect_ratio: '3:4',
                output_format: 'png',
                safety_tolerance: 2,
                prompt_upsampling: false,
              }
            )
            tryonUrl = Array.isArray(oneShotOut) ? oneShotOut[0] : String(oneShotOut)
            if (!tryonUrl || tryonUrl.length < 10) throw new Error(`One-shot Kontext returned invalid output: ${tryonUrl}`)
            console.log('[Replicate] One-shot Kontext starting frame success:', tryonUrl);
          } catch (oneShotErr: any) {
            console.warn('[Replicate] One-shot Kontext failed, falling back to 2-step pipeline:', oneShotErr.message)

          // Fallback 2-step: FLUX.2 Pro person → VTON
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

          try {
            const vtonKontextPrompt = `Replace the plain white shirt on the person in image 1 with the EXACT garment shown in image 2. The garment in image 2 is: ${videoGarmentDesc}. Copy every feature exactly — stripes, colors, logos, crests, numbers, patches. Keep the person's face, pose, body, and background unchanged.`
            const kontextOut = await runWithRetry(
              "flux-kontext-apps/multi-image-kontext-max:aa37e77197b933892f690e7e30418d971d091966490781b0f6caecff5bd1c7fb",
              {
                prompt: vtonKontextPrompt,
                input_image_1: personImageUrl,
                input_image_2: request.designUrl,
                aspect_ratio: 'match_input_image',
                output_format: 'png',
                safety_tolerance: 2,
              }
            )
            tryonUrl = Array.isArray(kontextOut) ? kontextOut[0] : String(kontextOut)
            if (!tryonUrl || tryonUrl.length < 10) throw new Error('Kontext VTON invalid output')
          } catch {
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
            tryonUrl = Array.isArray(vtonOutput) ? vtonOutput[0] : String(vtonOutput)
            if (!tryonUrl || tryonUrl.length < 10) {
              throw new Error(`[Replicate] IDM-VTON returned invalid output: ${tryonUrl}`)
            }
          }
          }
        }

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
