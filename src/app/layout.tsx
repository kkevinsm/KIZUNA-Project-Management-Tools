import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Kizuna - Project Management (Asana Clone)',
  description: 'Pixel-perfect duplicate web application of Asana.com with Cloudflare R2 storage',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#1e1f21] text-[#f5f4f3] antialiased">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
