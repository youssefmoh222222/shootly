import { ArrowRight, ArrowLeft, Check, Gem, Shield, Zap, RotateCcw } from 'lucide-react';
import { Button, Logo } from './shootly-ui.tsx';

type PricingPageProps = {
  onGetStarted: () => void;
  onBack: () => void;
};

const PACKS = [
  {
    name: 'Starter',
    credits: 20,
    price: 9,
    sub: '$0.45 / credit',
    features: ['~20 images or 6 videos', 'All cinematic scenarios', 'HD downloads', '1 brand profile'],
    cta: 'Get Starter',
    highlight: false,
    save: undefined as string | undefined,
  },
  {
    name: 'Studio',
    credits: 80,
    price: 29,
    sub: '$0.36 / credit',
    features: [
      '~80 images or 26 videos',
      'All scenarios + director controls',
      '4K downloads',
      'Up to 5 brand profiles',
      'Priority rendering',
    ],
    cta: 'Get Studio',
    highlight: true,
    save: 'Save 20%',
  },
  {
    name: 'Label',
    credits: 250,
    price: 79,
    sub: '$0.32 / credit',
    features: [
      '~250 images or 83 videos',
      'Everything in Studio',
      'Unlimited brand profiles',
      'Commercial license',
      'Dedicated support',
    ],
    cta: 'Get Label',
    highlight: false,
    save: 'Save 30%',
  },
];

export function PricingPage({ onGetStarted, onBack }: PricingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <header className="sticky top-0 z-40 glass border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors shrink-0"
            >
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
            </button>
            <span className="w-px h-6 bg-line hidden sm:block" />
            <div className="hidden sm:block">
              <Logo size={30} />
            </div>
          </div>
          <Button variant="primary" className="text-sm px-5! py-2.5!" onClick={onGetStarted}>
            Get started <ArrowRight size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-3">Pricing</div>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] mb-4">
              Buy credits, <span className="serif-em grad-text">create freely.</span>
            </h2>
            <p className="text-lg text-ink-soft">
              Credits never expire. Images cost 1 · videos cost 3. No subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PACKS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-4xl p-7 sm:p-8 transition-all lift ${
                  p.highlight
                    ? 'bg-ink text-white shadow-deep grain overflow-hidden'
                    : 'bg-white border border-line shadow-float'
                }`}
              >
                {p.highlight && (
                  <div
                    className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-55"
                    style={{ background: 'var(--grad)' }}
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-xl font-bold ${p.highlight ? 'text-white' : 'text-ink'}`}>{p.name}</h3>
                    {p.highlight ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
                        Most popular
                      </span>
                    ) : (
                      p.save && (
                        <span className="text-[11px] font-bold uppercase tracking-wider grad text-white px-2.5 py-1 rounded-full">
                          {p.save}
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-5xl font-extrabold tracking-tight">${p.price}</span>
                    <span className={`text-sm ${p.highlight ? 'text-white/55' : 'text-ink-faint'}`}>one-time</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-sm font-semibold mb-6 ${
                      p.highlight ? 'text-white/80' : 'text-ink-soft'
                    }`}
                  >
                    <Gem size={15} /> {p.credits} credits{' '}
                    <span className={`font-normal ${p.highlight ? 'text-white/45' : 'text-ink-faint'}`}>· {p.sub}</span>
                  </div>
                  <Button
                    variant={p.highlight ? 'invert' : 'dark'}
                    className="w-full py-3.5! text-sm mb-6"
                    onClick={onGetStarted}
                  >
                    {p.cta} <ArrowRight size={16} />
                  </Button>
                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`grid place-items-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                            p.highlight ? 'bg-white/15' : 'grad'
                          }`}
                        >
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </span>
                        <span className={p.highlight ? 'text-white/80' : 'text-ink-soft'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-14">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              {(
                [
                  [Shield, 'Secure checkout', 'Stripe-powered, encrypted'],
                  [Zap, 'Instant credits', 'Added to your balance now'],
                  [RotateCcw, 'No lock-in', 'Credits never expire'],
                ] as [React.ComponentType<{ size?: number; className?: string }>, string, string][]
              ).map(([Ic, t, d]) => (
                <div key={t} className="bg-white rounded-3xl border border-line p-5">
                  <span className="grid place-items-center w-10 h-10 rounded-2xl bg-paper border border-line mx-auto mb-3">
                    <Ic size={18} className="text-ink" />
                  </span>
                  <div className="font-bold text-sm mb-0.5">{t}</div>
                  <div className="text-xs text-ink-faint">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
