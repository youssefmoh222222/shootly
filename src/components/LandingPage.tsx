import * as React from 'react';
import {
  ArrowRight,
  Sparkles,
  Play,
  Menu,
  X,
  Upload,
  Video,
  Layers,
  Wand,
  Camera,
  Zap,
  Shield,
} from 'lucide-react';
import { Button, Logo, Avatars } from './shootly-ui.tsx';

type LandingPageProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
  onViewPricing: () => void;
};

/* ============ Hero showcase visual ============ */
function HeroVisual() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto aspect-[5/6] sm:aspect-[6/6]">
      {/* glow */}
      <div
        className="absolute -inset-10 -z-10 rounded-full blur-3xl opacity-70"
        style={{ background: 'var(--grad-soft)' }}
      />

      {/* main generated frame */}
      <div className="frame figure absolute right-0 top-[6%] w-[68%] aspect-[3/4] rounded-[26px] ph-b shadow-deep">
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-ink">
          <Sparkles size={13} /> AI generated
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="relative grid place-items-center w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-deep">
            <span
              className="absolute inset-0 rounded-full"
              style={{ animation: 'pulsering 2.4s ease-out infinite', background: '#fff' }}
            />
            <Play size={20} className="text-ink relative z-10 ml-0.5" />
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 mb-0.5">Scene</div>
            <div className="text-sm font-semibold leading-tight">Golden hour · Editorial</div>
          </div>
          <span className="text-[10px] font-bold text-white/90 px-2 py-1 rounded-md bg-white/15 backdrop-blur">
            4K
          </span>
        </div>
      </div>

      {/* upload card (floating) */}
      <div
        className="floaty absolute left-0 top-0 w-[44%] bg-white rounded-2xl p-3 shadow-deep"
        style={{ animationDelay: '-1s' }}
      >
        <div className="rounded-xl border border-dashed border-line bg-paper aspect-square grid place-items-center mb-2.5 relative overflow-hidden">
          <svg
            viewBox="0 0 80 80"
            className="w-1/2 h-1/2 text-ink/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          >
            <path d="M28 14 L20 22 L12 30 L20 40 L26 36 L26 66 L54 66 L54 36 L60 40 L68 30 L60 22 L52 14 C48 20 32 20 28 14 Z" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full grad" />
        </div>
        <div className="flex items-center gap-2">
          <Upload size={14} className="text-ink-faint" />
          <span className="text-[11px] font-medium text-ink-soft truncate">your-design.png</span>
        </div>
      </div>

      {/* render time chip */}
      <div
        className="floaty absolute left-[6%] bottom-[8%] inline-flex items-center gap-2 bg-white rounded-full pl-1.5 pr-3.5 py-1.5 shadow-deep"
        style={{ animationDelay: '-3s' }}
      >
        <span className="grid place-items-center w-7 h-7 rounded-full grad">
          <Zap size={14} className="text-white" />
        </span>
        <div className="leading-tight">
          <div className="text-[10px] text-ink-faint -mb-0.5">AI</div>
          <div className="text-[12px] font-bold text-ink">rendered</div>
        </div>
      </div>

      {/* thumbnail strip */}
      <div className="absolute right-0 bottom-0 flex gap-2">
        {['ph-c', 'ph-a', 'ph-d'].map((c, i) => (
          <div key={i} className={`frame w-12 h-16 sm:w-14 sm:h-[76px] rounded-xl ${c} ring-2 ring-paper shadow-float`} />
        ))}
      </div>
    </div>
  );
}

