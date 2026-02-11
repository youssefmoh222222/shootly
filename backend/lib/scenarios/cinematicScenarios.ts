import scenariosJson from '../../cinematic-shoot-scenarios.json';

export interface ModelProfile {
  descriptor: string;
  bestFor: string;
  shorthand: string;
}

export interface CinematicScenario {
  name: string;
  description: string;
  bestFor: string;
  runwayPrompt: string;
}

export interface BrandScenarios {
  brandProfile: string;
  scenarios: Record<string, CinematicScenario>;
}

export interface CinematicScenariosData {
  modelProfiles: {
    description: string;
    howToUse: string;
    profiles: Record<string, ModelProfile>;
  };
  diversityGuidelines: Record<string, string>;
  cinematicShootScenarios: Record<string, BrandScenarios>;
  promptEnhancements: {
    runwayOptimization: Record<string, string>;
    brandSpecificShortcuts: Record<string, string>;
  };
  quickReferenceMatrix: Record<string, string[]>;
}

const RUNWAY_MAX_CHARS = 512;

// Compact descriptors optimized for Runway's 512-char limit
const seasonDescriptors: Record<string, string> = {
  spring: 'spring light, fresh blooms',
  summer: 'bright summer sun, warm tones',
  fall: 'autumn golden hour, warm leaves',
  winter: 'crisp winter, cool tones',
};

const timeOfDayDescriptors: Record<string, string> = {
  morning: 'soft morning glow',
  midday: 'bright midday light',
  evening: 'golden hour sunset',
  night: 'dramatic night mood',
};

const demographicDescriptors: Record<string, string> = {
  youngAdult: 'youthful trendy energy',
  professional: 'polished professional look',
  luxury: 'sophisticated elegance',
  athletic: 'dynamic athletic energy',
};

class CinematicScenariosService {
  private static instance: CinematicScenariosService;
  private scenariosData: CinematicScenariosData | null = null;

  private constructor() {}

  public static getInstance(): CinematicScenariosService {
    if (!CinematicScenariosService.instance) {
      CinematicScenariosService.instance = new CinematicScenariosService();
    }
    return CinematicScenariosService.instance;
  }

  private loadScenariosData(): CinematicScenariosData {
    if (this.scenariosData) {
      return this.scenariosData;
    }

    this.scenariosData = scenariosJson as unknown as CinematicScenariosData;
    console.log('[CinematicScenarios] Loaded scenarios via import. Brands:', Object.keys(this.scenariosData.cinematicShootScenarios));
    console.log('[CinematicScenarios] Model profiles:', Object.keys(this.scenariosData.modelProfiles?.profiles || {}));
    console.log('[CinematicScenarios] Quick reference matrix:', Object.keys(this.scenariosData.quickReferenceMatrix || {}));
    return this.scenariosData;
  }

  public getBrandProfiles(): string[] {
    const data = this.loadScenariosData();
    return Object.keys(data.cinematicShootScenarios);
  }

  public getScenariosForBrand(brandKey: string): Record<string, CinematicScenario> {
    const data = this.loadScenariosData();
    const brandData = data.cinematicShootScenarios[brandKey];

    if (!brandData) {
      throw new Error(`Brand profile '${brandKey}' not found`);
    }

    return brandData.scenarios;
  }

  public getScenario(brandKey: string, scenarioKey: string): CinematicScenario {
    const scenarios = this.getScenariosForBrand(brandKey);
    const scenario = scenarios[scenarioKey];

    if (!scenario) {
      throw new Error(`Scenario '${scenarioKey}' not found for brand '${brandKey}'`);
    }

    return scenario;
  }

  /**
   * Get all available model profiles
   */
  public getModelProfiles(): Record<string, ModelProfile> {
    const data = this.loadScenariosData();
    return data.modelProfiles.profiles;
  }

  /**
   * Get a specific model profile by key
   */
  public getModelProfile(modelKey: string): ModelProfile | null {
    const profiles = this.getModelProfiles();
    return profiles[modelKey] || null;
  }

