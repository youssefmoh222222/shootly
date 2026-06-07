import { useState } from 'react';
import { ArrowRight, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Camera, Check } from 'lucide-react';
import { Button, TextField, FieldLabel } from './shootly-ui.tsx';

type AuthView = 'entry' | 'signup' | 'signin';

interface AuthProps {
  onAuthenticated: (credits?: number, rememberMe?: boolean, token?: string) => void;
  onSignupComplete: (credits?: number, token?: string) => void;
  apiUrl: string;
  onBack: () => void;
}

function GoogleMark() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function SocialButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full px-6 py-3.5 bg-white border border-line rounded-full font-semibold text-[15px] text-ink hover:border-ink/25 hover:-translate-y-0.5 shadow-float transition-all flex items-center justify-center gap-3"
      >
        <GoogleMark /> Continue with Google
      </button>
      <button
        type="button"
        className="w-full px-6 py-3.5 bg-white border border-line rounded-full font-semibold text-[15px] text-ink hover:border-ink/25 hover:-translate-y-0.5 shadow-float transition-all flex items-center justify-center gap-3"
      >
        <AppleMark /> Continue with Apple
      </button>
    </div>
  );
}

export function Auth({ onAuthenticated, onSignupComplete, apiUrl, onBack }: AuthProps) {
  const [view, setView] = useState<AuthView>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: brandName }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert(`Signup failed: Server returned ${response.status}`);
        setIsLoading(false);
        return;
      }
      if (response.ok) {
        onSignupComplete(data.credits, data.token);
      } else {
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
    try {
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert(`Sign in failed: Server returned ${response.status}`);
        setIsLoading(false);
        return;
      }
      if (response.ok) {
        onAuthenticated(data.credits, rememberMe, data.token);
      } else {
        alert(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Signin error:', error);
      alert('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-paper text-ink grain">
      <div
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-50 -z-0"
        style={{ background: 'var(--grad-soft)' }}
      />
      <div className="relative z-10 px-5 sm:px-6 pt-7">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft size={18} /> Back to site
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-6 py-10">
        <div className="w-full max-w-[420px]">
          {/* Entry */}
          {view === 'entry' && (
            <div className="text-center rise">
              <div className="inline-grid place-items-center w-16 h-16 rounded-[20px] grad shadow-deep mb-7">
                <Camera size={30} className="text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.15] mb-5 pb-1">
                Welcome to <span className="serif-em grad-text">Shootly</span>
              </h1>
              <p className="text-lg text-ink-soft mb-10">
                Create professional photoshoots for your brand in minutes.
              </p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full py-4! text-[15px]" onClick={() => setView('signup')}>
                  Create account <ArrowRight size={17} />
                </Button>
                <Button variant="ghost" className="w-full py-4! text-[15px]" onClick={() => setView('signin')}>
                  Sign in
                </Button>
              </div>
              <p className="text-sm text-ink-faint mt-8">No credit card required · free credits to start</p>
            </div>
          )}

          {/* Sign up / Sign in */}
          {view !== 'entry' && (
            <div className="rise">
              <button
                onClick={() => setView('entry')}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors mb-7"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] mb-2">
                {view === 'signup' ? 'Create account' : 'Welcome back'}
              </h2>
              <p className="text-ink-soft mb-7">
                {view === 'signup' ? 'Set up your brand in the next step.' : 'Sign in to keep creating.'}
              </p>

              <form className="space-y-4" onSubmit={view === 'signup' ? handleSignUp : handleSignIn}>
                <div>
                  <FieldLabel icon={Mail}>Email</FieldLabel>
                  <TextField
                    icon={Mail}
                    type="email"
                    placeholder="you@brand.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Lock size={16} className="text-ink-soft" /> Password
                    </span>
                    {view === 'signin' && (
                      <button type="button" className="text-sm font-medium text-ink-soft hover:text-ink">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <TextField
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={view === 'signup' ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-ink-faint hover:text-ink-soft"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </div>

                {view === 'signup' && (
                  <>
                    <div>
                      <FieldLabel icon={Lock}>Confirm password</FieldLabel>
                      <TextField
                        icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel icon={User}>
                        Brand name <span className="text-ink-faint font-normal">(optional)</span>
                      </FieldLabel>
                      <TextField
                        icon={User}
                        placeholder="Your brand name"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {view === 'signin' && (
                  <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        setRememberMe(!rememberMe);
                      }}
                      className={`grid place-items-center w-5 h-5 rounded-md border-2 transition-all ${
                        rememberMe ? 'bg-ink border-ink' : 'bg-white border-line hover:border-ink/40'
                      }`}
                    >
                      {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-sm text-ink-soft">Remember me</span>
                  </label>
                )}

                <Button type="submit" variant="primary" className="w-full py-4! text-[15px] mt-2" disabled={isLoading}>
                  {isLoading
                    ? view === 'signup'
                      ? 'Creating account…'
                      : 'Signing in…'
                    : view === 'signup'
                    ? 'Create account'
                    : 'Sign in'}{' '}
                  {!isLoading && <ArrowRight size={17} />}
                </Button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-line" />
                <span className="text-sm text-ink-faint">or</span>
                <div className="flex-1 h-px bg-line" />
              </div>
              <SocialButtons />
              <p className="text-sm text-center text-ink-soft mt-8">
                {view === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => setView(view === 'signup' ? 'signin' : 'signup')}
                  className="font-bold text-ink hover:underline"
                >
                  {view === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
