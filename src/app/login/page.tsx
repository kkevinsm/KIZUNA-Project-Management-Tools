'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, AlertCircle, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, users, switchUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1f21] flex flex-col justify-between p-6 select-none text-[#f5f4f3]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Asana 3 Coral Dots Logo */}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
            <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
          </div>
          <span className="font-bold text-[18px] tracking-tight text-white">kizuna</span>
        </Link>

        <div className="text-[13px] text-[#8a8886]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#4573d2] hover:underline font-semibold ml-1">
            Sign up
          </Link>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-[#252628] border border-[#333538] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-[#8a8886] mt-1.5">
            Log in to collaborate with your team on Kizuna
          </p>
        </div>

        {/* Quick One-Click Sign-in for Kevin and Friend */}
        <div className="mb-6 p-3 bg-[#1e1f21] border border-[#333538] rounded-xl space-y-2">
          <div className="text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#4cd195]" />
            <span>Quick Sign-in (1-Click)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.id)}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#252628] hover:bg-[#2e3034] border border-[#37383b] transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.initials}
                </div>
                <div className="truncate">
                  <div className="text-[12px] font-semibold text-white truncate">{u.name}</div>
                  <div className="text-[10px] text-[#8a8886] truncate">{u.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#47181c] border border-[#612127] rounded-xl flex items-center gap-2 text-[12px] text-[#ff6b72]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form with Modern Web Guidance autocomplete & semantic attributes */}
        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label htmlFor="email" className="block text-[#8a8886] font-semibold mb-1.5">
              Email address
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-[#8a8886] font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Default demo password is: password123')}
                className="text-[11px] text-[#4573d2] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
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
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-[12px] text-[#6d6c6e]">
        Kizuna Project Management • Seamless Asana workflow for you and your team
      </div>
    </div>
  );
}