export function LandingPage({ onGetStarted, onSignIn, onViewPricing }: LandingPageProps) {
  const [menu, setMenu] = React.useState(false);
  const links: [string, string][] = [
    ['Features', '#features'],
    ['How it works', '#how'],
    ['Showcase', '#showcase'],
    ['Pricing', '#pricing'],
  ];

  return (
    <div className="relative min-h-screen bg-paper text-ink overflow-x-hidden">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-50 glass border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <nav className="hidden md:flex items-center gap-1">
            {links.map(([l, h]) => (
              <a
                key={l}
                href={h}
                className="px-3.5 py-2 text-sm font-medium text-ink-soft hover:text-ink rounded-full hover:bg-ink/[0.04] transition-colors"
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onSignIn}
              className="text-sm font-semibold text-ink-soft hover:text-ink px-3 py-2 transition-colors"
            >
              Sign in
            </button>
            <Button variant="primary" className="text-sm px-5! py-2.5!" onClick={onGetStarted}>
              Get started <ArrowRight size={16} />
            </Button>
          </div>
          <button
            className="md:hidden grid place-items-center w-10 h-10 rounded-full border border-line bg-white"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menu && (
          <div className="md:hidden border-t border-line bg-paper px-5 py-4 flex flex-col gap-1">
            {links.map(([l, h]) => (
              <a
                key={l}
                href={h}
                onClick={() => setMenu(false)}
                className="px-3 py-2.5 text-[15px] font-medium text-ink-soft"
              >
                {l}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1 py-2.5! text-sm" onClick={onSignIn}>
                Sign in
              </Button>
              <Button variant="primary" className="flex-1 py-2.5! text-sm" onClick={onGetStarted}>
                Get started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative grain">
        <div
          className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50 -z-0"
          style={{ background: 'var(--grad-soft)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-16 sm:pt-24 pb-16 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="rise">
            <div className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-line shadow-float text-[13px] font-medium text-ink-soft mb-7">
              <span className="grid place-items-center w-5 h-5 rounded-full grad">
                <Sparkles size={12} className="text-white" />
              </span>
              AI photoshoots for fashion brands
            </div>
            <h1 className="text-[2.5rem] leading-[1.06] sm:text-[3.35rem] sm:leading-[1.05] font-extrabold tracking-[-0.03em] mb-6">
              Studio photoshoots,
              <br />
              <span className="serif-em grad-text pr-1">generated</span> in minutes.
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed max-w-xl mb-9">
              Upload your design, pick a mood, and get studio-quality images and cinematic video of
              models wearing it. No camera, no crew, no studio — just credits.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-9">
              <Button variant="primary" className="text-[15px] px-7! py-3.5!" onClick={onGetStarted}>
                Start free <ArrowRight size={17} />
              </Button>
              <Button
                variant="ghost"
                className="text-[15px] px-6! py-3.5!"
                onClick={() => document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="grid place-items-center w-6 h-6 rounded-full bg-ink text-white">
                  <Play size={11} className="ml-0.5" />
                </span>
                See how it works
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Avatars />
              <div className="text-sm text-ink-faint">Built for modern clothing brands.</div>
            </div>
          </div>
          <div className="rise" style={{ animationDelay: '.12s' }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ---------- Features (bento) ---------- */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mb-12 reveal">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-3">What you get</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-4">
            From a flat file to a <span className="serif-em">full campaign.</span>
          </h2>
          <p className="text-lg text-ink-soft">Everything you need to shoot a collection — without booking a thing.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {/* big card */}
          <div className="md:col-span-2 reveal bg-white rounded-4xl border border-line p-7 sm:p-9 lift hover:shadow-deep overflow-hidden relative">
            <div className="relative z-10 max-w-md">
              <span className="grid place-items-center w-12 h-12 rounded-2xl grad shadow-float mb-5">
                <Video size={22} className="text-white" />
              </span>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Cinematic scenes &amp; video</h3>
              <p className="text-ink-soft leading-relaxed">
                Generate studio stills or scroll-stopping product video with AI models wearing your designs —
                directed, lit, and graded for you.
              </p>
            </div>
            <div className="mt-7 flex gap-3">
              {['ph-c', 'ph-b', 'ph-a'].map((c, i) => (
                <div
                  key={i}
                  className={`frame ${c} rounded-2xl flex-1 aspect-[3/4] ${i === 1 ? 'figure' : ''} shadow-float relative`}
                >
                  {i === 1 && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid place-items-center w-10 h-10 rounded-full bg-white/90">
                        <Play size={15} className="text-ink ml-0.5" />
                      </span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* upload card */}
          <div className="reveal bg-white rounded-4xl border border-line p-7 sm:p-9 lift hover:shadow-deep">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink shadow-float mb-5">
              <Upload size={22} className="text-white" />
            </span>
            <h3 className="text-xl font-bold tracking-tight mb-2">Upload → AI does the rest</h3>
            <p className="text-ink-soft leading-relaxed text-[15px]">
              Drop your front and back images. Shootly reads the garment and builds a photoreal scene around it —
              automatically.
            </p>
          </div>
          {/* multi brand */}
          <div className="reveal bg-white rounded-4xl border border-line p-7 sm:p-9 lift hover:shadow-deep">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink shadow-float mb-5">
              <Layers size={22} className="text-white" />
            </span>
            <h3 className="text-xl font-bold tracking-tight mb-2">Multi-brand, one click</h3>
            <p className="text-ink-soft leading-relaxed text-[15px]">
              Keep a profile per label and generate on-brand content for each in a single workflow.
            </p>
          </div>
          {/* director controls wide */}
          <div className="md:col-span-2 reveal bg-ink text-white rounded-4xl p-7 sm:p-9 lift hover:shadow-deep relative overflow-hidden grain">
            <div
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-60"
              style={{ background: 'var(--grad)' }}
            />
            <div className="relative z-10">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur mb-5">
                <Wand size={22} className="text-white" />
              </span>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Director controls, on tap</h3>
              <p className="text-white/70 leading-relaxed max-w-md mb-6">
                Dial in the exact look — or let the AI direct it for you.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Lighting', 'Lens', 'Color grade', 'Pose', 'Atmosphere', 'Framing', 'Time of day'].map((t) => (
                  <span
                    key={t}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-medium backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-xl mx-auto mb-14 reveal">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-3">How it works</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em]">Three steps to a shoot.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-line" />
            {[
              [Sparkles, 'Create your brand profile', 'Set your name, category and style. Every shoot matches your brand identity.'],
              [Camera, 'Upload your design', 'Add front and back images. The AI extracts every detail of the garment.'],
              [Zap, 'Pick a scene & generate', 'Choose a cinematic scenario, tune the mood, and hit generate. Done in minutes.'],
            ].map(([Ic, t, d], i) => {
              const Icon = Ic as React.ComponentType<{ size?: number; className?: string }>;
              return (
                <div key={i} className="relative text-center reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="relative z-10 mx-auto mb-6 grid place-items-center w-14 h-14 rounded-full bg-paper border border-line shadow-float">
                    <span className="absolute -top-2 -right-1 grid place-items-center w-6 h-6 rounded-full grad text-white text-xs font-bold shadow-float">
                      {i + 1}
                    </span>
                    <Icon size={24} className="text-ink" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">{t as string}</h3>
                  <p className="text-ink-soft text-[15px] leading-relaxed max-w-xs mx-auto">{d as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Showcase ---------- */}
      <section id="showcase" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10 reveal">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-3">The gallery</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em]">
              Made with <span className="serif-em">Shootly.</span>
            </h2>
          </div>
          <p className="text-ink-soft max-w-sm text-[15px]">
            Every frame below started as a flat design file. Placeholders shown — drop in your own to see real output.
          </p>
        </div>
        <div className="columns-2 md:columns-4 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4">
          {(
            [
              ['ph-b', 'aspect-[3/4]', 'Golden hour', true],
              ['ph-c', 'aspect-square', 'Studio seamless', false],
              ['ph-a', 'aspect-[3/4]', 'Rooftop dusk', false],
              ['ph-d', 'aspect-[3/4]', 'Coastal morning', true],
              ['ph-e', 'aspect-square', 'Noir editorial', false],
              ['ph-f', 'aspect-[3/4]', 'Neon street', false],
              ['ph-a', 'aspect-square', 'Desert light', false],
              ['ph-b', 'aspect-[3/4]', 'Atelier grey', true],
            ] as [string, string, string, boolean][]
          ).map(([c, a, label, vid], i) => (
            <div
              key={i}
              className={`frame figure ${c} ${a} rounded-2xl relative break-inside-avoid group reveal shadow-float`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              {vid && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-white/85 backdrop-blur group-hover:scale-110 transition-transform">
                    <Play size={15} className="text-ink ml-0.5" />
                  </span>
                </span>
              )}
              <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between">
                <span className="text-white text-xs font-semibold">{label}</span>
                <span className="text-[9px] font-bold text-white/90 px-1.5 py-0.5 rounded bg-white/15 backdrop-blur uppercase tracking-wide">
                  {vid ? 'Video' : 'Image'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="bg-white border-y border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-xl mx-auto mb-12 reveal">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-3">Pricing</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-4">Pay only for what you create.</h2>
            <p className="text-lg text-ink-soft">Credit-based. No subscriptions, no hidden fees.</p>
          </div>
          <div className="reveal bg-paper rounded-4xl border border-line p-7 sm:p-10 shadow-float">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {(
                [
                  [Camera, 'Image', '1', 'credit per generation'],
                  [Video, 'Video', '3', 'credits per generation'],
                ] as [React.ComponentType<{ size?: number; className?: string }>, string, string, string][]
              ).map(([Ic, t, n, sub], i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-3xl border border-line p-5">
                  <span
                    className={`grid place-items-center w-14 h-14 rounded-2xl shrink-0 ${i === 0 ? 'bg-ink' : 'grad'}`}
                  >
                    <Ic size={24} className="text-white" />
                  </span>
                  <div>
                    <div className="font-bold text-lg">{t}</div>
                    <div className="text-ink-faint text-sm">
                      <span className="font-bold text-ink">{n}</span> {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl grad p-6 sm:p-7 text-white relative overflow-hidden grain">
              <div className="relative z-10 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full mb-2">
                  <Zap size={12} /> Launch offer
                </div>
                <div className="text-xl font-bold">Get free credits when you sign up.</div>
              </div>
              <Button variant="invert" className="relative z-10 shrink-0" onClick={onGetStarted}>
                Claim free credits <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink text-white px-6 sm:px-16 py-16 sm:py-24 text-center grain reveal">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-50"
            style={{ background: 'var(--grad)' }}
          />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] mb-5">
              Ready to <span className="serif-em">create?</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md mx-auto mb-9">
              Join the brands shooting entire collections with AI — and never book a studio again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="invert" className="text-[15px] px-7! py-3.5!" onClick={onGetStarted}>
                Get started free <ArrowRight size={17} />
              </Button>
              <Button variant="line" className="text-[15px] px-7! py-3.5!" onClick={onViewPricing}>
                View pricing
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/45">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="text-ink-soft text-sm mt-4 max-w-xs leading-relaxed">
              AI photoshoots for clothing brands. Scan it, style it, ship it.
            </p>
          </div>
          {(
            [
              ['Product', ['Features', 'Showcase', 'Pricing', 'Changelog']],
              ['Company', ['About', 'Blog', 'Careers', 'Contact']],
              ['Legal', ['Privacy', 'Terms', 'Security']],
            ] as [string, string[]][]
          ).map(([h, items]) => (
            <div key={h}>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint mb-4">{h}</div>
              <ul className="space-y-2.5">
                {items.map((it) => (
                  <li key={it}>
                    <a href="#" className="text-sm text-ink-soft hover:text-ink transition-colors">
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-faint">
            <span>© {new Date().getFullYear()} Shootly. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} /> SOC 2 · GDPR ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
