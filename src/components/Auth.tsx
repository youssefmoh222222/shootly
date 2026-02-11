import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

type AuthView = 'entry' | 'signup' | 'signin';

interface AuthProps {
  onAuthenticated: (credits?: number) => void;
  onSignupComplete: (credits?: number) => void;
  apiUrl: string;
}

export function Auth({ onAuthenticated, onSignupComplete, apiUrl }: AuthProps) {
  const [view, setView] = useState<AuthView>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    console.log('=== SIGNUP ATTEMPT ===');
    try {
      console.log('Sending signup request...');
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: brandName }),
      });

      console.log('Signup response status:', response.status);
      console.log('Signup response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first to handle non-JSON responses
      const text = await response.text();
      console.log('Signup response body:', text.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // If response is not JSON, show the status
        console.error('Signup error: Invalid response', text);
        alert(`Signup failed: Server returned ${response.status}`);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        console.log('Signup SUCCESS!');
        console.log('Full response data:', data);
        if (data.token) {
          console.log('Token received:', data.token.substring(0, 30) + '...');
          localStorage.setItem('ai_clothing_studio_token', data.token);
          console.log('Token stored in localStorage');
        } else {
          console.warn('No token in signup response!', data);
        }
        onSignupComplete(data.credits);
      } else {
        console.error('Signup failed:', data);
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('=== SIGNIN ATTEMPT ===');
    try {
      console.log('Sending signin request...');
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Signin response status:', response.status);
      console.log('Signin response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first to handle non-JSON responses
      const text = await response.text();
      console.log('Signin response body:', text.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // If response is not JSON, show the status
        console.error('Signin error: Invalid response', text);
        alert(`Sign in failed: Server returned ${response.status}`);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        console.log('Signin SUCCESS!');
        console.log('Full response data:', data);
        if (data.token) {
          console.log('Token received:', data.token.substring(0, 30) + '...');
          localStorage.setItem('ai_clothing_studio_token', data.token);
          console.log('Token stored in localStorage');
        } else {
          console.warn('No token in signin response!', data);
        }
        onAuthenticated(data.credits);
      } else {
        console.error('Signin failed:', data);
        alert(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Signin error:', error);
      alert('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Entry Screen */}
          {view === 'entry' && (
            <motion.div
              key="entry"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Logo/Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black mb-8"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
              >
                Welcome to Shootly
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-neutral-600 mb-12"
              >
                Create professional photoshoots for your brand in minutes.
              </motion.p>

              {/* Primary Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={() => setView('signup')}
                  className="w-full bg-black text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-black/10 group"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Sign up
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setView('signin')}
                  className="w-full bg-white text-black px-8 py-4 rounded-full font-semibold text-lg border-2 border-neutral-200 hover:border-neutral-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
                </motion.button>
              </motion.div>

              {/* Trust Badge */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-neutral-500 mt-8"
              >
                No credit card required
              </motion.p>
            </motion.div>
          )}

          {/* Sign Up Screen */}
          {view === 'signup' && (
            <motion.div
              key="signup"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setView('entry')}
                className="text-neutral-600 hover:text-black transition-colors mb-8 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Create account
              </h2>
              <p className="text-neutral-600 mb-8">
                You can set up your brand profile in the next step.
              </p>

              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>

                {/* Brand Name (Optional) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Brand name <span className="text-neutral-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Your brand name"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full bg-black text-white px-8 py-4 rounded-full font-semibold mt-6 disabled:opacity-50 relative overflow-hidden group"
                  whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Creating account...
                    </motion.div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-sm text-neutral-500">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full px-6 py-3 border-2 border-neutral-200 rounded-full font-medium hover:border-neutral-300 transition-colors flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full px-6 py-3 border-2 border-neutral-200 rounded-full font-medium hover:border-neutral-300 transition-colors flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </motion.button>
              </div>

              {/* Footer */}
              <p className="text-sm text-center text-neutral-600 mt-8">
                Already have an account?{' '}
                <button
                  onClick={() => setView('signin')}
                  className="text-black font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {/* Sign In Screen */}
          {view === 'signin' && (
            <motion.div
              key="signin"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setView('entry')}
                className="text-neutral-600 hover:text-black transition-colors mb-8 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-neutral-600 mb-8">
                Sign in to continue creating amazing content.
              </p>

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full bg-black text-white px-8 py-4 rounded-full font-semibold mt-6 disabled:opacity-50 relative overflow-hidden group"
                  whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Signing in...
                    </motion.div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-sm text-neutral-500">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full px-6 py-3 border-2 border-neutral-200 rounded-full font-medium hover:border-neutral-300 transition-colors flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full px-6 py-3 border-2 border-neutral-200 rounded-full font-medium hover:border-neutral-300 transition-colors flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </motion.button>
              </div>

              {/* Footer */}
              <p className="text-sm text-center text-neutral-600 mt-8">
                Don't have an account?{' '}
                <button
                  onClick={() => setView('signup')}
                  className="text-black font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
