import { useState } from 'react';
import {
  Download,
  RotateCcw,
  ArrowLeft,
  Plus,
  Check,
  Play,
  Maximize,
  Sparkles,
  Gem,
  X,
  Info,
} from 'lucide-react';
import type { Brand, DesignData } from '../App';
import { Button, Logo } from './shootly-ui.tsx';

interface ProfileResult {
  profileId: string;
  profileName: string;
  category: string;
  resultUrl: string;
  generationId: string;
  promptUsed?: string;
}

interface ResultsScreenProps {
  content: {
    images: string[];
    video: string;
    generationId?: string;
    allResults?: ProfileResult[];
    totalProfiles?: number;
    successCount?: number;
    error?: string;
  };
  brand: Brand | null;
  onRegenerate: (design: DesignData) => void;
  onBack: () => void;
  onViewPricing?: () => void;
}

type ResultItem = { url: string; type: 'image' | 'video'; label: string; poster?: string };

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

export function ResultsScreen({ content, brand, onRegenerate, onBack, onViewPricing }: ResultsScreenProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const brandSlug = brand?.name?.replace(/\s+/g, '-').toLowerCase() || 'shoot';

  // Build a unified list of result items from whatever the backend returned.
  const items: ResultItem[] = content.allResults?.length
    ? content.allResults
        .filter((r) => r.resultUrl)
        .map((r) => ({ url: r.resultUrl, type: 'video', label: r.profileName }))
    : [
        ...content.images.map((url, i) => ({
          url,
          type: 'image' as const,
          label: content.images.length === 2 ? (i === 0 ? 'Front' : 'Back') : `Variation ${i + 1}`,
        })),
        ...(content.video
          ? [{ url: content.video, type: 'video' as const, label: 'Video', poster: content.images[0] }]
          : []),
      ];

  const safeActive = Math.min(active, Math.max(0, items.length - 1));
  const current = items[safeActive];
  const allVideo = items.length > 0 && items.every((i) => i.type === 'video');
  const allImage = items.length > 0 && items.every((i) => i.type === 'image');

  const handleRegenerate = () => {
    const cachedDesign = localStorage.getItem('ai_clothing_studio_last_design');
    if (cachedDesign) {
      try {
        onRegenerate(JSON.parse(cachedDesign));
        return;
      } catch (e) {
        console.error('Failed to parse cached design:', e);
      }
    }
    onBack();
  };

  const downloadItem = (it: ResultItem, index: number) =>
    downloadFile(it.url, `${brandSlug}-${it.type === 'video' ? `video-${index + 1}.mp4` : `photo-${index + 1}.webp`}`);

  const handleDownloadAll = async () => {
    for (let i = 0; i < items.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await downloadItem(items[i], i);
    }
  };

  const Header = (
    <header className="sticky top-0 z-40 glass border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">
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
        <Button variant="dark" className="px-5! py-2.5! text-sm" onClick={onBack}>
          <Plus size={16} /> New shoot
        </Button>
      </div>
    </header>
  );

  // Error state
  if (content.error) {
    const isBilling = /insufficient credit|payment required|\b402\b/i.test(content.error);
    return (
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        {Header}
        <main className="flex-1 grid place-items-center px-5 sm:px-6 py-16">
          <div className="text-center max-w-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <Info size={28} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] mb-3">Generation hit a snag</h1>
            {isBilling ? (
              <p className="text-ink-soft mb-8">
                The image service is out of credit, so generation couldn't run. Add credit to your
                Replicate account, wait a couple of minutes, then try again.
              </p>
            ) : (
              <p className="text-ink-soft mb-8">{content.error}</p>
            )}
            <Button variant="primary" onClick={handleRegenerate}>
              <RotateCcw size={16} /> Try again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {Header}

      <main className="flex-1 px-5 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full grad text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-float">
                <Check size={13} strokeWidth={3} /> Shoot ready
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.12] mb-3 pb-0.5">
                Your <span className="serif-em grad-text">photoshoot</span> is ready
              </h2>
              <p className="text-lg text-ink-soft">
                {content.allResults && content.totalProfiles
                  ? `${content.successCount} of ${content.totalProfiles} brand profiles`
                  : `${items.length} ${allVideo ? 'videos' : allImage ? 'images' : 'assets'}`}{' '}
                · {brand?.name || 'Your brand'} · AI directed
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="primary" className="text-sm" onClick={handleDownloadAll}>
                <Download size={16} /> Download all
              </Button>
            )}
          </div>

          {items.length > 0 && current && (
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 items-start">
              {/* hero result */}
              <div>
                <div className="relative rounded-4xl shadow-deep overflow-hidden aspect-[4/5] sm:aspect-[3/2] bg-[#101014] group">
                  {current.type === 'video' ? (
                    <video
                      key={current.url}
                      src={current.url}
                      poster={current.poster}
                      controls
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <img src={current.url} alt={current.label} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setLightbox(true)}
                    className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full glass text-ink hover:bg-white transition-colors z-10"
                  >
                    <Maximize size={17} />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="text-white">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-white/65 mb-0.5">
                        {brand?.name || 'Shootly'}
                      </div>
                      <div className="text-lg font-bold">{current.label}</div>
                    </div>
                  </div>
                </div>
                {/* thumbnails */}
                {items.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                    {items.map((it, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl shrink-0 overflow-hidden border-2 transition-all bg-[#101014] ${
                          safeActive === i
                            ? 'border-ink -translate-y-0.5 shadow-float'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        {it.type === 'video' ? (
                          <>
                            <video src={it.url} poster={it.poster} className="w-full h-full object-cover" muted />
                            <span className="absolute inset-0 grid place-items-center">
                              <Play size={14} className="text-white" />
                            </span>
                          </>
                        ) : (
                          <img src={it.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* action panel */}
              <aside className="space-y-4">
                <div className="bg-white rounded-4xl border border-line p-6 shadow-float">
                  <h3 className="text-lg font-bold tracking-tight mb-4">{current.label}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <Button variant="dark" className="py-3! text-sm" onClick={() => downloadItem(current, safeActive)}>
                      <Download size={16} /> Download
                    </Button>
                    <Button variant="ghost" className="py-3! text-sm" onClick={handleRegenerate}>
                      <RotateCcw size={15} /> Regenerate
                    </Button>
                  </div>
                  <div className="rounded-2xl bg-paper border border-line p-4 space-y-2.5">
                    {(
                      [
                        ['Brand', brand?.name],
                        ['Output', allVideo ? `Video · ${items.length}×` : allImage ? `Image · ${items.length}×` : `${items.length} assets`],
                        ['Direction', 'AI directed'],
                      ] as [string, string | undefined][]
                    ).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-faint">{k}</span>
                        <span className="font-semibold text-ink text-right truncate">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-4xl border border-line p-6 shadow-float">
                  <h3 className="text-base font-bold tracking-tight mb-1">Want a different look?</h3>
                  <p className="text-sm text-ink-soft mb-4">
                    Re-run with a new scene or tweak the direction — your design stays loaded.
                  </p>
                  <div className="space-y-2.5">
                    <Button variant="primary" className="w-full py-3! text-sm" onClick={handleRegenerate}>
                      <Sparkles size={16} /> Try another scene
                    </Button>
                    <button
                      onClick={onBack}
                      className="w-full py-3 rounded-full border border-line text-sm font-semibold text-ink-soft hover:border-ink/25 transition-all"
                    >
                      Back to dashboard
                    </button>
                  </div>
                </div>

                {onViewPricing && (
                  <div className="rounded-4xl grad p-[1.5px] shadow-float">
                    <div className="rounded-[calc(2rem-1.5px)] bg-white p-5 flex items-center gap-4">
                      <span className="grid place-items-center w-11 h-11 rounded-2xl grad shrink-0">
                        <Gem size={20} className="text-white" />
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-sm">Running low on credits?</div>
                        <div className="text-xs text-ink-faint">Top up anytime — they never expire.</div>
                      </div>
                      <button onClick={onViewPricing} className="text-sm font-bold text-ink hover:underline whitespace-nowrap">
                        Top up
                      </button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* lightbox */}
      {lightbox && current && (
        <div
          className="fixed inset-0 z-50 bg-ink/90 backdrop-blur grid place-items-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-5 right-5 grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {current.type === 'video' ? (
              <video
                src={current.url}
                poster={current.poster}
                controls
                autoPlay
                className="w-full rounded-3xl shadow-deep"
              />
            ) : (
              <img src={current.url} alt={current.label} className="w-full rounded-3xl shadow-deep object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
