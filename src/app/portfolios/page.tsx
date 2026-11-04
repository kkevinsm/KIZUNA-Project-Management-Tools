'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Folder,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  X,
  ArrowLeft,
  Check,
  MoreHorizontal,
  Users,
  Lock,
  Kanban,
  GanttChartSquare,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Portfolio } from '@/lib/types';

export default function PortfoliosBrowsePage() {
  const router = useRouter();
  const { portfolios, createPortfolio, currentUser, projects } = useApp();

  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Wizard state (matching Asana video 2 frames 015-035)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [portfolioName, setPortfolioName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [privacy, setPrivacy] = useState<'Public to My workspace' | 'Private to members'>('Public to My workspace');
  const [shareAccess, setShareAccess] = useState<'Share project access manually' | 'Automatically grant access'>('Share project access manually');
  const [defaultView, setDefaultView] = useState<'List' | 'Timeline' | 'Workload'>('List');
  const [firstAction, setFirstAction] = useState<'add_projects' | 'share_team'>('add_projects');
  const [createdPortfolioId, setCreatedPortfolioId] = useState<string | null>(null);

  const handleOpenWizard = () => {
    setPortfolioName('');
    setNameError(false);
    setWizardStep(1);
    setDefaultView('List');
    setIsWizardOpen(true);
  };

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    // Create the portfolio in context
    const newPort = createPortfolio(portfolioName.trim(), defaultView);
    setCreatedPortfolioId(newPort.id);
    setWizardStep(2);
  };

  const handleStep2Finish = () => {
    setIsWizardOpen(false);
    if (createdPortfolioId) {
      router.push(`/portfolios/${createdPortfolioId}`);
    } else {
      router.push('/portfolios/my-first-portfolio');
    }
  };

  return (
    <div className="flex-1 bg-[#1e1f21] min-h-screen text-[#f5f4f3] select-none flex flex-col">
      <div className="p-8 max-w-[1240px] w-full mx-auto space-y-6 flex-1">
        {/* Header (matching Video 2 frame 005) */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-white tracking-tight">Portfolios</h1>
          <button
            onClick={handleOpenWizard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#44464a] hover:bg-[#28292c] text-white text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
          >
            <span>Create portfolio</span>
          </button>
        </div>

        {/* Navigation Tabs (Recent and starred / Browse all) */}
        <div className="flex items-center gap-6 border-b border-[#2b2c2e] text-[13.5px] font-medium">
          <button
            onClick={() => setActiveTab('recent')}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === 'recent'
                ? 'text-[#4573d2] font-semibold'
                : 'text-[#8a8886] hover:text-white'
            }`}
          >
            <span>Recent and starred</span>
            {activeTab === 'recent' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === 'all'
                ? 'text-[#4573d2] font-semibold'
                : 'text-[#8a8886] hover:text-white'
            }`}
          >
            <span>Browse all</span>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2]" />
            )}
          </button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-white cursor-pointer">
            <ChevronDown className="w-4 h-4 text-[#8a8886]" />
            <span>Recent portfolios</span>
          </div>

          {/* Grid / List switcher */}
          <div className="flex items-center gap-1 text-[#8a8886]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded hover:bg-[#2a2b2e] ${
                viewMode === 'grid' ? 'text-white' : 'text-[#8a8886]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded hover:bg-[#2a2b2e] ${
                viewMode === 'list' ? 'text-white' : 'text-[#8a8886]'
              }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Portfolios Cards Grid (matching Video 2 frame 005) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-2">
            {/* 1. New Portfolio Dashed Card */}
            <div
              onClick={handleOpenWizard}
              className="flex flex-col items-center justify-center h-[140px] rounded-2xl border-2 border-dashed border-[#37383b] hover:border-[#4573d2] bg-[#1a1b1d]/40 hover:bg-[#222325] transition-all cursor-pointer group p-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#252628] group-hover:bg-[#4573d2]/20 flex items-center justify-center text-[#8a8886] group-hover:text-[#4573d2] mb-2 transition-colors">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[13px] font-semibold text-[#cfcecd] group-hover:text-white transition-colors">
                New portfolio
              </span>
            </div>

            {/* 2. Existing Portfolios Cards */}
            {portfolios.map((port) => (
              <Link
                key={port.id}
                href={`/portfolios/${port.id}`}
                className="flex flex-col group cursor-pointer"
              >
                {/* Big folder graphic container */}
                <div className="h-[140px] rounded-2xl bg-[#28292b] group-hover:bg-[#323438] border border-[#37383b] group-hover:border-[#4573d2]/60 p-4 relative flex items-center justify-center transition-all shadow-xs overflow-hidden">
                  {/* Folder silhouette shape */}
                  <div className="w-24 h-18 bg-[#3d3f44] group-hover:bg-[#46484e] rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <Folder className="w-10 h-10 text-[#d0cecb] stroke-[1.5]" />
                  </div>

                  {/* Owner avatar badge on bottom right of folder */}
                  <div
                    className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md border-2 border-[#1e1f21]"
                    style={{ backgroundColor: port.owner?.avatarColor || '#d84b7f' }}
                  >
                    {port.owner?.initials || 'KS'}
                  </div>
                </div>

                {/* Portfolio Title & Subtitle */}
                <div className="mt-2.5 px-1">
                  <div className="text-[13.5px] font-semibold text-white group-hover:text-[#4573d2] transition-colors truncate">
                    {port.name}
                  </div>
                  <div className="text-[11.5px] text-[#8a8886]">
                    {port.projectIds?.length || 1} project
                    {(port.projectIds?.length || 1) === 1 ? '' : 's'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-[#252628] border-b border-[#2b2c2e]">
            {portfolios.map((port) => (
              <Link
                key={port.id}
                href={`/portfolios/${port.id}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#252628]/60 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#28292b] flex items-center justify-center text-[#dedcd9]">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium text-white group-hover:text-[#4573d2]">
                      {port.name}
                    </div>
                    <div className="text-[11.5px] text-[#8a8886]">
                      {port.projectIds?.length || 1} project • {port.privacy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[12px] text-[#8a8886]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4cd195]" />
                    {port.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* Portfolio Creation Wizard (Matching Video 2 frames 015-035)   */}
      {/* ============================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-[#141517] flex flex-col animate-in fade-in duration-150 select-none">
          {/* Top Bar: Back & Close */}
          <div className="h-14 px-6 border-b border-[#252628] flex items-center justify-between">
            {wizardStep === 2 ? (
              <button
                onClick={() => setWizardStep(1)}
                className="flex items-center gap-1.5 text-[#8a8886] hover:text-white text-[13px] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => setIsWizardOpen(false)}
              className="p-1 rounded-lg hover:bg-[#252628] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step 1: Form & Live View Preview (Matching Video 2 frame 015 & 025) */}
          {wizardStep === 1 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[480px_1fr] overflow-hidden">
              {/* Left Column: Form */}
              <div className="p-10 overflow-y-auto space-y-6 max-w-lg">
                <h2 className="text-[28px] font-bold text-white tracking-tight">New portfolio</h2>

                <form onSubmit={handleStep1Continue} className="space-y-5 text-[13px]">
                  <div>
                    <label className="block text-[#cfcecd] font-medium mb-1.5">
                      Portfolio name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Q4 Company Initiatives, Mobile Launches"
                      value={portfolioName}
                      onChange={(e) => {
                        setPortfolioName(e.target.value);
                        if (e.target.value.trim()) setNameError(false);
                      }}
                      className={`w-full bg-[#1b1c1e] text-white px-3.5 py-2.5 rounded-xl border outline-none transition-colors ${
                        nameError
                          ? 'border-[#ff5252] focus:border-[#ff5252]'
                          : 'border-[#37383b] focus:border-[#4573d2]'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[11.5px] text-[#ff5252] mt-1.5">
                        Portfolio name is required.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#cfcecd] font-medium mb-1.5">Privacy</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as any)}
                      className="w-full bg-[#1b1c1e] text-white px-3.5 py-2.5 rounded-xl border border-[#37383b] focus:border-[#4573d2] outline-none cursor-pointer"
                    >
                      <option value="Public to My workspace">Public to My workspace</option>
                      <option value="Private to members">Private to members</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[#cfcecd] font-medium">
                        Share project access with portfolio members
                      </label>
                      <span className="text-[11.5px] text-[#4573d2] hover:underline cursor-pointer">
                        Learn more
                      </span>
                    </div>
                    <select
                      value={shareAccess}
                      onChange={(e) => setShareAccess(e.target.value as any)}
                      className="w-full bg-[#1b1c1e] text-white px-3.5 py-2.5 rounded-xl border border-[#37383b] focus:border-[#4573d2] outline-none cursor-pointer"
                    >
                      <option value="Share project access manually">
                        Share project access manually
                      </option>
                      <option value="Automatically grant access">
                        Automatically grant access
                      </option>
                    </select>
                  </div>

                  {/* Default View Selector Cards (matching Video 2 frame 025) */}
                  <div>
                    <label className="block text-[#cfcecd] font-medium mb-2">Default view</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* List Card */}
                      <button
                        type="button"
                        onClick={() => setDefaultView('List')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          defaultView === 'List'
                            ? 'border-[#4573d2] bg-[#4573d2]/15 text-white shadow-xs'
                            : 'border-[#333538] bg-[#1a1b1d] hover:bg-[#222325] text-[#8a8886]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#252628] flex items-center justify-center shrink-0">
                          <ListIcon className="w-4 h-4 text-[#4573d2]" />
                        </div>
                        <span className="font-semibold text-[13px] text-white">List</span>
                      </button>

                      {/* Timeline Card */}
                      <button
                        type="button"
                        onClick={() => setDefaultView('Timeline')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          defaultView === 'Timeline'
                            ? 'border-[#4573d2] bg-[#4573d2]/15 text-white shadow-xs'
                            : 'border-[#333538] bg-[#1a1b1d] hover:bg-[#222325] text-[#8a8886]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#252628] flex items-center justify-center shrink-0">
                          <GanttChartSquare className="w-4 h-4 text-[#4573d2]" />
                        </div>
                        <span className="font-semibold text-[13px] text-white">Timeline</span>
                      </button>
                    </div>

                    {/* Workload Card */}
                    <button
                      type="button"
                      onClick={() => setDefaultView('Workload')}
                      className={`w-1/2 p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        defaultView === 'Workload'
                          ? 'border-[#4573d2] bg-[#4573d2]/15 text-white shadow-xs'
                          : 'border-[#333538] bg-[#1a1b1d] hover:bg-[#222325] text-[#8a8886]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#252628] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-[#4573d2]" />
                      </div>
                      <span className="font-semibold text-[13px] text-white">Workload</span>
                    </button>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#4573d2] hover:bg-[#3562be] text-white font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Dynamic Live Preview Mockup (Matching Video 2 frame 015 & 025) */}
              <div className="bg-[#101113] p-10 flex items-center justify-center border-l border-[#252628] overflow-hidden">
                <div className="w-full max-w-2xl bg-[#1e1f21] border border-[#2e3034] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
                  {/* Top Mock Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#2b2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#28292b] flex items-center justify-center">
                        <Folder className="w-4 h-4 text-[#a2a09e]" />
                      </div>
                      <span className="text-[16px] font-bold text-white">
                        {portfolioName || 'Portfolio preview'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#37383b]" />
                      <div className="w-6 h-6 rounded-full bg-[#37383b]" />
                      <div className="w-6 h-6 rounded-full bg-[#37383b]" />
                    </div>
                  </div>

                  {/* View Tabs Mockup */}
                  <div className="flex items-center gap-4 text-[12px] border-b border-[#2b2c2e]/60 pb-2">
                    <span className={defaultView === 'List' ? 'text-[#4573d2] font-bold' : 'text-[#8a8886]'}>
                      List
                    </span>
                    <span className={defaultView === 'Timeline' ? 'text-[#4573d2] font-bold' : 'text-[#8a8886]'}>
                      Timeline
                    </span>
                    <span className="text-[#8a8886]">Progress</span>
                    <span className={defaultView === 'Workload' ? 'text-[#4573d2] font-bold' : 'text-[#8a8886]'}>
                      Workload
                    </span>
                    <span className="text-[#8a8886]">Messages</span>
                  </div>

                  {/* Adaptive View Graphic (List vs Timeline vs Workload) */}
                  {defaultView === 'List' && (
                    <div className="space-y-2.5 py-2">
                      {[
                        { color: 'bg-emerald-500', name: 'Web Redesign' },
                        { color: 'bg-amber-500', name: 'Mobile App' },
                        { color: 'bg-purple-500', name: 'Q4 Marketing' },
                        { color: 'bg-blue-500', name: 'Platform Migration' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#252628]/60 border border-[#2b2c2e] text-[12px]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-white font-medium">{item.name}</span>
                          </div>
                          <div className="w-24 h-2 bg-[#333538] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4cd195] rounded-full"
                              style={{ width: `${(idx + 1) * 22}%` }}
                            />
                          </div>
                          <span className="text-[#8a8886]">Nov 3 – Dec 1</span>
                          <div className="w-5 h-5 rounded-full bg-pink-600 text-[10px] text-white flex items-center justify-center font-bold">
                            KS
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {defaultView === 'Timeline' && (
                    <div className="space-y-3 py-4">
                      <div className="h-4 flex border-b border-[#2e3034] text-[10px] text-[#8a8886] justify-between px-2">
                        <span>August</span>
                        <span>September</span>
                        <span>October</span>
                        <span>November</span>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="h-6 w-3/5 rounded-lg bg-teal-500/80 ml-8 text-[11px] text-black font-semibold flex items-center px-2">
                          Project timeline bar
                        </div>
                        <div className="h-6 w-2/3 rounded-lg bg-amber-500/80 ml-20 text-[11px] text-black font-semibold flex items-center px-2">
                          Mobile app milestone
                        </div>
                        <div className="h-6 w-1/2 rounded-lg bg-purple-500/80 ml-36 text-[11px] text-black font-semibold flex items-center px-2">
                          Brand refresh
                        </div>
                      </div>
                    </div>
                  )}

                  {defaultView === 'Workload' && (
                    <div className="space-y-4 py-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#37383b]" />
                          <div className="flex-1 h-5 rounded-lg bg-[#252628] relative overflow-hidden">
                            <div
                              className="h-full bg-purple-500/40 rounded-lg"
                              style={{ width: `${i * 30}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: "What do you want to do first?" (Matching Video 2 frame 035) */}
          {wizardStep === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full text-center space-y-8 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-white tracking-tight">
                  What do you want to do first?
                </h2>
                <p className="text-[13px] text-[#8a8886]">
                  Get started by adding projects to track progress or invite your team.
                </p>
              </div>

              <div className="w-full space-y-3 text-left">
                {/* Option 1: Start adding projects */}
                <div
                  onClick={() => setFirstAction('add_projects')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    firstAction === 'add_projects'
                      ? 'border-[#4573d2] bg-[#4573d2]/15 text-white'
                      : 'border-[#37383b] bg-[#1a1b1d] hover:bg-[#222325] text-[#cfcecd]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#252628] flex items-center justify-center text-[#4573d2] shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-white">Start adding projects</div>
                    <div className="text-[12px] text-[#8a8886]">
                      Add projects and track their progress
                    </div>
                  </div>
                </div>

                {/* Option 2: Share with teammates */}
                <div
                  onClick={() => setFirstAction('share_team')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    firstAction === 'share_team'
                      ? 'border-[#4573d2] bg-[#4573d2]/15 text-white'
                      : 'border-[#37383b] bg-[#1a1b1d] hover:bg-[#222325] text-[#cfcecd]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#252628] flex items-center justify-center text-[#4573d2] shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-white">Share with teammates</div>
                    <div className="text-[12px] text-[#8a8886]">
                      Invite teammates to collaborate
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStep2Finish}
                className="w-full py-3 rounded-xl bg-[#4573d2] hover:bg-[#3562be] text-white font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Go to portfolio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

