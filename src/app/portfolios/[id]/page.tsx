'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Folder,
  Star,
  Share2,
  SlidersHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  ListTodo,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Users,
  Check,
  MoreHorizontal,
  ChevronLeft,
  Minus,
  Sparkles,
  MessageSquare,
  Smile,
  Send,
  ExternalLink,
  PieChart as PieChartIcon,
  BarChart2,
  TrendingUp,
  X,
  Building,
  Link as LinkIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Project, Task, Portfolio } from '@/lib/types';
import CustomizeDrawer from '@/components/layout/CustomizeDrawer';

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const portfolioId = (params?.id as string) || 'my-first-portfolio';

  const {
    portfolios,
    projects,
    tasks,
    currentUser,
    updatePortfolio,
    openCreateModal,
    sharePortfolio,
  } = useApp();

  const portfolio =
    portfolios.find((p) => p.id === portfolioId) ||
    portfolios[0] || {
      id: 'my-first-portfolio',
      name: 'My first portfolio',
      status: 'On track' as const,
      owner: { name: currentUser.name, initials: currentUser.initials, avatarColor: '#d84b7f' },
      members: [{ name: currentUser.name, initials: currentUser.initials, avatarColor: '#d84b7f' }],
      projectIds: ['kevins-first-project'],
      defaultView: 'List' as const,
      privacy: 'Public to My workspace',
      dueDateRange: 'Nov 3 – Dec 1',
      isStarred: false,
    };

  const [activeTab, setActiveTab] = useState<
    'List' | 'Timeline' | 'Dashboard' | 'Progress' | 'Workload' | 'Messages'
  >(portfolio.defaultView || 'List');

  const [isStarred, setIsStarred] = useState(portfolio.isStarred || false);
  const [currentStatus, setCurrentStatus] = useState<string>(portfolio.status || 'On track');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Add work menu dropdown
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddExistingProjectOpen, setIsAddExistingProjectOpen] = useState(false);

  // Share & Customize modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [shareInviteEmail, setShareInviteEmail] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Messages tab state
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      author: string;
      initials: string;
      avatarColor: string;
      createdAt: string;
      title: string;
      status: string;
      summary: string;
      comments: Array<{
        id: string;
        author: string;
        initials: string;
        avatarColor: string;
        text: string;
        createdAt: string;
      }>;
    }>
  >([
    {
      id: 'msg-1',
      author: currentUser.name,
      initials: currentUser.initials,
      avatarColor: currentUser.avatarColor || '#d84b7f',
      createdAt: 'Yesterday at 11:18am',
      title: 'This portfolio of work is on track!',
      status: 'On track',
      summary:
        'This is a sample portfolio status update in Asana. Use portfolio status updates to give teammates and leaders visibility into how projects are progressing. Asana can help you aggregate multiple project status updates into one streamlined report so you can focus on what matters most.',
      comments: [],
    },
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');

  // Projects associated with this portfolio
  const portfolioProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (portfolio.projectIds && portfolio.projectIds.includes(p.id)) ||
        p.portfolios?.includes(portfolio.name) ||
        p.id === 'kevins-first-project'
    );
  }, [projects, portfolio]);

  const getStatusDot = (st: string) => {
    switch (st) {
      case 'On track':
        return 'bg-[#4cd195]';
      case 'At risk':
        return 'bg-[#f5b324]';
      case 'Off track':
        return 'bg-[#f06a6a]';
      case 'On hold':
        return 'bg-[#4573d2]';
      case 'Complete':
        return 'bg-[#a855f7]';
      default:
        return 'bg-[#4cd195]';
    }
  };

  // Compute project completion percentage
  const getProjectProgress = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter((t) => t.completed).length;
    return Math.round((completed / projTasks.length) * 100);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setMessages([
      {
        id: `msg-${Date.now()}`,
        author: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor || '#d84b7f',
        createdAt: 'Just now',
        title: 'Portfolio update',
        status: currentStatus,
        summary: newPostContent.trim(),
        comments: [],
      },
      ...messages,
    ]);
    setNewPostContent('');
  };

  const handleAddComment = (msgId: string) => {
    const text = commentInputs[msgId]?.trim();
    if (!text) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          return {
            ...m,
            comments: [
              ...m.comments,
              {
                id: `c-${Date.now()}`,
                author: currentUser.name,
                initials: currentUser.initials,
                avatarColor: currentUser.avatarColor || '#d84b7f',
                text,
                createdAt: 'Just now',
              },
            ],
          };
        }
        return m;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [msgId]: '' }));
  };

  return (
    <div className="flex-1 bg-[#1e1f21] min-h-screen text-[#f5f4f3] select-none flex flex-col overflow-hidden">
      {/* Top Header (Matching screenshot media_1793759858356_58c04d42.png) */}
      <div className="px-6 pt-4 pb-2 border-b border-[#2b2c2e]">
        <div className="flex items-center justify-between mb-3">
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1e1f21] shrink-0 shadow-xs"
              style={{ backgroundColor: portfolio.color || '#dedcd8' }}
            >
              <Folder className="w-4 h-4 fill-current" />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white flex items-center gap-1.5 hover:bg-[#28292c] px-2 py-0.5 rounded-lg cursor-pointer transition-colors">
                <span>{portfolio.name}</span>
                <ChevronDown className="w-4 h-4 text-[#8a8886]" />
              </h1>

              {/* Star */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`p-1 rounded hover:bg-[#28292c] transition-colors cursor-pointer ${
                  isStarred ? 'text-[#f5b324]' : 'text-[#8a8886] hover:text-white'
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-[#f5b324]' : ''}`} />
              </button>

              {/* Status Pill with interactive dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#252628] hover:bg-[#2c2d30] text-[12px] font-medium border border-[#37383b] transition-colors cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusDot(currentStatus)}`} />
                  <span className="text-white">{currentStatus}</span>
                  <ChevronDown className="w-3 h-3 text-[#8a8886]" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                    {['On track', 'At risk', 'Off track', 'On hold', 'Complete'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setCurrentStatus(st);
                          updatePortfolio(portfolio.id, { status: st as any });
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getStatusDot(st)}`} />
                          <span>{st}</span>
                        </span>
                        {currentStatus === st && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                onClick={() => setIsShareModalOpen(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: portfolio.owner?.avatarColor || '#d84b7f' }}
                title={portfolio.owner?.name || currentUser.name}
              >
                {portfolio.owner?.initials || currentUser.initials}
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                title="Manage portfolio members"
                className="w-7 h-7 rounded-full bg-[#2a2b2e] hover:bg-[#343539] border border-[#37383b] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer transition-colors"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              data-customize-trigger
              onClick={() => setIsCustomizeOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Tabs (List, Timeline, Dashboard, Progress, Workload, Messages) */}
        <div className="flex items-center gap-1 text-[13px] font-medium overflow-x-auto pb-1">
          {(
            ['List', 'Timeline', 'Dashboard', 'Progress', 'Workload', 'Messages'] as const
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0c326f] text-white font-medium shadow-xs'
                    : 'text-[#a2a09e] hover:text-white hover:bg-[#252628]/50'
                }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
          <button
            onClick={() => alert("Add view tab")}
            className="text-[#8a8886] hover:text-white px-2 py-1 font-bold rounded-lg hover:bg-[#252628]/50 transition-colors cursor-pointer text-[14px]"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px]">
        {/* + Add work split button (matching screenshot) */}
        <div className="relative inline-flex items-stretch h-7 rounded-lg overflow-hidden shadow-xs bg-[#2e3034] border border-[#3e4044]">
          <button
            type="button"
            onClick={() => setIsAddWorkOpen(!isAddWorkOpen)}
            className="flex items-center gap-1.5 px-3 hover:bg-[#383a3f] text-white font-medium text-[12.5px] transition-colors h-full cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add work</span>
          </button>
          <div className="w-px bg-white/10 h-full" />
          <button
            type="button"
            onClick={() => setIsAddWorkOpen(!isAddWorkOpen)}
            className="flex items-center justify-center px-1.5 hover:bg-[#383a3f] text-white transition-colors h-full cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#a2a09e]" />
          </button>

          {isAddWorkOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setIsAddWorkOpen(false);
                  openCreateModal('project');
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2e3034] text-white"
              >
                <Plus className="w-3.5 h-3.5 text-[#4573d2]" />
                <span>Create new project</span>
              </button>
              <button
                onClick={() => {
                  setIsAddWorkOpen(false);
                  setIsAddExistingProjectOpen(true);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2e3034] text-white"
              >
                <ListTodo className="w-3.5 h-3.5 text-[#4cd195]" />
                <span>Add existing project</span>
              </button>
            </div>
          )}
        </div>

        {/* Right controls: Filter, Sort, Group, Options, Search */}
        <div className="flex items-center gap-3 text-[#bdbbb9] text-[12px]">
          <button
            onClick={() => alert("Filter portfolio items")}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button
            onClick={() => alert("Sort portfolio items")}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
          <button
            onClick={() => alert("Group portfolio items")}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Group</span>
          </button>
          <button
            onClick={() => alert("Portfolio display options")}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>
          <button
            onClick={() => alert("Search within portfolio")}
            className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto">
        {/* ============================================================== */}
        {/* 1. LIST VIEW (Exact match to screenshot)                       */}
        {/* ============================================================== */}
        {activeTab === 'List' && (
          <div className="w-full">
            {/* Table Header Row */}
            <div className="grid grid-cols-[1fr_200px_180px_160px_180px_40px] items-center h-[34px] px-6 border-b border-[#2b2c2e] text-[#8a8886] text-[12px] select-none">
              <div>Name</div>
              <div>Status</div>
              <div>Task progress</div>
              <div>Due date</div>
              <div>Owner</div>
              <div className="flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#8a8886] cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Portfolio Projects Rows */}
            <div className="divide-y divide-[#242528]">
              {portfolioProjects.map((proj) => {
                const progressPct = getProjectProgress(proj.id);
                return (
                  <div
                    key={proj.id}
                    className="grid grid-cols-[1fr_200px_180px_160px_180px_40px] items-center py-3 px-6 hover:bg-[#242528]/60 transition-colors text-[13px] group"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b]/60 flex items-center justify-center text-white shrink-0">
                        <ListTodo className="w-4 h-4 text-[#c7c6c4]" />
                      </div>
                      <Link
                        href={`/project/${proj.id}`}
                        className="font-medium text-[13.5px] text-white hover:text-[#4573d2] transition-colors truncate"
                      >
                        {proj.name}
                      </Link>
                    </div>

                    {/* Status with timestamp */}
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="flex items-center gap-1.5 text-[#4cd195] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#4cd195]" />
                        <span>{proj.status || 'On track'}</span>
                      </span>
                      <span className="text-[#8a8886] text-[11px] truncate">
                        Yesterday at 11:18am
                      </span>
                    </div>

                    {/* Task progress bar */}
                    <div className="flex items-center gap-3 pr-4">
                      <div className="flex-1 h-2 bg-[#2d2e31] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4cd195] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-[#8a8886] shrink-0 font-medium">
                        {progressPct}%
                      </span>
                    </div>

                    {/* Due date */}
                    <div className="text-[12px] text-[#cfcecd]">Nov 3 – Dec 1</div>

                    {/* Owner */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs shrink-0"
                        style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                      >
                        {currentUser.initials}
                      </div>
                      <span className="text-[12px] text-[#cfcecd] truncate">
                        {currentUser.name}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/project/${proj.id}`}
                        className="p-1 rounded hover:bg-[#323438] text-[#8a8886] hover:text-white"
                        title="View project"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TIMELINE VIEW (Matching Video 1 frame 040)                  */}
        {/* ============================================================== */}
        {activeTab === 'Timeline' && (
          <div className="p-6 space-y-4">
            {/* Timeline Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2c2e]">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white">Quarters View</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#8a8886]">
                <span>Today: Nov 4, 2026</span>
              </div>
            </div>

            {/* Quarters Calendar Grid */}
            <div className="border border-[#333538] rounded-2xl bg-[#1b1c1e] overflow-hidden">
              <div className="grid grid-cols-[240px_1fr] border-b border-[#2b2c2e] text-[11px] font-semibold text-[#8a8886] bg-[#222325]">
                <div className="p-3 border-r border-[#2b2c2e]">Project</div>
                <div className="grid grid-cols-3 divide-x divide-[#2b2c2e] text-center py-2">
                  <div>Q3 2026 (Aug – Oct)</div>
                  <div className="text-white font-bold">Q4 2026 (Nov – Dec)</div>
                  <div>Q1 2027 (Jan – Mar)</div>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#28292c]">
                {portfolioProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="grid grid-cols-[240px_1fr] items-center py-4 px-3"
                  >
                    <div className="flex items-center gap-2.5 font-medium text-[13px] text-white">
                      <div className="w-6 h-6 rounded-lg bg-[#28292b] flex items-center justify-center">
                        <ListTodo className="w-3.5 h-3.5 text-[#cfcecd]" />
                      </div>
                      <span className="truncate">{proj.name}</span>
                    </div>

                    {/* Timeline bar */}
                    <div className="relative h-8 flex items-center">
                      <div className="absolute left-[38%] w-[35%] h-7 rounded-lg bg-[#45d3b6] text-black font-semibold text-[11.5px] flex items-center gap-2 px-3 shadow-md hover:brightness-110 transition-all cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px] font-bold">
                          KS
                        </div>
                        <span className="truncate">{proj.name}</span>
                        <span className="ml-auto text-[10px] opacity-80">Nov 3 – Dec 1</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. DASHBOARD VIEW (Aggregate Portfolio Health)                 */}
        {/* ============================================================== */}
        {activeTab === 'Dashboard' && (
          <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h3 className="text-[18px] font-bold text-white">Portfolio Health & Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-2">
                <span className="text-[12px] text-[#8a8886] font-semibold uppercase tracking-wider">
                  Total Projects
                </span>
                <div className="text-[32px] font-bold text-white">
                  {portfolioProjects.length}
                </div>
                <div className="text-[12px] text-[#4cd195] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All projects active</span>
                </div>
              </div>

              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-2">
                <span className="text-[12px] text-[#8a8886] font-semibold uppercase tracking-wider">
                  Health Status
                </span>
                <div className="text-[32px] font-bold text-[#4cd195]">100%</div>
                <div className="text-[12px] text-[#8a8886]">
                  On track across all milestones
                </div>
              </div>

              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-2">
                <span className="text-[12px] text-[#8a8886] font-semibold uppercase tracking-wider">
                  Due Dates
                </span>
                <div className="text-[20px] font-bold text-white mt-2">
                  Nov 3 – Dec 1
                </div>
                <div className="text-[12px] text-[#8a8886]">Target completion window</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. PROGRESS VIEW                                               */}
        {/* ============================================================== */}
        {activeTab === 'Progress' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-6 space-y-3">
              <h3 className="text-[16px] font-bold text-white">Executive Progress Summary</h3>
              <p className="text-[13.5px] text-[#bdbbb9] leading-relaxed">
                {portfolio.statusUpdate?.summary ||
                  'All key initiatives in this portfolio are proceeding according to scheduled timelines and budgets.'}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. WORKLOAD VIEW                                               */}
        {/* ============================================================== */}
        {activeTab === 'Workload' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-6 space-y-4">
              <h3 className="text-[16px] font-bold text-white">Team Member Workload</h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                >
                  {currentUser.initials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[13px] text-white font-medium mb-1.5">
                    <span>{currentUser.name}</span>
                    <span>{tasks.length} tasks assigned</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#1b1c1e] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4573d2] rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. MESSAGES VIEW (Exact match to Video 1 frame 065)            */}
        {/* ============================================================== */}
        {activeTab === 'Messages' && (
          <div className="p-8 max-w-3xl mx-auto space-y-6 select-none">
            {/* Top Quick Post Box */}
            <form
              onSubmit={handlePostMessage}
              className="p-3 bg-[#242528] border border-[#37383b] rounded-2xl flex items-center gap-3 shadow-xs"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
              >
                {currentUser.initials}
              </div>
              <input
                type="text"
                placeholder="Send message to members"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder-[#8a8886]"
              />
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="p-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3562be] disabled:opacity-40 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Stream of Messages / Status Updates Cards */}
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-[#242528] border border-[#37383b] rounded-2xl overflow-hidden shadow-md"
                >
                  {/* Top Green Accent Bar (matching Video 1 frame 065) */}
                  <div className="h-2 w-full bg-[#4cd195]" />

                  <div className="p-6 space-y-4">
                    {/* Header: View portfolio + Avatar */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveTab('List')}
                        className="text-[12.5px] text-[#4573d2] hover:underline font-medium cursor-pointer"
                      >
                        View portfolio
                      </button>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: msg.avatarColor }}
                        >
                          {msg.initials}
                        </div>
                        <Smile className="w-4 h-4 text-[#8a8886] cursor-pointer hover:text-white" />
                        <MoreHorizontal className="w-4 h-4 text-[#8a8886] cursor-pointer hover:text-white" />
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-[20px] font-bold text-white tracking-tight">
                      {msg.title}
                    </h3>

                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-2 text-[12px] text-[#8a8886]">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: msg.avatarColor }}
                      >
                        {msg.initials}
                      </div>
                      <span className="text-white font-medium">{msg.author}</span>
                      <span>•</span>
                      <span>{msg.createdAt}</span>
                    </div>

                    {/* Status & Portfolio info pills */}
                    <div className="space-y-1.5 pt-2 text-[12.5px]">
                      <div className="flex items-center gap-4">
                        <span className="text-[#8a8886] w-20">Status</span>
                        <span className="flex items-center gap-1.5 text-[#4cd195] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#4cd195]" />
                          <span>{msg.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[#8a8886] w-20">Portfolio</span>
                        <span className="inline-flex items-center gap-1.5 text-white font-medium">
                          <Folder className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>{portfolio.name}</span>
                        </span>
                      </div>
                    </div>

                    {/* Summary text */}
                    <div className="pt-2 text-[13px] text-[#cfcecd] leading-relaxed space-y-2">
                      <div className="font-semibold text-white">Summary</div>
                      <p>{msg.summary}</p>
                    </div>

                    {/* Comments Thread */}
                    {msg.comments.length > 0 && (
                      <div className="pt-4 border-t border-[#2e3034] space-y-2.5">
                        {msg.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 text-[12.5px]">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold mt-0.5"
                              style={{ backgroundColor: c.avatarColor }}
                            >
                              {c.initials}
                            </div>
                            <div className="flex-1 bg-[#1e1f21] p-2.5 rounded-xl border border-[#2e3034]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-white">{c.author}</span>
                                <span className="text-[10.5px] text-[#8a8886]">{c.createdAt}</span>
                              </div>
                              <p className="text-[#cfcecd]">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Composer */}
                    <div className="pt-3 border-t border-[#2e3034] flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment or @mention a teammate"
                        value={commentInputs[msg.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [msg.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(msg.id);
                        }}
                        className="flex-1 bg-[#1e1f21] border border-[#2e3034] focus:border-[#4573d2] rounded-xl px-3 py-2 text-[12.5px] text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(msg.id)}
                        className="p-2 rounded-xl bg-[#4573d2] hover:bg-[#3562be] text-white cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Existing Project to Portfolio */}
      {isAddExistingProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1f21] border border-[#37383b] rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2c2e]">
              <h3 className="text-[16px] font-bold text-white">Add project to portfolio</h3>
              <button
                onClick={() => setIsAddExistingProjectOpen(false)}
                className="p-1 rounded text-[#8a8886] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.map((proj) => {
                const isAlreadyIn = portfolioProjects.some((p) => p.id === proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (!isAlreadyIn) {
                        updatePortfolio(portfolio.id, {
                          projectIds: [...(portfolio.projectIds || []), proj.id],
                        });
                        setIsAddExistingProjectOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isAlreadyIn
                        ? 'bg-[#252628] border-[#37383b] text-[#8a8886]'
                        : 'bg-[#1b1c1e] hover:bg-[#252628] border-[#333538] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ListTodo className="w-4 h-4 text-[#4573d2]" />
                      <span className="font-semibold text-[13px]">{proj.name}</span>
                    </div>
                    {isAlreadyIn ? (
                      <span className="text-[11px] text-[#4cd195]">In portfolio</span>
                    ) : (
                      <Plus className="w-4 h-4 text-[#8a8886]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Share Portfolio Modal (Matching Video & Screenshot)           */}
      {/* ============================================================== */}
      {isShareModalOpen && (
        <div data-modal-overlay className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[540px] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Title + Copy link icon + Close button */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-[18px] font-bold text-white tracking-tight">
                Share {portfolio.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/portfolios/${portfolio.id}`;
                    navigator.clipboard.writeText(link);
                    setShareToast('Portfolio link copied to clipboard');
                    setTimeout(() => setShareToast(null), 2500);
                  }}
                  className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 1: Invite with email */}
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-white">
                Invite with email
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#141517] border border-[#37383b] focus-within:border-white rounded-xl overflow-hidden px-3.5 py-1.5 transition-colors">
                  <input
                    type="text"
                    value={shareInviteEmail}
                    onChange={(e) => setShareInviteEmail(e.target.value)}
                    placeholder="Add people, emails, or teams..."
                    className="bg-transparent text-[13.5px] text-white placeholder-[#717377] focus:outline-none flex-1 py-1"
                  />
                  <div className="flex items-center gap-1 text-[13px] text-[#cfcecd] hover:text-white cursor-pointer px-2 py-0.5 rounded">
                    <span>Editor</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  </div>
                </div>

                <button
                  disabled={!shareInviteEmail.trim()}
                  onClick={() => {
                    if (!shareInviteEmail.trim()) return;
                    const emails = shareInviteEmail
                      .split(',')
                      .map((e) => e.trim())
                      .filter(Boolean);
                    emails.forEach((em) => sharePortfolio(portfolio.id, em, 'Editor', true));
                    setShareToast(`Shared portfolio with ${emails.join(', ')}`);
                    setShareInviteEmail('');
                    setTimeout(() => setShareToast(null), 2500);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    shareInviteEmail.trim()
                      ? 'bg-[#4573d2] hover:bg-[#3b66be] text-white cursor-pointer'
                      : 'bg-[#252628] text-[#5d5f63] cursor-not-allowed border border-[#303236]'
                  }`}
                >
                  Invite
                </button>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <div className="text-[13px] text-white font-normal leading-tight">
                      Give access to all projects in this portfolio that I can share
                    </div>
                    <div className="text-[12px] text-[#8a8886] mt-0.5">
                      Users will get up to the project's default access level
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[13px] text-white font-normal leading-tight">
                    Notify when work is added to the portfolio
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-[#2e2f32]" />

            {/* Section 2: Access settings */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-white">
                Access settings
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#141517] border border-[#2e3034] hover:border-[#38393c] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5 text-[13.5px] text-white font-medium">
                  <Building className="w-4 h-4 text-[#8a8886]" />
                  <span>{currentUser.workspace || 'My workspace'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#8a8886]" />
              </div>
            </div>

            {/* Section 3: Who has access */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-white">Who has access</span>
                <button
                  onClick={() => alert("Notification preferences for portfolio updates")}
                  className="text-[13px] text-[#4573d2] hover:underline cursor-pointer font-medium"
                >
                  Manage notifications
                </button>
              </div>

              <div className="space-y-1">
                {/* Everyone at My workspace */}
                <div className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#252628] border border-[#37383b] flex items-center justify-center text-[#8a8886]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium text-white">
                        Everyone at {currentUser.workspace || 'My workspace'}
                      </div>
                      <div className="text-[11.5px] text-[#8a8886]">
                        Your organization
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[13px] text-[#cfcecd] hover:text-white cursor-pointer px-2 py-1 rounded">
                    <span>Editor</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  </div>
                </div>

                {/* Dynamic Portfolio Members with access */}
                {(portfolio.members && portfolio.members.length > 0
                  ? portfolio.members
                  : [
                      {
                        name: portfolio.owner?.name || currentUser.name,
                        initials: portfolio.owner?.initials || currentUser.initials,
                        avatarColor: portfolio.owner?.avatarColor || '#d84b7f',
                        email: portfolio.owner?.email || currentUser.email,
                        role: 'Portfolio admin',
                      },
                    ]
                ).map((member, idx) => (
                  <div
                    key={`${member.email || member.name}-${idx}`}
                    className="flex items-center justify-between py-2 px-1"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
                        style={{ backgroundColor: member.avatarColor || '#d84b7f' }}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium text-white">
                          {member.name}
                        </div>
                        <div className="text-[11.5px] text-[#8a8886]">
                          {member.email || (member.name === currentUser.name ? currentUser.email : '')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[13px] text-[#cfcecd] hover:text-white cursor-pointer px-2 py-1 rounded">
                      <span>{member.role || (idx === 0 ? 'Portfolio admin' : 'Editor')}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: Copy portfolio link button */}
            <div className="flex justify-end pt-2 border-t border-[#2e2f32]">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/portfolios/${portfolio.id}`;
                  navigator.clipboard.writeText(link);
                  setShareToast('Portfolio link copied to clipboard');
                  setTimeout(() => setShareToast(null), 2500);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#252628] hover:bg-[#2e3034] border border-[#37383b] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 text-[#cfcecd]" />
                <span>Copy portfolio link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Customize Right-Side Drawer                                    */}
      {/* ============================================================== */}
      <CustomizeDrawer
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        contextTitle={portfolio.name}
      />

      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141517] border border-[#37383b] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#4cd195]" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}

