import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Video, Clock, Users, Palette, ChevronDown, User, Sun, Aperture, Paintbrush, PersonStanding, Cloud, Layers, Scan, Clapperboard } from 'lucide-react';
import type { Brand } from '../App';

interface Scenario {
  key: string;
  name: string;
  description: string;
  bestFor: string;
}

interface ModelProfile {
  key: string;
  descriptor: string;
  bestFor: string;
  shorthand: string;
}

interface ScenarioSelectorProps {
  brand: Brand;
  onScenarioSelect: (scenarioData: ScenarioSelection) => void;
  contentType: 'image' | 'video';
}

export interface ScenarioSelection {
  scenarioKey: string;
  seasonalAdaptation?: 'spring' | 'summer' | 'fall' | 'winter';
  timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
  demographic?: 'youngAdult' | 'professional' | 'luxury' | 'athletic';
  customDetails?: string;
  modelKey?: string;
  lighting?: string;
  camera?: string;
  colorGrade?: string;
  pose?: string;
  atmosphere?: string;
  background?: string;
  framing?: string;
  cinematicIntelligence?: string;
}

const seasonOptions = [
  { value: 'spring', label: 'Spring', description: 'Fresh, renewal themes' },
  { value: 'summer', label: 'Summer', description: 'Bright, vacation vibes' },
  { value: 'fall', label: 'Fall', description: 'Warm, cozy atmospheres' },
  { value: 'winter', label: 'Winter', description: 'Crisp, luxury textures' }
];

const timeOptions = [
  { value: 'morning', label: 'Morning', description: 'Soft dawn lighting' },
  { value: 'midday', label: 'Midday', description: 'Bright clear lighting' },
  { value: 'evening', label: 'Evening', description: 'Warm golden lighting' },
  { value: 'night', label: 'Night', description: 'Dramatic evening mood' }
];

const demographicOptions = [
  { value: 'youngAdult', label: 'Young Adult', description: 'Trendy, social media ready' },
  { value: 'professional', label: 'Professional', description: 'Corporate, refined' },
  { value: 'luxury', label: 'Luxury', description: 'Upscale, sophisticated' },
  { value: 'athletic', label: 'Athletic', description: 'Performance, active' }
];

const lightingOptions = [
  { value: 'natural', label: 'Natural', description: 'Soft window light' },
  { value: 'studio', label: 'Studio', description: 'Even softbox lighting' },
  { value: 'dramatic', label: 'Dramatic', description: 'Rim light, deep shadows' },
  { value: 'neon', label: 'Neon', description: 'Vibrant colored glow' },
  { value: 'golden', label: 'Golden Hour', description: 'Warm backlight, flare' },
  { value: 'flash', label: 'Flash', description: 'Harsh on-camera flash' }
];

const cameraOptions = [
  { value: 'wide', label: 'Wide 35mm', description: 'Full scene context' },
  { value: 'standard', label: 'Standard 50mm', description: 'Natural perspective' },
  { value: 'portrait', label: 'Portrait 85mm', description: 'Shallow DOF, bokeh' },
  { value: 'macro', label: 'Macro', description: 'Extreme fabric detail' },
  { value: 'cinematic', label: 'Anamorphic', description: 'Cinematic widescreen' }
];

const colorGradeOptions = [
  { value: 'clean', label: 'Clean', description: 'True-to-life neutral' },
  { value: 'warm', label: 'Warm Film', description: 'Kodak Portra tones' },
  { value: 'cool', label: 'Cool', description: 'Blue shadows, desaturated' },
  { value: 'moody', label: 'Moody', description: 'Crushed blacks, contrast' },
  { value: 'bw', label: 'B&W', description: 'High contrast mono' },
  { value: 'vintage', label: 'Vintage', description: 'Faded film, grain' }
];

const poseOptions = [
  { value: 'confident', label: 'Confident', description: 'Standing, direct gaze' },
  { value: 'walking', label: 'Walking', description: 'Mid-stride, casual' },
  { value: 'seated', label: 'Seated', description: 'Relaxed, natural' },
  { value: 'dynamic', label: 'Dynamic', description: 'Action, movement' },
  { value: 'candid', label: 'Candid', description: 'Unposed, authentic' },
  { value: 'editorial', label: 'Editorial', description: 'Angular, striking' }
];

