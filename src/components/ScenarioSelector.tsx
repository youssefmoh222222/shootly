import { useState, useEffect } from 'react';
import {
  Camera,
  Video,
  Clock,
  Users,
  Palette,
  Sun,
  Aperture,
  Paintbrush,
  PersonStanding,
  Cloud,
  Layers,
  Scan,
  Clapperboard,
  Check,
  Wand,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import type { Brand } from '../App';
import { FieldLabel, Opt } from './shootly-ui.tsx';

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

type Option = { value: string; label: string; description: string };

const seasonOptions: Option[] = [
  { value: 'spring', label: 'Spring', description: 'Fresh, renewal themes' },
  { value: 'summer', label: 'Summer', description: 'Bright, vacation vibes' },
  { value: 'fall', label: 'Fall', description: 'Warm, cozy atmospheres' },
  { value: 'winter', label: 'Winter', description: 'Crisp, luxury textures' },
];

const timeOptions: Option[] = [
  { value: 'morning', label: 'Morning', description: 'Soft dawn lighting' },
  { value: 'midday', label: 'Midday', description: 'Bright clear lighting' },
  { value: 'evening', label: 'Evening', description: 'Warm golden lighting' },
  { value: 'night', label: 'Night', description: 'Dramatic evening mood' },
];

const demographicOptions: Option[] = [
  { value: 'youngAdult', label: 'Young Adult', description: 'Trendy, social media ready' },
  { value: 'professional', label: 'Professional', description: 'Corporate, refined' },
  { value: 'luxury', label: 'Luxury', description: 'Upscale, sophisticated' },
  { value: 'athletic', label: 'Athletic', description: 'Performance, active' },
];

const lightingOptions: Option[] = [
  { value: 'natural', label: 'Natural', description: 'Soft window light' },
  { value: 'studio', label: 'Studio', description: 'Even softbox lighting' },
  { value: 'dramatic', label: 'Dramatic', description: 'Rim light, deep shadows' },
  { value: 'neon', label: 'Neon', description: 'Vibrant colored glow' },
  { value: 'golden', label: 'Golden Hour', description: 'Warm backlight, flare' },
  { value: 'flash', label: 'Flash', description: 'Harsh on-camera flash' },
];

const cameraOptions: Option[] = [
  { value: 'wide', label: 'Wide 35mm', description: 'Full scene context' },
  { value: 'standard', label: 'Standard 50mm', description: 'Natural perspective' },
  { value: 'portrait', label: 'Portrait 85mm', description: 'Shallow DOF, bokeh' },
  { value: 'macro', label: 'Macro', description: 'Extreme fabric detail' },
  { value: 'cinematic', label: 'Anamorphic', description: 'Cinematic widescreen' },
];

const colorGradeOptions: Option[] = [
  { value: 'clean', label: 'Clean', description: 'True-to-life neutral' },
  { value: 'warm', label: 'Warm Film', description: 'Kodak Portra tones' },
  { value: 'cool', label: 'Cool', description: 'Blue shadows, desaturated' },
  { value: 'moody', label: 'Moody', description: 'Crushed blacks, contrast' },
  { value: 'bw', label: 'B&W', description: 'High contrast mono' },
  { value: 'vintage', label: 'Vintage', description: 'Faded film, grain' },
];

const poseOptions: Option[] = [
  { value: 'confident', label: 'Confident', description: 'Standing, direct gaze' },
  { value: 'walking', label: 'Walking', description: 'Mid-stride, casual' },
  { value: 'seated', label: 'Seated', description: 'Relaxed, natural' },
  { value: 'dynamic', label: 'Dynamic', description: 'Action, movement' },
  { value: 'candid', label: 'Candid', description: 'Unposed, authentic' },
  { value: 'editorial', label: 'Editorial', description: 'Angular, striking' },
];

const atmosphereOptions: Option[] = [
  { value: 'clear', label: 'Clear', description: 'Crisp and sharp' },
  { value: 'haze', label: 'Haze', description: 'Soft dreamy fog' },
  { value: 'rain', label: 'Rain', description: 'Wet streets, reflections' },
  { value: 'smoke', label: 'Smoke', description: 'Mist, atmospheric depth' },
  { value: 'dust', label: 'Dust', description: 'Particles, light beams' },
  { value: 'snow', label: 'Snow', description: 'Snowfall, frosted' },
];

const backgroundOptions: Option[] = [
  { value: 'studio', label: 'Studio', description: 'Seamless backdrop' },
  { value: 'urban', label: 'Urban', description: 'City, concrete' },
  { value: 'nature', label: 'Nature', description: 'Trees, sky, landscape' },
  { value: 'interior', label: 'Interior', description: 'Designed space' },
  { value: 'abstract', label: 'Abstract', description: 'Color wash, artistic' },
  { value: 'minimal', label: 'Minimal', description: 'Negative space, simple' },
];

const framingOptions: Option[] = [
  { value: 'fullBody', label: 'Full Body', description: 'Head to toe' },
  { value: 'threeQuarter', label: '3/4 Length', description: 'Head to knees' },
  { value: 'waistUp', label: 'Waist Up', description: 'Upper body focus' },
  { value: 'headshot', label: 'Headshot', description: 'Face and shoulders' },
  { value: 'detail', label: 'Detail', description: 'Garment close-up' },
];

const cinematicIntelligenceOptions: Option[] = [
  { value: 'filmNoir', label: 'Film Noir', description: 'Shadows, mystery, contrast' },
  { value: 'goldenHollywood', label: 'Golden Hollywood', description: 'Glamour, studio glow' },
  { value: 'neonCyberpunk', label: 'Neon Cyberpunk', description: 'Futuristic, neon-soaked' },
  { value: 'indieFilm', label: 'Indie Film', description: 'Intimate, natural, raw' },
  { value: 'musicVideo', label: 'Music Video', description: 'Stylized, bold, performative' },
  { value: 'epicCampaign', label: 'Epic Campaign', description: 'Sweeping, aspirational' },
];

const API_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://shootly-z6o8.vercel.app/api';

const vibeToCategory: Record<string, string> = {
  streetwear: 'STREETWEAR',
  sports: 'GYMWEAR',
  minimal: 'MINIMAL',
};

const PH_FILLS = ['ph-a', 'ph-d', 'ph-e', 'ph-f', 'ph-b', 'ph-c'];

export function ScenarioSelector({ brand, onScenarioSelect, contentType }: ScenarioSelectorProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [seasonalAdaptation, setSeasonalAdaptation] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [demographic, setDemographic] = useState<string>('');
  const [customDetails, setCustomDetails] = useState<string>('');
  const [aiDirect, setAiDirect] = useState<boolean>(true);
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
        const response = await fetch(
          `${API_URL}/scenarios?category=${encodeURIComponent(effectiveCategory)}&models=true`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('ai_clothing_studio_token')}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setScenarios(data.data.scenarios || []);
          setRecommendedModels(data.data.recommendedModels || []);
          setAllModels(data.data.allModels || []);
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

  // Emit selection upward. Director controls are only included when the user
  // has turned off "AI directs everything".
  useEffect(() => {
    if (!selectedScenario) return;
    const manual = !aiDirect;
    onScenarioSelect({
      scenarioKey: selectedScenario,
      modelKey: selectedModel || undefined,
      customDetails: customDetails || undefined,
      seasonalAdaptation: manual ? (seasonalAdaptation as any) || undefined : undefined,
      timeOfDay: manual ? (timeOfDay as any) || undefined : undefined,
      demographic: manual ? (demographic as any) || undefined : undefined,
      lighting: manual ? lighting || undefined : undefined,
      camera: manual ? camera || undefined : undefined,
      colorGrade: manual ? colorGrade || undefined : undefined,
      pose: manual ? pose || undefined : undefined,
      atmosphere: manual ? atmosphere || undefined : undefined,
      background: manual ? background || undefined : undefined,
      framing: manual ? framing || undefined : undefined,
      cinematicIntelligence: manual ? cinematicIntelligence || undefined : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedScenario,
    aiDirect,
    seasonalAdaptation,
    timeOfDay,
    demographic,
    customDetails,
    selectedModel,
    lighting,
    camera,
    colorGrade,
    pose,
    atmosphere,
    background,
    framing,
    cinematicIntelligence,
  ]);

  const displayModels = showAllModels ? allModels : recommendedModels;

  // Generic chip group
  const ChipGroup = ({
    icon,
    label,
    options,
    value,
    onChange,
  }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    options: Option[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? '' : o.value)}
              title={o.description}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-all active:scale-95 ${
                active ? 'bg-ink text-white border-ink' : 'bg-white text-ink-soft border-line hover:border-ink/25'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-ink/[0.06] rounded-2xl mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-ink/[0.06] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Cinematic scenarios */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          {contentType === 'video' ? (
            <Video size={18} className="text-ink" />
          ) : (
            <Camera size={18} className="text-ink" />
          )}
          <h3 className="text-lg font-bold tracking-tight">Cinematic scenarios</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {scenarios.map((scenario, i) => {
            const active = selectedScenario === scenario.key;
            return (
              <button
                key={scenario.key}
                type="button"
                onClick={() => setSelectedScenario(scenario.key)}
                className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                  active ? 'border-ink -translate-y-1 shadow-deep' : 'border-transparent hover:-translate-y-0.5 shadow-float'
                }`}
              >
                <div className={`frame figure aspect-[4/5] ${PH_FILLS[i % PH_FILLS.length]}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {active && (
                    <span className="absolute top-2.5 right-2.5 grid place-items-center w-7 h-7 rounded-full bg-white shadow-float">
                      <Check size={15} className="text-ink" strokeWidth={3} />
                    </span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/65 mb-0.5 truncate">
                      {scenario.bestFor}
                    </div>
                    <div className="text-sm font-bold text-white leading-tight">{scenario.name}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Model selection */}
      {selectedScenario && displayModels.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-ink" />
              <h3 className="text-lg font-bold tracking-tight">Choose model</h3>
            </div>
            {allModels.length > recommendedModels.length && (
              <button
                onClick={() => setShowAllModels(!showAllModels)}
                className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                {showAllModels ? 'Show recommended' : `Show all (${allModels.length})`}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Opt
              compact
              active={!selectedModel}
              onClick={() => setSelectedModel('')}
              title="Auto select"
              desc="Best match for your brand"
            />
            {displayModels.map((model) => (
              <Opt
                key={model.key}
                compact
                active={selectedModel === model.key}
                onClick={() => setSelectedModel(model.key)}
                title={model.shorthand}
                desc={model.bestFor}
              />
            ))}
          </div>
        </section>
      )}

      {/* Director controls */}
      {selectedScenario && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-ink" />
              <h3 className="text-lg font-bold tracking-tight">Director controls</h3>
            </div>
            <button
              onClick={() => setAiDirect((a) => !a)}
              className={`flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full border text-sm font-semibold transition-all ${
                aiDirect ? 'grad text-white border-transparent shadow-float' : 'bg-white text-ink-soft border-line hover:border-ink/25'
              }`}
            >
              <span className={`grid place-items-center w-6 h-6 rounded-full ${aiDirect ? 'bg-white/20' : 'bg-ink/[0.06]'}`}>
                <Wand size={13} className={aiDirect ? 'text-white' : 'text-ink-soft'} />
              </span>
              AI directs everything
            </button>
          </div>

          <div
            className={`relative grid sm:grid-cols-2 gap-x-6 gap-y-6 transition-opacity ${
              aiDirect ? 'opacity-40 pointer-events-none select-none' : ''
            }`}
          >
            <ChipGroup icon={Sun} label="Lighting" options={lightingOptions} value={lighting} onChange={setLighting} />
            <ChipGroup icon={Aperture} label="Lens & framing" options={cameraOptions} value={camera} onChange={setCamera} />
            <ChipGroup icon={Paintbrush} label="Color grade" options={colorGradeOptions} value={colorGrade} onChange={setColorGrade} />
            <ChipGroup icon={PersonStanding} label="Pose & energy" options={poseOptions} value={pose} onChange={setPose} />
            <ChipGroup icon={Cloud} label="Atmosphere" options={atmosphereOptions} value={atmosphere} onChange={setAtmosphere} />
            <ChipGroup icon={Clock} label="Time of day" options={timeOptions} value={timeOfDay} onChange={setTimeOfDay} />
            <ChipGroup icon={Scan} label="Framing" options={framingOptions} value={framing} onChange={setFraming} />
            <ChipGroup icon={Layers} label="Background" options={backgroundOptions} value={background} onChange={setBackground} />
            <ChipGroup icon={Palette} label="Season & mood" options={seasonOptions} value={seasonalAdaptation} onChange={setSeasonalAdaptation} />
            <ChipGroup icon={Users} label="Target audience" options={demographicOptions} value={demographic} onChange={setDemographic} />
            <div className="sm:col-span-2">
              <ChipGroup
                icon={Clapperboard}
                label="Cinematic intelligence"
                options={cinematicIntelligenceOptions}
                value={cinematicIntelligence}
                onChange={setCinematicIntelligence}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel hint="optional">Additional details</FieldLabel>
              <textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value.slice(0, 150))}
                placeholder="e.g. focus on fabric texture, urban background, dramatic shadows…"
                maxLength={150}
                rows={2}
                className="w-full px-4 py-3.5 bg-white border border-line rounded-2xl text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/80 focus:border-transparent transition-all resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-ink-faint font-mono">{customDetails.length} / 150</span>
              </div>
            </div>

            {aiDirect && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2.5 rounded-full border border-line shadow-float pointer-events-none">
                  <Wand size={16} className="text-ink" />
                  <span className="text-sm font-semibold text-ink">AI is directing — toggle off to customize</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
