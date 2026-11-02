'use client';

import React from 'react';
import FarRail from './FarRail';
import TopNav from './TopNav';
import SideNav from './SideNav';
import TaskDrawer from '../tasks/TaskDrawer';
import CreateModal from '../modals/CreateModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
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
    </div>
  );
}