const atmosphereOptions = [
  { value: 'clear', label: 'Clear', description: 'Crisp and sharp' },
  { value: 'haze', label: 'Haze', description: 'Soft dreamy fog' },
  { value: 'rain', label: 'Rain', description: 'Wet streets, reflections' },
  { value: 'smoke', label: 'Smoke', description: 'Mist, atmospheric depth' },
  { value: 'dust', label: 'Dust', description: 'Particles, light beams' },
  { value: 'snow', label: 'Snow', description: 'Snowfall, frosted' }
];

const backgroundOptions = [
  { value: 'studio', label: 'Studio', description: 'Seamless backdrop' },
  { value: 'urban', label: 'Urban', description: 'City, concrete' },
  { value: 'nature', label: 'Nature', description: 'Trees, sky, landscape' },
  { value: 'interior', label: 'Interior', description: 'Designed space' },
  { value: 'abstract', label: 'Abstract', description: 'Color wash, artistic' },
  { value: 'minimal', label: 'Minimal', description: 'Negative space, simple' }
];

const framingOptions = [
  { value: 'fullBody', label: 'Full Body', description: 'Head to toe' },
  { value: 'threeQuarter', label: '3/4 Length', description: 'Head to knees' },
  { value: 'waistUp', label: 'Waist Up', description: 'Upper body focus' },
  { value: 'headshot', label: 'Headshot', description: 'Face and shoulders' },
  { value: 'detail', label: 'Detail', description: 'Garment close-up' }
];

const cinematicIntelligenceOptions = [
  { value: 'filmNoir', label: 'Film Noir', description: 'Shadows, mystery, contrast' },
  { value: 'goldenHollywood', label: 'Golden Hollywood', description: 'Glamour, studio glow' },
  { value: 'neonCyberpunk', label: 'Neon Cyberpunk', description: 'Futuristic, neon-soaked' },
  { value: 'indieFilm', label: 'Indie Film', description: 'Intimate, natural, raw' },
  { value: 'musicVideo', label: 'Music Video', description: 'Stylized, bold, performative' },
  { value: 'epicCampaign', label: 'Epic Campaign', description: 'Sweeping, aspirational' }
];

const API_URL = import.meta.env.DEV ? '/api' : 'https://youssefmoh222222-shootly.vercel.app/api';

// Derive a category from vibe when the brand has no explicit category
const vibeToCategory: Record<string, string> = {
  'streetwear': 'STREETWEAR',
  'sports': 'GYMWEAR',
  'minimal': 'MINIMAL',
};

