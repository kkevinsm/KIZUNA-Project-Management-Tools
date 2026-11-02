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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarRail() {
  const router = useRouter();
  const { currentUser, users, switchUser, logout, inviteUser } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    inviteUser(inviteName.trim(), inviteEmail.trim());
    alert(`Teammate invited: ${inviteName} (${inviteEmail}). They can now log in!`);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
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

        {/* User Switcher / Profile Popover Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-[64px] bottom-0 w-72 bg-[#252628] border border-[#37383b] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]"
          >
            {/* Header info */}
            <div className="flex items-center gap-3 p-2 border-b border-[#333538] pb-3 mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] bg-[#333538] text-[#bdbbb9] px-1.5 py-0.2 rounded font-normal">
                    {currentUser.role || 'Member'}
                  </span>
                </div>
                <div className="text-[11px] text-[#8a8886] truncate">{currentUser.email}</div>
              </div>
            </div>

            {/* Switch User section (only shown if there are multiple accounts) */}
            {users.length > 1 && (
              <div className="space-y-1 mb-2">
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
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'bg-[#2f3135] text-white font-medium'
                          : 'text-[#bdbbb9] hover:bg-[#2b2c2e] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
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

            {/* Actions: Add friend & Logout */}
            <div className="pt-2 border-t border-[#333538] space-y-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowInviteModal(true);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#bdbbb9] hover:text-white hover:bg-[#2b2c2e] transition-colors text-[12px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite a teammate</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#ff6b72] hover:bg-[#47181c] transition-colors text-[12px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252628] border border-[#37383b] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-[18px] font-bold text-white mb-1.5">Invite a teammate</h2>
            <p className="text-[13px] text-[#8a8886] mb-4">
              Add your friend to your workspace so they can collaborate on tasks.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block text-[#8a8886] font-semibold mb-1">Teammate name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#1e1f21] text-white px-3 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8a8886] font-semibold mb-1">Teammate email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#1e1f21] text-white px-3 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 text-[#8a8886] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4573d2] hover:bg-[#3562be] text-white px-4 py-1.5 rounded-lg font-medium"
                >
                  Add Teammate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
