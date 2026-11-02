'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, AlertCircle, Users } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    const result = signup(name, email, password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Failed to create account');
    }
  };

  const handleGoogleSignUp = () => {
    loginWithGoogle();
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1f21] flex flex-col justify-between p-6 select-none text-[#f5f4f3]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
          </div>
          <span className="font-bold text-[18px] tracking-tight text-white">kizuna</span>
        </Link>

        <div className="text-[13px] text-[#8a8886]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4573d2] hover:underline font-semibold ml-1">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Sign-Up Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-[#252628] border border-[#333538] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4573d2]/20 border border-[#4573d2]/40 text-[#4573d2] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">Create an account</h1>
          <p className="text-[13px] text-[#8a8886] mt-1.5">
            Sign up to manage projects and collaborate seamlessly
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#47181c] border border-[#612127] rounded-xl flex items-center gap-2 text-[12px] text-[#ff6b72]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full bg-[#1e1f21] hover:bg-[#2b2c30] text-white border border-[#37383b] hover:border-[#4f5156] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] mb-4 text-[13px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.43l4.02-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#37383b] w-full"></div>
          <span className="bg-[#252628] px-3 text-[12px] text-[#8a8886] uppercase font-semibold">
            or
          </span>
          <div className="border-t border-[#37383b] w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label htmlFor="name" className="block text-[#8a8886] font-semibold mb-1.5">
              Full name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              placeholder="e.g. Kevin Safrisal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1e1f21] hover:bg-[#1a1b1d] focus:bg-[#151617] text-white px-3.5 py-2.5 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[#8a8886] font-semibold mb-1.5">
              Work email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              spellCheck={false}
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1e1f21] hover:bg-[#1a1b1d] focus:bg-[#151617] text-white px-3.5 py-2.5 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#8a8886] font-semibold mb-1.5">
              Create password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e1f21] hover:bg-[#1a1b1d] focus:bg-[#151617] text-white px-3.5 py-2.5 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4573d2] hover:bg-[#3562be] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-center text-[12px] text-[#6d6c6e]">
        Kizuna Project Management • Seamless Asana workflow for you and your team
      </div>
    </div>
  );
}
