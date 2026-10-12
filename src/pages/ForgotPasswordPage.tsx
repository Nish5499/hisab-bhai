import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: resetErr } = await resetPasswordForEmail(email);
      if (resetErr) {
        setError(resetErr.message || 'Failed to send reset link.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <h1 className="text-3xl font-black font-display tracking-tight text-black mb-2">
          Forgot Password? 🔑
        </h1>
        <p className="text-sm font-bold text-neutral-600">
          Enter your registered email and we'll send you a password reset link.
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
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#22C55E] border-3 border-black flex items-center justify-center shadow-neo">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-xl font-black font-display">Reset Link Sent!</h2>
              <p className="text-xs font-bold text-neutral-600">
                Check your inbox for <span className="text-black font-black">{email}</span>. Click the link to set a new password.
              </p>
              <Link to="/login" className="inline-block mt-2">
                <Button variant="primary">Return to Login</Button>
              </Link>
            </div>
          ) : (
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Send Password Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
