import {
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  Camera,
  Layers,
  Clock,
  Gem,
  Bell,
  Check,
  Wand,
  ArrowUpRight,
  Upload,
  ImageOff,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Brand } from '../App';
import { Button, Logo } from './shootly-ui.tsx';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog.tsx';

interface DashboardProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  credits: number | null;
  onSelectBrand: (brand: Brand) => void;
  onCreateContent: () => void;
  onAddBrand: () => void;
  onEditBrand: (brand: Brand) => void;
  onDeleteBrand: (brandId: string) => void;
  onLogout: () => void;
  onBack: () => void;
  onViewPricing?: () => void;
}

const PH_FILLS = ['ph-a', 'ph-d', 'ph-f', 'ph-b', 'ph-c', 'ph-e'];
const phFor = (index: number) => PH_FILLS[((index % PH_FILLS.length) + PH_FILLS.length) % PH_FILLS.length];
const initialOf = (name?: string) => (name?.trim()?.charAt(0) || 'S').toUpperCase();

function GenerationMedia({ gen }: { gen: any }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/50">
        <ImageOff className="w-6 h-6" />
        <span className="text-xs">Expired</span>
      </div>
    );
  }

  if (gen.type === 'VIDEO') {
    return (
      <video
        src={gen.resultUrl}
        controls
        preload="metadata"
        className="w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <img
      src={gen.resultUrl}
      alt="Generation"
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

export function Dashboard({
  brands,
  selectedBrand,
  credits,
  onSelectBrand,
  onCreateContent,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onLogout,
  onBack,
  onViewPricing,
}: DashboardProps) {
  const [generations, setGenerations] = useState<any[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_clothing_studio_authenticated');
    localStorage.removeItem('ai_clothing_studio_token');
    onLogout();
  };

  const confirmDelete = () => {
    if (selectedBrand) onDeleteBrand(selectedBrand.id);
    setDeleteOpen(false);
  };

  // Fetch generations whenever the active brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setGenerations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('ai_clothing_studio_token');
        const backendUrl = import.meta.env.DEV
          ? ''
          : import.meta.env.VITE_API_URL || 'https://shootly-z6o8.vercel.app';
        const response = await fetch(`${backendUrl}/api/generations?brandId=${selectedBrand.id}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setGenerations(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching generations:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBrand]);

  // Close brand switcher on outside click
  useEffect(() => {
    if (!switcherOpen) return;
    const close = () => setSwitcherOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [switcherOpen]);

  const formatWhen = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffH = (Date.now() - date.getTime()) / 36e5;
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    if (diffH < 48) return 'Yesterday';
    return `${Math.floor(diffH / 24)} days ago`;
  };

  // Flatten generation groups → individual recent shoots, newest first
  const allShoots = generations
    .flatMap((g: any) =>
      (g.generations || []).map((x: any) => ({ ...x, brandName: g.brandName }))
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  const recentShoots = showAll ? allShoots : allShoots.slice(0, 6);
  const hasShoots = recentShoots.length > 0;

  const creditsVal = credits ?? 0;
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  const selectedIndex = selectedBrand ? brands.findIndex((b) => b.id === selectedBrand.id) : -1;
  const selectedPh = phFor(selectedIndex < 0 ? 0 : selectedIndex);

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* ---------- Top bar ---------- */}
      <header className="sticky top-0 z-40 glass border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo onClick={onBack} size={34} />
            <span className="hidden sm:inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint border border-line rounded-full px-2.5 py-1">
              Studio
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full bg-white border border-line shadow-float">
              <Gem size={15} className="text-ink" />
              <span className="text-sm font-bold">{creditsVal}</span>
              <span className="hidden sm:inline text-sm text-ink-faint">credits</span>
            </div>
            <button
              onClick={() => fire('No new notifications')}
              className="grid place-items-center w-10 h-10 rounded-full bg-white border border-line text-ink-soft hover:text-ink hover:border-ink/20 transition-colors shadow-float relative"
            >
              <Bell size={17} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full grad" />
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="grid place-items-center w-10 h-10 rounded-full grad text-white font-bold text-sm shadow-float hover:-translate-y-0.5 transition-transform overflow-hidden"
            >
              {selectedBrand?.logo ? (
                <img src={selectedBrand.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                initialOf(selectedBrand?.name)
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        {/* ---------- Greeting ---------- */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
              Dashboard
            </div>
            <h1 className="text-3xl sm:text-[2.6rem] leading-tight font-extrabold tracking-[-0.03em]">
              {greeting}.
            </h1>
            <p className="text-ink-soft mt-1">
              You're creating as{' '}
              <span className="font-semibold text-ink">{selectedBrand?.name || 'your brand'}</span>.
            </p>
          </div>
          {/* brand switcher */}
          {selectedBrand && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSwitcherOpen((v) => !v)}
                className="flex items-center gap-3 bg-white border border-line rounded-full pl-2 pr-4 py-2 shadow-float hover:border-ink/20 transition-colors"
              >
                <span
                  className={`grid place-items-center w-8 h-8 rounded-full ${selectedPh} text-white font-bold text-sm overflow-hidden`}
                >
                  {selectedBrand.logo ? (
                    <img src={selectedBrand.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initialOf(selectedBrand.name)
                  )}
                </span>
                <span className="text-left">
                  <span className="block text-[11px] text-ink-faint -mb-0.5 leading-none">Brand</span>
                  <span className="block text-sm font-bold leading-tight">{selectedBrand.name}</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-ink-faint transition-transform ${switcherOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-2xl shadow-deep p-2 z-50">
                  {brands.map((b, i) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBrand(b);
                        setSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors ${
                        selectedBrand.id === b.id ? 'bg-ink/[0.05]' : 'hover:bg-ink/[0.03]'
                      }`}
                    >
                      <span
                        className={`grid place-items-center w-8 h-8 rounded-full ${phFor(i)} text-white font-bold text-sm shrink-0 overflow-hidden`}
                      >
                        {b.logo ? (
                          <img src={b.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          initialOf(b.name)
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold leading-tight">{b.name}</span>
                        <span className="block text-xs text-ink-faint capitalize">{b.vibe}</span>
                      </span>
                      {selectedBrand.id === b.id && <Check size={16} className="text-ink" />}
                    </button>
                  ))}
                  <div className="h-px bg-line my-1.5" />
                  <button
                    onClick={() => {
                      setSwitcherOpen(false);
                      onAddBrand();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left hover:bg-ink/[0.03] text-ink-soft"
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-full border border-dashed border-line">
                      <Plus size={16} />
                    </span>
                    <span className="text-sm font-semibold">Add new brand</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* ===== Left column ===== */}
          <div className="lg:col-span-2 space-y-5">
            {/* Create card */}
            <div className="reveal relative overflow-hidden rounded-4xl bg-ink text-white p-7 sm:p-9 grain shadow-deep">
              <div
                className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-55"
                style={{ background: 'var(--grad)' }}
              />
              <div className="relative z-10 grid sm:grid-cols-[1.3fr_1fr] gap-7 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/10 border border-white/15 px-2.5 py-1 rounded-full mb-4">
                    <Sparkles size={12} /> New shoot
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-2">
                    Create realistic photoshoots, instantly.
                  </h2>
                  <p className="text-white/65 mb-6 max-w-sm">
                    No prompts. No experience needed. Upload your design — Shootly does the rest.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      className="px-6! py-3! text-[15px]"
                      onClick={onCreateContent}
                      disabled={creditsVal === 0}
                    >
                      <Sparkles size={17} /> {creditsVal === 0 ? 'No credits' : 'Create content'}
                    </Button>
                    <span className="text-sm text-white/55">Image 1 credit · Video 3 credits</span>
                  </div>
                </div>
                {/* mini dropzone */}
                <div className="hidden sm:block rounded-3xl border border-dashed border-white/20 bg-white/[0.04] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {['Front', 'Back'].map((t) => (
                      <div
                        key={t}
                        className="rounded-2xl bg-white/[0.05] border border-white/10 aspect-[3/4] grid place-items-center relative"
                      >
                        <svg
                          viewBox="0 0 80 80"
                          className="w-1/2 h-1/2 text-white/35"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        >
                          <path d="M28 14 L20 22 L12 30 L20 40 L26 36 L26 66 L54 66 L54 36 L60 40 L68 30 L60 22 L52 14 C48 20 32 20 28 14 Z" />
                        </svg>
                        <span className="absolute bottom-2 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-white/45 text-xs mt-3">
                    <Upload size={13} /> Drop front &amp; back images
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {(
                [
                  [Gem, creditsVal, 'credits left', 'grad'],
                  [Camera, allShoots.length, 'shoots made', 'bg-ink'],
                  [Layers, brands.length, 'brands', 'bg-ink'],
                ] as [any, number, string, string][]
              ).map(([Ic, n, l, bg], i) => (
                <div
                  key={i}
                  className="reveal bg-white rounded-3xl border border-line p-4 sm:p-5 lift hover:shadow-float"
                >
                  <span className={`grid place-items-center w-10 h-10 rounded-2xl ${bg} mb-3.5`}>
                    <Ic size={18} className="text-white" />
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{n}</div>
                  <div className="text-sm text-ink-faint">{l}</div>
                </div>
              ))}
            </div>

            {/* Recent */}
            <div className="reveal bg-white rounded-4xl border border-line p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-ink" />
                  <h3 className="text-lg font-bold tracking-tight">Recent shoots</h3>
                </div>
                {allShoots.length > 6 && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="text-sm font-semibold text-ink-soft hover:text-ink flex items-center gap-1 transition-colors"
                  >
                    {showAll ? 'Show less' : 'View all'} <ChevronRight size={15} />
                  </button>
                )}
              </div>
              {hasShoots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {recentShoots.map((g: any, i: number) => (
                    <div
                      key={g.id || i}
                      className="frame aspect-[4/5] rounded-2xl relative group cursor-pointer shadow-float overflow-hidden"
                    >
                      <GenerationMedia gen={g} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
                        {g.type === 'VIDEO' ? 'Video' : 'Image'}
                      </span>
                      <div className="absolute left-2.5 bottom-2.5 right-2.5 pointer-events-none">
                        <div className="text-white text-xs font-semibold leading-tight truncate">
                          {g.brandName || selectedBrand?.name}
                        </div>
                        <div className="text-white/60 text-[10px]">{formatWhen(g.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-paper py-14 px-6 text-center">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white border border-line shadow-float mx-auto mb-4">
                    <Camera size={20} className="text-ink-soft" />
                  </span>
                  <h4 className="font-bold tracking-tight mb-1">No shoots yet</h4>
                  <p className="text-sm text-ink-soft mb-5 max-w-xs mx-auto">
                    Create your first photoshoot and it'll show up here.
                  </p>
                  <Button variant="primary" className="text-sm px-5! py-2.5!" onClick={onCreateContent} disabled={creditsVal === 0}>
                    <Sparkles size={15} /> Create content
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ===== Right column ===== */}
          <div className="space-y-5">
            {/* Your brands */}
            {selectedBrand && (
              <div className="reveal bg-white rounded-4xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold tracking-tight">Your brands</h3>
                  <button
                    onClick={onAddBrand}
                    className="grid place-items-center w-8 h-8 rounded-full border border-line text-ink-soft hover:text-ink hover:border-ink/20 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {/* selected */}
                <div className="rounded-3xl grad p-[1.5px] mb-3">
                  <div className="rounded-[calc(1.5rem-1.5px)] bg-white p-4 flex items-center gap-3">
                    <span
                      className={`grid place-items-center w-12 h-12 rounded-2xl ${selectedPh} text-white font-bold text-lg shrink-0 overflow-hidden`}
                    >
                      {selectedBrand.logo ? (
                        <img src={selectedBrand.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initialOf(selectedBrand.name)
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-ink-faint leading-none mb-0.5">Active brand</div>
                      <div className="font-bold leading-tight truncate">{selectedBrand.name}</div>
                      <span className="inline-block mt-1 text-[11px] font-semibold capitalize text-ink-soft bg-ink/[0.05] px-2 py-0.5 rounded-full">
                        {selectedBrand.vibe}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onEditBrand(selectedBrand)}
                        className="grid place-items-center w-8 h-8 rounded-full border border-line text-ink-soft hover:text-ink transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() =>
                          brands.length > 1 ? setDeleteOpen(true) : fire('Keep at least one brand')
                        }
                        className="grid place-items-center w-8 h-8 rounded-full border border-line text-ink-soft hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* others */}
                <div className="space-y-1">
                  {brands
                    .filter((b) => b.id !== selectedBrand.id)
                    .map((b) => {
                      const idx = brands.findIndex((x) => x.id === b.id);
                      return (
                        <button
                          key={b.id}
                          onClick={() => onSelectBrand(b)}
                          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-ink/[0.03] transition-colors text-left"
                        >
                          <span
                            className={`grid place-items-center w-9 h-9 rounded-xl ${phFor(idx)} text-white font-bold text-sm shrink-0 overflow-hidden`}
                          >
                            {b.logo ? (
                              <img src={b.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              initialOf(b.name)
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold leading-tight truncate">
                              {b.name}
                            </span>
                            <span className="block text-xs text-ink-faint capitalize">{b.vibe}</span>
                          </span>
                          <span className="text-xs font-semibold text-ink-faint">Switch</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Credits / usage */}
            <div className="reveal bg-white rounded-4xl border border-line p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold tracking-tight">Credits</h3>
                <Gem size={18} className="text-ink" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight mb-0.5">{creditsVal}</div>
              <p className="text-sm text-ink-faint mb-5">credits available · Image 1 · Video 3</p>
              <Button
                variant="dark"
                className="w-full py-3! text-sm"
                onClick={() => (onViewPricing ? onViewPricing() : onBack())}
              >
                Top up credits <ArrowUpRight size={16} />
              </Button>
            </div>

            {/* Tip */}
            <div className="reveal rounded-4xl border border-line p-6 bg-paper">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white border border-line shadow-float mb-3.5">
                <Wand size={18} className="text-ink" />
              </span>
              <h3 className="font-bold tracking-tight mb-1.5">Pro tip</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Upload both front and back images — Shootly stitches them into a fuller, more accurate scene.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBrand?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 bg-ink text-white pl-3 pr-4 py-2.5 rounded-full shadow-deep">
          <span className="grid place-items-center w-6 h-6 rounded-full grad">
            <Sparkles size={13} className="text-white" />
          </span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      </div>
    </div>
  );
}
