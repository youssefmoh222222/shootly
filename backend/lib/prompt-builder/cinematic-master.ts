import { BrandCategory, BrandTone, TargetAudience, EnvironmentType } from '.'

export interface CinematicPromptConfig {
  category: BrandCategory
  brandTone: BrandTone
  targetAudience: TargetAudience
  environment: EnvironmentType
  designDescription?: string
  customPrompt?: string
  primaryColor?: string
  secondaryColor?: string
  brandName?: string
  // Cinematic options
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  timeOfDay?: 'morning' | 'midday' | 'evening' | 'night'
  demographic?: 'youngAdult' | 'professional' | 'luxury' | 'athletic'
  scenarioType?: 'editorial' | 'commercial' | 'lifestyle' | 'campaign' | 'lookbook'
  cameraAngle?: 'wide' | 'medium' | 'closeup' | 'aerial' | 'low-angle'
  mood?: string
  customDetails?: string
  type?: 'image' | 'video'
  maxChars?: number
  // Director controls
  lighting?: string
  camera?: string
  colorGrade?: string
  pose?: string
  atmosphere?: string
  background?: string
  framing?: string
  cinematicIntelligence?: string
}

const RUNWAY_MAX_CHARS = 512

export class CinematicPromptGenerator {
  private config: CinematicPromptConfig

  constructor(config: CinematicPromptConfig) {
    this.config = config
  }