  /**
   * Get recommended models for a brand category from quickReferenceMatrix
   */
  public getRecommendedModels(brandKey: string): string[] {
    const data = this.loadScenariosData();
    return data.quickReferenceMatrix[brandKey] || [];
  }

  /**
   * Auto-select the best model for a brand category (first from quickReferenceMatrix)
   */
  public autoSelectModel(brandKey: string): ModelProfile | null {
    const recommended = this.getRecommendedModels(brandKey);
    if (recommended.length === 0) return null;

    const modelKey = recommended[0];
    return this.getModelProfile(modelKey);
  }

  /**
   * Build a complete prompt combining model profile + scenario + brand data + cinematic options.
   * Optimized for Runway's 512-char limit with front-loaded priority.
   */
  public buildPrompt(
    brandKey: string,
    scenarioKey: string,
    type: 'image' | 'video',
    options: {
      customDetails?: string;
      season?: 'spring' | 'summer' | 'fall' | 'winter';
      timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
      demographic?: 'youngAdult' | 'professional' | 'luxury' | 'athletic';
      designDescription?: string;
      modelKey?: string;
      // Brand profile data
      brandName?: string;
      brandTone?: string;
      targetAudience?: string;
      environment?: string;
      primaryColor?: string;
      secondaryColor?: string;
      lighting?: string;
      camera?: string;
      colorGrade?: string;
      pose?: string;
      atmosphere?: string;
      background?: string;
      framing?: string;
      cinematicIntelligence?: string;
      maxChars?: number;
    } = {}
  ): string {
    const data = this.loadScenariosData();
    const scenario = this.getScenario(brandKey, scenarioKey);

    const parts: string[] = [];

    // Get model - either user-selected or auto-selected from quickReferenceMatrix
    let modelProfile: ModelProfile | null = null;
    if (options.modelKey) {
      modelProfile = this.getModelProfile(options.modelKey);
    }
    if (!modelProfile) {
      modelProfile = this.autoSelectModel(brandKey);
    }

    // Priority 1: Model shorthand (~50 chars)
    if (modelProfile) {
      parts.push(modelProfile.shorthand);
    }

    // Priority 2: Scenario runwayPrompt from JSON (~150-213 chars)
    parts.push(scenario.runwayPrompt);

    // Priority 3: User's season/time/demographic (compact, ~60 chars combined)
    const cinematicParts: string[] = [];
    if (options.season && seasonDescriptors[options.season]) {
      cinematicParts.push(seasonDescriptors[options.season]);
    }
    if (options.timeOfDay && timeOfDayDescriptors[options.timeOfDay]) {
      cinematicParts.push(timeOfDayDescriptors[options.timeOfDay]);
    }
    if (options.demographic && demographicDescriptors[options.demographic]) {
      cinematicParts.push(demographicDescriptors[options.demographic]);
    }
    if (cinematicParts.length > 0) {
      parts.push(cinematicParts.join(', '));
    }

    const charLimit = options.maxChars || RUNWAY_MAX_CHARS;

    // Priority 4: Environment + targetAudience (included when budget allows)
    if (charLimit > RUNWAY_MAX_CHARS) {
      if (options.environment) {
        parts.push(`${options.environment.toLowerCase().replace(/_/g, ' ')} setting`);
      }
      if (options.targetAudience) {
        parts.push(`for ${options.targetAudience.toLowerCase().replace(/_/g, ' ')}`);
      }
    }

    // Priority 5: Brand name + tone + colors (compact)
    const brandParts: string[] = [];
    if (options.brandName) {
      brandParts.push(options.brandName);
    }
    if (options.brandTone) {
      brandParts.push(`${options.brandTone.toLowerCase()} tone`);
    }
    if (charLimit > RUNWAY_MAX_CHARS) {
      const colors = [options.primaryColor, options.secondaryColor].filter(Boolean);
      if (colors.length > 0) {
        brandParts.push(`${colors.join(' and ')} palette`);
      }
    }
    if (brandParts.length > 0) {
      parts.push(brandParts.join(', '));
    }

    // Priority 6: Custom details from user
    if (options.customDetails) {
      parts.push(options.customDetails);
    }

    // Priority 7: Brand-specific shortcut enhancement
    const brandShortcut = data.promptEnhancements.brandSpecificShortcuts[brandKey];
    if (brandShortcut) {
      parts.push(brandShortcut);
    }

    // Priority 8: Design description
    if (options.designDescription) {
      parts.push(`featuring ${options.designDescription}`);
    }

    // Priority 9: Quality keywords for images
    if (type === 'image' && charLimit > RUNWAY_MAX_CHARS) {
      parts.push('photorealistic, editorial lighting, magazine quality');
    }

    // Join and enforce char limit with controlled truncation
    let fullPrompt = parts.join(', ');
    if (fullPrompt.length > charLimit) {
      let truncated = fullPrompt.substring(0, charLimit);
      const lastBreak = Math.max(truncated.lastIndexOf(', '), truncated.lastIndexOf(' '));
      if (lastBreak > charLimit * 0.8) {
        truncated = truncated.substring(0, lastBreak);
      }
      console.log(`[CinematicScenarios] Prompt truncated from ${fullPrompt.length} to ${truncated.length} chars (limit: ${charLimit})`);
      fullPrompt = truncated;
    }

    console.log(`[CinematicScenarios] Brand: ${brandKey}, Scenario: ${scenarioKey}`);
    console.log(`[CinematicScenarios] Model: ${modelProfile?.shorthand || 'none'}`);
    console.log(`[CinematicScenarios] Cinematic: season=${options.season || 'none'}, time=${options.timeOfDay || 'none'}, demo=${options.demographic || 'none'}`);
    console.log(`[CinematicScenarios] Final prompt (${fullPrompt.length} chars):`, fullPrompt);

    return fullPrompt;
  }

