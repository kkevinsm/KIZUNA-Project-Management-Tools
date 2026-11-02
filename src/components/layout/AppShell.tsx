'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import FarRail from './FarRail';
import TopNav from './TopNav';
import SideNav from './SideNav';
import TaskDrawer from '../tasks/TaskDrawer';
import CreateModal from '../modals/CreateModal';
import InviteModal from '../modals/InviteModal';
import { useApp } from '@/context/AppContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useApp();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthPage, router]);

  // If on login or signup page, render standalone without shell
  if (isAuthPage) {
    return <main className="min-h-screen bg-[#1e1f21]">{children}</main>;
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
    </div>
  );
}
