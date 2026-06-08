import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { BrandWizard } from './components/BrandWizard.tsx';
import { DesignUpload } from './components/DesignUpload.tsx';
import { GenerationProgress } from './components/GenerationProgress.tsx';
import { ResultsScreen } from './components/ResultsScreen.tsx';
import { Auth } from './components/Auth.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { PricingPage } from './components/PricingPage.tsx';
import { motion, AnimatePresence } from 'motion/react';

// Backend API URL - Dev uses Vite proxy (/api → localhost:3001), prod hits Vercel directly
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://web-production-99299.up.railway.app/api')

// Log the API URL for debugging
console.log('API_URL:', API_URL);
console.log('import.meta.env.DEV:', import.meta.env.DEV);

export type Brand = {
  id: string;
  name: string;
  vibe: 'streetwear' | 'sports' | 'minimal';
  platform: 'instagram' | 'tiktok';
  category?: string;
  logo?: string;
  brandTone?: string;
  targetAudience?: string;
  environment?: string;
};

export type DesignData = {
  frontImage: string;
  backImage?: string;
  customPrompt?: string;
  generationMode?: 'product' | 'cinematic';
  productAnimation?: 'rotation' | 'closeup' | 'pan' | 'lifestyle';
  designDescription?: string;
  scenarioData?: {
    scenarioKey: string;
    seasonalAdaptation?: 'spring' | 'summer' | 'fall' | 'winter';
    timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
    demographic?: 'youngAdult' | 'professional' | 'luxury' | 'athletic';
    customDetails?: string;
    modelKey?: string;
    lighting?: string;
    camera?: string;
    colorGrade?: string;
    pose?: string;
    atmosphere?: string;
    background?: string;
    framing?: string;
    cinematicIntelligence?: string;
  };
  contentType?: 'image' | 'video';
  generateForAll?: boolean;
};

export type View = 'landing' | 'auth' | 'pricing' | 'dashboard' | 'brand-wizard' | 'design-upload' | 'generating' | 'results';

// localStorage keys
const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'ai_clothing_studio_authenticated',
  AUTH_TOKEN: 'ai_clothing_studio_token',
  REMEMBER_ME: 'ai_clothing_studio_remember_me',
};

// Helper to get auth headers (checks both storages)
const getAuthHeaders = (): Record<string, string> => {
  let token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  // Handle case where token is the literal string "null" or "undefined"
  if (!token || token === 'null' || token === 'undefined') {
    console.log('App - No valid token found in storage');
    return {};
  }

  console.log('App - Token found:', token.substring(0, 20) + '...');
  return { 'Authorization': `Bearer ${token}` };
};

// Helper to get fetch options with auth
const getFetchOptions = (method: string = 'GET', body?: any): RequestInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };
  
  return {
    method,
    headers,
    credentials: 'include' as const,  // Include cookies
    body: body ? JSON.stringify(body) : undefined,
  };
};

