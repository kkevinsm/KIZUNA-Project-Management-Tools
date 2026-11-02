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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SideNav() {
  const pathname = usePathname();
  const { projects, openCreateModal, isSidebarCollapsed } = useApp();

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
          </div>
        </div>
      </div>

      {/* Bottom Section: Trial Card & Invite */}
      <div className="pt-3 border-t border-[#2b2c2e] flex flex-col gap-2.5">
        {/* Trial Card */}
        <div className="bg-[#252628] rounded-xl p-3 border border-[#333538] flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Donut progress ring */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 transform -rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  stroke="#2b3b32"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  stroke="#38b273"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray="69"
                  strokeDashoffset="18"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-white leading-tight">
                Advanced trial
              </span>
              <span className="text-[11px] text-[#9c9a99]">14 days left</span>
            </div>
          </div>

          {/* Yellow Billing Info Button */}
          <button
            onClick={() => alert("Billing details: Advanced Trial active.")}
            className="w-full bg-[#f5b324] hover:bg-[#e2a41d] text-[#1e1f21] font-semibold text-[12px] py-1.5 px-3 rounded-lg text-center transition-colors shadow-sm"
          >
            Add billing info
          </button>
        </div>

        {/* Invite link */}
        <button
          onClick={() => alert("Invite link copied to clipboard: https://kizuna.pm/invite/kevin")}
          className="flex items-center justify-center gap-2 py-1.5 text-[#bdbbb9] hover:text-white hover:bg-[#252628] rounded-lg transition-colors text-[12px]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>
    </nav>
  );
}