export function ScenarioSelector({ brand, onScenarioSelect, contentType }: ScenarioSelectorProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [seasonalAdaptation, setSeasonalAdaptation] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [demographic, setDemographic] = useState<string>('');
  const [customDetails, setCustomDetails] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedModels, setRecommendedModels] = useState<ModelProfile[]>([]);
  const [allModels, setAllModels] = useState<ModelProfile[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAllModels, setShowAllModels] = useState<boolean>(false);
  const [lighting, setLighting] = useState<string>('');
  const [camera, setCamera] = useState<string>('');
  const [colorGrade, setColorGrade] = useState<string>('');
  const [pose, setPose] = useState<string>('');
  const [atmosphere, setAtmosphere] = useState<string>('');
  const [background, setBackground] = useState<string>('');
  const [framing, setFraming] = useState<string>('');
  const [cinematicIntelligence, setCinematicIntelligence] = useState<string>('');

  const effectiveCategory = brand.category || vibeToCategory[brand.vibe] || 'STREETWEAR';

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const response = await fetch(`${API_URL}/scenarios?category=${encodeURIComponent(effectiveCategory)}&models=true`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ai_clothing_studio_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setScenarios(data.data.scenarios || []);
          setRecommendedModels(data.data.recommendedModels || []);
          setAllModels(data.data.allModels || []);
          // Auto-select the first recommended model
          if (data.data.recommendedModels?.length > 0) {
            setSelectedModel(data.data.recommendedModels[0].key);
          }
        }
      } catch (error) {
        console.error('Failed to load scenarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, [effectiveCategory]);

  useEffect(() => {
    if (selectedScenario) {
      onScenarioSelect({
        scenarioKey: selectedScenario,
        seasonalAdaptation: seasonalAdaptation as any,
        timeOfDay: timeOfDay as any,
        demographic: demographic as any,
        customDetails: customDetails || undefined,
        modelKey: selectedModel || undefined,
        lighting: lighting || undefined,
        camera: camera || undefined,
        colorGrade: colorGrade || undefined,
        pose: pose || undefined,
        atmosphere: atmosphere || undefined,
        background: background || undefined,
        framing: framing || undefined,
        cinematicIntelligence: cinematicIntelligence || undefined,
      });
    }
  }, [selectedScenario, seasonalAdaptation, timeOfDay, demographic, customDetails, selectedModel, lighting, camera, colorGrade, pose, atmosphere, background, framing, cinematicIntelligence, onScenarioSelect]);

  const displayModels = showAllModels ? allModels : recommendedModels;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-neutral-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Scenario Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {contentType === 'video' ? (
            <Video className="w-5 h-5 text-neutral-600" />
          ) : (
            <Camera className="w-5 h-5 text-neutral-600" />
          )}
          <h3 className="text-lg font-semibold">
            Choose Cinematic Style
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((scenario) => (
            <motion.button
              key={scenario.key}
              onClick={() => setSelectedScenario(scenario.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedScenario === scenario.key
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold mb-1">{scenario.name}</div>
              <div className="text-sm text-neutral-600 mb-2">{scenario.description}</div>
              <div className="text-xs text-neutral-500">Best for: {scenario.bestFor}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {selectedScenario && displayModels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neutral-600" />
              <h3 className="text-lg font-semibold">Choose Model</h3>
            </div>
            {allModels.length > recommendedModels.length && (
              <button
                onClick={() => setShowAllModels(!showAllModels)}
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                {showAllModels ? 'Show Recommended' : `Show All (${allModels.length})`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Auto option */}
            <motion.button
              onClick={() => setSelectedModel('')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                !selectedModel
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-sm">Auto Select</div>
              <div className="text-xs text-neutral-500">Best match for your brand</div>
            </motion.button>

            {displayModels.map((model) => (
              <motion.button
                key={model.key}
                onClick={() => setSelectedModel(model.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedModel === model.key
                    ? 'border-black bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-semibold text-sm">{model.shorthand}</div>
                <div className="text-xs text-neutral-500 mt-1">{model.bestFor}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Advanced Options */}
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors mb-4"
          >
            <span className="font-medium">Director Controls</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pl-4 border-l-2 border-neutral-100"
              >
                {/* Season */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Season & Mood</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {seasonOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSeasonalAdaptation(
                          seasonalAdaptation === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          seasonalAdaptation === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time of Day */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Time of Day</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTimeOfDay(
                          timeOfDay === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          timeOfDay === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Demographic */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Target Audience</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {demographicOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDemographic(
                          demographic === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          demographic === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cinematic Intelligence */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clapperboard className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Cinematic Intelligence</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cinematicIntelligenceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCinematicIntelligence(
                          cinematicIntelligence === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          cinematicIntelligence === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Lighting</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {lightingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLighting(
                          lighting === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          lighting === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera / Lens */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Aperture className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Camera / Lens</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cameraOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCamera(
                          camera === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          camera === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framing */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Scan className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Framing</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {framingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFraming(
                          framing === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          framing === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Grade */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Paintbrush className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Color Grade</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {colorGradeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setColorGrade(
                          colorGrade === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          colorGrade === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pose & Expression */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PersonStanding className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Pose & Expression</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {poseOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPose(
                          pose === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          pose === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Atmosphere */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Atmosphere</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {atmosphereOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAtmosphere(
                          atmosphere === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          atmosphere === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Style */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-neutral-600" />
                    <label className="text-sm font-medium">Background Style</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBackground(
                          background === option.value ? '' : option.value
                        )}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          background === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Details */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value.slice(0, 150))}
                    placeholder="e.g., Focus on fabric texture, urban background, dramatic shadows..."
                    maxLength={150}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-neutral-400 font-mono">
                      {customDetails.length} / 150
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