// Default brands for first-time users when API is unavailable
const defaultBrands: Brand[] = [
  {
    id: '1',
    name: 'Urban Threads',
    vibe: 'streetwear',
    platform: 'instagram',
    category: 'STREETWEAR'
  }
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [brands, setBrands] = useState<Brand[]>(defaultBrands);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [currentDesign, setCurrentDesign] = useState<DesignData | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Check authentication status on mount and validate token
  useEffect(() => {
    const checkAuth = async () => {
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      const storage = rememberMe === 'false' ? sessionStorage : localStorage;
      const storedAuth = storage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      const token = storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (storedAuth === 'true' && token && token !== 'null' && token !== 'undefined') {
        try {
          // Validate token by calling the credits endpoint
          const response = await fetch(`${API_URL}/credits`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setCredits(data.credits);
            setCurrentView('dashboard');
          } else {
            // Token is invalid/expired — clear everything
            localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
            sessionStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
            sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          }
        } catch {
          // Network error — allow access with stored token
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch brands and credits from database API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBrandsFromAPI();
      fetchCredits();
    } else {
      // Not authenticated, use default brands
      setBrands(defaultBrands);
      setSelectedBrand(null);
      setCredits(null);
    }
  }, [isAuthenticated]);

  const fetchBrandsFromAPI = async () => {
    try {
      let token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // Handle case where token is the literal string "null" or "undefined"
      if (!token || token === 'null' || token === 'undefined') {
        console.log('App - fetchBrandsFromAPI: No valid token found');
        setBrands(defaultBrands);
        setSelectedBrand(null);
        return;
      }
      
      console.log('App - fetchBrandsFromAPI token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_URL}/profiles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      console.log('App - fetchBrandsFromAPI response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Transform database brands to frontend format
          const dbBrands: Brand[] = data.data.map((profile: any) => {
            // Load logo from localStorage if available
            const savedLogo = localStorage.getItem(`brand_logo_${profile.id}`);
            return {
              id: profile.id,
              name: profile.name,
              vibe: mapCategoryToVibe(profile.category),
              platform: 'instagram' as const,
              category: profile.category,
              brandTone: profile.brandTone,
              targetAudience: profile.targetAudience,
              environment: profile.environment,
              logo: savedLogo || undefined,
            };
          });
          setBrands(dbBrands);
          setSelectedBrand(dbBrands[0]);
        }
        // If data is empty, keep current brands (don't overwrite with defaults)
      } else if (response.status === 401) {
        // Token expired, clear auth and redirect to login
        console.warn('Authentication expired, redirecting to login');
        handleLogout();
        return;
      } else {
        // API returned error, use default brands
        console.warn('API fetch failed, using default brands');
        setBrands(defaultBrands);
        setSelectedBrand(null);
      }
    } catch (error) {
      console.error('Error fetching brands from API:', error);
      // API not available, use default brands
      setBrands(defaultBrands);
      setSelectedBrand(null);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${API_URL}/credits`, getFetchOptions());
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const mapCategoryToVibe = (category: string): 'streetwear' | 'sports' | 'minimal' => {
    const categoryMap: Record<string, 'streetwear' | 'sports' | 'minimal'> = {
      'STREETWEAR': 'streetwear',
      'FOOTBALL': 'sports',
      'GYMWEAR': 'sports',
      'OLD_MONEY': 'minimal',
      'LUXURY': 'minimal',
      'MINIMAL': 'minimal',
      'VINTAGE': 'streetwear',
      'MEDICAL_WEAR': 'minimal',
      'Y2K': 'streetwear',
      'TECHWEAR': 'streetwear',
      'OVERSIZED': 'streetwear',
      'RETRO_SPORTS': 'sports',
      'PREPPY': 'minimal'
    };
    return categoryMap[category] || 'streetwear';
  };

  const mapVibeToCategory = (vibe: string): string => {
    const vibeMap: Record<string, string> = {
      'streetwear': 'STREETWEAR',
      'football': 'FOOTBALL',
      'gymwear': 'GYMWEAR',
      'old-money': 'OLD_MONEY',
      'luxury': 'LUXURY',
      'minimal': 'MINIMAL',
      'vintage': 'VINTAGE',
      'medical-wear': 'MEDICAL_WEAR',
      'y2k': 'Y2K',
      'techwear': 'TECHWEAR',
      'oversized': 'OVERSIZED',
      'retro-sports': 'RETRO_SPORTS',
      'preppy': 'PREPPY',
      // Legacy mappings
      'sports': 'GYMWEAR'
    };
    return vibeMap[vibe] || 'STREETWEAR';
  };

  const handleAuthenticated = (creditsFromAuth?: number, rememberMe: boolean = true, token?: string) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    if (token) {
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    storage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(rememberMe));

    setIsAuthenticated(true);
    if (creditsFromAuth !== undefined) setCredits(creditsFromAuth);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear both storages
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setBrands(defaultBrands);
    setSelectedBrand(null);
    setCurrentView('landing');
  };

  const handleSignupComplete = (creditsFromAuth?: number, token?: string) => {
    // Sign-up always remembers (localStorage)
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');

    setIsAuthenticated(true);
    if (creditsFromAuth !== undefined) setCredits(creditsFromAuth);
    setCurrentView('brand-wizard');
  };

  const handleCreateBrand = async (brand: Brand) => {
    try {
      // Call create API
      const response = await fetch(`${API_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: brand.name,
          category: mapVibeToCategory(brand.vibe),
          brandTone: 'MINIMAL',
          targetAudience: 'GENERAL_PUBLIC',
          environment: 'STUDIO',
        })
      });

      if (response.ok) {
        const data = await response.json();
        const categoryValue = mapVibeToCategory(brand.vibe);
        const brandId = data.data?.id || brand.id;
        const newBrand = { ...brand, id: brandId, category: categoryValue };

        // Save logo to localStorage if provided
        if (brand.logo) {
          localStorage.setItem(`brand_logo_${brandId}`, brand.logo);
        }

        const updatedBrands = [...brands, newBrand];
        setBrands(updatedBrands);
        setSelectedBrand(newBrand);
        setCurrentView('dashboard');
      } else {
        // Check if it's an auth error
        if (response.status === 401) {
          console.warn('Authentication expired, redirecting to login');
          handleLogout();
          return;
        }
        
        // API failed - do NOT add to local state
        console.warn('API call failed, brand not saved');
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create brand: ${errorData.message || 'Unknown error'}`);
        // Don't change view, let user try again
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Failed to create brand. Please try again.');
      // Don't add to local state or change view
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setCurrentView('brand-wizard');
  };

  const handleUpdateBrand = async (updatedBrand: Brand) => {
    try {
      // Call update API
      const response = await fetch(`${API_URL}/profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          id: updatedBrand.id,
          name: updatedBrand.name,
          category: mapVibeToCategory(updatedBrand.vibe),
          brandTone: 'MINIMAL',
          targetAudience: 'GENERAL_PUBLIC',
          environment: 'STUDIO',
        })
      });

      if (response.ok) {
        console.log('Brand updated successfully');
      } else {
        console.warn('API update call failed, updating locally only');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
    }

    // Save logo to localStorage
    if (updatedBrand.logo) {
      localStorage.setItem(`brand_logo_${updatedBrand.id}`, updatedBrand.logo);
    } else {
      localStorage.removeItem(`brand_logo_${updatedBrand.id}`);
    }

    // Update local state - ensure category stays in sync with vibe
    const brandWithCategory = { ...updatedBrand, category: mapVibeToCategory(updatedBrand.vibe) };
    const updatedBrands = brands.map(b => b.id === updatedBrand.id ? brandWithCategory : b);
    setBrands(updatedBrands);
    if (selectedBrand?.id === updatedBrand.id) {
      setSelectedBrand(brandWithCategory);
    }
    setEditingBrand(null);
    setCurrentView('dashboard');
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      // Call delete API
      const response = await fetch(`${API_URL}/profiles?id=${brandId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        return;
      }
      
      console.log('Brand deleted successfully');
    } catch (error) {
      console.error('Error deleting brand:', error);
      return;
    }
    
    // Update local state
    const updatedBrands = brands.filter(b => b.id !== brandId);
    setBrands(updatedBrands);
    
    // If deleted brand was selected, select the first available brand
    if (selectedBrand?.id === brandId) {
      const newSelected = updatedBrands.length > 0 ? updatedBrands[0] : null;
      setSelectedBrand(newSelected);
    }
  };

  const handleStartGeneration = async (design: DesignData) => {
    if (!selectedBrand) return;

    setCurrentDesign(design);

    // Cache the design metadata for regeneration (strip image data URIs — too large for localStorage)
    try {
      const { designUrl, backDesignUrl, ...designMeta } = design as any;
      localStorage.setItem('ai_clothing_studio_last_design', JSON.stringify(designMeta));
    } catch {
      // Quota exceeded or storage unavailable — non-critical, skip cache
    }

    setCurrentView('generating');

    try {
      const generationType = design.contentType === 'video' ? 'VIDEO' : 'IMAGE';

      // Check if generating for ALL profiles
      if (design.generateForAll && brands.length > 0) {
        console.log(`Starting generation for ALL ${brands.length} profiles...`);

        const response = await fetch(`${API_URL}/generate-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify({
            imageUrl: design.frontImage,
            backImageUrl: design.backImage,
            title: `${selectedBrand.name} Design`,
            type: generationType,
            customPrompt: design.customPrompt,
            // Generation mode
            generationMode: design.generationMode || 'cinematic',
            productAnimation: design.productAnimation,
            designDescription: design.designDescription,
            // Cinematic mood selections
            scenarioKey: design.scenarioData?.scenarioKey,
            seasonalAdaptation: design.scenarioData?.seasonalAdaptation,
            timeOfDay: design.scenarioData?.timeOfDay,
            demographic: design.scenarioData?.demographic,
            customDetails: design.scenarioData?.customDetails,
            // Model profile selection
            modelKey: design.scenarioData?.modelKey,
            // Director controls
            lighting: design.scenarioData?.lighting,
            camera: design.scenarioData?.camera,
            colorGrade: design.scenarioData?.colorGrade,
            pose: design.scenarioData?.pose,
            atmosphere: design.scenarioData?.atmosphere,
            background: design.scenarioData?.background,
            framing: design.scenarioData?.framing,
            cinematicIntelligence: design.scenarioData?.cinematicIntelligence,
            // Brand profile data
            brandName: selectedBrand.name,
            brandCategory: selectedBrand.category,
            brandTone: selectedBrand.brandTone,
            targetAudience: selectedBrand.targetAudience,
            brandEnvironment: selectedBrand.environment,
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Generation failed' }));
          if (errorData.credits !== undefined) setCredits(errorData.credits);
          throw new Error(errorData.error || `Generation failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data.data?.credits !== undefined) setCredits(data.data.credits);
        const allResults = data.data?.results || [];
        const successResults = allResults.filter((r: any) => r.status === 'success');

        console.log(`Generation complete: ${successResults.length}/${allResults.length} successful`);

        // Runway always returns videos - collect all as video results
        const videos = successResults.map((r: any) => r.resultUrl);

        setGeneratedContent({
          images: [],
          video: videos.length > 0 ? videos[0] : '',
          allResults: successResults,
          totalProfiles: allResults.length,
          successCount: successResults.length,
        });

        setCurrentView('results');
        return;
      }

      // Single profile generation
      // Step 1: Create a design record
      const designResponse = await fetch(`${API_URL}/designs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          brandProfileId: selectedBrand.id,
          title: `${selectedBrand.name} Design`,
          imageUrl: design.frontImage,
          backImageUrl: design.backImage,
          customPrompt: design.customPrompt,
        })
      });

      if (!designResponse.ok) {
        const errData = await designResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create design');
      }

      const designData = await designResponse.json();
      const designId = designData.data?.id;

      if (!designId) {
        throw new Error('No design ID returned');
      }

      console.log('Design created:', designId);

      // Step 2: Start generation
      const generateResponse = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          designId,
          type: generationType,
          customPrompt: design.customPrompt,
          // Generation mode
          generationMode: design.generationMode || 'cinematic',
          productAnimation: design.productAnimation,
          designDescription: design.designDescription,
          // Cinematic mood selections
          scenarioKey: design.scenarioData?.scenarioKey,
          seasonalAdaptation: design.scenarioData?.seasonalAdaptation,
          timeOfDay: design.scenarioData?.timeOfDay,
          demographic: design.scenarioData?.demographic,
          customDetails: design.scenarioData?.customDetails,
          // Model profile selection
          modelKey: design.scenarioData?.modelKey,
          // Director controls
          lighting: design.scenarioData?.lighting,
          camera: design.scenarioData?.camera,
          colorGrade: design.scenarioData?.colorGrade,
          pose: design.scenarioData?.pose,
          atmosphere: design.scenarioData?.atmosphere,
          background: design.scenarioData?.background,
          framing: design.scenarioData?.framing,
          cinematicIntelligence: design.scenarioData?.cinematicIntelligence,
          // Brand profile data
          brandName: selectedBrand.name,
          brandCategory: selectedBrand.category,
          brandTone: selectedBrand.brandTone,
          targetAudience: selectedBrand.targetAudience,
          brandEnvironment: selectedBrand.environment,
        })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({ error: 'Generation failed' }));
        if (errorData.credits !== undefined) setCredits(errorData.credits);
        throw new Error(errorData.error || `Generation failed with status ${generateResponse.status}`);
      }

      const genData = await generateResponse.json();
      const resultUrl = genData.data?.resultUrl;
      const resultUrls = genData.data?.resultUrls || [resultUrl];  // Array of all URLs (front + back)
      const resultType = genData.data?.resultType || 'video';
      if (genData.data?.credits !== undefined) setCredits(genData.data.credits);
      console.log(`${generationType} generated (${resultType}):`, resultUrls);

      if (!resultUrl) {
        throw new Error('No result URL returned from generation');
      }

      if (resultType === 'image') {
        // Use resultUrls array for multiple images (front + back)
        setGeneratedContent({
          images: resultUrls.filter((url: string) => url && url.length > 0),
          video: '',
          generationId: genData.data?.generationId,
        });
      } else {
        setGeneratedContent({
          images: [],
          video: resultUrl,
          generationId: genData.data?.generationId,
        });
      }

      setCurrentView('results');

    } catch (error: any) {
      console.error('Generation error:', error);
      setGeneratedContent({
        images: [],
        video: '',
        error: error.message || 'An unexpected error occurred during generation.',
      });
      setCurrentView('results');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8">
            <img src="/logo-new.png" alt="Shootly" className="w-20 h-20" />
          </div>
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingPage
              onGetStarted={() => setCurrentView('auth')}
              onSignIn={() => setCurrentView('auth')}
              onViewPricing={() => setCurrentView('pricing')}
            />
          </motion.div>
        )}

        {currentView === 'pricing' && (
          <motion.div
            key="pricing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <PricingPage
              onGetStarted={() => setCurrentView('auth')}
              onBack={() => setCurrentView('landing')}
            />
          </motion.div>
        )}

        {currentView === 'auth' && (
          <motion.div
            key="auth"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Auth
              onAuthenticated={handleAuthenticated}
              onSignupComplete={handleSignupComplete}
              apiUrl={API_URL}
              onBack={() => setCurrentView('landing')}
            />
          </motion.div>
        )}

        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Dashboard
              brands={brands}
              selectedBrand={selectedBrand}
              credits={credits}
              onSelectBrand={setSelectedBrand}
              onCreateContent={() => setCurrentView('design-upload')}
              onAddBrand={() => setCurrentView('brand-wizard')}
              onEditBrand={handleEditBrand}
              onDeleteBrand={handleDeleteBrand}
              onLogout={handleLogout}
              onBack={() => setCurrentView('landing')}
              onViewPricing={() => setCurrentView('pricing')}
            />
          </motion.div>
        )}

        {currentView === 'brand-wizard' && (
          <motion.div
            key="brand-wizard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandWizard
              onComplete={editingBrand ? handleUpdateBrand : handleCreateBrand}
              onCancel={() => {
                setEditingBrand(null);
                setCurrentView('dashboard');
              }}
              editingBrand={editingBrand}
            />
          </motion.div>
        )}

        {currentView === 'design-upload' && (
          <motion.div
            key="design-upload"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesignUpload
              brand={selectedBrand}
              brands={brands}
              onGenerate={handleStartGeneration}
              onBack={() => setCurrentView('dashboard')}
            />
          </motion.div>
        )}

        {currentView === 'generating' && (
          <motion.div
            key="generating"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <GenerationProgress brand={selectedBrand} totalBrands={currentDesign?.generateForAll ? brands.length : undefined} />
          </motion.div>
        )}

        {currentView === 'results' && (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResultsScreen
              content={generatedContent}
              brand={selectedBrand}
              onRegenerate={handleStartGeneration}
              onBack={() => setCurrentView('dashboard')}
              onViewPricing={() => setCurrentView('pricing')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
