import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';
import { ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

type Step = 'form' | 'success';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const confirmPw = fd.get('confirmPw') as string;
    const schoolName = fd.get('schoolName') as string;
    const city = fd.get('city') as string;
    const phone = fd.get('phone') as string;
    const students = parseInt(fd.get('students') as string, 10);

    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await api.post('/registrations', {
        schoolName,
        city,
        contactName: name,
        email,
        phone,
        students,
        plan: 'Starter',
        uid: cred.user.uid,
      });

      setStep('success');
      await auth.signOut();
    } catch (error) {
      setError(getErrorMessage(error, 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
          <div className="mb-12 flex justify-center">
             <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
             </div>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-4">User registration done</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
            Your registration is being reviewed. We'll contact you once your institution is verified.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-14 bg-gray-900 hover:bg-emerald-600 text-white font-bold px-6 transition-all duration-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-20 px-6 selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Onboarding Portal</span>
          </div>
          <h1 className="text-4xl font-light tracking-[-0.03em] text-gray-900 mb-2">Create Account.</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Register your school for EduSync Access.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Principal */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-gray-50 pb-2">Administrative Profile</h2>
            <div className="space-y-4">
              <input name="name" type="text" required placeholder="Full Legal Name" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
              <input name="email" type="email" required placeholder="Institutional Email" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input name="password" type="password" required placeholder="Secure Password" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
                <input name="confirmPw" type="password" required placeholder="Confirm Password" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Section: Institution */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Institution Details</h2>
            <div className="space-y-4">
              <input name="schoolName" type="text" required placeholder="School Name" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input name="city" type="text" required placeholder="City" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
                <input name="students" type="number" required placeholder="Total Students" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
              </div>
              <input name="phone" type="tel" placeholder="Contact Phone" className="w-full h-12 bg-gray-50/50 border-none rounded-none px-4 text-sm focus:bg-white focus:ring-0 focus:border-l-2 focus:border-emerald-500 transition-all" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-500 bg-rose-50/50 p-4 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-between h-16 bg-gray-900 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-bold px-8 transition-all duration-500"
            >
              <span className="text-sm tracking-tight">{loading ? 'Verifying...' : 'Request Credentials'}</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        <div className="mt-16 flex flex-col items-center gap-4 pt-12 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium">Already registered?</p>
          <Link
            to="/login"
            className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 hover:text-gray-900 transition-colors border-b border-emerald-100"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    </div>
  );
}