  /**
   * Generate a compact prompt optimized for Runway's 512-char limit.
   * Front-loads user choices (season, time, demographic, custom details)
   * so they survive any truncation.
   */
  public generateCompact(): string {
    const { category, brandTone, brandName, environment, targetAudience,
            designDescription, season, timeOfDay, demographic, customDetails,
            customPrompt, primaryColor, secondaryColor, type, maxChars } = this.config
    const charLimit = maxChars || RUNWAY_MAX_CHARS

    const parts: string[] = []

    // 1. Compact brand intro (~60 chars)
    const name = brandName || 'fashion brand'
    const catLabel = category.toLowerCase().replace(/_/g, ' ')
    parts.push(`${catLabel} by ${name}, ${brandTone.toLowerCase()} tone`)

    // 2. User's cinematic selections inline (~60 chars)
    const cinematicParts: string[] = []
    if (season) {
      const seasonLabels: Record<string, string> = {
        spring: 'spring light, fresh blooms',
        summer: 'bright summer sun',
        fall: 'autumn golden hour',
        winter: 'crisp winter cool tones'
      }
      cinematicParts.push(seasonLabels[season] || season)
    }
    if (timeOfDay) {
      const timeLabels: Record<string, string> = {
        morning: 'soft morning glow',
        midday: 'bright midday light',
        evening: 'golden hour sunset',
        night: 'dramatic night mood'
      }
      cinematicParts.push(timeLabels[timeOfDay] || timeOfDay)
    }
    if (demographic) {
      const demoLabels: Record<string, string> = {
        youngAdult: 'youthful trendy energy',
        professional: 'polished professional',
        luxury: 'sophisticated elegance',
        athletic: 'dynamic athletic energy'
      }
      cinematicParts.push(demoLabels[demographic] || demographic)
    }
    if (cinematicParts.length > 0) {
      parts.push(cinematicParts.join(', '))
    }

    // 2b. Director layer selections
    const directorParts: string[] = []
    const cinematicIntelligenceMap: Record<string, string> = {
      filmNoir: 'film noir style, deep shadows, venetian blind light, smoky mystery',
      goldenHollywood: 'golden age Hollywood glamour, studio glow, classic elegance',
      neonCyberpunk: 'neon cyberpunk aesthetic, rain-slicked neon streets, futuristic',
      indieFilm: 'indie film aesthetic, intimate natural light, raw authenticity',
      musicVideo: 'music video style, stylized bold colors, performative energy',
      epicCampaign: 'epic campaign cinematic, sweeping wide shots, aspirational grandeur'
    }
    if (this.config.cinematicIntelligence && cinematicIntelligenceMap[this.config.cinematicIntelligence]) directorParts.push(cinematicIntelligenceMap[this.config.cinematicIntelligence])
    const lightingMap: Record<string, string> = {
      natural: 'soft natural window light, gentle shadows',
      studio: 'professional studio softbox lighting, even illumination',
      dramatic: 'dramatic rim lighting, deep shadows, high contrast',
      neon: 'neon colored lighting, vibrant glow, urban night',
      golden: 'warm golden hour backlight, sun flare',
      flash: 'direct flash photography, harsh on-camera flash, raw'
    }
    const cameraMap: Record<string, string> = {
      wide: '35mm wide-angle lens, environmental context, full scene',
      standard: '50mm natural perspective, full body framing',
      portrait: '85mm portrait lens, shallow depth of field, bokeh background',
      macro: 'macro close-up, extreme fabric detail, tight crop',
      cinematic: 'anamorphic lens, cinematic aspect ratio, lens flare'
    }
    const colorGradeMap: Record<string, string> = {
      clean: 'clean neutral color grade, true-to-life colors',
      warm: 'warm film tones, Kodak Portra 400 palette',
      cool: 'cool editorial tones, blue shadows, desaturated',
      moody: 'high contrast moody grade, crushed blacks, lifted highlights',
      bw: 'black and white, high contrast monochrome',
      vintage: 'faded vintage film look, grain, muted pastels'
    }
    const poseMap: Record<string, string> = {
      confident: 'standing confident pose, direct gaze at camera',
      walking: 'walking naturally, mid-stride, casual movement',
      seated: 'seated relaxed pose, natural posture',
      dynamic: 'dynamic action pose, movement and energy',
      candid: 'candid unposed moment, natural authentic expression',
      editorial: 'editorial fashion pose, striking angular stance, intense gaze'
    }
    const atmosphereMap: Record<string, string> = {
      clear: 'clear atmosphere, crisp and sharp',
      haze: 'light atmospheric haze, soft dreamy fog',
      rain: 'rain and wet streets, reflective surfaces, moody',
      smoke: 'light smoke and mist, atmospheric depth',
      dust: 'floating dust particles, light beams through particles',
      snow: 'gentle snowfall, cold breath, frosted surfaces'
    }
    const backgroundMap: Record<string, string> = {
      studio: 'clean studio backdrop, seamless paper background',
      urban: 'urban street background, city architecture, concrete',
      nature: 'natural outdoor background, trees, sky, landscape',
      interior: 'interior architecture, designed space, furniture',
      abstract: 'abstract blurred background, color wash, artistic',
      minimal: 'minimal negative space, isolated subject, simple'
    }

    if (this.config.lighting && lightingMap[this.config.lighting]) directorParts.push(lightingMap[this.config.lighting])
    if (this.config.camera && cameraMap[this.config.camera]) directorParts.push(cameraMap[this.config.camera])
    if (this.config.colorGrade && colorGradeMap[this.config.colorGrade]) directorParts.push(colorGradeMap[this.config.colorGrade])
    if (this.config.pose && poseMap[this.config.pose]) directorParts.push(poseMap[this.config.pose])
    if (this.config.atmosphere && atmosphereMap[this.config.atmosphere]) directorParts.push(atmosphereMap[this.config.atmosphere])
    if (this.config.background && backgroundMap[this.config.background]) directorParts.push(backgroundMap[this.config.background])
    const framingMap: Record<string, string> = {
      fullBody: 'full body framing, head to toe visible',
      threeQuarter: 'three-quarter length framing, head to knees',
      waistUp: 'waist-up framing, upper body focus',
      headshot: 'headshot framing, face and shoulders',
      detail: 'tight detail crop, garment close-up'
    }
    if (this.config.framing && framingMap[this.config.framing]) directorParts.push(framingMap[this.config.framing])

    if (directorParts.length > 0) {
      parts.push(directorParts.join(', '))
    }

    // 3. Environment + target audience
    const envLabel = environment.toLowerCase().replace(/_/g, ' ')
    parts.push(`${envLabel} setting`)
    if (charLimit > RUNWAY_MAX_CHARS && targetAudience) {
      const audienceLabel = targetAudience.toLowerCase().replace(/_/g, ' ')
      parts.push(`for ${audienceLabel}`)
    }

    // 4. Compact scene/model vibe (~80 chars) — describes the SCENE not the garment
    const compactScene: Record<string, string> = {
      MEDICAL_WEAR: 'professional clinical setting, composed confident model',
      FOOTBALL: 'athletic energy, dynamic movement, sports environment',
      GYMWEAR: 'fit athletic model, active confident energy, gym setting',
      STREETWEAR: 'urban street presence, effortless cool attitude',
      OLD_MONEY: 'refined elegance, understated wealth, classic setting',
      LUXURY: 'editorial presence, premium atmosphere, haute couture mood',
      MINIMAL: 'clean composition, intentional restraint, calm presence',
      VINTAGE: 'nostalgic retro atmosphere, warm character, period charm',
      Y2K: 'millennium energy, playful bold attitude, pop culture vibe',
      TECHWEAR: 'futuristic urban edge, utility-forward setting',
      OVERSIZED: 'relaxed confident volume, modern nonchalance',
      RETRO_SPORTS: 'vintage sports heritage, classic athletic charisma',
      PREPPY: 'collegiate polish, academic sophistication'
    }
    parts.push(compactScene[category] || compactScene.STREETWEAR)

    // 5. Custom prompt / custom details (~100 chars)
    if (customDetails) {
      parts.push(customDetails)
    }
    if (customPrompt) {
      parts.push(customPrompt)
    }

    // 6. Colors if specified
    const colors = [primaryColor, secondaryColor].filter(Boolean)
    if (colors.length > 0) {
      parts.push(`${colors.join(' and ')} palette`)
    }

    // 7. Design description (lowest priority)
    if (designDescription) {
      parts.push(`featuring ${designDescription}`)
    }

    // 8. Style keyword suffix (~50 chars)
    const styleKeywords = type === 'video'
      ? 'cinematic 4K, smooth camera motion, film color grade'
      : 'photorealistic, editorial lighting, magazine quality'
    parts.push(styleKeywords)

    // Join and enforce char limit
    let prompt = parts.join('. ')
    if (prompt.length > charLimit) {
      let truncated = prompt.substring(0, charLimit)
      const lastBreak = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf(', '), truncated.lastIndexOf(' '))
      if (lastBreak > charLimit * 0.8) {
        truncated = truncated.substring(0, lastBreak)
      }
      console.log(`[CinematicMaster] Compact prompt truncated from ${prompt.length} to ${truncated.length} chars (limit: ${charLimit})`)
      prompt = truncated
    }

