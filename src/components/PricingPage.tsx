import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Camera,
  Video,
  Sparkles,
  Zap,
  Crown,
  Building2,
  ArrowLeft,
  Flame,
  Gift,
  Plus,
  Minus,
} from 'lucide-react';

type PricingPageProps = {
  onGetStarted: () => void;
  onBack: () => void;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try Shootly with no commitment',
    credits: 10,
    icon: Sparkles,
    highlight: false,
    badge: null,
    features: [
      '10 credits included',
      '~5 cinematic images',
      'OR 1 cinematic video',
      'All brand categories',
      'Product & cinematic modes',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    price: '$9.99',
    period: '/mo',
    description: 'For individual designers & small brands',
    credits: 50,
    icon: Zap,
    highlight: false,
    badge: null,
    features: [
      '50 credits / month',
      '~25 cinematic images',
      'OR 5 cinematic videos',
      'All brand categories',
      'Product & cinematic modes',
      'Virtual try-on',
    ],
    cta: 'Get Starter',
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/mo',
    description: 'For growing brands & agencies',
    credits: 200,
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
    features: [
      '200 credits / month',
      '~100 cinematic images',
      'OR 20 cinematic videos',
      'All brand categories',
      'Product & cinematic modes',
      'Virtual try-on',
      'Priority generation',
    ],
    cta: 'Get Pro',
  },
  {
    name: 'Business',
    price: '$79.99',
    period: '/mo',
    description: 'For large brands & studios',
    credits: 600,
    icon: Building2,
    highlight: false,
    badge: null,
    features: [
      '600 credits / month',
      '~300 cinematic images',
      'OR 60 cinematic videos',
      'All brand categories',
      'Product & cinematic modes',
      'Virtual try-on',
      'Priority generation',
      'Multi-brand workflows',
    ],
    cta: 'Get Business',
  },
];

const creditCosts = [
  {
    type: 'Product Image',
    credits: 1,
    icon: Camera,
    description: 'Upscaled product shot',
    iconBg: '#059669',
  },
  {
    type: 'Cinematic Image',
    credits: 2,
    icon: Camera,
    description: 'AI model wearing your design',
    iconBg: '#2563eb',
  },
  {
    type: 'Product Video',
    credits: 5,
    icon: Video,
    description: 'Rotation, close-up, or pan',
    iconBg: '#7c3aed',
  },
  {
    type: 'Cinematic Video',
    credits: 10,
    icon: Video,
    description: 'Full cinematic scene',
    iconBg: '#e11d48',
  },
];

const faqs = [
  {
    q: 'What happens when I run out of credits?',
    a: 'You can top up credits anytime or upgrade your plan. Your brand profiles and generated content remain accessible.',
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes, you can upgrade or downgrade at any time. When upgrading, your new credits are available immediately.',
  },
  {
    q: "What's the difference between product and cinematic mode?",
    a: 'Product mode creates clean product shots and animations of your design. Cinematic mode generates photorealistic scenes with AI models wearing your garment.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Credits reset each billing cycle on monthly plans. We recommend a plan that matches your typical monthly usage.',
  },
];

