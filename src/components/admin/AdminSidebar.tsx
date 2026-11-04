'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Sparkles,
  CreditCard,
  Briefcase,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  BookOpen,
  ExternalLink,
  MessageSquare,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AdminSidebarProps {
  onContactSales?: () => void;
  onEditWorkspace?: () => void;
}

export default function AdminSidebar({
  onContactSales,
  onEditWorkspace,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useApp();

  const [isPeopleOpen, setIsPeopleOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const isUsersActive =
    pathname === '/admin' || pathname === '/admin/users' || pathname?.startsWith('/admin/users');
  const isGlobalSettingsActive = pathname === '/admin/globalsettings';
  const isAiSettingsActive = pathname === '/admin/ai-settings' || pathname === '/admin/dash-ai';
  const isBillingActive = pathname === '/admin/billing';
  const isInsightsActive = pathname === '/admin/insights';
  const isResourcesActive = pathname === '/admin/resources';

  const workspaceName = currentUser?.workspace || 'My workspace';

  return (
    <aside className="w-[240px] min-w-[240px] bg-[#151617] border-r border-[#262729] flex flex-col justify-between h-full select-none text-[13.5px] z-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col p-3 gap-3 overflow-y-auto">
        {/* Kizuna ADMIN Logo */}
        <div className="flex items-center justify-between px-1.5 py-1">
          <Link href="/admin" className="flex items-center gap-2 group">
            {/* 3 Coral Dots */}
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f06a6a]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f06a6a]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f06a6a]"></span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white group-hover:text-[#f06a6a] transition-colors">
              kizuna
            </span>
            <span className="text-[10px] font-bold text-[#f06a6a] border border-[#f06a6a]/70 px-1.5 py-0.2 rounded tracking-wider uppercase ml-0.5">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Active Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1e1f21] hover:bg-[#252628] border border-[#2d2f32] text-white transition-colors cursor-pointer text-left"
            title="Active workspace"
          >
            <div className="flex items-center gap-2 truncate">
              <Briefcase className="w-4 h-4 text-[#8a8886] shrink-0" />
              <span className="font-medium text-[13px] truncate">{workspaceName}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] shrink-0 ml-1" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1f21] border border-[#333538] rounded-xl shadow-xl p-1.5 z-50 text-[13px]">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                Workspaces
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#252628] text-white">
                <span className="truncate">{workspaceName}</span>
                <Check className="w-3.5 h-3.5 text-[#4573d2]" />
              </div>
              {onEditWorkspace && (
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onEditWorkspace();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#252628] text-[#9c9a99] hover:text-white transition-colors mt-1"
                >
                  Rename workspace
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-0.5 mt-1">
          {/* 1. People Section (Collapsible) */}
          <div>
            <button
              onClick={() => setIsPeopleOpen(!isPeopleOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[#9c9a99] hover:text-white hover:bg-[#1f2022] rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                <span className="font-medium">People</span>
              </div>
              {isPeopleOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
              )}
            </button>

            {isPeopleOpen && (
              <div className="pl-6 mt-0.5 flex flex-col gap-0.5">
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
                    isUsersActive
                      ? 'bg-[#252628] text-white shadow-xs'
                      : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
                  }`}
                >
                  <span>Users</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. Dash AI / AI Settings */}
          <Link
            href="/admin/ai-settings"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
              isAiSettingsActive
                ? 'bg-[#252628] text-white shadow-xs'
                : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f06a6a]" />
            <span>Dash AI</span>
          </Link>

          {/* 3. Billing */}
          <Link
            href="/admin/billing"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
              isBillingActive
                ? 'bg-[#252628] text-white shadow-xs'
                : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#8a8886]" />
            <span>Billing</span>
          </Link>

          {/* 4. Workspace Section (Collapsible) */}
          <div>
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[#9c9a99] hover:text-white hover:bg-[#1f2022] rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                <span className="font-medium">Workspace</span>
              </div>
              {isWorkspaceOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
              )}
            </button>

            {isWorkspaceOpen && (
              <div className="pl-6 mt-0.5 flex flex-col gap-0.5">
                <Link
                  href="/admin/globalsettings"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
                    isGlobalSettingsActive
                      ? 'bg-[#252628] text-white shadow-xs'
                      : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
                  }`}
                >
                  <span>Global settings</span>
                </Link>
                <Link
                  href="/admin/insights"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
                    isInsightsActive
                      ? 'bg-[#252628] text-white shadow-xs'
                      : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
                  }`}
                >
                  <span>Insights</span>
                </Link>
              </div>
            )}
          </div>

          {/* 5. Resources */}
          <Link
            href="/admin/resources"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors font-medium text-[13px] ${
              isResourcesActive
                ? 'bg-[#252628] text-white shadow-xs'
                : 'text-[#9c9a99] hover:text-white hover:bg-[#1f2022]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8a8886]" />
            <span>Resources</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Area: Launch Kizuna & Contact Sales Card */}
      <div className="p-3 border-t border-[#222325] flex flex-col gap-3">
        {/* Launch Kizuna Button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#cfcecd] hover:text-white hover:bg-[#1f2022] transition-colors font-medium text-[13px]"
        >
          <ExternalLink className="w-4 h-4 text-[#8a8886]" />
          <span>Launch Kizuna</span>
        </Link>

        {/* Explore Plans & Pricing Card */}
        <div className="bg-[#1b1c1e] border border-[#2b2c2e] rounded-xl p-3 flex flex-col gap-2">
          <p className="text-[12px] text-[#8a8886] leading-snug">
            Explore Kizuna plans and pricing with an expert.
          </p>
          <button
            onClick={() => onContactSales ? onContactSales() : alert('Contacting Kizuna sales specialist...')}
            className="flex items-center justify-center gap-1.5 bg-[#252628] hover:bg-[#2e2f32] text-white text-[12px] font-medium py-1.5 px-3 rounded-lg border border-[#37383c] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#f06a6a]" />
            <span>Contact sales</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
