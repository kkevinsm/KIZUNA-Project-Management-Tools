'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Bot,
  Compass,
  BookOpen,
  Users,
  MoreHorizontal,
  HelpCircle,
  LogOut,
  UserCheck,
  UserPlus,
  Check,
  Calendar,
  Settings,
  SlidersHorizontal,
  Plus,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarRail() {
  const router = useRouter();
  const { currentUser, users, switchUser, logout, openInviteModal, openSettingsModal, openCreateModal } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    { id: 'people', label: 'People', icon: Users, href: '#' },
    { id: 'more', label: 'More', icon: MoreHorizontal, href: '#' },
  ];

  return (
    <aside className="w-[58px] min-w-[58px] bg-[#151617] border-r border-[#262729] flex flex-col justify-between items-center py-2.5 z-30 select-none relative">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'work';

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

        {/* User Switcher / Profile Popover Menu (Matching Image 2) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-[64px] bottom-0 w-72 bg-[#222325] border border-[#37383b] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]"
          >
            {/* 1. Yellow trial banner */}
            <div className="bg-[#42310a] text-[#facc15] px-3.5 py-2 text-[12px] font-medium flex items-center justify-between border-b border-[#5c440a]">
              <span>14 days left in trial.</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openSettingsModal('account');
                }}
                className="underline hover:text-white transition-colors cursor-pointer text-[12px]"
              >
                Learn more
              </button>
            </div>

            {/* 2. User info */}
            <div className="p-3 pb-2">
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: currentUser.avatarColor || '#8b5cf6' }}
                >
                  {currentUser.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-[14px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[12px] text-[#8a8886] truncate mt-0.5">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Set out of office pill button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openSettingsModal('profile');
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-[#3b3c3e] bg-[#222325] hover:bg-[#2c2d30] text-white text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer mb-2"
              >
                <Calendar className="w-3.5 h-3.5 text-[#8a8886]" />
                <span>Set out of office</span>
              </button>

              <div className="border-t border-[#37383b] my-1.5" />

              {/* Menu items list matching Image 2 */}
              <div className="space-y-0.5 text-[13px]">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openSettingsModal('account');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#8a8886]" />
                  <span>Admin console</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openCreateModal('project');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#8a8886]" />
                  <span>New workspace</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openInviteModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#8a8886]" />
                  <span>Invite to Asana</span>
                </button>

                <div className="border-t border-[#37383b] my-1" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openSettingsModal('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#8a8886]" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openSettingsModal('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#8a8886]" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#8a8886]" />
                  <span>Add another account</span>
                </button>

                {/* Multiple accounts quick switch */}
                {users.length > 1 && (
                  <div className="pt-1 mt-1 border-t border-[#37383b]">
                    <div className="text-[10px] font-semibold text-[#8a8886] uppercase px-2 mb-1">
                      Switch Teammate
                    </div>
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors text-left ${
                            isSelected
                              ? 'bg-[#2f3135] text-white font-medium'
                              : 'text-[#bdbbb9] hover:bg-[#2b2c2e] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                              style={{ backgroundColor: u.avatarColor }}
                            >
                              {u.initials}
                            </div>
                            <span className="truncate text-[12px]">{u.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#4cd195]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-[#37383b] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#2c2d30] transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#8a8886]" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
