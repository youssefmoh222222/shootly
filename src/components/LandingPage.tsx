import { motion } from 'motion/react';
import {
  Upload,
  Video,
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  Camera,
  Check,
} from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Shootly" className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">Shootly</span>
          </div>
          <button
            onClick={onSignIn}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-sm text-neutral-600 mb-8">
          <Sparkles className="w-4 h-4" />
          AI-powered clothing content
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          AI Photoshoots for Your
          <br />
          Clothing Brand
        </h1>
        <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your design. Pick a mood. Get studio-quality images and cinematic
          videos — no camera, no model, no studio needed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-5 text-sm text-neutral-400">
          No credit card required &middot; First 20 users get 20 free credits
        </p>
      </motion.section>

      {/* Features */}
      <motion.section
        className="max-w-5xl mx-auto px-6 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-neutral-500 text-center mb-14 max-w-lg mx-auto">
          From a flat design file to scroll-stopping content in minutes.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Upload,
              title: 'Upload → AI Does the Rest',
              description:
                'Drop your front and back design images. Our AI analyzes the garment and builds a photorealistic scene around it.',
            },
            {
              icon: Video,
              title: 'Cinematic Scenes & Videos',
              description:
                'Generate studio-quality still images or cinematic product videos with AI models wearing your designs.',
            },
            {
              icon: Layers,
              title: 'Multi-Brand, One Click',
              description:
                'Manage multiple brand profiles and generate content tailored to each brand\'s style in a single workflow.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-8 rounded-3xl border border-neutral-200 hover:border-neutral-300 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
        <p className="text-neutral-500 text-center mb-14 max-w-lg mx-auto">
          Three simple steps from design to content.
        </p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: 1,
              icon: Sparkles,
              title: 'Create your brand profile',
              description:
                'Set your brand name, category, and style. Your AI content will match your brand identity.',
            },
            {
              step: 2,
              icon: Camera,
              title: 'Upload your design',
              description:
                'Upload front and back images of your garment. The AI extracts every detail automatically.',
            },
            {
              step: 3,
              icon: Zap,
              title: 'Choose a scene & generate',
              description:
                'Pick a cinematic scenario, adjust the mood, and hit generate. Done in minutes.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto mb-5 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing / Credits */}
      <motion.section
        className="max-w-3xl mx-auto px-6 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Simple credit-based pricing
        </h2>
        <p className="text-neutral-500 text-center mb-12 max-w-md mx-auto">
          Pay only for what you generate. No subscriptions, no hidden fees.
        </p>
        <div className="rounded-3xl border border-neutral-200 p-10 text-center">
          <div className="flex items-center justify-center gap-12 mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-neutral-700" />
              </div>
              <span className="font-semibold text-lg">Image</span>
              <span className="text-neutral-500 text-sm">1 credit</span>
            </div>
            <div className="w-px h-16 bg-neutral-200" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Video className="w-6 h-6 text-neutral-700" />
              </div>
              <span className="font-semibold text-lg">Video</span>
              <span className="text-neutral-500 text-sm">3 credits</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            First 20 signups get 20 free credits
          </div>
          <div>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors mt-4"
            >
              Start creating
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-4xl font-bold mb-4">Ready to create?</h2>
        <p className="text-neutral-500 text-lg mb-8 max-w-md mx-auto">
          Join the brands already using AI to produce stunning content.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <img src="/logo.png" alt="Shootly" className="h-5 w-5 opacity-50" />
            <span>&copy; {new Date().getFullYear()} Shootly. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
