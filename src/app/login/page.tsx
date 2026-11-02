'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, AlertCircle, X, ExternalLink, CheckCircle } from 'lucide-react';

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
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    try {
      if (!response.credential) return;
      // Decode JWT payload
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
  }, [loginWithGoogle, router]);

  // Initialize Google Identity Services when script is ready
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
    if (googleClientId && window.google?.accounts?.id) {
      // Trigger native Google Prompt
      window.google.accounts.id.prompt();
    } else {
      // Show setup dialog explaining how Google OAuth API works + demo login options
      setShowGoogleSetupModal(true);
    }
  };

  const handleModalGoogleLogin = (useKevin = true) => {
    if (useKevin) {
      loginWithGoogle({
        name: 'Kevin Safrisal',
        email: 'karashii866@gmail.com',
      });
    } else {
      if (!customGoogleEmail.trim()) return;
      loginWithGoogle({
        name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
        email: customGoogleEmail.trim(),
      });
    }
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
            <h1 className="text-[26px] font-bold text-white tracking-tight">Welcome to Kizuna</h1>
            <p className="text-[13px] text-[#8a8886] mt-1.5">
              Log in to manage projects and collaborate with your team
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
              {/* Official Google G Logo SVG */}
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
                <button
                  type="button"
                  onClick={() => alert('Password default adalah: password123')}
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
              <span>{loading ? 'Signing in...' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[12px] text-[#6d6c6e]">
          Kizuna Project Management • Seamless Asana workflow for you and your team
        </div>
      </div>

      {/* Google Sign-In Setup & Info Modal */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252628] border border-[#37383b] rounded-2xl p-6 max-w-lg w-full shadow-2xl text-[13px] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-[#333538] pb-3">
              <div className="flex items-center gap-2">
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
                <h2 className="text-[16px] font-bold text-white">Google Account Sign-In</h2>
              </div>
              <button
                onClick={() => setShowGoogleSetupModal(false)}
                className="p-1 rounded-lg hover:bg-[#333538] text-[#8a8886] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#bdbbb9] mb-4 leading-relaxed">
              Agar popup Google resmi (Google OAuth consent) muncul otomatis di browser, Anda hanya perlu memasukkan <strong>Google Client ID</strong> di Vercel Environment Variables.
            </p>

            {/* Step-by-step to get Google Client ID */}
            <div className="bg-[#1e1f21] border border-[#333538] rounded-xl p-3.5 mb-4 space-y-2 text-[12px] text-[#9c9a99]">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Cara Mengaktifkan Google OAuth Resmi (Gratis):</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4573d2] hover:underline flex items-center gap-1"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Buka Google Cloud Console ➔ Credentials ➔ Create OAuth Client ID (Web Application).</li>
                <li>Tambahkan Authorized Origins: <code className="text-[#4cd195] bg-[#151617] px-1 rounded">https://kizuna-project-management.vercel.app</code></li>
                <li>Salin Client ID ke Vercel: <code className="text-[#4cd195] bg-[#151617] px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.</li>
              </ol>
            </div>

            {/* Quick Demo Login Option */}
            <div className="border-t border-[#333538] pt-3.5">
              <span className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider block mb-2">
                Opsi Masuk Cepat Google:
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleModalGoogleLogin(true)}
                  className="w-full bg-[#4573d2] hover:bg-[#3562be] text-white p-2.5 rounded-xl font-medium flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4cd195]" />
                    <span>Masuk sebagai Kevin (karashii866@gmail.com)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="p-3 bg-[#1e1f21] rounded-xl border border-[#333538] space-y-2">
                  <span className="text-[11px] text-[#8a8886] block">
                    Atau masuk menggunakan akun Google teman Anda:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="email.teman@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="flex-1 bg-[#252628] text-white text-[12px] px-2.5 py-1.5 rounded-lg border border-[#37383b] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Nama Teman"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-28 bg-[#252628] text-white text-[12px] px-2.5 py-1.5 rounded-lg border border-[#37383b] outline-none"
                    />
                    <button
                      type="button"
                      disabled={!customGoogleEmail.trim()}
                      onClick={() => handleModalGoogleLogin(false)}
                      className="bg-[#2f3135] hover:bg-[#383a3f] disabled:opacity-40 text-white text-[12px] px-3 py-1.5 rounded-lg font-medium"
                    >
                      Masuk
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
