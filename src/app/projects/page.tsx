'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  Plus,
  Folder,
  FolderPlus,
  Star,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  LayoutGrid,
  ListTodo,
  Check,
  Trash2,
  Copy,
  Edit2,
  Archive,
  ExternalLink,
  Kanban,
  GanttChartSquare,
  FileCheck2,
  Users2,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Project, Task, PriorityLevel, StatusLevel } from '@/lib/types';

interface TemplateDef {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  iconBg: string;
  description: string;
  defaultView: 'List' | 'Board' | 'Timeline' | 'Dashboard';
  sections: string[];
  tasks: Array<{
    name: string;
    section: string;
    priority: PriorityLevel;
    status: StatusLevel;
    dueDate: string;
  }>;
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'project-timeline',
    title: 'Project timeline',
    category: 'Project Management',
    icon: GanttChartSquare,
    iconBg: 'bg-[#2a2b2e]',
    description: 'Map out dependencies, milestones, and deadlines to keep your projects on schedule.',
    defaultView: 'Timeline',
    sections: ['Planning', 'In Development', 'Quality Assurance', 'Launch'],
    tasks: [
      { name: 'Initial scope & requirements', section: 'Planning', priority: 'High', status: 'On track', dueDate: 'Nov 5' },
      { name: 'Architecture design review', section: 'Planning', priority: 'Medium', status: 'On track', dueDate: 'Nov 8' },
      { name: 'Core feature development', section: 'In Development', priority: 'High', status: 'On track', dueDate: 'Nov 15' },
      { name: 'End-to-end integration tests', section: 'Quality Assurance', priority: 'Medium', status: 'At risk', dueDate: 'Nov 20' },
      { name: 'Production release deployment', section: 'Launch', priority: 'High', status: 'On track', dueDate: 'Nov 25' },
    ],
  },
  {
    id: 'request-tracking',
    title: 'Request tracking',
    category: 'Operations',
    icon: FileCheck2,
    iconBg: 'bg-[#2a2b2e]',
    description: 'Capture, prioritize, and monitor requests until completion.',
    defaultView: 'List',
    sections: ['Incoming Requests', 'Triaged', 'In Progress', 'Completed'],
    tasks: [
      { name: 'User feedback on search performance', section: 'Incoming Requests', priority: 'Medium', status: 'On track', dueDate: 'Nov 4' },
      { name: 'Security audit compliance checklist', section: 'Triaged', priority: 'High', status: 'At risk', dueDate: 'Nov 10' },
      { name: 'Update billing system integration', section: 'In Progress', priority: 'High', status: 'On track', dueDate: 'Nov 12' },
      { name: 'Q3 analytics export report', section: 'Completed', priority: 'Low', status: 'On track', dueDate: 'Oct 30' },
    ],
  },
  {
    id: 'new-hire-checklist',
    title: 'New hire checklist',
    category: 'Human Resources',
    icon: Users2,
    iconBg: 'bg-[#2a2b2e]',
    description: 'Outline onboarding steps, assign tasks with due dates, and track team progress.',
    defaultView: 'List',
    sections: ['Before Day 1', 'Day 1: Setup & Welcomes', 'Week 1: Foundations', 'Month 1: Ramp-up'],
    tasks: [
      { name: 'Setup workstation and credentials', section: 'Before Day 1', priority: 'High', status: 'On track', dueDate: 'Nov 3' },
      { name: 'Team introduction and welcome lunch', section: 'Day 1: Setup & Welcomes', priority: 'Low', status: 'On track', dueDate: 'Nov 4' },
      { name: 'Walkthrough codebase and setup guide', section: 'Week 1: Foundations', priority: 'Medium', status: 'On track', dueDate: 'Nov 7' },
      { name: 'Deliver first pull request project', section: 'Month 1: Ramp-up', priority: 'High', status: 'On track', dueDate: 'Nov 28' },
    ],
  },
  {
    id: 'sprint-board',
    title: 'Agile Sprint Planning',
    category: 'Engineering',
    icon: Kanban,
    iconBg: 'bg-[#2a2b2e]',
    description: 'Track sprint backlog, tasks in flight, code review, and acceptance criteria in Kanban.',
    defaultView: 'Board',
    sections: ['Backlog', 'To do', 'In Progress', 'Code Review', 'Done'],
    tasks: [
      { name: 'Refactor chart state memoization', section: 'To do', priority: 'Medium', status: 'On track', dueDate: 'Nov 6' },
      { name: 'Implement Cloudflare R2 file sync', section: 'In Progress', priority: 'High', status: 'On track', dueDate: 'Nov 5' },
      { name: 'PR #14: Asana view styling', section: 'Code Review', priority: 'High', status: 'On track', dueDate: 'Nov 4' },
      { name: 'Update test suite for tasks API', section: 'Done', priority: 'Low', status: 'On track', dueDate: 'Nov 2' },
    ],
  },
  {
    id: 'product-roadmap',
    title: 'Product Roadmap Q4',
    category: 'Product',
    icon: Briefcase,
    iconBg: 'bg-[#2a2b2e]',
    description: 'Align cross-functional stakeholders on quarterly deliverables, themes, and goals.',
    defaultView: 'Timeline',
    sections: ['Research & Discovery', 'Design & UX', 'Execution', 'Launch'],
    tasks: [
      { name: 'Customer interview synthesis', section: 'Research & Discovery', priority: 'Medium', status: 'On track', dueDate: 'Nov 9' },
      { name: 'High fidelity interactive prototypes', section: 'Design & UX', priority: 'High', status: 'On track', dueDate: 'Nov 14' },
      { name: 'API v2 endpoint release', section: 'Execution', priority: 'High', status: 'At risk', dueDate: 'Nov 22' },
      { name: 'Marketing release campaign & blog', section: 'Launch', priority: 'Medium', status: 'On track', dueDate: 'Dec 1' },
    ],
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    tasks,
    currentUser,
    createProject,
    createTask,
    reorderTasks,
  } = useApp();

  // Search & Filter state
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Popover open state for filter chips
  const [activeFilterPopover, setActiveFilterPopover] = useState<
    'owner' | 'members' | 'portfolios' | 'status' | null
  >(null);

  // Sorting
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Banner dismissed state
  const [showTemplatesBanner, setShowTemplatesBanner] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kizuna_projects_banner_dismissed') !== 'true';
    }
    return true;
  });

  // Modals
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TemplateDef | null>(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPortfolio, setNewProjectPortfolio] = useState('My first portfolio');
  const [newProjectDefaultView, setNewProjectDefaultView] = useState<'List' | 'Board' | 'Timeline' | 'Dashboard'>('List');

  // Row action menu state
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);

  // Close popovers on click outside
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveFilterPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismissBanner = () => {
    setShowTemplatesBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kizuna_projects_banner_dismissed', 'true');
    }
  };

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((proj) => {
        // Text search
        if (filterQuery.trim()) {
          const q = filterQuery.toLowerCase();
          const matchesName = proj.name.toLowerCase().includes(q);
          const matchesPortfolio = proj.portfolios.some((p) => p.toLowerCase().includes(q));
          if (!matchesName && !matchesPortfolio) return false;
        }

        // Owner filter
        if (selectedOwner === 'me') {
          // If project was created by current user or has user as member
          const hasUser = proj.members.some((m) => m.name === currentUser.name);
          if (!hasUser) return false;
        }

        // Member filter
        if (selectedMember === 'me') {
          const hasUser = proj.members.some((m) => m.name === currentUser.name);
          if (!hasUser) return false;
        }

        // Portfolio filter
        if (selectedPortfolio === 'any_portfolio') {
          if (!proj.portfolios || proj.portfolios.length === 0) return false;
        } else if (selectedPortfolio === 'no_portfolio') {
          if (proj.portfolios && proj.portfolios.length > 0) return false;
        } else if (selectedPortfolio !== 'all') {
          if (!proj.portfolios.includes(selectedPortfolio)) return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if (proj.status !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Simple sort by name or recency
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [
    projects,
    filterQuery,
    selectedOwner,
    selectedMember,
    selectedPortfolio,
    selectedStatus,
    currentUser,
    sortOrder,
  ]);

  const hasActiveFilters =
    filterQuery.trim() !== '' ||
    selectedOwner !== 'all' ||
    selectedMember !== 'all' ||
    selectedPortfolio !== 'all' ||
    selectedStatus !== 'all';

  const clearAllFilters = () => {
    setFilterQuery('');
    setSelectedOwner('all');
    setSelectedMember('all');
    setSelectedPortfolio('all');
    setSelectedStatus('all');
    setActiveFilterPopover(null);
  };

  // Create Project from Template
  const handleUseTemplate = (template: TemplateDef) => {
    const newProj = createProject(template.title, template.description);
    
    // Add default template sections
    if (template.sections && template.sections.length > 0) {
      newProj.sections = template.sections;
    }
    if (!newProj.portfolios.includes('My first portfolio')) {
      newProj.portfolios = ['My first portfolio'];
    }

    // Add sample template tasks
    template.tasks.forEach((t) => {
      createTask({
        name: t.name,
        projectId: newProj.id,
        section: t.section,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        assignee: {
          name: currentUser.name,
          initials: currentUser.initials,
          avatarColor: currentUser.avatarColor,
        },
      });
    });

    setIsTemplateGalleryOpen(false);
    setSelectedPreviewTemplate(null);
    router.push(`/project/${newProj.id}`);
  };

  // Handle Create Blank Project submit
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj = createProject(newProjectName.trim(), newProjectDescription.trim());
    if (newProjectPortfolio) {
      newProj.portfolios = [newProjectPortfolio];
    }

    setNewProjectName('');
    setNewProjectDescription('');
    setIsCreateProjectModalOpen(false);
    router.push(`/project/${newProj.id}`);
  };

  return (
    <div className="flex-1 bg-[#1e1f21] min-h-screen text-[#f5f4f3] select-none flex flex-col">
      <div className="p-8 max-w-[1240px] w-full mx-auto space-y-6 flex-1">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-white tracking-tight">Projects</h1>
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#44464a] hover:bg-[#28292c] text-white text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
          >
            <span>Create project</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3 relative" ref={popoverRef}>
          {/* Full width Asana pill search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8a8886] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Find a project"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full h-[38px] bg-[#141517] hover:bg-[#1a1b1d] focus:bg-[#141517] text-white text-[13px] pl-10 pr-9 rounded-full border border-[#333538] focus:border-[#4573d2] outline-none transition-all placeholder-[#6d6c6e]"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8886] hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 text-[12px] flex-wrap">
            {/* Owner Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilterPopover(activeFilterPopover === 'owner' ? null : 'owner')
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedOwner !== 'all'
                    ? 'bg-[#2a2b2e] border-[#4573d2] text-white'
                    : 'bg-[#222325] hover:bg-[#2a2b2e] border-[#37383b] text-[#cfcecd] hover:text-white'
                }`}
              >
                <span>Owner</span>
                {selectedOwner !== 'all' && <span className="text-[#4573d2] font-semibold">•</span>}
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>

              {activeFilterPopover === 'owner' && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setSelectedOwner('all');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>Anyone</span>
                    {selectedOwner === 'all' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOwner('me');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>{currentUser.name} (You)</span>
                    {selectedOwner === 'me' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Members Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilterPopover(activeFilterPopover === 'members' ? null : 'members')
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedMember !== 'all'
                    ? 'bg-[#2a2b2e] border-[#4573d2] text-white'
                    : 'bg-[#222325] hover:bg-[#2a2b2e] border-[#37383b] text-[#cfcecd] hover:text-white'
                }`}
              >
                <span>Members</span>
                {selectedMember !== 'all' && <span className="text-[#4573d2] font-semibold">•</span>}
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>

              {activeFilterPopover === 'members' && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setSelectedMember('all');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>Any member</span>
                    {selectedMember === 'all' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember('me');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>{currentUser.name} (Me)</span>
                    {selectedMember === 'me' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Portfolios Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilterPopover(activeFilterPopover === 'portfolios' ? null : 'portfolios')
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedPortfolio !== 'all'
                    ? 'bg-[#2a2b2e] border-[#4573d2] text-white'
                    : 'bg-[#222325] hover:bg-[#2a2b2e] border-[#37383b] text-[#cfcecd] hover:text-white'
                }`}
              >
                <span>Portfolios</span>
                {selectedPortfolio !== 'all' && <span className="text-[#4573d2] font-semibold">•</span>}
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>

              {activeFilterPopover === 'portfolios' && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-52 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setSelectedPortfolio('all');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>All portfolios</span>
                    {selectedPortfolio === 'all' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPortfolio('My first portfolio');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>📁 My first portfolio</span>
                    {selectedPortfolio === 'My first portfolio' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPortfolio('any_portfolio');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>In any portfolio</span>
                    {selectedPortfolio === 'any_portfolio' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPortfolio('no_portfolio');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>No portfolio</span>
                    {selectedPortfolio === 'no_portfolio' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Status Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilterPopover(activeFilterPopover === 'status' ? null : 'status')
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedStatus !== 'all'
                    ? 'bg-[#2a2b2e] border-[#4573d2] text-white'
                    : 'bg-[#222325] hover:bg-[#2a2b2e] border-[#37383b] text-[#cfcecd] hover:text-white'
                }`}
              >
                <span>Status</span>
                {selectedStatus !== 'all' && <span className="text-[#4573d2] font-semibold">•</span>}
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>

              {activeFilterPopover === 'status' && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setSelectedStatus('all');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                  >
                    <span>All statuses</span>
                    {selectedStatus === 'all' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus('On track');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-[#4cd195]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4cd195]" />
                      On track
                    </span>
                    {selectedStatus === 'On track' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus('At risk');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-[#f5b324]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f5b324]" />
                      At risk
                    </span>
                    {selectedStatus === 'At risk' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus('Off track');
                      setActiveFilterPopover(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-[#f06a6a]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f06a6a]" />
                      Off track
                    </span>
                    {selectedStatus === 'Off track' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Clear filters pill */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-[11.5px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="w-full border-b border-[#2b2c2e]">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_180px_220px_140px] items-center pb-2 text-[#8a8886] text-[12px] font-normal px-2">
            <div>Name</div>
            <div>Members</div>
            <div>Portfolios</div>
            <div
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 justify-end cursor-pointer hover:text-white transition-colors"
            >
              <span>Last modified</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
          </div>

          {/* Project Rows */}
          {filteredProjects.length > 0 ? (
            <div className="divide-y divide-[#252628]">
              {filteredProjects.map((proj) => {
                const isMenuOpen = activeMenuProjectId === proj.id;
                return (
                  <div
                    key={proj.id}
                    className="grid grid-cols-[1fr_180px_220px_140px] items-center py-2.5 px-2 hover:bg-[#242528]/60 rounded-lg group transition-colors relative"
                  >
                    {/* Name Column */}
                    <div className="flex items-center gap-3 pr-2">
                      <Link
                        href={`/project/${proj.id}`}
                        className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b]/60 flex items-center justify-center text-white shrink-0 hover:border-[#4573d2] transition-colors"
                      >
                        <ListTodo className="w-4 h-4 text-[#c7c6c4]" />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={`/project/${proj.id}`}
                          className="font-medium text-[13.5px] text-white hover:text-[#4573d2] transition-colors truncate block"
                        >
                          {proj.name}
                        </Link>
                        {proj.joined && (
                          <span className="text-[11.5px] text-[#4cd195] font-medium leading-none block mt-0.5">
                            Joined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Members Column */}
                    <div className="flex items-center gap-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs shrink-0"
                        style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                        title={currentUser.name}
                      >
                        {currentUser.initials}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#2a2b2e] border border-[#37383b] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer text-[10px] shrink-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Portfolios Column */}
                    <div className="flex items-center pr-2">
                      {proj.portfolios && proj.portfolios.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {proj.portfolios.map((portfolioName) => (
                            <Link
                              key={portfolioName}
                              href="/portfolios"
                              className="inline-flex items-center gap-1.5 bg-[#28292b] hover:bg-[#323438] border border-[#37383b] px-2.5 py-0.5 rounded text-[12px] text-[#dedcd9] transition-colors"
                            >
                              <Folder className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span className="truncate max-w-[150px]">{portfolioName}</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#646362] text-[12px]">—</span>
                      )}
                    </div>

                    {/* Last Modified & Hover Action Menu */}
                    <div className="flex items-center justify-end gap-2 text-[12px] text-[#8a8886]">
                      <span className="group-hover:hidden">{proj.lastModified || 'Just now'}</span>
                      
                      {/* Hover action buttons matching Asana */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <Link
                          href={`/project/${proj.id}`}
                          className="p-1 rounded hover:bg-[#323438] text-[#8a8886] hover:text-white"
                          title="Open project"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuProjectId(isMenuOpen ? null : proj.id)
                          }
                          className="p-1 rounded hover:bg-[#323438] text-[#8a8886] hover:text-white cursor-pointer"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Options Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-4 top-10 z-30 w-44 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              router.push(`/project/${proj.id}`);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2e3034] text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Open project</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              const duplicated = createProject(`${proj.name} (Copy)`, proj.description);
                              router.push(`/project/${duplicated.id}`);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2e3034] text-white"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Duplicate</span>
                          </button>
                          <div className="my-1 border-t border-[#333538]" />
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              alert(`Project "${proj.name}" settings.`);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2e3034] text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Edit details</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[#8a8886] space-y-2">
              <p className="text-[14px]">No projects match your search or filter.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[12.5px] text-[#4573d2] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Explore ready-made templates banner (Matching Asana screenshot exactly) */}
        {showTemplatesBanner && (
          <div className="pt-6 relative">
            <div className="text-center space-y-1 relative mb-6">
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Explore ready-made templates to jumpstart your next project
              </h2>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="absolute right-0 top-0 p-1.5 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.slice(0, 3).map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      setSelectedPreviewTemplate(template);
                      setIsTemplateGalleryOpen(true);
                    }}
                    className="bg-[#222325] hover:bg-[#27282b] border border-[#333538] hover:border-[#4573d2]/70 rounded-xl p-5 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-[#2a2b2e] group-hover:bg-[#34353a] flex items-center justify-center text-white mb-3 transition-colors">
                        <IconComponent className="w-4 h-4 text-[#e0dedc]" />
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] font-bold text-white mb-1.5 group-hover:text-[#4573d2] transition-colors">
                        {template.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[12px] text-[#8a8886] leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2e3034] flex items-center justify-between text-[11.5px] text-[#8a8886]">
                      <span className="capitalize">{template.defaultView} view</span>
                      <span className="text-[#4573d2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Use template →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center "View the template gallery" Button */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedPreviewTemplate(TEMPLATES[0]);
                  setIsTemplateGalleryOpen(true);
                }}
                className="bg-[#222325] hover:bg-[#2b2c2f] border border-[#3e4044] text-white px-5 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                View the template gallery
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* Template Gallery Modal                                        */}
      {/* ============================================================== */}
      {isTemplateGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#1e1f21] border border-[#37383b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2c2e]">
              <div>
                <h3 className="text-[18px] font-bold text-white">Template Gallery</h3>
                <p className="text-[12px] text-[#8a8886]">
                  Select a workflow template to automatically setup sections, tasks, and default views.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateGalleryOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left sidebar list & Right preview */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Template Selector */}
              <div className="w-72 border-r border-[#2b2c2e] p-3 overflow-y-auto space-y-1 bg-[#1a1b1d]">
                <div className="text-[11px] font-semibold uppercase text-[#888684] px-3 py-1 tracking-wider">
                  Recommended
                </div>
                {TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedPreviewTemplate?.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedPreviewTemplate(tmpl)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2a2b2e] border border-[#4573d2]/60 text-white'
                          : 'hover:bg-[#222325] text-[#cfcecd]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#252628] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#e0dedc]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold truncate text-white">{tmpl.title}</div>
                        <div className="text-[11px] text-[#8a8886] truncate">{tmpl.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Template Preview */}
              {selectedPreviewTemplate && (
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#2a2b2e] text-[#4573d2] text-[11px] font-semibold mb-2">
                        {selectedPreviewTemplate.category}
                      </div>
                      <h4 className="text-[20px] font-bold text-white mb-1">
                        {selectedPreviewTemplate.title}
                      </h4>
                      <p className="text-[13px] text-[#8a8886] max-w-xl">
                        {selectedPreviewTemplate.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(selectedPreviewTemplate)}
                      className="px-5 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3562be] text-white text-[13px] font-semibold transition-colors cursor-pointer shadow-sm shrink-0"
                    >
                      Use template
                    </button>
                  </div>

                  {/* Template Details: Sections & Sample Tasks */}
                  <div className="space-y-4">
                    <div className="text-[12.5px] font-semibold uppercase text-[#888684] tracking-wider">
                      Included Sections & Sample Tasks
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPreviewTemplate.sections.map((section) => {
                        const sectionTasks = selectedPreviewTemplate.tasks.filter(
                          (t) => t.section === section
                        );
                        return (
                          <div
                            key={section}
                            className="bg-[#252628] border border-[#333538] rounded-xl p-3.5 space-y-2"
                          >
                            <div className="text-[13px] font-semibold text-white flex items-center justify-between">
                              <span>{section}</span>
                              <span className="text-[11px] text-[#8a8886]">
                                {sectionTasks.length} task{sectionTasks.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {sectionTasks.map((t, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-[#1e1f21] border border-[#2e3034] text-[12px] flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                                    <span className="text-[#dedcd9] truncate">{t.name}</span>
                                  </div>
                                  <span className="text-[10.5px] text-[#8a8886] shrink-0">
                                    {t.dueDate}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Create Blank Project Modal                                    */}
      {/* ============================================================== */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1f21] border border-[#37383b] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2c2e]">
              <h3 className="text-[17px] font-bold text-white">Create project</h3>
              <button
                type="button"
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="p-6 space-y-4 text-[13px]">
              <div>
                <label className="block text-[#8a8886] font-medium mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Website Redesign, Marketing Q4"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#141517] text-white px-3.5 py-2.5 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8a8886] font-medium mb-1.5">
                  Portfolio (optional)
                </label>
                <select
                  value={newProjectPortfolio}
                  onChange={(e) => setNewProjectPortfolio(e.target.value)}
                  className="w-full bg-[#141517] text-white px-3.5 py-2.5 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none cursor-pointer"
                >
                  <option value="My first portfolio">My first portfolio</option>
                  <option value="">No portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8a8886] font-medium mb-1.5">
                  Default View
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['List', 'Board', 'Timeline', 'Dashboard'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewProjectDefaultView(v)}
                      className={`py-2 px-1 text-center rounded-lg border text-[12px] font-medium transition-colors ${
                        newProjectDefaultView === v
                          ? 'border-[#4573d2] bg-[#4573d2]/15 text-white'
                          : 'border-[#37383b] bg-[#141517] text-[#8a8886] hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8a8886] font-medium mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this project about?"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-[#141517] text-white p-3 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2b2c2e]">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4573d2] hover:bg-[#3562be] text-white font-medium px-5 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
