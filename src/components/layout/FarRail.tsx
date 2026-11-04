'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Briefcase,
  Bot,
  Compass,
  BookOpen,
  Users,
  MoreHorizontal,
  HelpCircle,
  Calendar,
  SlidersHorizontal,
  Plus,
  UserPlus,
  CircleUser,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarRail() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, openInviteModal, updateUserProfile } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPeopleActive = pathname?.startsWith('/people') ?? false;

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const railItems = [
    { id: 'work', label: 'Work', icon: Briefcase, href: '/' },
    { id: 'agents', label: 'Agents', icon: Bot, href: '#' },
    { id: 'strategy', label: 'Strategy', icon: Compass, href: '#' },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen, href: '#' },
    { id: 'people', label: 'People', icon: Users, href: '/people' },
    { id: 'more', label: 'More', icon: MoreHorizontal, href: '#' },
  ];

  return (
    <aside className="w-[58px] min-w-[58px] bg-[#151617] border-r border-[#262729] flex flex-col justify-between items-center py-2.5 z-30 select-none relative">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'people' ? isPeopleActive : item.id === 'work' ? !isPeopleActive : false;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center w-[48px] py-1.5 rounded-lg group transition-colors ${
                isActive
                  ? 'text-white bg-[#252628]'
                  : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
              }`}
              title={item.label}
            >
              <Icon className="w-[18px] h-[18px] mb-0.5 stroke-[1.8]" />
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom user profile & help */}
      <div className="flex flex-col items-center gap-2.5 w-full pb-1 relative">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#252628] transition-colors"
          title="Help & feedback"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        {/* User initials avatar (KS / User) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold transition-transform hover:scale-105 shadow-sm ring-2 ring-transparent hover:ring-[#4573d2]"
          style={{ backgroundColor: currentUser.avatarColor }}
          title={`${currentUser.name} (${currentUser.email}) - Click to switch user or log out`}
        >
          {currentUser.initials}
        </button>

        {/* User Profile Popover Menu (Matching app.asana.com) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-[64px] bottom-1 w-[260px] bg-[#1e1f21] border border-[#333538] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13.5px] select-none"
          >
            {/* Header info */}
            <div className="p-1 mb-2">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#1e1f21] text-[14px] font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: '#f5a3bf' }}
                >
                  {currentUser.initials}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white text-[15px] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[12.5px] text-[#8a8886] truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Set out of office */}
              <button
                onClick={() => {
                  const note = prompt('Set out of office note (optional):', currentUser.outOfOfficeNote || '');
                  if (note !== null) {
                    updateUserProfile({
                      isOutOfOffice: !currentUser.isOutOfOffice,
                      outOfOfficeNote: note,
                    });
                  }
                }}
                className="w-full border border-[#38393c] hover:border-[#4f5156] bg-[#252628] hover:bg-[#2b2c2e] text-white text-[13px] py-1.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#cfcecd]" />
                <span>{currentUser.isOutOfOffice ? 'Clear out of office' : 'Set out of office'}</span>
              </button>
            </div>

            {/* Section 1: Admin console, New workspace, Invite */}
            <div className="border-t border-[#2e2f32] py-1 space-y-0.5">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/admin');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#cfcecd]" />
                <span>Admin console</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  const name = prompt('Enter new workspace name:');
                  if (name?.trim()) {
                    updateUserProfile({ workspace: name.trim() });
                  }
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#cfcecd]" />
                <span>New workspace</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openInviteModal();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#cfcecd]" />
                <span>Invite to Asana</span>
              </button>
            </div>

            {/* Section 2: Profile, Settings, Add another account */}
            <div className="border-t border-[#2e2f32] py-1 space-y-0.5">
              <Link
                href="/people/profile"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <CircleUser className="w-4 h-4 text-[#cfcecd]" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  alert('Settings: Preferences, Display, and Notifications');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#cfcecd]" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#cfcecd]" />
                <span>Add another account</span>
              </button>
            </div>

            {/* Section 3: Log out */}
            <div className="border-t border-[#2e2f32] pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white hover:bg-[#2b2c2e] transition-colors text-left cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-[#cfcecd]" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