export function PricingPage({ onGetStarted, onBack }: PricingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [signupCount, setSignupCount] = useState<number | null>(null);

  const EARLY_ADOPTER_LIMIT = 20;

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://shootly-z6o8.vercel.app';
    fetch(`${backendUrl}/api/stats`)
      .then((r) => r.json())
      .then((data) => setSignupCount(data.signupCount ?? 0))
      .catch(() => setSignupCount(0));
  }, []);

  const spotsLeft = signupCount === null ? null : Math.max(0, EARLY_ADOPTER_LIMIT - signupCount);
  const isFull = signupCount !== null && signupCount >= EARLY_ADOPTER_LIMIT;

  const getPrice = (monthly: string) => {
    if (!isAnnual || monthly === '$0') return monthly;
    const num = parseFloat(monthly.replace('$', ''));
    const annual = (num * 0.8).toFixed(2);
    return `$${annual}`;
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Navbar — not blurred */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo-new.png" alt="Shootly" className="h-12 w-12" />
            <span className="text-lg font-semibold tracking-tight">Shootly</span>
          </div>
          <button
            onClick={onGetStarted}
            className="text-sm font-medium px-5 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Overlay — fixed below navbar, above blurred content */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center" style={{ top: 64 }}>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 mx-6 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundColor: '#141414', color: '#ffffff' }}
        >
          <div className="p-10 md:p-12 text-center">
            {/* Animated badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{
                backgroundColor: isFull ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: isFull ? '#f87171' : '#fbbf24',
                border: `1px solid ${isFull ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-4 h-4" />
              {isFull ? 'Early-adopter spots are full' : 'Limited — only 20 spots'}
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {isFull ? (
                <>All early-adopter<br />spots are claimed</>
              ) : (
                <>First 20 signups get<br /><span style={{ color: '#fbbf24' }}>20 credits free</span></>
              )}
            </h2>

            {/* Live counter */}
            <div className="mb-6">
              {signupCount === null ? (
                <div className="h-2 w-48 mx-auto rounded-full bg-white/10 animate-pulse" />
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm mb-2 max-w-xs mx-auto">
                    <span style={{ color: '#a3a3a3' }}>
                      {signupCount} of {EARLY_ADOPTER_LIMIT} spots claimed
                    </span>
                    <span style={{ color: isFull ? '#f87171' : '#fbbf24' }} className="font-semibold">
                      {isFull ? 'Full' : `${spotsLeft} left`}
                    </span>
                  </div>
                  <div className="w-full max-w-xs mx-auto h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: isFull ? '#f87171' : '#fbbf24' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (signupCount / EARLY_ADOPTER_LIMIT) * 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </>
              )}
            </div>

            <p className="mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: '#a3a3a3' }}>
              {isFull
                ? 'The early-adopter offer is over, but you can still sign up and explore the platform.'
                : 'Be an early adopter and get enough credits to create cinematic images and videos — completely free. No credit card required.'}
            </p>

            {/* Credit breakdown — only show when spots available */}
            {!isFull && (
              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {[
                  { label: '~10 cinematic images', icon: '📸' },
                  { label: '2 cinematic videos', icon: '🎬' },
                  { label: 'All brand categories', icon: '✅' },
                  { label: 'No credit card needed', icon: '🔓' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm rounded-xl px-3 py-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ color: '#d4d4d4' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            <motion.button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full font-semibold text-base transition-all"
              style={{ backgroundColor: '#ffffff', color: '#171717' }}
              whileHover={{ scale: 1.02, opacity: 0.95 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-5 h-5" />
              {isFull ? 'Sign Up Free' : 'Claim Your 20 Free Credits'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <p className="text-xs mt-4" style={{ color: '#525252' }}>
              Pricing details available after sign-up
            </p>
          </div>
        </motion.div>
      </div>

      {/* All pricing content — blurred behind the overlay */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', overflow: 'hidden' }}>

      {/* Hero Header */}
      <motion.section
        className="max-w-4xl mx-auto px-6 pt-20 pb-4 text-center"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-sm text-neutral-600 mb-6 border border-neutral-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          Credits that match
          <br />
          how you create
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Every plan includes all features — cinematic scenes, virtual try-on,
          and multi-brand support. Just pick your volume.
        </p>
      </motion.section>

      {/* Billing Toggle */}
      <motion.div
        className="flex items-center justify-center gap-4 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <span className={`text-sm font-medium ${!isAnnual ? 'text-neutral-900' : 'text-neutral-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          style={{
            position: 'relative',
            width: 48,
            height: 28,
            borderRadius: 9999,
            backgroundColor: isAnnual ? '#171717' : '#d4d4d4',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: isAnnual ? 23 : 3,
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s',
            }}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? 'text-neutral-900' : 'text-neutral-400'}`}>
          Annual
        </span>
        {isAnnual && (
          <motion.span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: '#059669', backgroundColor: '#ecfdf5' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Save 20%
          </motion.span>
        )}
      </motion.div>

      {/* Credit Cost Breakdown */}
      <motion.section
        className="max-w-3xl mx-auto px-6 pb-14"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {creditCosts.map((item, i) => (
            <motion.div
              key={item.type}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-neutral-200 text-center bg-white hover:border-neutral-300 transition-all duration-300"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.iconBg }}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-xs text-neutral-500 uppercase tracking-wide">
                {item.type}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{item.credits}</span>
                <span className="text-xs text-neutral-400 font-medium">
                  {item.credits === 1 ? 'credit' : 'credits'}
                </span>
              </div>
              <span className="text-xs text-neutral-400 leading-snug">{item.description}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Plans */}
      <motion.section
        className="max-w-6xl mx-auto px-6 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 lg:items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? 'border-neutral-800 lg:-mt-3 lg:mb-[-12px]'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              style={
                plan.highlight
                  ? {
                      backgroundColor: '#141414',
                      color: '#ffffff',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    }
                  : {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }
              }
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="flex justify-center pt-0">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#171717',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Flame className="w-3 h-3" style={{ color: '#f97316' }} />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`p-8 flex flex-col ${plan.badge ? 'pt-5' : ''}`}>
                {/* Plan Header */}
                <div className="mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: plan.highlight
                        ? 'rgba(255,255,255,0.12)'
                        : '#f5f5f5',
                    }}
                  >
                    <plan.icon
                      className="w-5 h-5"
                      style={{
                        color: plan.highlight ? '#ffffff' : '#525252',
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p
                    className="text-sm"
                    style={{ color: plan.highlight ? '#a3a3a3' : '#737373' }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {getPrice(plan.price)}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm ml-1"
                      style={{ color: plan.highlight ? '#a3a3a3' : '#737373' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                {isAnnual && plan.period ? (
                  <p
                    className="text-xs font-medium mb-5"
                    style={{ color: '#059669' }}
                  >
                    Billed $
                    {(parseFloat(plan.price.replace('$', '')) * 0.8 * 12).toFixed(0)}
                    /year
                  </p>
                ) : (
                  <div className="mb-5" />
                )}

                {/* Credits Pill */}
                <div
                  className="text-sm font-semibold px-4 py-2.5 rounded-xl mb-7 text-center"
                  style={{
                    backgroundColor: plan.highlight
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.04)',
                    color: plan.highlight ? '#ffffff' : '#404040',
                  }}
                >
                  <span className="text-base font-bold">{plan.credits}</span> credits
                  {plan.period ? ' / month' : ''}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div
                        className="w-5 h-5 mt-0.5 shrink-0 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: plan.highlight
                            ? 'rgba(16,185,129,0.2)'
                            : '#ecfdf5',
                        }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{
                            color: plan.highlight ? '#34d399' : '#059669',
                          }}
                          strokeWidth={3}
                        />
                      </div>
                      <span
                        style={{
                          color: plan.highlight ? '#d4d4d4' : '#525252',
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold transition-all duration-200 text-sm"
                  style={
                    plan.highlight
                      ? {
                          backgroundColor: '#ffffff',
                          color: '#171717',
                        }
                      : {
                          backgroundColor: '#171717',
                          color: '#ffffff',
                        }
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Enterprise */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-3xl border border-neutral-200 overflow-hidden"
          style={{ backgroundColor: '#fafafa' }}
        >
          <div className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-medium mb-5">
                <Building2 className="w-4 h-4" />
                Enterprise
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Need more? Let's talk.
              </h3>
              <p className="text-neutral-500 leading-relaxed mb-7">
                Starting at $199/month with 2,000+ credits, priority generation,
                dedicated support, and API access for your workflow.
              </p>
              <ul className="space-y-3">
                {[
                  '2,000+ credits / month',
                  'Priority generation queue',
                  'Dedicated account support',
                  'API access for custom integrations',
                  'Custom brand category setup',
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-neutral-600"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#ecfdf5' }}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: '#059669' }}
                        strokeWidth={3}
                      />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <a
                href="mailto:shootlyai@gmail.com"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Credit Top-ups */}
      <motion.section
        className="max-w-3xl mx-auto px-6 py-12 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-sm text-neutral-600 mb-5">
          <Plus className="w-4 h-4" />
          Add-ons
        </div>
        <h3 className="text-2xl font-bold mb-2">Need extra credits?</h3>
        <p className="text-neutral-500 mb-10 max-w-md mx-auto">
          Top up anytime without changing your plan.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { credits: 20, price: '$4.99', perCredit: '$0.25', popular: false },
            { credits: 50, price: '$9.99', perCredit: '$0.20', popular: true },
            { credits: 150, price: '$24.99', perCredit: '$0.17', popular: false },
          ].map((topup) => (
            <motion.div
              key={topup.credits}
              className={`relative flex flex-col items-center gap-2 p-7 rounded-2xl border transition-all duration-300 ${
                topup.popular
                  ? 'border-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              style={{
                backgroundColor: topup.popular ? '#fafafa' : '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              whileHover={{ y: -4 }}
            >
              {topup.popular && (
                <span
                  className="absolute -top-2.5 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-0.5 rounded-full"
                  style={{ backgroundColor: '#171717' }}
                >
                  Best value
                </span>
              )}
              <span className="text-3xl font-bold">{topup.credits}</span>
              <span className="text-xs text-neutral-400 font-medium">credits</span>
              <div className="w-8 h-px bg-neutral-200 my-1" />
              <span className="text-lg font-bold">{topup.price}</span>
              <span className="text-[10px] text-neutral-400">
                {topup.perCredit}/credit
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Early Adopter Banner */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-3xl overflow-hidden p-10 md:p-14 text-center"
          style={{ backgroundColor: '#141414', color: '#ffffff' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: 'rgba(245,158,11,0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gift className="w-4 h-4" />
            Limited offer
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            First 20 signups get 20 free credits
          </h3>
          <p style={{ color: '#a3a3a3' }} className="mb-8 max-w-md mx-auto leading-relaxed">
            Be an early adopter and get enough credits to create cinematic images
            and videos — completely free. No credit card required.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white font-semibold hover:bg-neutral-100 transition-colors"
            style={{ color: '#171717' }}
          >
            Claim Your Free Credits
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        className="max-w-2xl mx-auto px-6 py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="text-2xl font-bold text-center mb-10">
          Frequently asked questions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full p-5 text-left"
              >
                <span className="font-semibold text-sm pr-4">{faq.q}</span>
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: openFaq === i ? '#171717' : '#f5f5f5',
                    color: openFaq === i ? '#ffffff' : '#737373',
                  }}
                >
                  {openFaq === i ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5"
                >
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-16 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to create?</h2>
        <p className="text-neutral-500 text-lg mb-8 max-w-md mx-auto">
          Join the brands already using AI to produce stunning content.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-10 mt-10" style={{ pointerEvents: 'none' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <img src="/logo-new.png" alt="Shootly" className="h-5 w-5 opacity-50" />
              <span>
                &copy; {new Date().getFullYear()} Shootly. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="mailto:shootlyai@gmail.com"
                className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                shootlyai@gmail.com
              </a>
              <a
                href="https://instagram.com/shootly.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                shootly.io
              </a>
            </div>
          </div>
        </div>
      </footer>

      </div>{/* end blurred wrapper */}
    </div>
  );
}