  public getAllScenariosForBrand(brandKey: string): { key: string; scenario: CinematicScenario }[] {
    const scenarios = this.getScenariosForBrand(brandKey);
    return Object.entries(scenarios).map(([key, scenario]) => ({ key, scenario }));
  }

  // Helper method to map brand categories to scenario keys
  public getBrandKeyFromCategory(category: string): string {
    const categoryMappings: Record<string, string> = {
      // Database enum values (lowercased from UPPER_SNAKE_CASE)
      'streetwear': 'streetwear',
      'football': 'footballWear',
      'gymwear': 'gymwear',
      'old_money': 'luxuryOldMoney',
      'luxury': 'luxuryOldMoney',
      'minimal': 'lifestyle',
      'vintage': 'streetwear',
      'medical_wear': 'medicalWear',
      'y2k': 'streetwear',
      'techwear': 'streetwear',
      'oversized': 'streetwear',
      'retro_sports': 'footballWear',
      'preppy': 'luxuryOldMoney',
      // Human-readable aliases
      'medical': 'medicalWear',
      'medical wear': 'medicalWear',
      'healthcare': 'medicalWear',
      'sports': 'footballWear',
      'street': 'streetwear',
      'urban': 'streetwear',
      'formal': 'luxuryOldMoney',
      'business': 'luxuryOldMoney',
      'gym': 'gymwear',
      'fitness': 'gymwear',
      'athletic': 'gymwear',
      'activewear': 'gymwear',
      'artistic': 'artisticCreative',
      'creative': 'artisticCreative',
      'art': 'artisticCreative',
      'lifestyle': 'lifestyle',
      'casual': 'lifestyle',
      'everyday': 'lifestyle',
      // New direct mappings
      'ecommerce': 'ecommerce',
      'e-commerce': 'ecommerce',
      'cinematic': 'cinematic',
      'film': 'cinematic',
    };

    const normalizedCategory = category.toLowerCase().trim();
    return categoryMappings[normalizedCategory] || 'lifestyle'; // Default to lifestyle
  }
}

export const cinematicScenariosService = CinematicScenariosService.getInstance();
