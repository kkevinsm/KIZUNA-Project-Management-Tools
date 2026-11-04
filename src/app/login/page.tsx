'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, AlertCircle, X, ShieldCheck, Mail } from 'lucide-react';

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    (response: GoogleCredentialResponse) => {
      try {
        if (!response.credential) return;
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const data = JSON.parse(jsonPayload);

        loginWithGoogle({
          name: data.name,
          email: data.email,
          picture: data.picture,
        });
        router.push('/');
      } catch (err) {
        console.error('Google token parse error:', err);
        setError('Failed to authenticate with Google token.');
      }
    },
    [loginWithGoogle, router]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });
        const btnContainer = document.getElementById('googleNativeBtn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Google initialization error:', err);
      }
    }
  }, [googleClientId, handleCredentialResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleBtnClick = () => {
    setGoogleModalError(null);
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleGoogleAccountSelect = (selectedEmail: string, selectedName: string) => {
    const clean = selectedEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setGoogleModalError('Masukkan alamat email Google yang valid (contoh: nama@gmail.com).');
      return;
    }
    loginWithGoogle({
      name: selectedName.trim() || clean.split('@')[0],
      email: clean,
    });
    setShowGoogleModal(false);
    router.push('/');
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (googleClientId && window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleCredentialResponse,
            });
          }
        }}
      />

      <div className="min-h-screen w-full bg-[#1e1f21] flex flex-col justify-between p-6 select-none text-[#f5f4f3]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
              <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
              <span className="w-3 h-3 rounded-full bg-[#f06a6a]"></span>
            </div>
            <span className="font-bold text-[18px] tracking-tight text-white">kizuna</span>
          </div>

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
            <h1 className="text-[26px] font-bold text-white tracking-tight">Welcome to Kizuna</h1>
            <p className="text-[13px] text-[#8a8886] mt-1.5">
              To get started, please sign in with your Google Mail or email account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#47181c] border border-[#612127] rounded-xl flex items-center gap-2 text-[12px] text-[#ff6b72]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Continue with Google Button */}
          <div className="mb-4">
            <div id="googleNativeBtn" className="flex justify-center mb-1"></div>
            <button
              type="button"
              onClick={handleGoogleBtnClick}
              className="w-full bg-[#1e1f21] hover:bg-[#2b2c30] text-white border border-[#37383b] hover:border-[#4f5156] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] text-[13px]"
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#37383b] w-full"></div>
            <span className="bg-[#252628] px-3 text-[12px] text-[#8a8886] uppercase font-semibold">
              or
            </span>
            <div className="border-t border-[#37383b] w-full"></div>
          </div>

          {/* Standard Email & Password Form */}
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
                <span className="text-[11px] text-[#6d6c6e]">
                  Default: password123
                </span>
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
              <span>{loading ? 'Signing in...' : 'Continue with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#333538] flex items-center gap-2 text-[11px] text-[#8a8886]">
            <ShieldCheck className="w-4 h-4 text-[#4cd195] shrink-0" />
            <span>
              Setiap akun memiliki ruang kerja Kizuna terpisah dan hanya dapat melihat proyek/tugas yang dibagikan melalui izin undangan.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[12px] text-[#6d6c6e]">
          Kizuna Project Management • Secure Multi-Tenant Workspace powered by Cloudflare R2
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252628] border border-[#37383b] rounded-2xl p-6 max-w-md w-full shadow-2xl text-[13px] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-[#333538] pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <div>
                  <h2 className="text-[15px] font-bold text-white">Sign in with Google</h2>
                  <p className="text-[11px] text-[#8a8886]">Choose an account to continue to Kizuna</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg hover:bg-[#333538] text-[#8a8886] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {googleModalError && (
              <div className="mb-3 p-2.5 bg-[#47181c] border border-[#612127] rounded-lg flex items-center gap-2 text-[12px] text-[#ff6b72]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{googleModalError}</span>
              </div>
            )}

            {/* Quick Account Option */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect('karashii866@gmail.com', 'Kevin Safrisal')}
                className="w-full bg-[#1e1f21] hover:bg-[#2c2d30] border border-[#37383b] rounded-xl p-3 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#d84b7f] text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                    KS
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">Kevin Safrisal</div>
                    <div className="text-[11px] text-[#8a8886]">karashii866@gmail.com</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8a8886]" />
              </button>

              {/* Enter any Gmail account */}
              <div className="p-3.5 bg-[#1e1f21] rounded-xl border border-[#333538] space-y-2.5">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                  <Mail className="w-3.5 h-3.5 text-[#4573d2]" />
                  <span>Use another Google Mail account</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="nama.anda@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full bg-[#252628] text-white text-[13px] px-3 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Nama Lengkap (opsional)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full bg-[#252628] text-white text-[13px] px-3 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail.trim()}
                    onClick={() => handleGoogleAccountSelect(customGoogleEmail, customGoogleName)}
                    className="w-full bg-[#4573d2] hover:bg-[#3562be] disabled:opacity-40 text-white text-[13px] py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Continue as {customGoogleEmail.trim() || 'Google User'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
