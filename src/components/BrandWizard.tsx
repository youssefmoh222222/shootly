import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, Upload, X, Users, Film } from 'lucide-react';
import type { Brand } from '../App';
import { Button, Logo, FieldLabel, TextField, Opt } from './shootly-ui.tsx';

interface BrandWizardProps {
  onComplete: (brand: Brand) => void;
  onCancel: () => void;
  isPostSignup?: boolean;
  editingBrand?: Brand | null;
}

const categoryGroups: { group: string; styles: { id: string; label: string; ph: string }[] }[] = [
  {
    group: 'Sports & Performance',
    styles: [
      { id: 'football', label: 'Football', ph: 'ph-f' },
      { id: 'gymwear', label: 'Gymwear', ph: 'ph-d' },
    ],
  },
  {
    group: 'Fashion & Lifestyle',
    styles: [
      { id: 'streetwear', label: 'Streetwear', ph: 'ph-a' },
      { id: 'old-money', label: 'Old Money', ph: 'ph-c' },
      { id: 'luxury', label: 'Luxury', ph: 'ph-e' },
      { id: 'minimal', label: 'Minimal', ph: 'ph-d' },
      { id: 'vintage', label: 'Vintage', ph: 'ph-c' },
    ],
  },
  {
    group: 'Healthcare',
    styles: [{ id: 'medical-wear', label: 'Medical Wear', ph: 'ph-f' }],
  },
  {
    group: 'Niche Styles',
    styles: [
      { id: 'y2k', label: 'Y2K', ph: 'ph-b' },
      { id: 'techwear', label: 'Techwear', ph: 'ph-f' },
      { id: 'oversized', label: 'Oversized', ph: 'ph-a' },
      { id: 'retro-sports', label: 'Retro Sports', ph: 'ph-e' },
      { id: 'preppy', label: 'Preppy', ph: 'ph-c' },
    ],
  },
];

const styleDetails = ['Clean', 'Bold', 'Elegant', 'Aggressive', 'Classic', 'Modern', 'Premium', 'Raw'];

const targetAudiences = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'youth', label: 'Youth' },
  { id: 'premium-buyers', label: 'Premium buyers' },
];

const platforms = [
  { id: 'instagram-feed', name: 'Instagram Feed', ratio: '1:1 Square' },
  { id: 'instagram-reels', name: 'Instagram Reels', ratio: '9:16 Vertical' },
  { id: 'tiktok', name: 'TikTok', ratio: '9:16 Vertical' },
  { id: 'website', name: 'Website / Store', ratio: 'Multi-format' },
];

