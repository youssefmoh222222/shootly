import { ChevronDown, Plus, Sparkles, Pencil, Trash2, Image, Video, Clock, LogOut, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import type { Brand } from '../App';
import {
  AlertDialog,
  AlertDialogTrigger,
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
  onLogout
}: DashboardProps) {
  const [generations, setGenerations] = useState<any[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const confirmDelete = () => {
    if (selectedBrand) {
      onDeleteBrand(selectedBrand.id);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('ai_clothing_studio_authenticated');
    localStorage.removeItem('ai_clothing_studio_token');
    console.log('Dashboard - localStorage cleared');
    // Call the logout callback
    onLogout();
  };

  // Fetch generations when brand changes or when history is shown
  useEffect(() => {
    if (selectedBrand && showHistory) {
      fetchGenerations();
    }
  }, [selectedBrand, showHistory]);

  const fetchGenerations = async () => {
    if (!selectedBrand) return;
    
    setIsLoadingGenerations(true);
    try {
      const token = localStorage.getItem('ai_clothing_studio_token');
      const response = await fetch(`/api/generations?brandId=${selectedBrand.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setGenerations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setIsLoadingGenerations(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.1 }}
>
  <img 
    src="/build/public/logo.png" 
    alt="Logo" 
    className="h-16 w-auto max-w-[2002px]" 
  />
</motion.div>


            {/* Brand Selector */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <motion.button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  showHistory ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="w-4 h-4" />
                History
              </motion.button>

              {credits !== null && (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold">{credits}</span>
                  <span className="text-amber-600">credits</span>
                </div>
              )}

              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>

              <div className="relative">
                <select
                  value={selectedBrand?.id || ''}
                  onChange={(e) => {
                    const brand = brands.find((b) => b.id === e.target.value);
                    if (brand) onSelectBrand(brand);
                  }}
                  className="appearance-none bg-neutral-50 border border-neutral-200 rounded-full pl-6 pr-12 py-3 text-sm font-medium cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-20">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black mb-8">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Create realistic photoshoots
              <br />
              for your brand using AI
            </h2>

            <p className="text-lg text-neutral-500 mb-12 max-w-md mx-auto">
              No prompts. No experience needed.
              <br />
              Upload your design — we'll do the rest.
            </p>

            {/* Primary CTA */}
            <motion.button
              onClick={onCreateContent}
              disabled={credits === 0}
              className={`inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-semibold mb-3 shadow-lg ${
                credits === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                  : 'bg-black text-white shadow-black/10'
              }`}
              whileHover={credits !== 0 ? { scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
              whileTap={credits !== 0 ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Sparkles className="w-5 h-5" />
              {credits === 0 ? 'No Credits' : 'Create Content'}
            </motion.button>

            <p className="text-xs text-neutral-400 mb-6">
              Image: 1 credit &middot; Video: 3 credits
            </p>

            {/* Secondary CTA */}
            <div>
              <motion.button
                onClick={onAddBrand}
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-black transition-colors text-sm font-medium"
                whileHover={{ gap: '0.75rem' }}
              >
                <Plus className="w-4 h-4" />
                Add New Brand
              </motion.button>
            </div>
          </motion.div>

          {/* Brand Info Card */}
          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 p-6 bg-neutral-50 rounded-3xl border border-neutral-100"
            >
              <div className="flex items-center justify-center gap-4">
                {selectedBrand.logo ? (
                  <img
                    src={selectedBrand.logo}
                    alt={`${selectedBrand.name} logo`}
                    className="w-12 h-12 rounded-full object-contain bg-white border border-neutral-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 shadow-sm flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-400">
                      {selectedBrand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm text-neutral-500 mb-0.5">Current Brand</p>
                  <p className="font-semibold text-lg">{selectedBrand.name}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="inline-block px-4 py-1.5 bg-white rounded-full text-xs font-medium text-neutral-700 border border-neutral-200 capitalize">
                    {selectedBrand.vibe}
                  </span>
                  {/* Edit Button */}
                  <motion.button
                    onClick={() => onEditBrand(selectedBrand)}
                    className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit brand"
                  >
                    <Pencil className="w-4 h-4" />
                  </motion.button>
                  {/* Delete Button with AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.button
                        className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-red-500 hover:border-red-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Delete brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{selectedBrand.name}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={confirmDelete}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generations History */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Your Generations</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Hide
                </button>
              </div>

              {isLoadingGenerations ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : generations.length === 0 ? (
                <div className="p-8 bg-neutral-50 rounded-2xl text-center border border-neutral-100">
                  <Image className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500 mb-2">No generations yet</p>
                  <p className="text-sm text-neutral-400">
                    Create your first photoshoot to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {generations.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                      <div className="flex items-center gap-3 mb-4">
                        {group.designImage && (
                          <img
                            src={group.designImage}
                            alt="Design"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{group.brandName}</p>
                          <p className="text-xs text-neutral-500">{group.generations.length} generation(s)</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {group.generations.map((gen: any) => (
                          <div
                            key={gen.id}
                            className="relative group aspect-square rounded-xl overflow-hidden bg-white"
                          >
                            {gen.type === 'VIDEO' ? (
                              <video
                                src={gen.resultUrl}
                                controls
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={gen.resultUrl}
                                alt={`Generation ${gen.type}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                                {gen.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Latest: {formatDate(group.generations[0]?.createdAt || new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

