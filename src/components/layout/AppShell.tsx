'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import FarRail from './FarRail';
import TopNav from './TopNav';
import SideNav from './SideNav';
import TaskDrawer from '../tasks/TaskDrawer';
import CreateModal from '../modals/CreateModal';
import InviteModal from '../modals/InviteModal';
import CreateWorkspaceModal from '../modals/CreateWorkspaceModal';
import { useApp } from '@/context/AppContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useApp();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated && !isAuthPage) {
      router.replace('/login');
    } else if (isAuthenticated && isAuthPage) {
      router.replace('/');
    }
  }, [isHydrated, isAuthenticated, isAuthPage, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen w-screen bg-[#1e1f21] flex flex-col items-center justify-center gap-3 text-[#9ca3af] select-none">
        <div className="flex items-center gap-1.5 animate-pulse">
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
        </div>
        <span className="text-[13px] font-medium text-[#8a8886]">Loading Kizuna...</span>
      </div>
    );
  }

  // If on login or signup page, render standalone without shell
  if (isAuthPage) {
    return <main className="min-h-screen bg-[#1e1f21]">{children}</main>;
  }

  // Block rendering of protected routes when unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#1e1f21] flex flex-col items-center justify-center gap-3 text-[#9ca3af] select-none">
        <div className="flex items-center gap-1.5 animate-pulse">
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#f06a6a]"></span>
        </div>
        <span className="text-[13px] font-medium text-[#8a8886]">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f21] text-[#f5f4f3]">
      {/* 1. Far Left Narrow Icon Rail */}
      <FarRail />

      {/* 2. Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Global Top Header */}
        <TopNav />

        {/* Workspace Body: SideNav + Dynamic Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <SideNav />

          <main className="flex-1 min-w-0 overflow-y-auto bg-[#1e1f21] flex flex-col">
            {children}
          </main>

          {/* Right Slide-over Task Drawer */}
          <TaskDrawer />
        </div>
      </div>

      {/* Global Modals */}
      <CreateModal />
      <InviteModal />
      <CreateWorkspaceModal />
    </div>
  );
}
