import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Brand } from '../App';

interface BrandWizardProps {
  onComplete: (brand: Brand) => void;
  onCancel: () => void;
  isPostSignup?: boolean;
  editingBrand?: Brand | null;
}

const categoryGroups = [
  {
    group: 'Sports & Performance',
    styles: [
      { id: 'football', label: 'Football', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55' },
      { id: 'gymwear', label: 'Gymwear', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' }
    ]
  },
  {
    group: 'Fashion & Lifestyle',
    styles: [
      { id: 'streetwear', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9' },
      { id: 'old-money', label: 'Old Money', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
      { id: 'luxury', label: 'Luxury', image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891' },
      { id: 'minimal', label: 'Minimal', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c' },
      { id: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae' }
    ]
  },
  {
    group: 'Medical & Healthcare',
    styles: [
      { id: 'medical-wear', label: 'Medical Wear', image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133', isPrimary: true }
    ]
  },
  {
    group: 'Niche Styles',
    styles: [
      { id: 'y2k', label: 'Y2K', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b' },
      { id: 'techwear', label: 'Techwear', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7' },
      { id: 'oversized', label: 'Oversized', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990' },
      { id: 'retro-sports', label: 'Retro Sports', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c' },
      { id: 'preppy', label: 'Preppy', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22' }
    ]
  }
];

const medicalSubCategories = [
  'Scrubs',
  'Lab Coats',
  'Medical Uniforms',
  'Nurse Wear',
  'Hospital Staff Wear'
];

const medicalTargetAudiences = [
  { id: 'doctors', label: 'Doctors' },
  { id: 'nurses', label: 'Nurses' },
  { id: 'medical-students', label: 'Medical students' },
  { id: 'hospital-staff', label: 'Hospital staff' }
];

const medicalEnvironments = [
  { id: 'hospital', label: 'Hospital' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'laboratory', label: 'Laboratory' }
];

const medicalBrandTones = [
  'Clean',
  'Professional',
  'Premium',
  'Minimal'
];


const styleDetails = [
  'Clean',
  'Bold',
  'Elegant',
  'Aggressive',
  'Classic',
  'Modern',
  'Premium',
  'Raw'
];

const targetAudiences = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'youth', label: 'Youth' },
  { id: 'premium-buyers', label: 'Premium buyers' }
];

const platforms = [
  { id: 'instagram-feed', name: 'Instagram Feed', ratio: '1:1 Square' },
  { id: 'instagram-reels', name: 'Instagram Reels', ratio: '9:16 Vertical' },
  { id: 'tiktok', name: 'TikTok', ratio: '9:16 Vertical' },
  { id: 'website', name: 'Website / Store', ratio: 'Multi-format' }
];


export function BrandWizard({ onComplete, onCancel, isPostSignup, editingBrand }: BrandWizardProps) {
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedStyleDetails, setSelectedStyleDetails] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string>('unisex');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram-feed');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Medical Wear specific states
  const [selectedMedicalSubCategories, setSelectedMedicalSubCategories] = useState<string[]>([]);
  const [selectedMedicalAudience, setSelectedMedicalAudience] = useState<string>('doctors');
  const [selectedMedicalEnvironment, setSelectedMedicalEnvironment] = useState<string>('hospital');
  const [selectedMedicalTones, setSelectedMedicalTones] = useState<string[]>(['Professional']);

  const isMedicalWear = selectedStyle === 'medical-wear';

  // Pre-fill form when editing
  useEffect(() => {
    if (editingBrand) {
      setBrandName(editingBrand.name);
      setSelectedStyle(editingBrand.vibe);
      setLogoPreview(editingBrand.logo || null);
      setSelectedPlatform(editingBrand.platform);
    }
  }, [editingBrand]);

  const handleComplete = () => {
    if (brandName && selectedStyle) {
      onComplete({
        id: editingBrand?.id || Date.now().toString(),
        name: brandName,
        vibe: selectedStyle as any,
        platform: selectedPlatform as any,
        logo: logoPreview || undefined,
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleStyleDetail = (detail: string) => {
    if (selectedStyleDetails.includes(detail)) {
      setSelectedStyleDetails(selectedStyleDetails.filter((d) => d !== detail));
    } else {
      setSelectedStyleDetails([...selectedStyleDetails, detail]);
    }
  };

  const canProceed = () => {
    if (step === 1) return brandName.trim().length > 0 && selectedStyle !== null;
    if (step === 2) return true; // Logo is optional
    if (step === 3) return selectedAudience !== null && selectedPlatform !== null;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            {/* Step Indicator */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-black'
                      : s < step
                      ? 'bg-neutral-300'
                      : 'bg-neutral-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-12 py-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Name & Style Category */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Create your brand
                  </h2>
                  <p className="text-lg text-neutral-500">
                    Tell us about your brand's identity
                  </p>
                </div>

                {/* Brand Name Input */}
                <div className="mb-12 max-w-2xl mx-auto">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter your brand name"
                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>

                {/* Style Categories */}
                <div className="space-y-8">
                  {categoryGroups.map((group, groupIndex) => (
                    <div key={group.group}>
                      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                        {group.group}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {group.styles.map((style, styleIndex) => (
                          <motion.button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: groupIndex * 0.1 + styleIndex * 0.05,
                              type: 'spring',
                              stiffness: 300,
                              damping: 25
                            }}
                            className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                              selectedStyle === style.id
                                ? 'border-black shadow-xl shadow-black/20 -translate-y-1'
                                : 'border-neutral-200 hover:border-neutral-300 hover:-translate-y-0.5'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="aspect-[3/4] relative">
                              <img
                                src={style.image}
                                alt={style.label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white">
                                <h3 className="text-sm font-bold">{style.label}</h3>
                              </div>
                              {selectedStyle === style.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                  className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <Check className="w-4 h-4 text-black" strokeWidth={3} />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Style Details */}
                {selectedStyle && !isMedicalWear && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 max-w-4xl mx-auto"
                  >
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Style Details (Optional)
                    </label>
                    <p className="text-sm text-neutral-500 mb-4">
                      Optional — used to fine-tune the photoshoot mood.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {styleDetails.map((detail, index) => (
                        <motion.button
                          key={detail}
                          onClick={() => toggleStyleDetail(detail)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.3 + index * 0.05,
                            type: 'spring',
                            stiffness: 400,
                            damping: 20
                          }}
                          className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                            selectedStyleDetails.includes(detail)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {detail}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Medical Wear Specific Inputs */}
                {isMedicalWear && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 max-w-4xl mx-auto space-y-8"
                  >
                    {/* Medical Sub-Categories */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Product Categories
                      </label>
                      <p className="text-sm text-neutral-500 mb-4">
                        Select one or more product types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {medicalSubCategories.map((category, index) => (
                          <motion.button
                            key={category}
                            onClick={() => {
                              if (selectedMedicalSubCategories.includes(category)) {
                                setSelectedMedicalSubCategories(selectedMedicalSubCategories.filter(c => c !== category));
                              } else {
                                setSelectedMedicalSubCategories([...selectedMedicalSubCategories, category]);
                              }
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.3 + index * 0.05,
                              type: 'spring',
                              stiffness: 400,
                              damping: 20
                            }}
                            className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                              selectedMedicalSubCategories.includes(category)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-blue-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {category}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Medical Target Audience */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-4">
                        Target Healthcare Professional
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {medicalTargetAudiences.map((audience, index) => (
                          <motion.button
                            key={audience.id}
                            onClick={() => setSelectedMedicalAudience(audience.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.4 + index * 0.05,
                              type: 'spring',
                              stiffness: 300,
                              damping: 25
                            }}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              selectedMedicalAudience === audience.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-neutral-200 hover:border-blue-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{audience.label}</span>
                              {selectedMedicalAudience === audience.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                  className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Medical Environment */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-4">
                        Environment Style
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {medicalEnvironments.map((env, index) => (
                          <motion.button
                            key={env.id}
                            onClick={() => setSelectedMedicalEnvironment(env.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.05,
                              type: 'spring',
                              stiffness: 300,
                              damping: 25
                            }}
                            className={`p-4 rounded-2xl border-2 text-center transition-all ${
                              selectedMedicalEnvironment === env.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-neutral-200 hover:border-blue-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="font-semibold text-sm">{env.label}</span>
                            {selectedMedicalEnvironment === env.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="mt-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mx-auto"
                              >
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Tone */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Brand Tone
                      </label>
                      <p className="text-sm text-neutral-500 mb-4">
                        Select one or more tones
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {medicalBrandTones.map((tone, index) => (
                          <motion.button
                            key={tone}
                            onClick={() => {
                              if (selectedMedicalTones.includes(tone)) {
                                setSelectedMedicalTones(selectedMedicalTones.filter(t => t !== tone));
                              } else {
                                setSelectedMedicalTones([...selectedMedicalTones, tone]);
                              }
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.6 + index * 0.05,
                              type: 'spring',
                              stiffness: 400,
                              damping: 20
                            }}
                            className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                              selectedMedicalTones.includes(tone)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-blue-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {tone}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Info Card for Medical Wear */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="p-4 bg-blue-50 rounded-2xl border border-blue-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">AI Auto-generation for Medical Wear</p>
                          <p className="text-blue-700">
                            Your photoshoots will automatically feature professional healthcare settings,
                            realistic medical staff poses, and clinical lighting—no prompts required.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Reassurance Card */}
                {selectedStyle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 max-w-2xl mx-auto"
                  >
                    <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <Info className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-neutral-600">
                        <p className="font-medium text-black mb-1">You can change this later.</p>
                        <p>Your brand identity is automatically applied to every photoshoot.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Brand Logo */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Upload your logo
                  </h2>
                  <p className="text-lg text-neutral-500">
                    Add your brand logo (optional)
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {logoPreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <div className="w-full aspect-square rounded-3xl border-2 border-neutral-200 overflow-hidden bg-neutral-50 flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Brand logo"
                          className="max-w-full max-h-full object-contain p-6"
                        />
                      </div>
                      <motion.button
                        onClick={removeLogo}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full border border-neutral-200 flex items-center justify-center shadow-md hover:bg-red-50 hover:border-red-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4 text-neutral-600" />
                      </motion.button>
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full py-3 rounded-2xl border-2 border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Change logo
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-square rounded-3xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-neutral-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-700 mb-1">
                          Click to upload your logo
                        </p>
                        <p className="text-xs text-neutral-500">
                          PNG, JPG, SVG up to 2MB
                        </p>
                      </div>
                    </motion.button>
                  )}

                  <div className="mt-6 flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-500">
                      Your logo is displayed on your dashboard for easy identification. You can skip this step and add it later.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Audience & Platform */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Target audience & platform
                  </h2>
                  <p className="text-lg text-neutral-500">
                    Help us create the perfect content
                  </p>
                </div>

                {/* Target Audience */}
                <div className="mb-12">
                  <label className="block text-sm font-medium text-neutral-700 mb-4">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                    {targetAudiences.map((audience, index) => (
                      <motion.button
                        key={audience.id}
                        onClick={() => setSelectedAudience(audience.id)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25
                        }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedAudience === audience.id
                            ? 'border-black bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{audience.label}</span>
                          {selectedAudience === audience.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="w-6 h-6 bg-black rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Primary Platform
                  </label>
                  <p className="text-sm text-neutral-500 mb-4">
                    The AI adapts poses, framing, and movement for each platform.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {platforms.map((platform, index) => (
                      <motion.button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.2 + index * 0.08,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25
                        }}
                        className={`p-6 rounded-3xl border-2 text-left transition-all ${
                          selectedPlatform === platform.id
                            ? 'border-black bg-neutral-50 shadow-lg'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold">{platform.name}</h3>
                          {selectedPlatform === platform.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="w-7 h-7 bg-black rounded-full flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">{platform.ratio}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {step < 3 ? (
              <motion.button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={canProceed() ? { scale: 1.02 } : {}}
                whileTap={canProceed() ? { scale: 0.98 } : {}}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="w-4 h-4" />
                {editingBrand ? 'Update' : 'Complete'}
              </motion.button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}