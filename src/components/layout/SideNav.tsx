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
  ChevronDown,
  Folder,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SideNav() {
  const pathname = usePathname();
  const { currentUser, projects, portfolios, openCreateModal, isSidebarCollapsed, openInviteModal } = useApp();

  if (isSidebarCollapsed) {
    return null;
  }

  const isPeopleView = pathname?.startsWith('/people') ?? false;

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Inbox', href: '/inbox', icon: Inbox, badge: 1 },
    { label: 'My tasks', href: '/my-tasks', icon: CheckCircle2 },
    { label: 'Projects', href: '/projects', icon: FolderClosed },
    { label: 'Portfolios', href: '/portfolios', icon: Layers },
  ];

  return (
    <nav className="w-[240px] min-w-[240px] bg-[#1e1f21] border-r border-[#2b2c2e] flex flex-col justify-between h-[calc(100vh-48px)] p-3 select-none text-[13px]">
      {isPeopleView ? (
        /* People Navigation (matching Asana screenshot & video) */
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* People Header */}
          <div className="px-2 pt-1">
            <h2 className="text-[14px] font-semibold text-white">People</h2>
          </div>

          {/* Profile Item */}
          <div className="flex flex-col gap-0.5">
            <Link
              href="/people"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg group transition-colors ${
                pathname === '/people' || pathname === '/people/profile'
                  ? 'bg-[#2a2b2e] text-white font-medium'
                  : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
              <span className="truncate">Profile</span>
            </Link>
          </div>

          {/* Team Section */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#888684] px-2 mb-1.5 cursor-pointer">
              <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
              <span className="uppercase">Team</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <Link
                href="/people/team"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg group transition-colors ${
                  pathname?.startsWith('/people/team')
                    ? 'bg-[#2a2b2e] text-white font-medium'
                    : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded bg-[#2a2b2e] border border-[#38393c] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {currentUser.workspace ? currentUser.workspace.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <span className="truncate">{currentUser.workspace || 'My workspace'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Work Navigation */
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
              {/* Portfolios in Work list matching Asana screenshot */}
              {portfolios.map((port) => {
                const isActive =
                  pathname === `/portfolios/${port.id}` ||
                  pathname === `/portfolio/${port.id}`;
                return (
                  <Link
                    key={port.id}
                    href={`/portfolios/${port.id}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg group transition-colors ${
                      isActive
                        ? 'bg-[#2a2b2e] text-white font-medium'
                        : 'text-[#bdbbb9] hover:bg-[#252628] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder
                        className="w-4 h-4 shrink-0 transition-colors"
                        style={{ color: port.color || '#9c9a99' }}
                      />
                      <span className="truncate">{port.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Invite (NOTE: Never add Advanced trial or Billing badges here) */}
      <div className="pt-3 border-t border-[#2b2c2e]">
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

