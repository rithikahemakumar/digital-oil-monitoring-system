import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Droplet, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const initialMode = params.get('mode') === 'login' ? 'login' : 'signup';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate('/onboarding');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/88 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/10 border border-neutral-200/60 my-auto">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
            <Droplet size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">OilWise</span>
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          {mode === 'signup' ? 'Start your smart oil journey today' : 'Sign in to track your oil intake'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error-600 bg-error-50 rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-400 font-medium">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              loginDemo();
              navigate('/dashboard');
            }}
            className="w-full py-3.5 rounded-xl border border-primary-300 bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} className="text-primary-600" />
            <span>Explore Demo Mode (Instant Access)</span>
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="text-primary-600 font-semibold hover:underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
