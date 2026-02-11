import { useState, useEffect } from 'react';
import { Sparkles, Palette, Camera, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Brand } from '../App';

interface GenerationProgressProps {
  brand: Brand | null;
  totalBrands?: number;
}

const stages = [
  {
    icon: Palette,
    title: 'Analyzing your design',
    description: 'Understanding style and composition'
  },
  {
    icon: Sparkles,
    title: 'Matching brand identity',
    description: 'Applying your brand context'
  },
  {
    icon: Camera,
    title: 'Creating photoshoot scenes',
    description: 'Generating professional imagery'
  },
  {
    icon: Video,
    title: 'Rendering images and video',
    description: 'Finalizing your content'
  }
];

export function GenerationProgress({ brand, totalBrands }: GenerationProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1000);

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const target = ((currentStage + 1) / stages.length) * 100;
        const diff = target - prev;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [currentStage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-2xl w-full">
        {/* Main Animation */}
        <div className="text-center mb-16">
          <motion.div
            className="relative inline-block mb-12"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-16 h-16" />
            </div>

            {/* Orbiting Particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  marginLeft: '-6px',
                  marginTop: '-6px'
                }}
                animate={{
                  x: [0, Math.cos((i * 120 * Math.PI) / 180) * 80],
                  y: [0, Math.sin((i * 120 * Math.PI) / 180) * 80],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            AI Creative Director is working…
          </motion.h1>

          {brand && (
            <motion.p
              className="text-lg text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {totalBrands && totalBrands > 1
                ? <>Generating for <span className="text-white font-semibold">{totalBrands} brand profiles</span></>
                : <>Creating content for <span className="text-white font-semibold">{brand.name}</span></>
              }
            </motion.p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === currentStage;
              const isComplete = index < currentStage;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isActive || isComplete ? 1 : 0.3,
                    x: 0,
                    scale: isActive ? 1.02 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive ? 'bg-white/10' : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isComplete
                        ? 'bg-white text-black'
                        : isActive
                        ? 'bg-white/20 animate-pulse'
                        : 'bg-white/5'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-0.5">{stage.title}</h3>
                    <p className="text-sm text-white/60">{stage.description}</p>
                  </div>

                  {isActive && (
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Brand Accent */}
        {brand && (
          <motion.div
            className="mt-12 h-1 rounded-full mx-auto bg-black"
            style={{ width: '120px' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}