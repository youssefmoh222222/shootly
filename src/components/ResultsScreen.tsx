import { useState } from 'react';
import { Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { Brand, DesignData } from '../App';

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
}

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
  } catch (err) {
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}

export function ResultsScreen({ content, brand, onRegenerate, onBack }: ResultsScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const brandName = brand?.name?.replace(/\s+/g, '-').toLowerCase() || 'shoot';

  const handleDownloadImage = (url: string, index: number) => {
    const label = content.images.length === 2 ? (index === 0 ? 'front' : 'back') : `${index + 1}`;
    downloadFile(url, `${brandName}-photo-${label}.webp`);
  };

  const handleDownloadVideo = () => {
    if (content.video) {
      downloadFile(content.video, `${brandName}-video.mp4`);
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < content.images.length; i++) {
      await downloadFile(content.images[i], `${brandName}-photo-${content.images.length === 2 ? (i === 0 ? 'front' : 'back') : `${i + 1}`}.webp`);
    }
    if (content.video) {
      await downloadFile(content.video, `${brandName}-video.mp4`);
    }
  };

  const handleDownloadAllImages = () => {
    content.images.forEach((img, i) => handleDownloadImage(img, i));
  };

  // Use the stored design or a default empty one for regeneration
  const handleRegenerate = () => {
    // Use cached design data from localStorage if available
    const cachedDesign = localStorage.getItem('ai_clothing_studio_last_design');
    if (cachedDesign) {
      try {
        const design = JSON.parse(cachedDesign);
        onRegenerate(design);
        return;
      } catch (e) {
        console.error('Failed to parse cached design:', e);
      }
    }
    // Fallback - go back to design upload
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full text-sm font-medium hover:border-neutral-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </motion.button>

              <motion.button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Download All
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {content.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                Generation encountered an issue
              </h1>
              <p className="text-neutral-500 mb-4 max-w-lg mx-auto">{content.error}</p>
              <motion.button
                onClick={handleRegenerate}
                className="px-6 py-3 bg-black text-white rounded-full font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Success Message */}
          {!content.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white mb-6"
              >
                <motion.svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </motion.svg>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Your AI photoshoot is ready
              </h1>
              <p className="text-lg text-neutral-500">
                {content.allResults && content.totalProfiles
                  ? `Generated for ${content.successCount} of ${content.totalProfiles} brand profiles`
                  : 'Generated using your brand identity'}
              </p>
            </motion.div>
          )}

          {/* Multi-Profile Results */}
          {content.allResults && content.allResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Results by Brand Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.allResults.map((result: any, index: number) => (
                  <motion.div
                    key={result.profileId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                    className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-sm"
                  >
                    <div className="p-4 border-b border-neutral-100">
                      <h3 className="font-semibold text-lg">{result.profileName}</h3>
                      <p className="text-sm text-neutral-500 capitalize">{result.category.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                    <div className="aspect-video bg-neutral-100 group relative">
                      {result.resultUrl ? (
                        <video
                          src={result.resultUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          No result
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Images Grid (single-profile mode) */}
          {content.images.length > 0 && !content.allResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Photoshoots</h2>
                <button
                  onClick={handleDownloadAllImages}
                  className="text-sm text-neutral-600 hover:text-black transition-colors font-medium"
                >
                  Download Images
                </button>
              </div>

              <div className={`grid gap-4 ${content.images.length === 2 ? 'grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-2 md:grid-cols-4'}`}>
                {content.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={image}
                      alt={`Generated content ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Front/Back label for 2 images */}
                    {content.images.length === 2 && (
                      <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {index === 0 ? 'Front' : 'Back'}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <motion.button
                        className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image, index);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                    </div>

                    {brand?.logo && (
                      <img
                        src={brand.logo}
                        alt=""
                        className="absolute top-3 right-3 w-6 h-6 rounded-full object-contain bg-white border border-neutral-200 shadow-lg"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Video Section (single-profile mode) */}
          {content.video && !content.allResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Video</h2>
                <button
                  onClick={handleDownloadVideo}
                  className="text-sm text-neutral-600 hover:text-black transition-colors font-medium"
                >
                  Download Video
                </button>
              </div>

              <div className="max-w-4xl">
                <motion.div
                  className="relative aspect-[9/16] md:aspect-video rounded-3xl overflow-hidden bg-neutral-100 group"
                  whileHover={{ scale: 1.01 }}
                >
                  <video
                    src={content.video}
                    poster={content.images[0] || ''}
                    controls
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-4 p-8 bg-neutral-50 rounded-3xl border border-neutral-100">
              <p className="text-sm text-neutral-600">Want a different vibe?</p>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleRegenerate}
                  className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Adjust and regenerate
                </motion.button>
                <motion.button
                  onClick={onBack}
                  className="px-6 py-3 bg-black text-white rounded-full font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create another photoshoot
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            src={selectedImage}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain rounded-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = content.images.indexOf(selectedImage!);
              handleDownloadImage(selectedImage!, idx >= 0 ? idx : 0);
            }}
            className="absolute top-6 left-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-neutral-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-neutral-300 transition-colors"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
}