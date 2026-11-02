'use client';

import React from 'react';
import { Menu, Plus, Search, ChevronDown, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function TopNav() {
  const { toggleSidebar, openCreateModal, searchQuery, setSearchQuery } = useApp();

  return (
    <header className="h-[48px] min-h-[48px] bg-[#1e1f21] border-b border-[#2b2c2e] px-3.5 flex items-center justify-between z-20 select-none">
      {/* Left side: Hamburger & Create Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-[#2c2d30] text-[#a2a0a2] hover:text-white transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Asana's iconic Coral/Red Create button */}
        <button
          onClick={() => openCreateModal('task')}
          className="flex items-center gap-1 bg-[#f06a6a] hover:bg-[#e05858] text-white text-[13px] font-medium px-2.5 py-1 rounded-full shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create</span>
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-[540px] mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#8a8886] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2b2d] hover:bg-[#323336] focus:bg-[#252628] text-[#f5f4f3] placeholder-[#8a8886] text-[13px] pl-8 pr-4 py-1.5 rounded-full border border-transparent focus:border-[#4573d2] outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: Work with Dash AI button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert("Dash AI Assistant: How can I help organize your workspace today, Kevin?")}
          className="flex items-center gap-1.5 bg-[#252628] hover:bg-[#2f3033] border border-[#37383b] text-[#f5f4f3] text-[13px] font-medium px-3 py-1.5 rounded-full transition-all"
        >
          {/* Radial multi-color star icon representing Dash AI */}
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-20"></span>
            <Sparkles className="w-3.5 h-3.5 text-[#ff7043]" />
          </span>
          <span>Work with Dash</span>
        </button>
      </div>
    </header>
  );
}

