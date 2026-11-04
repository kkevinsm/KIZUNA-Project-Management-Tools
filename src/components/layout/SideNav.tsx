'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Inbox,
  CheckCircle2,
  FolderClosed,
  Layers,
  Plus,
  ListTodo,
  UserPlus,
  ChevronRight,
  Folder,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SideNav() {
  const pathname = usePathname();
  const { projects, openCreateModal, isSidebarCollapsed, openInviteModal } = useApp();

  if (isSidebarCollapsed) {
    return null;
  }

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Inbox', href: '/inbox', icon: Inbox, badge: 1 },
    { label: 'My tasks', href: '/my-tasks', icon: CheckCircle2 },
    { label: 'Projects', href: '/projects', icon: FolderClosed },
    { label: 'Portfolios', href: '/portfolios', icon: Layers },
  ];

  return (
    <nav className="w-[240px] min-w-[240px] bg-[#1e1f21] border-r border-[#2b2c2e] flex flex-col justify-between h-[calc(100vh-48px)] p-3 select-none text-[13px]">
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Main Work Nav */}
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#888684] px-2 mb-1.5">
            Work
          </div>
          <div className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/projects' && pathname.startsWith('/projects'));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg group transition-colors ${
                    isActive
                      ? 'bg-[#2a2b2e] text-white font-medium'
                      : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9c9a99] group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-[#f06a6a]"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Work Projects Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#888684]">
              Work
            </span>
            <button
              onClick={() => openCreateModal('project')}
              className="text-[#9c9a99] hover:text-white p-0.5 rounded hover:bg-[#2a2b2d]"
              title="Create project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {projects.map((project) => {
              const href = `/project/${project.id}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={project.id}
                  href={href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg group transition-colors ${
                    isActive
                      ? 'bg-[#2a2b2e] text-white font-medium'
                      : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
                  }`}
                >
                  <ListTodo className="w-4 h-4 text-[#9c9a99] group-hover:text-white" />
                  <span className="truncate">{project.name}</span>
                </Link>
              );
            })}
            {/* Portfolio in Work list matching Asana screenshot */}
            <Link
              href="/portfolios"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg group transition-colors ${
                pathname === '/portfolios'
                  ? 'bg-[#2a2b2e] text-white font-medium'
                  : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-[#9c9a99] group-hover:text-white" />
                <span>My first portfolio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Trial Badge & Invite matching Asana screenshot */}
      <div className="space-y-3 pt-3 border-t border-[#2b2c2e]">
        <div className="p-3 bg-[#1e1f21] rounded-xl border border-[#2e3034] space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <div>
              <div className="text-[12px] font-semibold text-white leading-tight">Advanced trial</div>
              <div className="text-[11px] text-[#8a8886] leading-tight">12 days left</div>
            </div>
          </div>
          <button
            onClick={() => alert("Billing & Subscription management")}
            className="w-full py-1.5 px-3 bg-[#f5b324] hover:bg-[#e5a51a] text-black font-semibold rounded-lg text-[12px] transition-colors cursor-pointer"
          >
            Add billing info
          </button>
        </div>

        <button
          onClick={openInviteModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[#c5c3c0] hover:text-white hover:bg-[#28292c] rounded-lg transition-colors text-[13px] font-medium border border-[#333538] hover:border-[#44464a] cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#a2a09e]" />
          <span>Invite</span>
        </button>
      </div>
    </nav>
  );
}

