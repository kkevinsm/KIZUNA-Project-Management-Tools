'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, AlertCircle, Users } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useApp();

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
          <h1 className="text-[26px] font-bold text-white tracking-tight">Join your team</h1>
          <p className="text-[13px] text-[#8a8886] mt-1.5">
            Create an account to collaborate on projects with Kevin
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#47181c] border border-[#612127] rounded-xl flex items-center gap-2 text-[12px] text-[#ff6b72]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
              placeholder="e.g. Alex Pratama"
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
