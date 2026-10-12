import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mail, Lock, User, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, setDemoMode } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error: authErr } = await signUpWithEmail(email, password, fullName);
      if (authErr) {
        setError(authErr.message || 'Signup failed. Please try again.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
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
          Create an account and never calculate splits by hand again.
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

          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#22C55E] border-3 border-black flex items-center justify-center shadow-neo">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-black font-display text-black">
                Check Your Email! 📩
              </h2>
              <p className="text-xs font-bold text-neutral-600">
                We sent a confirmation link to <span className="text-black font-black">{email}</span>. Click it to verify your account and start your Hisab journey.
              </p>
              <div className="pt-2">
                <Button variant="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Demo Mode Banner */}
              <div className="p-4 bg-[#FFE600] border-2 border-black rounded-2xl shadow-neo-sm">
                <div className="flex items-center gap-2 font-black text-xs uppercase mb-1">
                  <Sparkles className="w-4 h-4" /> Skip signup with Demo Mode
                </div>
                <p className="text-xs font-semibold text-black/80 mb-3">
                  Instantly try out HisabBhai with sample Indian roommates and trip data.
                </p>
                <Button
                  variant="dark"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleInstantDemo}
                  type="button"
                >
                  Launch Demo Mode 🚀
                </Button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t-2 border-black"></div>
                <span className="flex-shrink mx-3 text-xs font-black uppercase text-neutral-500">
                  Or Sign Up With Email
                </span>
                <div className="flex-grow border-t-2 border-black"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="neo-input pl-10 text-sm"
                    />
                  </div>
                </div>

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
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="neo-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="neo-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="blue"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </form>

              <p className="text-center text-xs font-bold text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="text-black font-extrabold underline">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
