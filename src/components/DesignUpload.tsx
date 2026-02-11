import { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Brand } from '../App';
import { ScenarioSelector, type ScenarioSelection } from './ScenarioSelector.tsx';

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

const photoshootStyles = [
  { id: 'urban', label: 'Urban street look', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9' },
  { id: 'studio', label: 'Studio clean look', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c' },
  { id: 'cinematic', label: 'Cinematic video', image: 'https://images.unsplash.com/photo-1558769132-cb1aea9c8b7f' }
];

const placeholders = [
  'Darker mood with dramatic lighting',
  'More movement, walking pose',
  'Night city vibe with light smoke'
];

export function DesignUpload({ brand, brands, onGenerate, onBack }: DesignUploadProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<'front' | 'back' | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customVibe, setCustomVibe] = useState('');
  const [currentPlaceholder] = useState(placeholders[Math.floor(Math.random() * placeholders.length)]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [contentType, setContentType] = useState<'image' | 'video'>('video');
  const [scenarioData, setScenarioData] = useState<ScenarioSelection | null>(null);
  const [generationMode, setGenerationMode] = useState<'product' | 'cinematic'>('cinematic');
  const [selectedAnimation, setSelectedAnimation] = useState<ProductAnimation>('rotation');
  const [designDescription, setDesignDescription] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setIsDragging(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'front') {
          setFrontImage(reader.result as string);
        } else {
          setBackImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'front') {
          setFrontImage(reader.result as string);
        } else {
          setBackImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const DropZone = ({
    side,
    image,
    required
  }: {
    side: 'front' | 'back';
    image: string | null;
    required?: boolean;
  }) => (
    <div className="relative">
      <input
        ref={side === 'front' ? frontInputRef : backInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, side)}
        className="hidden"
      />

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(side);
        }}
        onDragLeave={() => setIsDragging(null)}
        onDrop={(e) => handleDrop(e, side)}
        onClick={() =>
          side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()
        }
        className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${
          isDragging === side
            ? 'border-black bg-neutral-50 scale-[1.02]'
            : image
            ? 'border-transparent'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
        }`}
        whileHover={!image ? { scale: 1.01 } : {}}
      >
        {image ? (
          <div className="relative w-full h-full group">
            <img src={image} alt={`${side} design`} className="w-full h-full object-contain bg-neutral-100" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (side === 'front') setFrontImage(null);
                  else setBackImage(null);
                }}
                className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                Remove
              </motion.button>
            </div>
            {/* Design Ready Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-sm font-semibold text-black mb-0.5">Design ready</p>
              <p className="text-xs text-neutral-600">AI is preparing the photoshoot setup</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="font-semibold text-lg mb-3">
              Drag & drop your design here
            </p>
            <p className="text-sm text-neutral-500 mb-2">
              or click to upload
            </p>
            <p className="text-xs text-neutral-400">PNG or JPG · High quality recommended</p>
          </div>
        )}
      </motion.div>

      {image && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 w-9 h-9 bg-black rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Brand Context Card */}
          {brand && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-6 bg-neutral-50 rounded-3xl border border-neutral-100"
            >
              <div className="flex items-start gap-4">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    className="w-12 h-12 rounded-full flex-shrink-0 object-contain bg-white border border-neutral-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex-shrink-0 bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-400">{brand.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showTooltip && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-6 top-0 w-64 bg-black text-white text-xs px-4 py-2 rounded-xl shadow-xl z-10"
                          >
                            Your brand style is automatically used in every photoshoot.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">Brand identity applied</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Style</p>
                      <p className="text-sm font-medium capitalize">{brand.vibe}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Target audience</p>
                      <p className="text-sm font-medium">Gen Z / Millennials</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Primary platform</p>
                      <p className="text-sm font-medium capitalize">{brand.platform}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-3"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Upload your design
            </h2>
            <p className="text-lg text-neutral-500">
              Front and back supported
            </p>
          </motion.div>

          {/* Upload Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto"
          >
            <DropZone side="front" image={frontImage} required />
            <DropZone side="back" image={backImage} />
          </motion.div>

          {/* Content Type & Cinematic Mode Selection */}
          {frontImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 max-w-4xl mx-auto"
            >
              {/* Content Type Toggle */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">
                  Choose Content Type
                </h3>
                <div className="flex justify-center gap-2 p-1 bg-neutral-100 rounded-2xl max-w-md mx-auto">
                  <button
                    onClick={() => { setContentType('image'); setGenerationMode('cinematic'); }}
                    className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                      contentType === 'image'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    📸 Images
                  </button>
                  <button
                    onClick={() => setContentType('video')}
                    className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                      contentType === 'video'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

              {/* Generation Mode Selector */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">
                  Generation Mode
                </h3>
                <div className="flex justify-center gap-2 p-1 bg-neutral-100 rounded-2xl max-w-lg mx-auto mb-2">
                  {contentType === 'video' && (
                    <button
                      onClick={() => setGenerationMode('product')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                        generationMode === 'product'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Product Showcase
                    </button>
                  )}
                  <button
                    onClick={() => setGenerationMode('cinematic')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      generationMode === 'cinematic'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Cinematic Scene
                  </button>
                </div>
                <p className="text-xs text-neutral-500 text-center max-w-lg mx-auto mb-6">
                  {generationMode === 'product'
                    ? 'Animates your uploaded design image — rotation, close-up, pan, or lifestyle shot'
                    : 'AI-generated cinematic scene with a model — your design is described in the prompt'}
                </p>
              </div>

              {/* Mode-specific options */}
              {generationMode === 'product' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Animation Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {productAnimations.map((anim) => (
                      <motion.button
                        key={anim.id}
                        onClick={() => setSelectedAnimation(anim.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedAnimation === anim.id
                            ? 'border-black bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-semibold text-sm mb-1">{anim.label}</p>
                        <p className="text-xs text-neutral-500">{anim.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : brand ? (
                <>
                  <ScenarioSelector
                    brand={brand}
                    contentType={contentType}
                    onScenarioSelect={setScenarioData}
                  />

                </>
              ) : null}
            </motion.div>
          )}

          {/* PRO Customization Toggle */}
          {frontImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold">
                    Customize the vibe (optional)
                  </label>
                  <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded-md">
                    PRO
                  </span>
                </div>
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showCustomization ? 'bg-black' : 'bg-neutral-300'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                    animate={{ x: showCustomization ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="text-sm text-neutral-500 mb-4">
                The AI already understands your brand.
              </p>

              <AnimatePresence>
                {showCustomization && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Add small tweaks (optional)
                      </label>
                      <textarea
                        value={customVibe}
                        onChange={(e) => setCustomVibe(e.target.value.slice(0, 200))}
                        placeholder={currentPlaceholder}
                        maxLength={200}
                        rows={3}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-neutral-500">
                          Short guidance only — no need to write a full description.
                        </p>
                        <p className="text-xs text-neutral-400 font-mono">
                          {customVibe.length} / 200
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Generate Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-4"
          >
            <motion.button
              onClick={() => onGenerate({
                frontImage: frontImage!,
                backImage: backImage || undefined,
                customPrompt: customVibe || undefined,
                generationMode,
                productAnimation: generationMode === 'product' ? selectedAnimation : undefined,
                designDescription: generationMode === 'cinematic' ? designDescription || undefined : undefined,
                scenarioData: generationMode === 'cinematic' ? scenarioData || undefined : undefined,
                contentType
              })}
              disabled={!frontImage || (generationMode === 'cinematic' && !scenarioData)}
              className="inline-flex flex-col items-center gap-2 bg-black text-white px-12 py-5 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
              whileHover={frontImage && (generationMode === 'product' || scenarioData) ? { scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
              whileTap={frontImage && (generationMode === 'product' || scenarioData) ? { scale: 0.98 } : {}}
            >
              <span className="flex items-center gap-3 text-lg">
                <Sparkles className="w-5 h-5" />
                {generationMode === 'product' ? 'Generate Product Video' : 'Generate AI Photoshoot'}
              </span>
              <span className="text-sm opacity-80">
                For selected brand only
              </span>
            </motion.button>

            {/* Generate for All Brands */}
            {brands && brands.length > 1 && (
              <div>
                <motion.button
                  onClick={() => onGenerate({
                    frontImage: frontImage!,
                    backImage: backImage || undefined,
                    customPrompt: customVibe || undefined,
                    generationMode,
                    productAnimation: generationMode === 'product' ? selectedAnimation : undefined,
                    designDescription: generationMode === 'cinematic' ? designDescription || undefined : undefined,
                    scenarioData: generationMode === 'cinematic' ? scenarioData || undefined : undefined,
                    contentType,
                    generateForAll: true,
                  })}
                  disabled={!frontImage || (generationMode === 'cinematic' && !scenarioData)}
                  className="inline-flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                  whileHover={frontImage && (generationMode === 'product' || scenarioData) ? { scale: 1.02, boxShadow: '0 20px 40px rgba(147,51,234,0.2)' } : {}}
                  whileTap={frontImage && (generationMode === 'product' || scenarioData) ? { scale: 0.98 } : {}}
                >
                  <span className="flex items-center gap-3 text-lg">
                    <Sparkles className="w-5 h-5" />
                    Generate for All Brands ({brands.length})
                  </span>
                  <span className="text-sm opacity-80">
                    Each brand gets its own unique prompt and style
                  </span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
