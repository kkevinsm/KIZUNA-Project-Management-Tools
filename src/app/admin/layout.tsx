'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowRight, ExternalLink, SlidersHorizontal, Check } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { EditWorkspaceNameModal, ContactSalesModal } from '@/components/admin/AdminModals';
import { useApp } from '@/context/AppContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, openInviteModal, logout } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const [isContactSalesOpen, setIsContactSalesOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f21] text-[#f5f4f3] select-none">
      {/* 1. Admin Sidebar */}
      <AdminSidebar
        onContactSales={() => setIsContactSalesOpen(true)}
        onEditWorkspace={() => setIsEditWorkspaceOpen(true)}
      />

      {/* 2. Main Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#1e1f21]">
        {/* Top Header Bar */}
        <header className="h-[48px] min-h-[48px] border-b border-[#262729] px-6 flex items-center justify-end gap-3 z-30 bg-[#1e1f21]/80 backdrop-blur-xs">
          {/* Invite Users Button (Matching admin_02.jpg) */}
          <button
            onClick={openInviteModal}
            className="bg-[#4573d2] hover:bg-[#3b63b8] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite users</span>
          </button>

          {/* User Profile Avatar (Pink KS / currentUser) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold transition-transform hover:scale-105 shadow-sm ring-2 ring-transparent hover:ring-[#4573d2] cursor-pointer"
              style={{ backgroundColor: currentUser?.avatarColor || '#d84b7f' }}
              title={`${currentUser?.name} (${currentUser?.email})`}
            >
              {currentUser?.initials || 'KS'}
            </button>

            {/* Profile Popover Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[240px] bg-[#1e1f21] border border-[#333538] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]">
                <div className="p-2 border-b border-[#2d2f32]">
                  <div className="font-semibold text-white truncate">{currentUser?.name}</div>
                  <div className="text-[12px] text-[#8a8886] truncate">{currentUser?.email}</div>
                  <div className="text-[11px] text-[#4573d2] mt-0.5 truncate font-medium">
                    {currentUser?.workspace || 'My workspace'} • Admin
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white hover:bg-[#252628] transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#8a8886]" />
                    <span>Launch Kizuna</span>
                  </Link>
                  <Link
                    href="/admin/globalsettings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white hover:bg-[#252628] transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#8a8886]" />
                    <span>Workspace settings</span>
                  </Link>
                </div>

                <div className="border-t border-[#2d2f32] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white hover:bg-[#252628] transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="w-4 h-4 text-[#8a8886]" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Admin Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>

      {/* Admin Modals */}
      <EditWorkspaceNameModal
        isOpen={isEditWorkspaceOpen}
        onClose={() => setIsEditWorkspaceOpen(false)}
      />
      <ContactSalesModal
        isOpen={isContactSalesOpen}
        onClose={() => setIsContactSalesOpen(false)}
      />
    </div>
  );
}