export function BrandWizard({ onComplete, onCancel, editingBrand }: BrandWizardProps) {
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedStyleDetails, setSelectedStyleDetails] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string>('unisex');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram-feed');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        name: brandName.trim(),
        vibe: selectedStyle as any,
        platform: selectedPlatform as any,
        logo: logoPreview || undefined,
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogoPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleStyleDetail = (detail: string) =>
    setSelectedStyleDetails((p) => (p.includes(detail) ? p.filter((d) => d !== detail) : [...p, detail]));

  const canNext = step === 1 ? brandName.trim().length > 0 && !!selectedStyle : true;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-line">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors shrink-0"
            >
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Cancel</span>
            </button>
            <span className="w-px h-6 bg-line hidden sm:block" />
            <div className="hidden sm:block">
              <Logo size={30} />
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-9 rounded-full transition-all ${
                  s === step ? 'grad' : s < step ? 'bg-ink/30' : 'bg-ink/10'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-3">
                  {editingBrand ? 'Edit your brand' : 'Create your brand'}
                </h2>
                <p className="text-lg text-ink-soft">Tell us about your brand's identity.</p>
              </div>
              <div className="max-w-xl mx-auto mb-12">
                <FieldLabel>Brand name</FieldLabel>
                <TextField
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter your brand name"
                  autoFocus
                />
              </div>

              <div className="space-y-8">
                {categoryGroups.map(({ group, styles }) => (
                  <div key={group}>
                    <h3 className="text-xs font-semibold text-ink-faint uppercase tracking-[0.14em] mb-4">{group}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                      {styles.map(({ id, label, ph }) => {
                        const active = selectedStyle === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedStyle(id)}
                            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                              active
                                ? 'border-ink -translate-y-1 shadow-deep'
                                : 'border-transparent hover:-translate-y-0.5 shadow-float'
                            }`}
                          >
                            <div className={`frame figure aspect-[3/4] ${ph}`}>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                                <span className="text-sm font-bold text-white">{label}</span>
                              </div>
                              {active && (
                                <span className="absolute top-2.5 right-2.5 grid place-items-center w-7 h-7 rounded-full bg-white shadow-float">
                                  <Check size={15} className="text-ink" strokeWidth={3} />
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedStyle && (
                <div className="mt-12 max-w-3xl mx-auto">
                  <FieldLabel hint="optional — fine-tunes the mood">Style details</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {styleDetails.map((d) => (
                      <button
                        key={d}
                        onClick={() => toggleStyleDetail(d)}
                        className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all active:scale-95 ${
                          selectedStyleDetails.includes(d)
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink-soft border-line hover:border-ink/25'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedStyle && (
                <div className="mt-8 max-w-xl mx-auto flex items-start gap-3 p-4 bg-white rounded-2xl border border-line">
                  <Info size={18} className="text-ink-faint shrink-0 mt-0.5" />
                  <div className="text-sm text-ink-soft">
                    <span className="font-semibold text-ink">You can change this later.</span> Your brand identity is
                    applied to every photoshoot automatically.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-3">Upload your logo</h2>
                <p className="text-lg text-ink-soft">Add your brand logo — optional.</p>
              </div>
              <div className="max-w-md mx-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden ${
                    logoPreview ? 'border-ink bg-white' : 'border-line bg-white hover:border-ink/30'
                  }`}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Brand logo" className="w-full h-full object-contain p-8" />
                  ) : (
                    <>
                      <span className="grid place-items-center w-16 h-16 rounded-full bg-paper border border-line">
                        <Upload size={26} className="text-ink-soft" />
                      </span>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-ink mb-1">Click to upload your logo</p>
                        <p className="text-xs text-ink-faint">PNG, JPG, SVG up to 2MB</p>
                      </div>
                    </>
                  )}
                </button>
                {logoPreview && (
                  <button
                    onClick={removeLogo}
                    className="mt-4 w-full py-3 rounded-2xl border border-line text-sm font-semibold text-ink-soft hover:border-ink/25 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={15} /> Remove logo
                  </button>
                )}
                <div className="mt-6 flex items-start gap-3 p-4 bg-white rounded-2xl border border-line">
                  <Info size={18} className="text-ink-faint shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-soft">
                    Your logo appears on your dashboard and watermarks generated shots. You can add it later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-3">Audience &amp; platform</h2>
                <p className="text-lg text-ink-soft">Help us frame content the right way.</p>
              </div>
              <div className="max-w-3xl mx-auto mb-12">
                <FieldLabel icon={Users}>Target audience</FieldLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {targetAudiences.map((a) => (
                    <Opt
                      key={a.id}
                      active={selectedAudience === a.id}
                      onClick={() => setSelectedAudience(a.id)}
                      title={a.label}
                    />
                  ))}
                </div>
              </div>
              <div className="max-w-3xl mx-auto">
                <FieldLabel icon={Film} hint="adapts poses, framing & motion">
                  Primary platform
                </FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platforms.map((p) => {
                    const active = selectedPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-200 active:scale-[.99] ${
                          active ? 'border-ink bg-white shadow-float' : 'border-line bg-white hover:border-ink/20 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold">{p.name}</h3>
                          {active && (
                            <span className="grid place-items-center w-7 h-7 rounded-full grad">
                              <Check size={15} className="text-white" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-faint">{p.ratio}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-paper/90 backdrop-blur sticky bottom-0 z-30">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {step < 3 ? (
            <Button variant="primary" className="text-sm" disabled={!canNext} onClick={() => canNext && setStep((s) => s + 1)}>
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" className="text-sm" onClick={handleComplete}>
              <Check size={16} /> {editingBrand ? 'Update brand' : 'Create brand'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
