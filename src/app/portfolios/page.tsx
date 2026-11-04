'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Folder,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronRight,
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
  Star,
  Pencil,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Portfolio } from '@/lib/types';

// Asana standard folder color palette
const PORTFOLIO_COLORS = [
  { name: 'Default Gray', value: '#dedcd8' },
  { name: 'Magenta Pink', value: '#d472d4' },
  { name: 'Purple', value: '#9b6ade' },
  { name: 'Blue', value: '#4573d2' },
  { name: 'Teal', value: '#20c997' },
  { name: 'Green', value: '#4cd195' },
  { name: 'Yellow', value: '#f5b324' },
  { name: 'Orange', value: '#f27238' },
  { name: 'Red', value: '#e54b4b' },
];

// Authentic Asana Folder SVG Silhouette
function AsanaFolderShape({
  color = '#dedcd8',
  className = '',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 138 90"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 10 0 L 48 0 C 54 0, 58 3, 62 8 C 66 13, 70 15, 78 15 L 126 15 C 132 15, 138 21, 138 27 L 138 78 C 138 84, 132 90, 126 90 L 12 90 C 6 90, 0 84, 0 78 L 0 10 C 0 4, 4 0, 10 0 Z"
        fill={color}
      />
    </svg>
  );
}

export default function PortfoliosBrowsePage() {
  const router = useRouter();
  const {
    portfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    currentUser,
    projects,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Context menu & action states matching Asana
  const [activeMenuPortfolioId, setActiveMenuPortfolioId] = useState<string | null>(null);
  const [showColorSubmenu, setShowColorSubmenu] = useState<string | null>(null);
  const [renamingPortfolio, setRenamingPortfolio] = useState<Portfolio | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sharingPortfolio, setSharingPortfolio] = useState<Portfolio | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-portfolio-menu]')) {
        setActiveMenuPortfolioId(null);
        setShowColorSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleStarred = (portId: string) => {
    const port = portfolios.find((p) => p.id === portId);
    if (!port) return;
    const newStarred = !port.isStarred;
    updatePortfolio(portId, { isStarred: newStarred });
    setToastMessage(newStarred ? 'Added to starred portfolios' : 'Removed from starred');
  };

  const handleSaveRename = () => {
    if (!renamingPortfolio || !renameValue.trim()) return;
    updatePortfolio(renamingPortfolio.id, { name: renameValue.trim() });
    setRenamingPortfolio(null);
    setToastMessage('Portfolio renamed');
  };

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

  // Filter or sort portfolios according to tab
  const displayedPortfolios = useMemo(() => {
    if (activeTab === 'all') {
      return portfolios;
    }
    return [...portfolios].sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return 0;
    });
  }, [portfolios, activeTab]);

  return (
    <div className="flex-1 bg-[#1e1f21] min-h-screen text-[#f5f4f3] select-none flex flex-col">
      <div className="p-8 max-w-[1240px] w-full mx-auto space-y-6 flex-1">
        {/* Header (matching Asana screenshot) */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-white tracking-tight">Portfolios</h1>
          <button
            onClick={handleOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2e3034] text-white text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
          >
            <span>Create portfolio</span>
          </button>
        </div>

        {/* Navigation Tabs (Recent and starred / Browse all) - Matching Asana pill button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-[#1e468f] text-white shadow-xs'
                : 'text-[#8a8886] hover:text-white'
            }`}
          >
            Recent and starred
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1e468f] text-white shadow-xs'
                : 'text-[#8a8886] hover:text-white'
            }`}
          >
            Browse all
          </button>
        </div>

        {/* Section Header with Horizontal Rule (matching Asana screenshot) */}
        <div className="flex items-center justify-between pt-2 pb-2 border-b border-[#2e2f32]">
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-white cursor-pointer hover:text-[#dedcd8]">
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

        {/* Portfolios Cards Grid (matching Asana screenshot) */}
        {viewMode === 'grid' ? (
          <div className="flex flex-wrap items-start gap-4 pt-2">
            {/* 1. New Portfolio Dashed Card */}
            <div
              onClick={handleOpenWizard}
              className="flex flex-col group cursor-pointer w-[142px]"
            >
              <div className="h-[136px] w-[136px] mx-auto rounded-2xl border border-dashed border-[#3a3b3e] group-hover:border-[#4573d2] flex items-center justify-center transition-colors bg-transparent">
                <Plus className="w-7 h-7 text-[#8a8886] group-hover:text-white transition-colors" />
              </div>
              <span className="text-[13px] font-medium text-[#cfcecd] group-hover:text-white transition-colors text-center mt-2">
                New portfolio
              </span>
            </div>

            {/* 2. Existing Portfolios Cards with Folder Silhouette & Hover Context Menu */}
            {displayedPortfolios.map((port) => (
              <div
                key={port.id}
                data-portfolio-menu
                className={`relative flex flex-col group cursor-pointer w-[146px] p-2 rounded-2xl transition-all ${
                  activeMenuPortfolioId === port.id
                    ? 'bg-[#28292c] shadow-lg'
                    : 'hover:bg-[#28292c]/80'
                }`}
              >
                {/* Folder Silhouette Container */}
                <div
                  onClick={() => router.push(`/portfolios/${port.id}`)}
                  className="relative w-[130px] h-[86px] mx-auto select-none"
                >
                  <AsanaFolderShape
                    color={port.color || '#dedcd8'}
                    className="w-full h-full drop-shadow-xs transition-colors"
                  />

                  {/* Star Button (Top-left on tab) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleStarred(port.id);
                    }}
                    className={`absolute top-1 left-1.5 z-10 p-1 rounded-md text-[#1e1f21] hover:bg-black/15 transition-all cursor-pointer ${
                      port.isStarred
                        ? 'opacity-100 text-[#f5b324]'
                        : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
                    }`}
                    title={port.isStarred ? 'Remove from starred' : 'Add to starred'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        port.isStarred ? 'fill-[#f5b324] text-[#f5b324]' : 'text-[#1e1f21]'
                      }`}
                    />
                  </button>

                  {/* Three-dots Menu Trigger (Top-right shoulder) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMenuPortfolioId(
                        activeMenuPortfolioId === port.id ? null : port.id
                      );
                    }}
                    className={`absolute top-4 right-1 z-10 p-1 rounded-md text-[#1e1f21] hover:bg-black/15 transition-all cursor-pointer ${
                      activeMenuPortfolioId === port.id
                        ? 'opacity-100 bg-black/15'
                        : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
                    }`}
                    title="More actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Owner Avatar Badge (Overlapping bottom-right corner of folder) */}
                  <div
                    className="absolute -bottom-1 -right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md border-2 border-[#1e1f21]"
                    style={{ backgroundColor: port.owner?.avatarColor || '#d84b7f' }}
                    title={port.owner?.name || currentUser.name}
                  >
                    {port.owner?.initials || 'KS'}
                  </div>
                </div>

                {/* Portfolio Title & Subtitle */}
                <div
                  onClick={() => router.push(`/portfolios/${port.id}`)}
                  className="mt-2.5 px-1"
                >
                  <div className="text-[13px] font-semibold text-white group-hover:text-[#4573d2] transition-colors truncate">
                    {port.name}
                  </div>
                  <div className="text-[11.5px] text-[#8a8886]">
                    {port.projectIds?.length || 1} project
                    {(port.projectIds?.length || 1) === 1 ? '' : 's'}
                  </div>
                </div>

                {/* Pop-up Menu matching Asana screenshot exactly */}
                {activeMenuPortfolioId === port.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-[48px] left-[70px] z-50 w-[205px] bg-[#1e1f21] border border-[#38393c] rounded-xl shadow-2xl py-1 text-[13px] text-[#cfcecd] animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Share */}
                    <button
                      onClick={() => {
                        setSharingPortfolio(port);
                        setActiveMenuPortfolioId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#2a2b2e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#9c9a99]" />
                      <span>Share</span>
                    </button>

                    {/* Add to starred */}
                    <button
                      onClick={() => {
                        toggleStarred(port.id);
                        setActiveMenuPortfolioId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#2a2b2e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          port.isStarred ? 'fill-[#f5b324] text-[#f5b324]' : 'text-[#9c9a99]'
                        }`}
                      />
                      <span>{port.isStarred ? 'Remove from starred' : 'Add to starred'}</span>
                    </button>

                    {/* Set color > with Flyout Submenu */}
                    <div className="relative group/color">
                      <button
                        onClick={() => {
                          setShowColorSubmenu(showColorSubmenu === port.id ? null : port.id);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#2a2b2e] hover:text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-[3px] border border-white/20 shrink-0"
                            style={{ backgroundColor: port.color || '#dedcd8' }}
                          />
                          <span>Set color</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                      </button>

                      {/* Color Palette Flyout */}
                      <div className="hidden group-hover/color:block absolute left-[100%] top-0 ml-1 p-2 bg-[#1e1f21] border border-[#38393c] rounded-xl shadow-2xl z-50">
                        <div className="grid grid-cols-3 gap-1.5 w-[96px]">
                          {PORTFOLIO_COLORS.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => {
                                updatePortfolio(port.id, { color: c.value });
                                setActiveMenuPortfolioId(null);
                                setShowColorSubmenu(null);
                                setToastMessage(`Color updated to ${c.name}`);
                              }}
                              className={`w-6 h-6 rounded-md hover:scale-110 transition-transform flex items-center justify-center border ${
                                (port.color || '#dedcd8') === c.value
                                  ? 'border-white'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            >
                              {(port.color || '#dedcd8') === c.value && (
                                <Check className="w-3 h-3 text-black stroke-[3]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rename portfolio */}
                    <button
                      onClick={() => {
                        setRenamingPortfolio(port);
                        setRenameValue(port.name);
                        setActiveMenuPortfolioId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#2a2b2e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-[#9c9a99]" />
                      <span>Rename portfolio</span>
                    </button>

                    {/* Copy portfolio link */}
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/portfolios/${port.id}`;
                        navigator.clipboard.writeText(link);
                        setToastMessage('Portfolio link copied to clipboard');
                        setActiveMenuPortfolioId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#2a2b2e] hover:text-white transition-colors cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4 text-[#9c9a99]" />
                      <span>Copy portfolio link</span>
                    </button>

                    {/* Delete portfolio */}
                    <div className="my-1 border-t border-[#2e2f32]" />
                    <button
                      onClick={() => {
                        if (confirm(`Delete portfolio "${port.name}"?`)) {
                          deletePortfolio(port.id);
                          setToastMessage('Portfolio deleted');
                        }
                        setActiveMenuPortfolioId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete portfolio</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-[#252628] border-b border-[#2b2c2e]">
            {displayedPortfolios.map((port) => (
              <Link
                key={port.id}
                href={`/portfolios/${port.id}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#252628]/60 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1e1f21]"
                    style={{ backgroundColor: port.color || '#dedcd8' }}
                  >
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
              className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Wizard Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Step 1: Configuration & Live Preview */}
            {wizardStep === 1 ? (
              <>
                {/* Left Panel: Form */}
                <div className="w-[480px] p-10 overflow-y-auto space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-[28px] font-bold text-white tracking-tight">New portfolio</h2>
                      <p className="text-[13px] text-[#8a8886] mt-1">
                        Organize initiatives and track their progress in one place.
                      </p>
                    </div>

                    <form onSubmit={handleStep1Continue} className="space-y-5">
                      {/* Portfolio Name */}
                      <div>
                        <label className="block text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider mb-1.5">
                          Portfolio name
                        </label>
                        <input
                          type="text"
                          value={portfolioName}
                          onChange={(e) => {
                            setPortfolioName(e.target.value);
                            if (nameError) setNameError(false);
                          }}
                          placeholder="e.g. Q4 Strategic Initiatives"
                          autoFocus
                          className={`w-full bg-[#1e1f21] border rounded-lg px-3.5 py-2.5 text-[14px] text-white placeholder-[#5d5f63] focus:outline-none transition-colors ${
                            nameError
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-[#37383b] focus:border-[#4573d2]'
                          }`}
                        />
                        {nameError && (
                          <div className="text-[11.5px] text-rose-400 mt-1.5 flex items-center gap-1">
                            <span>Please enter a portfolio name</span>
                          </div>
                        )}
                      </div>

                      {/* Privacy Selection */}
                      <div>
                        <label className="block text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider mb-1.5">
                          Privacy
                        </label>
                        <select
                          value={privacy}
                          onChange={(e) => setPrivacy(e.target.value as any)}
                          className="w-full bg-[#1e1f21] border border-[#37383b] rounded-lg px-3.5 py-2.5 text-[13.5px] text-white focus:outline-none focus:border-[#4573d2] cursor-pointer"
                        >
                          <option value="Public to My workspace">Public to My workspace</option>
                          <option value="Private to members">Private to members</option>
                        </select>
                      </div>

                      {/* Checkbox: Share project access */}
                      <label className="flex items-start gap-3 p-3 rounded-xl border border-[#2b2c2e] hover:bg-[#1a1b1d] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5 rounded border-[#37383b] bg-[#1e1f21] text-[#4573d2] focus:ring-0 cursor-pointer"
                        />
                        <div className="text-[12.5px]">
                          <div className="font-medium text-white leading-tight">
                            Share project access with portfolio members
                          </div>
                          <div className="text-[#8a8886] text-[11.5px] mt-0.5 leading-snug">
                            Portfolio members will be added as project members if they aren't already.
                          </div>
                        </div>
                      </label>

                      {/* Default View Selector */}
                      <div>
                        <label className="block text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider mb-2">
                          Default view
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { key: 'List', label: 'List', icon: ListIcon },
                            { key: 'Timeline', label: 'Timeline', icon: GanttChartSquare },
                            { key: 'Workload', label: 'Workload', icon: BarChart3 },
                          ].map((v) => {
                            const Icon = v.icon;
                            const isSelected = defaultView === v.key;
                            return (
                              <button
                                key={v.key}
                                type="button"
                                onClick={() => setDefaultView(v.key as any)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#4573d2] bg-[#4573d2]/10 text-white font-semibold'
                                    : 'border-[#2e3034] bg-[#1a1b1d] text-[#8a8886] hover:bg-[#252628] hover:text-white'
                                }`}
                              >
                                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#4573d2]' : 'text-[#8a8886]'}`} />
                                <span className="text-[12.5px]">{v.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Continue Button */}
                  <div className="pt-4 border-t border-[#252628] flex justify-end">
                    <button
                      onClick={handleStep1Continue}
                      className="px-5 py-2 bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13.5px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Right Panel: Live Adaptive Preview */}
                <div className="flex-1 bg-[#1a1b1d] p-10 flex flex-col justify-center items-center border-l border-[#252628]">
                  <div className="w-full max-w-[620px] bg-[#1e1f21] border border-[#2e3034] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    {/* Mock Window Header */}
                    <div className="h-10 px-4 bg-[#252628] border-b border-[#2e3034] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AsanaFolderShape color="#dedcd8" className="w-5 h-3.5" />
                        <span className="text-[12.5px] font-semibold text-white truncate max-w-[280px]">
                          {portfolioName || 'Portfolio preview'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {['List', 'Timeline', 'Workload'].map((tab) => (
                          <span
                            key={tab}
                            className={`text-[11px] px-2 py-0.5 rounded ${
                              defaultView === tab
                                ? 'bg-[#1e1f21] text-white font-semibold'
                                : 'text-[#8a8886]'
                            }`}
                          >
                            {tab}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mock Body Based on Default View */}
                    <div className="p-5 h-[280px] bg-[#18191b] overflow-hidden">
                      {defaultView === 'List' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-[#8a8886] border-b border-[#28292c] pb-2">
                            <span>Project</span>
                            <span>Status</span>
                            <span>Progress</span>
                            <span>Due date</span>
                          </div>
                          {[
                            { name: "Kevin's first project", status: 'On track', color: 'bg-[#4cd195]', pct: '0%', date: 'Nov 3 – Dec 1' },
                            { name: 'Mobile App Redesign', status: 'At risk', color: 'bg-[#f5b324]', pct: '45%', date: 'Dec 15' },
                            { name: 'Backend Scalability', status: 'On track', color: 'bg-[#4cd195]', pct: '80%', date: 'Jan 10' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[12px] text-white py-1.5 border-b border-[#252628]/50">
                              <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                              <span className="flex items-center gap-1.5 text-[11px] text-[#8a8886]">
                                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                {item.status}
                              </span>
                              <span className="text-[11px] text-[#8a8886]">{item.pct}</span>
                              <span className="text-[11px] text-[#8a8886]">{item.date}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {defaultView === 'Timeline' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-[11px] text-[#8a8886] text-center border-b border-[#28292c] pb-2">
                            <span>Q3 2026</span>
                            <span>Q4 2026</span>
                            <span>Q1 2027</span>
                          </div>
                          <div className="space-y-4 pt-3">
                            <div className="h-6 w-[70%] ml-[15%] bg-[#4573d2]/30 border border-[#4573d2] rounded-md px-2 flex items-center text-[10px] text-white font-medium">
                              Kevin's first project (Nov 3 – Dec 1)
                            </div>
                            <div className="h-6 w-[55%] ml-[35%] bg-purple-500/30 border border-purple-500 rounded-md px-2 flex items-center text-[10px] text-white font-medium">
                              Mobile App Redesign (Dec – Jan)
                            </div>
                          </div>
                        </div>
                      )}

                      {defaultView === 'Workload' && (
                        <div className="space-y-4 pt-2">
                          {[
                            { name: 'Kevin Safrisal', initials: 'KS', load: '65%', color: '#d84b7f' },
                            { name: 'Sarah Chen', initials: 'SC', load: '90%', color: '#20c997' },
                            { name: 'Alex Rivera', initials: 'AR', load: '40%', color: '#f5b324' },
                          ].map((person, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-white flex items-center gap-1.5">
                                  <span
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ backgroundColor: person.color }}
                                  >
                                    {person.initials}
                                  </span>
                                  {person.name}
                                </span>
                                <span className="text-[#8a8886]">{person.load} capacity</span>
                              </div>
                              <div className="h-2 w-full bg-[#252628] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4573d2] rounded-full"
                                  style={{ width: person.load }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Step 2: "What do you want to do first?" */
              <div className="flex-1 flex flex-col justify-center items-center p-10 max-w-[640px] mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-[28px] font-bold text-white tracking-tight">
                    What do you want to do first?
                  </h2>
                  <p className="text-[13.5px] text-[#8a8886]">
                    You can always do these later.
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {/* Option 1: Start adding projects */}
                  <div
                    onClick={() => setFirstAction('add_projects')}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      firstAction === 'add_projects'
                        ? 'border-[#4573d2] bg-[#4573d2]/10'
                        : 'border-[#2e3034] bg-[#1a1b1d] hover:bg-[#252628]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#252628] text-[#4573d2] shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-white">Start adding projects</div>
                      <div className="text-[12px] text-[#8a8886] mt-0.5">
                        Group related projects to monitor their status, timelines, and progress together.
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      firstAction === 'add_projects'
                        ? 'border-[#4573d2] bg-[#4573d2] text-white'
                        : 'border-[#44464a]'
                    }`}>
                      {firstAction === 'add_projects' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 2: Share with teammates */}
                  <div
                    onClick={() => setFirstAction('share_team')}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      firstAction === 'share_team'
                        ? 'border-[#4573d2] bg-[#4573d2]/10'
                        : 'border-[#2e3034] bg-[#1a1b1d] hover:bg-[#252628]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#252628] text-[#4573d2] shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-white">Share with teammates</div>
                      <div className="text-[12px] text-[#8a8886] mt-0.5">
                        Invite stakeholders to keep them updated on progress and roadmaps.
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      firstAction === 'share_team'
                        ? 'border-[#4573d2] bg-[#4573d2] text-white'
                        : 'border-[#44464a]'
                    }`}>
                      {firstAction === 'share_team' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-end pt-4">
                  <button
                    onClick={handleStep2Finish}
                    className="px-6 py-2.5 bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13.5px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Go to portfolio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Rename Portfolio Dialog                                        */}
      {/* ============================================================== */}
      {renamingPortfolio && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-white">Rename portfolio</h3>
              <button
                onClick={() => setRenamingPortfolio(null)}
                className="p-1 rounded text-[#8a8886] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#8a8886] mb-1.5 uppercase tracking-wider">
                Portfolio name
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setRenamingPortfolio(null);
                }}
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] focus:outline-none rounded-lg px-3 py-2 text-[14px] text-white"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRenamingPortfolio(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#37383b] text-[#cfcecd] hover:bg-[#28292c] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Share Portfolio Dialog                                         */}
      {/* ============================================================== */}
      {sharingPortfolio && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: sharingPortfolio.color || '#dedcd8' }}
                >
                  <Folder className="w-3.5 h-3.5 text-[#1e1f21]" />
                </div>
                <h3 className="text-[17px] font-bold text-white truncate max-w-[340px]">
                  Share {sharingPortfolio.name}
                </h3>
              </div>
              <button
                onClick={() => setSharingPortfolio(null)}
                className="p-1 rounded text-[#8a8886] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Invite link copy */}
              <div className="flex items-center justify-between p-3 bg-[#141517] rounded-xl border border-[#2e3034]">
                <div className="flex items-center gap-2.5">
                  <LinkIcon className="w-4 h-4 text-[#4573d2]" />
                  <div>
                    <div className="text-[13px] font-medium text-white">Anyone in workspace can view</div>
                    <div className="text-[11.5px] text-[#8a8886]">Workspace members have read-only access</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/portfolios/${sharingPortfolio.id}`;
                    navigator.clipboard.writeText(link);
                    setToastMessage('Portfolio link copied to clipboard');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2e3034] text-white text-[12px] font-medium border border-[#37383b] transition-colors cursor-pointer"
                >
                  Copy link
                </button>
              </div>

              {/* Member list */}
              <div>
                <div className="text-[12px] font-semibold text-[#8a8886] mb-2 uppercase tracking-wider">
                  Members with access
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#252628]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ backgroundColor: sharingPortfolio.owner?.avatarColor || '#d84b7f' }}
                      >
                        {sharingPortfolio.owner?.initials || 'KS'}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white">
                          {sharingPortfolio.owner?.name || currentUser.name}
                        </div>
                        <div className="text-[11px] text-[#8a8886]">Portfolio Owner</div>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#8a8886]">Owner</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSharingPortfolio(null)}
                className="px-4 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Toast Notification                                            */}
      {/* ============================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141517] border border-[#37383b] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#4cd195]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
