import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      const email = fd.get('email') as string;
      await login(email, fd.get('password') as string);
      
      // Check for Admin redirection
      if (email === 'admin@edusync.in') {
        window.location.href = 'http://localhost:3000';
        return;
      }

      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Simple Branding */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">EduSync Systems</span>
          </div>
          <h1 className="text-4xl font-light tracking-[-0.03em] text-gray-900 mb-2">Sign in.</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Access your institutional dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-emerald-500">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@school.edu"
                className="w-full h-12 bg-gray-50 border-none rounded-none text-base text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-0 focus:border-b-2 focus:border-emerald-500 transition-all duration-300"
              />
              <div className="h-[1px] w-full bg-gray-100" />
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-emerald-500">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-12 bg-gray-50 border-none rounded-none text-base text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-0 focus:border-b-2 focus:border-emerald-500 transition-all duration-300"
              />
              <div className="h-[1px] w-full bg-gray-100" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-500 bg-rose-50/50 p-3 rounded-none animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-between h-14 bg-gray-900 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-bold px-6 transition-all duration-500 active:scale-[0.98]"
            >
              <span className="text-sm tracking-tight">{loading ? 'Processing...' : 'Continue'}</span>
              {!loading && <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            </button>
          </div>
        </form>

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-gray-50 pt-8">
          <p className="text-xs text-gray-400 font-medium">New institution?</p>
          <Link
            to="/signup"
            className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 hover:text-gray-900 transition-colors border-b border-emerald-100"
          >
            Create an Account
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        Alpha v1.02.2
      </footer>
    </div>
  );
}
