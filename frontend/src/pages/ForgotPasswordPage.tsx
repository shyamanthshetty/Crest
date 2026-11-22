import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setDevToken(null);

    try {
      const response = await authService.forgotPassword(email.trim());
      setSuccessMessage(response.message || 'If that email exists, a password reset link has been sent.');
      if (response.resetToken) {
        setDevToken(response.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDevToken = () => {
    if (devToken) {
      navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(devToken)}`);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot password?</h2>
        <p className="text-slate-500 mt-2 text-sm">
          No worries! Enter your registered email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {successMessage ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3.5">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-emerald-900">Check your inbox</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {successMessage}
              </p>
            </div>
          </div>

          {devToken && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-wider">
                <KeyRound size={14} />
                <span>Dev Mode Detected</span>
              </div>
              <p className="text-xs text-amber-900">
                A reset token was provided directly by the server:
              </p>
              <div className="font-mono text-xs bg-white/90 p-2 rounded-lg border border-amber-200 break-all select-all text-slate-700">
                {devToken}
              </div>
              <button
                type="button"
                onClick={handleUseDevToken}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue to Reset Password with this Token</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <KeyRound size={16} />
              <span>I already have a reset token</span>
            </Link>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Return to sign in</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 block">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                placeholder="Enter your registered email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold transition-all shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_20px_-4px_rgba(99,102,241,0.5)] disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Send Reset Link
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="pt-2 flex flex-col gap-3 text-center">
            <Link
              to="/reset-password"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Have a reset token? Click here to enter it
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