    console.log(`[CinematicMaster] Compact prompt (${prompt.length} chars):`, prompt)
    return prompt
  }

  public generate(): string {
    const sections = [
      this.getBrandIntroduction(),
      this.getCinematicDirecting(),
      this.getDirectorLayers(),
      this.getEnvironmentScene(),
      this.getHumanElements(),
      this.getProductDetails(),
      this.getCategoryEnhancements(),
      this.getStyleGuidelines(),
      this.getTechnicalSpecs(),
      this.getQualityRequirements()
    ].filter(Boolean)

    const prompt = sections.join('. ')
    return this.optimizePrompt(prompt)
  }

  public generateWithNegative(): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.generate(),
      negativePrompt: this.getNegativePrompts()
    }
  }

  getBrandIntroduction(): string {
    const { category, brandTone, brandName, designDescription } = this.config
    const name = brandName || 'fashion brand'
    const tone = brandTone.toLowerCase()

    const categoryDescriptions: Record<BrandCategory, string> = {
      MEDICAL_WEAR: `Professional medical and healthcare apparel by ${name}, embodying ${tone} clinical precision`,
      FOOTBALL: `High-performance football athletic wear by ${name}, channeling ${tone} competitive energy`,
      GYMWEAR: `Premium fitness and training apparel by ${name}, radiating ${tone} athletic intensity`,
      STREETWEAR: `Contemporary urban streetwear collection by ${name}, expressing ${tone} street culture authenticity`,
      OLD_MONEY: `Timeless heritage fashion by ${name}, reflecting ${tone} generational elegance and understated wealth`,
      LUXURY: `Haute couture luxury collection by ${name}, exuding ${tone} opulence and exclusive craftsmanship`,
      MINIMAL: `Refined minimalist design by ${name}, showcasing ${tone} simplicity and intentional restraint`,
      VINTAGE: `Curated vintage-inspired collection by ${name}, evoking ${tone} nostalgic charm with modern sensibility`,
      Y2K: `Bold Y2K revival collection by ${name}, capturing ${tone} millennium-era futurism and pop culture energy`,
      TECHWEAR: `Advanced technical apparel by ${name}, fusing ${tone} functionality with futuristic utility design`,
      OVERSIZED: `Statement oversized silhouettes by ${name}, expressing ${tone} contemporary volume and relaxed proportions`,
      RETRO_SPORTS: `Retro athletic revival by ${name}, blending ${tone} vintage sports heritage with modern flair`,
      PREPPY: `Classic preppy collection by ${name}, embodying ${tone} academic tradition and polished sophistication`
    }

    const intro = categoryDescriptions[category] || categoryDescriptions.STREETWEAR
    return designDescription ? `${intro}. Featuring: ${designDescription}` : intro
  }

  getCinematicDirecting(): string {
    const { scenarioType, cameraAngle, mood, type } = this.config

    const directionParts: string[] = []

    const scenarioDirections: Record<string, string> = {
      editorial: 'High-fashion editorial direction with dramatic composition and artistic framing',
      commercial: 'Clean commercial photography direction with product-focused composition',
      lifestyle: 'Natural lifestyle direction capturing authentic moments and candid energy',
      campaign: 'Campaign-grade cinematic direction with bold visual storytelling',
      lookbook: 'Polished lookbook direction with consistent styling and clean presentation'
    }

    if (scenarioType && scenarioDirections[scenarioType]) {
      directionParts.push(scenarioDirections[scenarioType])
    } else {
      directionParts.push('Professional cinematic direction with intentional visual storytelling')
    }

    const cameraDirections: Record<string, string> = {
      'wide': 'Wide establishing shot showing full environment and context',
      'medium': 'Medium shot capturing full outfit and model presence',
      'closeup': 'Intimate close-up revealing fabric texture and design details',
      'aerial': 'Dramatic aerial perspective adding scale and visual impact',
      'low-angle': 'Low-angle shot creating powerful, commanding presence'
    }

    if (cameraAngle && cameraDirections[cameraAngle]) {
      directionParts.push(cameraDirections[cameraAngle])
    }

    if (mood) {
      directionParts.push(`Mood: ${mood}`)
    }

    if (type === 'video') {
      directionParts.push('Cinematic motion with smooth camera movement and dynamic transitions')
    }

    return directionParts.join('. ')
  }

  getDirectorLayers(): string {
    const { lighting, camera, colorGrade, pose, atmosphere, background, framing, cinematicIntelligence } = this.config
    const parts: string[] = []

    const cinematicIntelligenceDescriptions: Record<string, string> = {
      filmNoir: 'Film noir cinematic intelligence: deep chiaroscuro shadows, venetian blind light patterns, smoky mysterious atmosphere, morally ambiguous tension, detective-movie visual language',
      goldenHollywood: 'Golden age Hollywood cinematic intelligence: classic studio glamour lighting, soft-focus romantic glow, old Hollywood elegance, Technicolor richness, star-system charisma',
      neonCyberpunk: 'Neon cyberpunk cinematic intelligence: rain-slicked streets reflecting neon signs, futuristic urban decay, Blade Runner atmospheric density, electric color palette, dystopian beauty',
      indieFilm: 'Indie film cinematic intelligence: intimate handheld naturalism, available light authenticity, raw emotional proximity, mumblecore honesty, A24 visual storytelling',
      musicVideo: 'Music video cinematic intelligence: high-energy stylized visuals, bold saturated color blocking, performative confidence and swagger, MTV-era dynamic editing rhythm, fashion-forward spectacle',
      epicCampaign: 'Epic campaign cinematic intelligence: sweeping wide establishing shots, aspirational grandeur, golden-hour hero lighting, large-scale production value, Nike/Apple visual ambition'
    }
    if (cinematicIntelligence && cinematicIntelligenceDescriptions[cinematicIntelligence]) parts.push(cinematicIntelligenceDescriptions[cinematicIntelligence])

    const lightingDescriptions: Record<string, string> = {
      natural: 'Soft natural window light with gentle diffused shadows and warm ambient fill',
      studio: 'Professional studio softbox lighting with even illumination and controlled highlights',
      dramatic: 'Dramatic rim lighting with deep shadows, high contrast, and sculpted light shaping',
      neon: 'Neon colored lighting with vibrant electric glow, urban night atmosphere',
      golden: 'Warm golden hour backlight with sun flare and long atmospheric shadows',
      flash: 'Direct flash photography with harsh on-camera flash, raw unfiltered look'
    }

    const cameraDescriptions: Record<string, string> = {
      wide: '35mm wide-angle lens capturing full environmental context and scene depth',
      standard: '50mm natural perspective with full body framing and true-to-eye proportions',
      portrait: '85mm portrait lens with shallow depth of field and creamy bokeh background',
      macro: 'Macro close-up revealing extreme fabric detail and textile texture in tight crop',
      cinematic: 'Anamorphic lens with cinematic widescreen aspect ratio and distinctive lens flare'
    }

    const colorGradeDescriptions: Record<string, string> = {
      clean: 'Clean neutral color grading with true-to-life accurate color reproduction',
      warm: 'Warm film tones reminiscent of Kodak Portra 400, rich skin tones and golden highlights',
      cool: 'Cool editorial tones with blue-shifted shadows and elegantly desaturated palette',
      moody: 'High contrast moody grade with crushed blacks, lifted highlights, and cinematic tension',
      bw: 'Black and white high contrast monochrome with rich tonal range and dramatic shadows',
      vintage: 'Faded vintage film look with organic grain, muted pastels, and nostalgic color shift'
    }

    const poseDescriptions: Record<string, string> = {
      confident: 'Standing in a confident commanding pose with direct gaze at camera, shoulders back',
      walking: 'Walking naturally mid-stride with casual fluid movement and relaxed expression',
      seated: 'Seated in a relaxed pose with natural posture and effortless composure',
      dynamic: 'Dynamic action pose full of movement and energy, capturing peak motion',
      candid: 'Candid unposed moment with natural authentic expression and genuine emotion',
      editorial: 'Editorial fashion pose with striking angular stance and intense focused gaze'
    }

    const atmosphereDescriptions: Record<string, string> = {
      clear: 'Clear crisp atmosphere with sharp detail and clean visual clarity throughout',
      haze: 'Light atmospheric haze with soft dreamy fog creating depth and ethereal mood',
      rain: 'Rain-soaked scene with wet streets, reflective surfaces, and moody overcast light',
      smoke: 'Light smoke and mist creating atmospheric depth layers and volumetric light',
      dust: 'Floating dust particles catching light beams, creating warm textured atmosphere',
      snow: 'Gentle snowfall with cold visible breath and frosted crystalline surfaces'
    }

    const backgroundDescriptions: Record<string, string> = {
      studio: 'Clean studio backdrop with seamless paper background and controlled environment',
      urban: 'Urban street background with city architecture, concrete textures, and metropolitan energy',
      nature: 'Natural outdoor background with trees, sky, and expansive landscape setting',
      interior: 'Interior architecture with designed space, curated furniture, and intentional styling',
      abstract: 'Abstract blurred background with artistic color wash and painterly depth',
      minimal: 'Minimal negative space with isolated subject against clean simple background'
    }

    if (lighting && lightingDescriptions[lighting]) parts.push(lightingDescriptions[lighting])
    if (camera && cameraDescriptions[camera]) parts.push(cameraDescriptions[camera])
    if (colorGrade && colorGradeDescriptions[colorGrade]) parts.push(colorGradeDescriptions[colorGrade])
    if (pose && poseDescriptions[pose]) parts.push(poseDescriptions[pose])
    if (atmosphere && atmosphereDescriptions[atmosphere]) parts.push(atmosphereDescriptions[atmosphere])
    if (background && backgroundDescriptions[background]) parts.push(backgroundDescriptions[background])

    const framingDescriptions: Record<string, string> = {
      fullBody: 'Full body framing showing head to toe, complete outfit visible with footwear',
      threeQuarter: 'Three-quarter length framing from head to knees, emphasizing silhouette and proportions',
      waistUp: 'Waist-up framing with upper body focus, highlighting top half and facial expression',
      headshot: 'Headshot framing capturing face and shoulders, intimate portrait perspective',
      detail: 'Tight detail crop on garment construction, fabric texture and design elements visible'
    }
    if (framing && framingDescriptions[framing]) parts.push(framingDescriptions[framing])

    if (parts.length === 0) return ''
    return `Director vision: ${parts.join('. ')}`
  }

  getEnvironmentScene(): string {
    const { environment, season, timeOfDay, category } = this.config

    const environmentScenes: Record<EnvironmentType, Record<BrandCategory, string>> = {
      HOSPITAL: {
        MEDICAL_WEAR: 'Modern hospital corridor with clean white walls, ambient clinical lighting, and professional healthcare environment',
        FOOTBALL: 'Sports medicine facility with medical equipment and athletic recovery zone',
        GYMWEAR: 'Physical therapy gym within a medical facility',
        STREETWEAR: 'Modern hospital atrium with contemporary architecture',
        OLD_MONEY: 'Private hospital wing with elegant furnishings',
        LUXURY: 'Exclusive private medical suite with premium finishes',
        MINIMAL: 'Clean, minimalist medical facility with sparse modern design',
        VINTAGE: 'Classic hospital building with period architectural details',
        Y2K: 'Futuristic medical center with high-tech displays',
        TECHWEAR: 'Advanced medical research facility with cutting-edge equipment',
        OVERSIZED: 'Spacious hospital commons area with natural light',
        RETRO_SPORTS: 'Sports medicine clinic with vintage athletic memorabilia',
        PREPPY: 'University medical center with traditional campus architecture'
      },
      CLINIC: {
        MEDICAL_WEAR: 'Private clinic with modern examination rooms and warm professional lighting',
        FOOTBALL: 'Sports clinic with performance testing equipment',
        GYMWEAR: 'Wellness clinic with integrated fitness assessment area',
        STREETWEAR: 'Urban health clinic with contemporary interior',
        OLD_MONEY: 'Boutique private practice with refined decor',
        LUXURY: 'Premium wellness clinic with spa-like atmosphere',
        MINIMAL: 'Clean-lined clinic with Scandinavian-inspired simplicity',
        VINTAGE: 'Established medical practice with classic furnishings',
        Y2K: 'Next-generation clinic with digital health interfaces',
        TECHWEAR: 'Smart clinic with integrated health monitoring systems',
        OVERSIZED: 'Open-concept wellness center with flowing spaces',
        RETRO_SPORTS: 'Community sports medicine practice',
        PREPPY: 'Collegiate health center with traditional touches'
      },
      GYM: {
        MEDICAL_WEAR: 'Medical-grade rehabilitation gym with professional equipment',
        FOOTBALL: 'Professional football training facility with turf and weight stations',
        GYMWEAR: 'Premium fitness center with state-of-the-art equipment, mirrors, and dramatic gym lighting',
        STREETWEAR: 'Underground urban gym with raw industrial aesthetic and graffiti walls',
        OLD_MONEY: 'Private country club fitness center with mahogany and brass fixtures',
        LUXURY: 'Exclusive boutique gym with designer equipment and ambient lighting',
        MINIMAL: 'Clean, open-concept workout space with curated minimal equipment',
        VINTAGE: 'Classic iron gym with vintage barbells and retro fitness posters',
        Y2K: 'Neon-lit futuristic gym with chrome equipment and LED floors',
        TECHWEAR: 'High-tech training facility with digital displays and smart equipment',
        OVERSIZED: 'Spacious functional training warehouse with open floor plan',
        RETRO_SPORTS: 'Old-school gymnasium with wooden floors and classic equipment',
        PREPPY: 'University athletic center with institutional quality equipment'
      },
      STUDIO: {
        MEDICAL_WEAR: 'Clean photography studio with neutral backdrop and soft professional lighting',
        FOOTBALL: 'Sports photography studio with dramatic directional lighting',
        GYMWEAR: 'Fitness photography studio with workout props and dramatic rim lighting',
        STREETWEAR: 'Industrial photography loft with concrete walls and neon accent lights',
        OLD_MONEY: 'Classic portrait studio with rich velvet drapes and golden accents',
        LUXURY: 'High-end editorial studio with seamless backdrop and gallery lighting',
        MINIMAL: 'Pure white studio space with single-source natural light',
        VINTAGE: 'Film-era photography studio with vintage props and warm tungsten light',
        Y2K: 'Pop-art inspired studio with colorful backdrops and ring lights',
        TECHWEAR: 'Futuristic dark studio with volumetric lighting and LED panels',
        OVERSIZED: 'Expansive studio space with high ceilings and wide-angle setup',
        RETRO_SPORTS: 'Retro sports photography set with period-correct props',
        PREPPY: 'Ivy League inspired studio with academic props and warm light'
      },
      OFFICE: {
        MEDICAL_WEAR: 'Medical office with professional consultation area',
        FOOTBALL: 'Sports management office with team memorabilia',
        GYMWEAR: 'Active workspace with standing desks and fitness-forward culture',
        STREETWEAR: 'Creative agency office with urban art and open plan layout',
        OLD_MONEY: 'Executive corner office with leather and dark wood furnishings',
        LUXURY: 'Penthouse office suite with panoramic city views',
        MINIMAL: 'Scandinavian-designed workspace with clean lines and natural materials',
        VINTAGE: 'Mid-century modern office with period furniture and decor',
        Y2K: 'Tech startup office with translucent furniture and digital art walls',
        TECHWEAR: 'Smart office with integrated tech displays and modular furniture',
        OVERSIZED: 'Loft-style coworking space with oversized furniture',
        RETRO_SPORTS: 'Sports media office with vintage team photography',
        PREPPY: 'Traditional firm office with bookshelves and brass desk lamps'
      },
      HOME: {
        MEDICAL_WEAR: 'Modern home with clean, comfortable lounging area',
        FOOTBALL: 'Athletes home with trophy display and dedicated training space',
        GYMWEAR: 'Home gym setup with workout equipment and motivational decor',
        STREETWEAR: 'Urban apartment with curated street art and vinyl collection',
        OLD_MONEY: 'Grand estate living room with antique furniture and oil paintings',
        LUXURY: 'Penthouse apartment with designer furniture and floor-to-ceiling windows',
        MINIMAL: 'Minimalist apartment with clean surfaces and single statement piece',
        VINTAGE: 'Character home with thrifted decor and eclectic vintage collection',
        Y2K: 'Y2K-styled bedroom with inflatable furniture and lava lamps',
        TECHWEAR: 'Smart home with automated systems and futuristic interior',
        OVERSIZED: 'Open loft apartment with oversized furniture and high ceilings',
        RETRO_SPORTS: 'Den with vintage sports memorabilia and retro gaming setup',
        PREPPY: 'Classic New England home with plaid throws and nautical accents'
      }
    }

    let scene = environmentScenes[environment]?.[category]
      || `Professional ${environment.toLowerCase()} setting appropriate for ${category.toLowerCase().replace('_', ' ')} fashion`

    // Season modifications
    const seasonMods: Record<string, string> = {
      spring: 'Spring atmosphere with fresh blooming elements, soft pastel ambient light, and gentle natural warmth',
      summer: 'Summer setting with bright golden sunlight, vibrant warm tones, and sun-drenched atmosphere',
      fall: 'Autumn ambiance with rich warm earth tones, golden hour light, and fallen leaves accents',
      winter: 'Winter atmosphere with cool crisp light, frosted textures, and cozy layered warmth'
    }

    if (season && seasonMods[season]) {
      scene += `. ${seasonMods[season]}`
    }

    // Time of day modifications
    const timeMods: Record<string, string> = {
      morning: 'Soft morning light streaming in, creating gentle shadows and a fresh, awakening mood',
      midday: 'Bright midday illumination with defined shadows and high-contrast clarity',
      evening: 'Warm golden-hour evening light casting long dramatic shadows with amber warmth',
      night: 'Dramatic nighttime atmosphere with artificial lighting creating moody contrast and urban glow'
    }

    if (timeOfDay && timeMods[timeOfDay]) {
      scene += `. ${timeMods[timeOfDay]}`
    }

    return scene
  }

  getHumanElements(): string {
    const { category, demographic, targetAudience } = this.config

    const baseModels: Record<BrandCategory, string> = {
      MEDICAL_WEAR: 'Confident healthcare professional with composed posture and attentive expression',
      FOOTBALL: 'Athletic football player with powerful build and competitive determination',
      GYMWEAR: 'Fit athletic model with toned physique demonstrating active confidence',
      STREETWEAR: 'Stylish urban individual with effortless cool and authentic street presence',
      OLD_MONEY: 'Refined individual with poised elegance and natural aristocratic bearing',
      LUXURY: 'High-fashion model with striking features and commanding editorial presence',
      MINIMAL: 'Clean-featured model with understated beauty and calm, centered expression',
      VINTAGE: 'Character model with distinctive features and nostalgic retro charm',
      Y2K: 'Energetic young model with bold expressive style and playful millennium attitude',
      TECHWEAR: 'Sharp-featured model with urban edge and futuristic street-tech aesthetic',
      OVERSIZED: 'Confident model embracing relaxed proportions with modern nonchalance',
      RETRO_SPORTS: 'Athletic model with classic sportsperson build and vintage athletic charisma',
      PREPPY: 'Well-groomed model with collegiate polish and approachable sophistication'
    }

    let humanDesc = baseModels[category] || baseModels.STREETWEAR

    // Demographic targeting
    const demographicMods: Record<string, string> = {
      youngAdult: 'Young adult (18-25) with youthful energy and trend-forward sensibility',
      professional: 'Working professional (28-40) with polished appearance and career confidence',
      luxury: 'Discerning luxury consumer with refined taste and effortless sophistication',
      athletic: 'Active athlete with performance-driven physique and competitive focus'
    }

    if (demographic && demographicMods[demographic]) {
      humanDesc += `. ${demographicMods[demographic]}`
    }

    // Audience-specific touches
    const audienceTouches: Record<TargetAudience, string> = {
      DOCTORS: 'Wearing outfit with professional authority befitting a physician',
      NURSES: 'Displaying caring professionalism with practical nursing attire',
      MEDICAL_STUDENTS: 'Youthful medical professional with eager, studious demeanor',
      HOSPITAL_STAFF: 'Hospital team member in functional, comfortable workplace attire',
      ATHLETES: 'Athletic build and posture reflecting peak physical performance',
      GENERAL_PUBLIC: 'Relatable everyday individual with natural, authentic appearance'
    }

    if (audienceTouches[targetAudience]) {
      humanDesc += `. ${audienceTouches[targetAudience]}`
    }

    return humanDesc
  }

  getProductDetails(): string {
    const { designDescription } = this.config

    // Do NOT describe specific garment construction, patterns, or graphics here.
    // The actual garment design is provided via the uploaded image and applied through virtual try-on.
    // This section only reinforces preservation of the original design.
    let details = 'The model wears the EXACT garment as provided — preserve every detail of the original design including all prints, graphics, logos, colors, patterns, sleeve length, neckline, and fit precisely as uploaded. No modifications, no reinterpretation, no added or removed elements'

    if (designDescription) {
      details += `. Garment reference: ${designDescription}`
    }

    return `Product integrity: ${details}`
  }

  getTechnicalSpecs(): string {
    const { type } = this.config

    if (type === 'video') {
      return 'Technical: Cinematic 4K resolution, 24fps film cadence, shallow depth of field with bokeh, smooth dolly or gimbal camera movement, color-graded with film LUT, professional sound design'
    }

    return 'Technical: Ultra-high resolution photography, shallow depth of field with creamy bokeh, professional color grading, sharp focus on garment details, natural skin tones, print-ready quality'
  }

  getStyleGuidelines(): string {
    const { category, brandTone } = this.config

    const styleGuides: Record<BrandCategory, string> = {
      MEDICAL_WEAR: 'Clean composition, professional color temperature, clinical precision in framing, institutional credibility with human warmth',
      FOOTBALL: 'Dynamic action-oriented composition, high-energy color grading, motion blur accents, sports broadcast aesthetic',
      GYMWEAR: 'Power-focused composition, high-contrast dramatic lighting, sweat and texture emphasis, fitness magazine editorial quality',
      STREETWEAR: 'Raw urban composition, film grain texture, street photography candid feel, hypebeast editorial aesthetic',
      OLD_MONEY: 'Classical composition with rule of thirds, warm muted color palette, soft-focus background, Vogue heritage aesthetic',
      LUXURY: 'Bold symmetrical composition, rich deep color palette, dramatic chiaroscuro lighting, haute couture editorial aesthetic',
      MINIMAL: 'Clean negative space composition, muted neutral palette, single focal point, Japanese design magazine aesthetic',
      VINTAGE: 'Nostalgic composition with film photography feel, warm desaturated tones, natural vignetting, analog photography aesthetic',
      Y2K: 'Playful asymmetric composition, saturated pop colors, flash photography feel, early-2000s magazine aesthetic',
      TECHWEAR: 'Geometric structured composition, cool desaturated tones with neon accents, cyberpunk-influenced lighting, futuristic editorial aesthetic',
      OVERSIZED: 'Wide framing to emphasize volume, neutral earth tones, architectural lighting, avant-garde fashion aesthetic',
      RETRO_SPORTS: 'Classic sports composition, warm saturated vintage tones, period-accurate styling, retro sports magazine aesthetic',
      PREPPY: 'Balanced traditional composition, clean bright colors, natural collegiate lighting, Ralph Lauren campaign aesthetic'
    }

    const guide = styleGuides[category] || styleGuides.STREETWEAR
    return `Style: ${guide}. Brand tone: ${brandTone.toLowerCase()}`
  }

  getCategoryEnhancements(): string {
    const { category, season, demographic } = this.config

    const enhancements: Record<BrandCategory, string> = {
      MEDICAL_WEAR: 'Stethoscope or medical tools as accessories, name badge, clinical environment details, professional posture and composure',
      FOOTBALL: 'Athletic stadium or field environment, competitive energy in posture, sports lighting, dynamic athletic stance',
      GYMWEAR: 'Gym equipment or outdoor training environment visible, athletic confident posture, sweat-glistening skin, performance energy',
      STREETWEAR: 'Sneaker coordination, accessory styling (chains, caps, bags), urban environment details, authentic street attitude',
      OLD_MONEY: 'Layered styling with scarves and watches, equestrian or nautical setting undertones, generational quality atmosphere',
      LUXURY: 'Statement jewelry pairing, museum-quality setting presentation, exclusive atmosphere, refined editorial posture',
      MINIMAL: 'Clean proportions in composition, intentional negative space, monochromatic environment coordination, architectural setting alignment',
      VINTAGE: 'Era-specific accessories, retro hairstyling and makeup, period-correct setting details, nostalgic atmosphere',
      Y2K: 'Platform shoes, chunky jewelry, nostalgic tech accessories, playful expressive poses, millennium-era setting',
      TECHWEAR: 'Tactical bag coordination, futuristic urban setting, utility-forward accessories, weather-ready environment',
      OVERSIZED: 'Chunky footwear balance, relaxed stance and posture, architectural space to emphasize volume',
      RETRO_SPORTS: 'Vintage sneaker pairing, headband and wristband accessories, retro gym bag props, old-school setting',
      PREPPY: 'Loafer or boat shoe coordination, belt and watch accessories, academic setting context, collegiate environment'
    }

    let enhancement = enhancements[category] || enhancements.STREETWEAR

    // Season-specific category enhancements
    if (season) {
      const seasonalCategory: Record<string, Partial<Record<BrandCategory, string>>> = {
        spring: {
          STREETWEAR: 'Fresh spring urban setting, blooming trees, pastel city vibes',
          OLD_MONEY: 'Garden party atmosphere, spring estate grounds, fresh floral setting',
          GYMWEAR: 'Outdoor spring training environment, fresh park setting, morning energy',
          MINIMAL: 'Soft spring natural light, airy open spaces, gentle warmth'
        },
        summer: {
          STREETWEAR: 'Hot summer street energy, bright sun, vibrant city atmosphere',
          OLD_MONEY: 'Summer resort setting, yacht club, bright maritime atmosphere',
          GYMWEAR: 'Outdoor summer training, bright sun, beach or park environment',
          FOOTBALL: 'Summer pitch atmosphere, bright stadium, pre-season energy'
        },
        fall: {
          STREETWEAR: 'Autumn urban setting, fallen leaves, warm earth-tone atmosphere',
          OLD_MONEY: 'Autumn estate grounds, golden foliage, countryside atmosphere',
          GYMWEAR: 'Fall outdoor training environment, crisp air, golden light',
          VINTAGE: 'Autumn nostalgic setting, warm amber tones, cozy atmosphere'
        },
        winter: {
          STREETWEAR: 'Winter city streets, cold breath visible, urban night lights',
          OLD_MONEY: 'Winter estate interior, fireplace, frosted windows, cozy warmth',
          GYMWEAR: 'Cold weather training environment, breath visible, determined energy',
          TECHWEAR: 'Harsh winter urban environment, snow, futuristic cold-weather setting'
        }
      }

      const seasonCat = seasonalCategory[season]?.[category]
      if (seasonCat) {
        enhancement += `. Seasonal setting: ${seasonCat}`
      }
    }

    return enhancement
  }

  getNegativePrompts(): string {
    const { category } = this.config

    const baseNegative = 'cartoon, anime, painting, drawing, illustration, 3D render, CGI, blurry, out of focus, low resolution, watermark, text overlay, deformed anatomy, extra limbs, distorted face, unnatural skin, plastic skin, modified garment design, altered graphics, changed pattern, different print from original, added logos, removed logos, wrong sleeve length, wrong neckline'

    const categoryNegative: Record<BrandCategory, string> = {
      MEDICAL_WEAR: `${baseNegative}, bloody, gory, scary, horror medical, halloween costume, toy stethoscope, costume-quality fabric, wrinkled fabric, stained clothing`,
      FOOTBALL: `${baseNegative}, wrong sport equipment, soccer/football confusion, oversized jersey, costume quality, fake muscles, static pose, flat lighting`,
      GYMWEAR: `${baseNegative}, steroid exaggeration, unrealistic body proportions, dirty gym, old equipment, non-athletic pose, cotton casual wear, loose unstructured fabric`,
      STREETWEAR: `${baseNegative}, formal business wear, suburban setting, outdated fashion, costumey, try-hard styling, corporate feel, pristine untouched look`,
      OLD_MONEY: `${baseNegative}, flashy logos, bright neon colors, streetwear accessories, casual sneakers, visible brand names, trendy fast-fashion, distressed denim`,
      LUXURY: `${baseNegative}, mass-produced look, cheap fabric texture, casual styling, department store feel, sale tags, plastic accessories, synthetic-looking materials`,
      MINIMAL: `${baseNegative}, cluttered background, busy patterns, excessive accessories, bright colors, logo-heavy, maximalist styling, competing visual elements`,
      VINTAGE: `${baseNegative}, modern technology visible, contemporary car in background, current-era phone, modern architecture, LED lighting, obviously new fabric`,
      Y2K: `${baseNegative}, modern minimalist aesthetic, muted earth tones, current smartphone, traditional styling, conservative fashion, plain solid colors`,
      TECHWEAR: `${baseNegative}, traditional fabric, no pockets, smooth featureless garment, office wear, formal suit, no utility function, decorative-only elements`,
      OVERSIZED: `${baseNegative}, fitted tailored look, skin-tight clothing, small accessories, conventional proportions, structured blazer, slim-fit anything`,
      RETRO_SPORTS: `${baseNegative}, modern athletic technology, compression gear, current team logos, contemporary sneakers, fitness tracker, modern athletic branding`,
      PREPPY: `${baseNegative}, streetwear elements, distressed clothing, urban graffiti, neon colors, athletic sneakers, heavy jewelry, rebellious styling`
    }

    return categoryNegative[category] || `${baseNegative}`
  }

  getQualityRequirements(): string {
    const { type } = this.config

    if (type === 'video') {
      return 'Quality: Broadcast-grade cinematic video, professional color science, accurate fabric physics and draping in motion, realistic human movement and expression, consistent lighting throughout shot, no flickering or artifacts, smooth frame interpolation. CRITICAL: The garment design, prints, colors, and all details must remain exactly as the original uploaded design throughout every frame — zero modifications'
    }

    return 'Quality: Magazine-grade photorealistic output, accurate human anatomy and proportions, natural fabric physics and draping, genuine skin texture and tones, no AI artifacts, production-ready resolution. CRITICAL: The garment design, prints, colors, and all details must remain exactly as the original uploaded design — zero modifications'
  }

  optimizePrompt(prompt: string): string {
    // Remove duplicate words/phrases
    const seen = new Set<string>()
    const words = prompt.split(/[,.]/).map(s => s.trim()).filter(Boolean)

    const deduped = words.filter(phrase => {
      const normalized = phrase.toLowerCase().trim()
      if (normalized.length < 3) return false
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })

    let optimized = deduped.join('. ')

    // Add custom details at the end if provided
    if (this.config.customDetails) {
      optimized += `. Additional details: ${this.config.customDetails}`
    }

    // Add custom prompt enhancement
    if (this.config.customPrompt) {
      optimized += `. ${this.config.customPrompt}`
    }

    // Trim to reasonable length for AI models (most work best under ~500 tokens)
    if (optimized.length > 2000) {
      optimized = optimized.substring(0, 1997) + '...'
    }

    return optimized
  }
}

export function buildCinematicPrompt(config: CinematicPromptConfig): string {
  const generator = new CinematicPromptGenerator(config)
  return generator.generateCompact()
}

export function buildCinematicPromptWithNegative(config: CinematicPromptConfig): { prompt: string; negativePrompt: string } {
  const generator = new CinematicPromptGenerator(config)
  return generator.generateWithNegative()
}
