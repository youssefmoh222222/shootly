import { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, Sparkles, Info, ChevronRight, Check, Camera, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Brand } from '../App';
import { ScenarioSelector, type ScenarioSelection } from './ScenarioSelector.tsx';
import { Button, Logo, FieldLabel } from './shootly-ui.tsx';

type ProductAnimation = 'rotation' | 'closeup' | 'pan' | 'lifestyle';

interface DesignUploadProps {
  brand: Brand | null;
  brands?: Brand[];
  onGenerate: (design: {
    frontImage: string;
    backImage?: string;
    customPrompt?: string;
    generationMode?: 'product' | 'cinematic';
    productAnimation?: ProductAnimation;
    designDescription?: string;
    scenarioData?: ScenarioSelection;
    contentType?: 'image' | 'video';
    generateForAll?: boolean;
  }) => void;
  onBack: () => void;
}

const productAnimations: { id: ProductAnimation; label: string; description: string }[] = [
  { id: 'rotation', label: 'Front to Back', description: 'Smooth turn from front to back view' },
  { id: 'closeup', label: 'Close-up', description: 'Macro detail of fabric and stitching' },
  { id: 'pan', label: 'Full Pan', description: 'Top-to-bottom reveal of the design' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Styled setting with subtle motion' },
];

const placeholders = [
  'Darker mood with dramatic lighting',
  'More movement, walking pose',
  'Night city vibe with light smoke',
];

export function DesignUpload({ brand, brands, onGenerate, onBack }: DesignUploadProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<'front' | 'back' | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customVibe, setCustomVibe] = useState('');
  const [currentPlaceholder] = useState(placeholders[Math.floor(Math.random() * placeholders.length)]);
  const [contentType, setContentType] = useState<'image' | 'video'>('video');
  const [scenarioData, setScenarioData] = useState<ScenarioSelection | null>(null);
  const [generationMode, setGenerationMode] = useState<'product' | 'cinematic'>('cinematic');
  const [selectedAnimation, setSelectedAnimation] = useState<ProductAnimation>('rotation');
  const [designDescription] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'front') setFrontImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'front') setFrontImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const ready = !!frontImage && (generationMode === 'product' || !!scenarioData);

  const DropZone = ({
    side,
    image,
    required,
  }: {
    side: 'front' | 'back';
    image: string | null;
    required?: boolean;
  }) => {
    const isFront = side === 'front';
    const label = isFront ? 'Front' : 'Back';
    return (
      <div>
        <FieldLabel hint={isFront ? undefined : 'recommended'}>
          {label} view {isFront && <span className="text-ink-faint font-normal">· required</span>}
        </FieldLabel>
        <input
          ref={isFront ? frontInputRef : backInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, side)}
          className="hidden"
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(side);
          }}
          onDragLeave={() => setIsDragging(null)}
          onDrop={(e) => handleDrop(e, side)}
          onClick={() => (isFront ? frontInputRef.current?.click() : backInputRef.current?.click())}
          className={`group relative w-full aspect-[3/4] rounded-3xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
            isDragging === side
              ? 'border-ink bg-paper scale-[1.01]'
              : image
              ? 'border-ink shadow-float'
              : 'border-dashed border-line bg-white hover:border-ink/30'
          }`}
        >
          {image ? (
            <>
              <img src={image} alt={`${side} design`} className="absolute inset-0 w-full h-full object-contain bg-paper-card" />
              <span className="absolute top-3 right-3 grid place-items-center w-7 h-7 rounded-full bg-white shadow-float">
                <Check size={15} className="text-ink" strokeWidth={3} />
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFront) setFrontImage(null);
                    else setBackImage(null);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-white text-ink px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-opacity"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                <span className="text-xs font-semibold text-white">{label.toLowerCase()}-design.png</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full p-6 text-center">
              <span className="grid place-items-center w-14 h-14 rounded-full bg-paper border border-line group-hover:scale-105 transition-transform">
                <Upload size={22} className="text-ink-soft" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">
                  {label} {required && <span className="text-ink-faint font-normal">· required</span>}
                </p>
                <p className="text-xs text-ink-faint mt-0.5">Drag &amp; drop or click to upload</p>
                <p className="text-[11px] text-ink-faint mt-1">PNG or JPG · high quality</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors shrink-0"
            >
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="w-px h-6 bg-line hidden sm:block" />
            <div className="hidden sm:block">
              <Logo size={30} />
            </div>
          </div>
          {brand && (
            <div className="flex items-center gap-2 shrink-0">
              {brand.logo ? (
                <img src={brand.logo} alt="" className="w-7 h-7 rounded-full object-cover border border-line" />
              ) : (
                <span className="grid place-items-center w-7 h-7 rounded-full grad text-white text-xs font-bold">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-semibold hidden sm:inline">{brand.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-faint mb-4">
            <span className="text-ink">Upload</span>
            <ChevronRight size={14} />
            <span className="text-ink-faint/60">Scene</span>
            <ChevronRight size={14} />
            <span className="text-ink-faint/60">Generate</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-3">Upload your design</h2>
          <p className="text-lg text-ink-soft mb-10 max-w-2xl">
            Add clear images of your garment. Front is required; back gives the AI a fuller, more accurate result.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            <DropZone side="front" image={frontImage} required />
            <DropZone side="back" image={backImage} />
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-line mb-10">
            <Info size={18} className="text-ink-faint shrink-0 mt-0.5" />
            <div className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">Best results:</span> use flat-lay or ghost-mannequin shots on a
              plain background, well-lit, with the full garment in frame.
            </div>
          </div>

          {/* Content type + mode (revealed once a front image exists) */}
          {frontImage && (
            <div className="space-y-8">
              {/* Output type */}
              <div>
                <FieldLabel>Output type</FieldLabel>
                <div className="inline-flex p-1 rounded-full bg-ink/[0.06] border border-line">
                  <button
                    onClick={() => {
                      setContentType('image');
                      setGenerationMode('cinematic');
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      contentType === 'image' ? 'bg-ink text-white shadow-float' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Camera size={15} /> Image
                  </button>
                  <button
                    onClick={() => setContentType('video')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      contentType === 'video' ? 'bg-ink text-white shadow-float' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Video size={15} /> Video
                  </button>
                </div>
              </div>

              {/* Generation mode */}
              <div>
                <FieldLabel>Generation mode</FieldLabel>
                <div className="inline-flex p-1 rounded-full bg-ink/[0.06] border border-line mb-2">
                  {contentType === 'video' && (
                    <button
                      onClick={() => setGenerationMode('product')}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                        generationMode === 'product' ? 'bg-ink text-white shadow-float' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      Product showcase
                    </button>
                  )}
                  <button
                    onClick={() => setGenerationMode('cinematic')}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      generationMode === 'cinematic' ? 'bg-ink text-white shadow-float' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Cinematic scene
                  </button>
                </div>
                <p className="text-sm text-ink-faint max-w-lg">
                  {generationMode === 'product'
                    ? 'Animates your uploaded design image — rotation, close-up, pan, or lifestyle shot.'
                    : 'AI-generated cinematic scene with a model — your design is described in the prompt.'}
                </p>
              </div>

              {/* Mode-specific options */}
              {generationMode === 'product' ? (
                <div>
                  <FieldLabel>Animation style</FieldLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {productAnimations.map((anim) => {
                      const active = selectedAnimation === anim.id;
                      return (
                        <button
                          key={anim.id}
                          onClick={() => setSelectedAnimation(anim.id)}
                          className={`text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[.98] ${
                            active
                              ? 'border-transparent bg-ink text-white shadow-float'
                              : 'border-line bg-white hover:border-ink/20 hover:-translate-y-0.5'
                          }`}
                        >
                          <p className={`font-bold text-sm mb-1 ${active ? 'text-white' : 'text-ink'}`}>{anim.label}</p>
                          <p className={`text-xs ${active ? 'text-white/65' : 'text-ink-faint'}`}>{anim.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : brand ? (
                <ScenarioSelector brand={brand} contentType={contentType} onScenarioSelect={setScenarioData} />
              ) : null}

              {/* PRO customization */}
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-ink">Customize the vibe</label>
                    <span className="px-2 py-0.5 grad text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                      Pro
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      showCustomization ? 'grad' : 'bg-ink/15'
                    }`}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                      style={{ transform: showCustomization ? 'translateX(26px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                <p className="text-sm text-ink-faint mb-3">The AI already understands your brand.</p>
                <AnimatePresence>
                  {showCustomization && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={customVibe}
                        onChange={(e) => setCustomVibe(e.target.value.slice(0, 200))}
                        placeholder={currentPlaceholder}
                        maxLength={200}
                        rows={3}
                        className="w-full px-4 py-3.5 bg-white border border-line rounded-2xl text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/80 focus:border-transparent transition-all resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-ink-faint">Short guidance only — no need to write a full description.</p>
                        <p className="text-xs text-ink-faint font-mono">{customVibe.length} / 200</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky footer */}
      <footer className="border-t border-line bg-paper/90 backdrop-blur sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className="text-sm text-ink-faint hidden sm:block">
            {!frontImage
              ? 'Upload a front view to continue'
              : ready
              ? 'Ready to generate'
              : 'Pick a scene to continue'}
          </span>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto">
            <Button
              variant="primary"
              className="text-sm"
              disabled={!ready}
              onClick={() =>
                onGenerate({
                  frontImage: frontImage!,
                  backImage: backImage || undefined,
                  customPrompt: customVibe || undefined,
                  generationMode,
                  productAnimation: generationMode === 'product' ? selectedAnimation : undefined,
                  designDescription: generationMode === 'cinematic' ? designDescription || undefined : undefined,
                  scenarioData: generationMode === 'cinematic' ? scenarioData || undefined : undefined,
                  contentType,
                })
              }
            >
              <Sparkles size={16} />
              {generationMode === 'product' ? 'Generate product video' : 'Generate photoshoot'}
            </Button>
            {brands && brands.length > 1 && (
              <Button
                variant="dark"
                className="text-sm"
                disabled={!ready}
                onClick={() =>
                  onGenerate({
                    frontImage: frontImage!,
                    backImage: backImage || undefined,
                    customPrompt: customVibe || undefined,
                    generationMode,
                    productAnimation: generationMode === 'product' ? selectedAnimation : undefined,
                    designDescription: generationMode === 'cinematic' ? designDescription || undefined : undefined,
                    scenarioData: generationMode === 'cinematic' ? scenarioData || undefined : undefined,
                    contentType,
                    generateForAll: true,
                  })
                }
              >
                <Sparkles size={16} /> All brands ({brands.length})
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
