import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, setDemoMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: authErr } = await signInWithEmail(email, password);
      if (authErr) {
        setError(authErr.message || 'Incorrect credentials. Please try again.');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  const handleInstantDemo = () => {
    setDemoMode(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🪙</span>
          <h1 className="text-3xl font-black font-display tracking-tight text-black">
            HisabBhai
          </h1>
        </div>
        <p className="text-sm font-bold text-neutral-600">
          Welcome back! Login to check who owes what.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl border-2 border-black bg-red-100 text-red-900 text-xs font-bold flex items-center gap-2 shadow-neo-sm">
              <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Mode Banner */}
          <div className="p-4 bg-[#FFE600] border-2 border-black rounded-2xl shadow-neo-sm">
            <div className="flex items-center gap-2 font-black text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4" /> Instant Demo Mode
            </div>
            <p className="text-xs font-semibold text-black/80 mb-3">
              Want to test immediately without signing up? Click below to load Indian roommates & tapri chai sample data.
            </p>
            <Button
              variant="dark"
              size="sm"
              className="w-full text-xs"
              onClick={handleInstantDemo}
              type="button"
            >
              Enter Demo Mode as Rahul Sharma ⚡
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t-2 border-black"></div>
            <span className="flex-shrink mx-3 text-xs font-black uppercase text-neutral-500">
              Or Sign In With
            </span>
            <div className="flex-grow border-t-2 border-black"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3 px-4 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 text-black font-extrabold text-sm shadow-neo inline-flex items-center justify-center gap-3 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="neo-input pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase text-black">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#2B59FF] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="neo-input pl-10 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Log In to HisabBhai
            </Button>
          </form>

          <p className="text-center text-xs font-bold text-neutral-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-black font-extrabold underline">
              Sign Up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
