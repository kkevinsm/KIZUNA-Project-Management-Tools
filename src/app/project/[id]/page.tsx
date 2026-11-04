'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  SlidersHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  Search,
  ListTodo,
  CheckCircle2,
  MoreHorizontal,
  Folder,
  Sparkles,
  Lock,
  User,
  Users,
  Calendar,
  Clock,
  Check,
  Edit2,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertCircle,
  X,
  Link2,
  EyeOff,
  Trash2,
  Key,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskRow from '@/components/tasks/TaskRow';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import TaskFiles from '@/components/tasks/TaskFiles';
import TaskTimeline from '@/components/tasks/TaskTimeline';
import ListOptionsDrawer from '@/components/tasks/ListOptionsDrawer';
import CustomizeDrawer from '@/components/layout/CustomizeDrawer';
import ExploreProjectBar from '@/components/modals/ExploreProjectBar';
import EditFieldModal from '@/components/modals/EditFieldModal';
import AddFieldModal from '@/components/modals/AddFieldModal';
import { StatusLevel, PriorityLevel, CustomColumn } from '@/lib/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'kevins-first-project';

  const {
    projects,
    tasks,
    users,
    portfolios,
    currentUser,
    openCreateModal,
    createTask,
    viewConfigs,
    openTaskDrawer,
    shareProject,
    updateProjectMemberRole,
    removeProjectMember,
    statusOptions,
    priorityOptions,
    updateStatusOptions,
    updatePriorityOptions,
    autoFillTaskStatus,
  } = useApp();

  const [isEditFieldModalOpen, setIsEditFieldModalOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState<'Status' | 'Priority'>('Status');
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [openColumnMenu, setOpenColumnMenu] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInlineNewFieldActive, setIsInlineNewFieldActive] = useState(false);
  const [inlineNewFieldName, setInlineNewFieldName] = useState('');

  // Custom columns state (persisted in localStorage)
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kizuna_custom_columns');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: 'sad', name: 'sad', type: 'text' },
      { id: 'asfdfd', name: 'asfdfd', type: 'text' },
      { id: 'fasfas', name: 'fasfas', type: 'text' },
    ];
  });

  const saveCustomColumns = (cols: CustomColumn[]) => {
    setCustomColumns(cols);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kizuna_custom_columns', JSON.stringify(cols));
      } catch {}
    }
  };

  const handleCreateCustomField = (field: {
    title: string;
    type: any;
    description?: string;
    options?: any[];
  }) => {
    const newCol: CustomColumn = {
      id: field.title.toLowerCase().replace(/\s+/g, '-'),
      name: field.title,
      type: field.type,
      options: field.options?.map((o) => o.name),
    };
    const updated = [...customColumns, newCol];
    saveCustomColumns(updated);
    setToastMessage(`${field.title} added successfully.`);
    setIsInlineNewFieldActive(true);
    setTimeout(() => {
      setToastMessage((prev) => (prev === `${field.title} added successfully.` ? null : prev));
    }, 4000);
  };

  const handleDeleteCustomColumn = (colId: string) => {
    const updated = customColumns.filter((c) => c.id !== colId);
    saveCustomColumns(updated);
  };

  const project = projects.find((p) => p.id === projectId) || projects[0];

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'List' | 'Board' | 'Timeline' | 'Dashboard' | 'Calendar' | 'Files'
  >('List');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isStarred, setIsStarred] = useState(false);
  const [inlineNewTaskSection, setInlineNewTaskSection] = useState<string | null>(null);
  const [inlineTaskName, setInlineTaskName] = useState('');

  // Project Status State
  const [projectStatus, setProjectStatus] = useState<string>(project?.status || 'On track');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Overview edit description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectDescription, setProjectDescription] = useState(
    project.description || 'Welcome to your first project! Track work, assign due dates, and collaborate.'
  );

  // Customize Drawer State
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
  const [isCustomizeDrawerOpen, setIsCustomizeDrawerOpen] = useState(false);
  
  // Share & Member Management Modal State (Matching Asana UI/UX)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareInviteEmail, setShareInviteEmail] = useState('');
  const [shareInviteRole, setShareInviteRole] = useState<'Editor' | 'Commenter' | 'Viewer'>('Editor');
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);
  const [notifyTasksAdded, setNotifyTasksAdded] = useState(false);
  const [accessSetting, setAccessSetting] = useState<'workspace' | 'private'>('workspace');
  const [isAccessSettingOpen, setIsAccessSettingOpen] = useState(false);
  const [taskCollaboratorsRole, setTaskCollaboratorsRole] = useState<'Editor' | 'Commenter' | 'Viewer'>('Editor');
  const [isTaskCollabRoleOpen, setIsTaskCollabRoleOpen] = useState(false);
  const [workspaceRole, setWorkspaceRole] = useState<'Editor' | 'Commenter' | 'Viewer'>('Editor');
  const [isWorkspaceRoleOpen, setIsWorkspaceRoleOpen] = useState(false);
  const [currentUserProjectRole, setCurrentUserProjectRole] = useState<'Project admin' | 'Editor' | 'Commenter' | 'Viewer'>('Project admin');
  const [isCurrentUserRoleOpen, setIsCurrentUserRoleOpen] = useState(false);
  const [activeMemberRoleDropdown, setActiveMemberRoleDropdown] = useState<string | null>(null);
  const [isManageNotificationsOpen, setIsManageNotificationsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    statusUpdates: true,
    conversations: true,
    tasksAdded: false,
  });
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [listColumns, setListColumns] = useState<Record<string, boolean>>({
    assignee: true,
    dueDate: true,
    priority: true,
    status: true,
  });

  const sections = project?.sections || ['To do', 'Doing', 'Done'];
  const projectTasks = tasks.filter((t) => t.projectId === project?.id);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInlineCreate = (section: string) => {
    if (!inlineTaskName.trim()) {
      setInlineNewTaskSection(null);
      return;
    }

    createTask({
      name: inlineTaskName.trim(),
      section,
      projectId: project.id,
      dueDate: 'Nov 5',
    });

    setInlineTaskName('');
    setInlineNewTaskSection(null);
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'On track':
        return 'bg-[#4cd195] text-[#4cd195]';
      case 'At risk':
        return 'bg-[#f5b324] text-[#f5b324]';
      case 'Off track':
        return 'bg-[#f06a6a] text-[#f06a6a]';
      case 'On hold':
        return 'bg-[#4573d2] text-[#4573d2]';
      case 'Complete':
        return 'bg-[#a855f7] text-[#a855f7]';
      default:
        return 'bg-[#4cd195] text-[#4cd195]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-3 pb-2 border-b border-[#2b2c2e]">
        {/* Breadcrumb matching Asana screenshot/video */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#8a8886] mb-1">
          <Link
            href="/portfolios"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>{project.portfolios?.[0] || 'My first portfolio'}</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-3">
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-white shrink-0">
              <ListTodo className="w-4 h-4 text-[#cfcecd]" />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white flex items-center gap-1.5 hover:bg-[#28292c] px-2 py-0.5 rounded-lg cursor-pointer transition-colors">
                <span>{project.name}</span>
                <ChevronDown className="w-4 h-4 text-[#8a8886]" />
              </h1>

              {/* Favorite Star */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`p-1 rounded hover:bg-[#28292c] transition-colors cursor-pointer ${
                  isStarred ? 'text-[#f5b324]' : 'text-[#8a8886] hover:text-white'
                }`}
                title={isStarred ? 'Remove from favorites' : 'Star project'}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-[#f5b324]' : ''}`} />
              </button>

              {/* Status Pill with interactive Dropdown (matching Asana video frame 015 & 130) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#252628] hover:bg-[#2c2d30] text-[12px] font-medium border border-[#37383b] transition-colors cursor-pointer"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${getStatusColor(projectStatus).split(' ')[0]}`}
                  />
                  <span className="text-white">{projectStatus}</span>
                  <ChevronDown className="w-3 h-3 text-[#8a8886]" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                    {['On track', 'At risk', 'Off track', 'On hold', 'Complete'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setProjectStatus(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2e3034] text-white"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(st).split(' ')[0]}`} />
                          <span>{st}</span>
                        </span>
                        {projectStatus === st && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              {(project.members && project.members.length > 0
                ? project.members
                : [
                    {
                      name: currentUser.name,
                      initials: currentUser.initials,
                      avatarColor: currentUser.avatarColor,
                      email: currentUser.email,
                      role: 'Project admin',
                    },
                  ]
              )
                .slice(0, 3)
                .map((m, idx) => (
                  <button
                    key={`${m.name}-${idx}`}
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ring-2 ring-[#1e1f21] hover:scale-105 transition-transform cursor-pointer"
                    style={{ backgroundColor: m.avatarColor || '#d84b7f' }}
                    title={`${m.name} (${m.role || 'Member'})`}
                  >
                    {m.initials}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                title="Manage project members"
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
              onClick={() => setIsCustomizeDrawerOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 text-[13px] font-medium overflow-x-auto pb-1">
          {(
            ['Overview', 'List', 'Board', 'Timeline', 'Dashboard', 'Calendar', 'Files'] as const
          ).map((tab) => {
            const config = viewConfigs[tab] || { name: tab, icon: '' };
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
                {config.icon && <span className="text-[14px] leading-none">{config.icon}</span>}
                <span>{config.name || tab}</span>
              </button>
            );
          })}
          <button
            onClick={() => alert("Add view tab")}
            className="text-[#8a8886] hover:text-white px-2 py-1 font-bold rounded-lg hover:bg-[#252628]/50 transition-colors cursor-pointer text-[14px]"
            title="Add view"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Toolbar for List view */}
      {activeTab === 'List' && (
        <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px]">
          {/* Add task button */}
          <div className="inline-flex items-stretch h-7 rounded-lg overflow-hidden shadow-xs bg-[#4573d2]">
            <button
              type="button"
              onClick={() => openCreateModal('task')}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-2.5 font-medium text-[12.5px] transition-colors h-full cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add task</span>
            </button>
            <div className="w-px bg-white/20 h-full" />
            <button
              type="button"
              onClick={() => openCreateModal('task')}
              className="flex items-center justify-center bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 transition-colors h-full cursor-pointer"
              title="More options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right action controls */}
          <div className="flex items-center gap-3 text-[#bdbbb9] text-[12px]">
            <button
              onClick={() => alert("Filter list")}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => alert("Sort list")}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button
              onClick={() => alert("Group list")}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Group</span>
            </button>
            <button
              onClick={() => setIsOptionsDrawerOpen(true)}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
            <button
              onClick={() => alert("Search tasks in project")}
              className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto">
        {/* ============================================================== */}
        {/* 1. LIST VIEW                                                   */}
        {/* ============================================================== */}
        {activeTab === 'List' && (
          <div className="flex flex-col min-h-full justify-between">
            <div>
              {/* Table Column Headers with Asana Column Header Menus (matching f_005.jpg & f_025.jpg) */}
              <div className="flex items-center h-[34px] px-4 border-b border-[#2b2c2e] text-[#8a8886] font-medium text-[12px] select-none">
                <div className="w-[30px]" />
                <div className="flex-1 min-w-[200px] pr-4">Name</div>

                {/* Assignee Header */}
                {listColumns.assignee && (
                  <div className="w-[160px] hidden md:flex items-center relative group/head">
                    <button
                      type="button"
                      onClick={() => setOpenColumnMenu(openColumnMenu === 'assignee' ? null : 'assignee')}
                      className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    >
                      <span>Assignee</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover/head:opacity-100 transition-opacity" />
                    </button>

                    {/* Column Dropdown Menu (matching f_005.jpg) */}
                    {openColumnMenu === 'assignee' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 w-56 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Sort by Assignee');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Sort</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Filter by Assignee');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Filter className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Filter</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Group by Assignee');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Group</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            setIsAddFieldModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Add column</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Move column');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Move column</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, assignee: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Hide column</span>
                        </button>

                        <div className="border-t border-[#37383b] my-1" />

                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Add automation to Assignee');
                          }}
                          className="w-full px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#bdbbb9]"
                        >
                          Add automation to field
                        </button>

                        <div className="border-t border-[#37383b] my-1" />

                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Find and replace assignee');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#bdbbb9]"
                        >
                          <Search className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Find and replace assignee</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Due date Header */}
                {listColumns.dueDate && (
                  <div className="w-[130px] hidden sm:flex items-center relative group/head">
                    <button
                      type="button"
                      onClick={() => setOpenColumnMenu(openColumnMenu === 'dueDate' ? null : 'dueDate')}
                      className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    >
                      <span>Due date</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover/head:opacity-100 transition-opacity" />
                    </button>

                    {openColumnMenu === 'dueDate' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 w-52 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Sort by Due date');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Sort</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Filter by Due date');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Filter className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Filter</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            setIsAddFieldModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Add column</span>
                        </button>
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, dueDate: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Hide column</span>
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Add automation to Due date');
                          }}
                          className="w-full px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#bdbbb9]"
                        >
                          Add automation to field
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Priority Header */}
                {listColumns.priority && (
                  <div className="w-[110px] hidden sm:flex items-center relative group/head">
                    <button
                      type="button"
                      onClick={() => setOpenColumnMenu(openColumnMenu === 'priority' ? null : 'priority')}
                      className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    >
                      <span>Priority</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover/head:opacity-100 transition-opacity" />
                    </button>

                    {openColumnMenu === 'priority' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 w-56 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setEditFieldType('Priority');
                            setIsEditFieldModalOpen(true);
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Edit field</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Field access and permissions');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Field access and permissions</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Sort by Priority');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Sort</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            setIsAddFieldModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Add column</span>
                        </button>
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, priority: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Hide column</span>
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Add automation to field');
                          }}
                          className="w-full px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#bdbbb9]"
                        >
                          Add automation to field
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            projectTasks.forEach((t) => autoFillTaskStatus(t.id));
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>AI auto-fill</span>
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, priority: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#ff6b72]"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#ff6b72]" />
                          <span>Delete field</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Header (matching f_025.jpg) */}
                {listColumns.status && (
                  <div className="w-[110px] hidden lg:flex items-center relative group/head">
                    <button
                      type="button"
                      onClick={() => setOpenColumnMenu(openColumnMenu === 'status' ? null : 'status')}
                      className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    >
                      <span>Status</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover/head:opacity-100 transition-opacity" />
                    </button>

                    {/* Column Dropdown Menu (matching f_025.jpg) */}
                    {openColumnMenu === 'status' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 w-56 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setEditFieldType('Status');
                            setIsEditFieldModalOpen(true);
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Edit field</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Field access and permissions');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Field access and permissions</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Sort by Status');
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Sort</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            setIsAddFieldModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Add column</span>
                        </button>
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, status: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Hide column</span>
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            alert('Add automation to field');
                          }}
                          className="w-full px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#bdbbb9]"
                        >
                          Add automation to field
                        </button>
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            projectTasks.forEach((t) => autoFillTaskStatus(t.id));
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>AI auto-fill</span>
                        </button>
                        <div className="border-t border-[#37383b] my-1" />
                        <button
                          onClick={() => {
                            setListColumns((prev) => ({ ...prev, status: false }));
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#ff6b72]"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#ff6b72]" />
                          <span>Delete field</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Custom Column Headers (matching f_025.jpg & f_048.jpg) */}
                {customColumns.map((col) => (
                  <div
                    key={col.id}
                    className="w-[120px] hidden xl:flex items-center relative group/head"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenColumnMenu(openColumnMenu === col.id ? null : col.id)}
                      className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    >
                      <span className="truncate">{col.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover/head:opacity-100 transition-opacity shrink-0" />
                    </button>

                    {openColumnMenu === col.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 w-56 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setOpenColumnMenu(null);
                            setIsAddFieldModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                          <span>Add column</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteCustomColumn(col.id);
                            setOpenColumnMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-left transition-colors text-[#ff6b72]"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#ff6b72]" />
                          <span>Delete field</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Inline "New field" placeholder when added (matching f_048.jpg) */}
                {isInlineNewFieldActive && (
                  <div className="w-[130px] px-1 flex items-center">
                    <input
                      autoFocus
                      placeholder="New field"
                      value={inlineNewFieldName}
                      onChange={(e) => setInlineNewFieldName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (inlineNewFieldName.trim()) {
                            handleCreateCustomField({
                              title: inlineNewFieldName.trim(),
                              type: 'text',
                            });
                          }
                          setInlineNewFieldName('');
                          setIsInlineNewFieldActive(false);
                        } else if (e.key === 'Escape') {
                          setInlineNewFieldName('');
                          setIsInlineNewFieldActive(false);
                        }
                      }}
                      onBlur={() => {
                        if (inlineNewFieldName.trim()) {
                          handleCreateCustomField({
                            title: inlineNewFieldName.trim(),
                            type: 'text',
                          });
                        }
                        setInlineNewFieldName('');
                        setIsInlineNewFieldActive(false);
                      }}
                      className="w-full bg-[#1e1f21] border border-[#4573d2] rounded-md px-2 py-0.5 text-white text-[12px] outline-none"
                    />
                  </div>
                )}

                {/* + Add Column Button (matching f_038.jpg) */}
                <div className="w-[30px] flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsAddFieldModalOpen(true)}
                    className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                    title="Add field"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#6d6c6e] hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="pb-8">
                {sections.map((sectionName) => {
                  const isCollapsed = collapsedSections[sectionName];
                  const sectionTasks = projectTasks.filter((t) => t.section === sectionName);

                  return (
                    <div key={sectionName} className="border-b border-[#252628]">
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSection(sectionName)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#252628] cursor-pointer group text-[13px] font-bold text-white transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        )}
                        <span>{sectionName}</span>
                        <span className="text-[11px] text-[#8a8886] font-normal">
                          {sectionTasks.length}
                        </span>
                      </div>

                      {/* Section Tasks */}
                      {!isCollapsed && (
                        <div>
                          {sectionTasks.map((t) => (
                            <TaskRow
                              key={t.id}
                              task={t}
                              showProjectColumn={false}
                              showVisibilityColumn={false}
                              showCollaboratorsColumn={false}
                              showAssigneeColumn={listColumns.assignee}
                              showDueDateColumn={listColumns.dueDate}
                              showPriorityColumn={listColumns.priority}
                              showStatusColumn={listColumns.status}
                              customColumns={customColumns}
                              onOpenEditField={(fieldType) => {
                                setEditFieldType(fieldType);
                                setIsEditFieldModalOpen(true);
                              }}
                            />
                          ))}

                          {/* Inline Add Task Input */}
                          {inlineNewTaskSection === sectionName ? (
                            <div className="flex items-center h-[38px] px-8 border-b border-[#2b2c2e] bg-[#252628]">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Write a task name..."
                                value={inlineTaskName}
                                onChange={(e) => setInlineTaskName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleInlineCreate(sectionName);
                                  if (e.key === 'Escape') setInlineNewTaskSection(null);
                                }}
                                className="w-full bg-transparent text-white text-[13px] outline-none"
                              />
                              <button
                                onClick={() => handleInlineCreate(sectionName)}
                                className="text-[12px] bg-[#4573d2] text-white px-2.5 py-0.5 rounded font-medium ml-2 cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setInlineNewTaskSection(null)}
                                className="text-[12px] text-[#8a8886] hover:text-white px-2 py-0.5 ml-1 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setInlineNewTaskSection(sectionName)}
                              className="flex items-center gap-2 h-[34px] px-10 text-[12px] text-[#8a8886] hover:text-white hover:bg-[#252628] w-full text-left transition-colors cursor-pointer"
                            >
                              <span>Add task</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Section */}
                <button
                  onClick={() => alert("Add new section to project")}
                  className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add section</span>
                </button>
              </div>
            </div>

            {/* Bottom Explore Your Project Banner */}
            <div className="p-4">
              <ExploreProjectBar />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. BOARD VIEW                                                  */}
        {/* ============================================================== */}
        {activeTab === 'Board' && (
          <TaskBoard sections={sections} tasks={projectTasks} projectId={project.id} />
        )}

        {/* ============================================================== */}
        {/* 3. TIMELINE (GANTT) VIEW                                       */}
        {/* ============================================================== */}
        {activeTab === 'Timeline' && (
          <TaskTimeline tasks={projectTasks} sections={sections} projectId={project.id} />
        )}

        {/* ============================================================== */}
        {/* 4. DASHBOARD VIEW                                              */}
        {/* ============================================================== */}
        {activeTab === 'Dashboard' && (
          <TaskDashboard tasks={projectTasks} projectName={project.name} />
        )}

        {/* ============================================================== */}
        {/* 5. FILES VIEW (Connected with Cloudflare R2!)                  */}
        {/* ============================================================== */}
        {activeTab === 'Files' && (
          <TaskFiles tasks={projectTasks} projectName={project.name} />
        )}

        {/* ============================================================== */}
        {/* 6. CALENDAR VIEW                                               */}
        {/* ============================================================== */}
        {activeTab === 'Calendar' && <TaskCalendar tasks={projectTasks} />}

        {/* ============================================================== */}
        {/* 7. OVERVIEW VIEW (Authentic Asana matching video frame 130)     */}
        {/* ============================================================== */}
        {activeTab === 'Overview' && (
          <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 select-none">
            {/* Left Main Column: AI Summary + Description + Roles */}
            <div className="space-y-6">
              {/* AI Summary Card (Matching Asana video frame 130) */}
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#45d3b6]" />
                    <span className="text-[14px] font-bold text-white">AI summary</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[#8a8886] bg-[#1e1f21] px-2.5 py-0.5 rounded-full border border-[#2e3034]">
                    <Lock className="w-3 h-3" />
                    <span>Private to you</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Recent Activity check */}
                  <div className="p-3 bg-[#1e1f21] border border-[#2e3034] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-semibold text-white">Recent activity</div>
                      <div className="text-[12px] text-[#8a8886]">
                        Catch up on what&apos;s happened in this project lately
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Included Recent Activity in AI summary")}
                      className="text-[12px] text-[#4573d2] hover:text-[#5a87e5] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Include</span>
                    </button>
                  </div>

                  {/* Risk Report check */}
                  <div className="p-3 bg-[#1e1f21] border border-[#2e3034] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-semibold text-white">Risk report</div>
                      <div className="text-[12px] text-[#8a8886]">
                        Proactively flag potential risks in this project
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Included Risk Report in AI summary")}
                      className="text-[12px] text-[#4573d2] hover:text-[#5a87e5] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Include</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-[12px] text-[#8a8886] cursor-pointer">
                    <input type="checkbox" className="rounded accent-[#4573d2]" />
                    <span>Get regular updates</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert("AI summary generated for " + project.name)}
                    className="px-4 py-1.5 rounded-lg bg-[#2e3034] hover:bg-[#383a3f] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    Generate summary
                  </button>
                </div>
              </div>

              {/* Project Description */}
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-white">Project description</h3>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="text-[#8a8886] hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full bg-[#1e1f21] text-white p-3 rounded-xl border border-[#4573d2] text-[13.5px] outline-none resize-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingDescription(false)}
                        className="px-3 py-1 rounded-lg text-[#8a8886] hover:text-white text-[12.5px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsEditingDescription(false)}
                        className="px-4 py-1 rounded-lg bg-[#4573d2] text-white text-[12.5px] font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13.5px] text-[#bdbbb9] leading-relaxed">
                    {projectDescription}
                  </p>
                )}
              </div>

              {/* Project Roles */}
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-[16px] font-bold text-white">Project roles</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shadow-sm"
                      style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                    >
                      {currentUser.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-[13.5px]">{currentUser.name}</div>
                      <div className="text-[12px] text-[#8a8886]">Project owner</div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Add member to project")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#37383b] hover:bg-[#2e3034] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add member</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Status Widget & Activity Feed (Matching Asana video frame 130) */}
            <div className="space-y-6">
              {/* Status Update Card */}
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(projectStatus).split(' ')[0]}`} />
                    <span className="text-[15px] font-bold text-white">{projectStatus}</span>
                  </div>

                  <button
                    onClick={() => alert("Post status update modal")}
                    className="flex items-center gap-1 text-[12px] text-[#4573d2] hover:text-[#5a87e5] font-medium cursor-pointer"
                  >
                    <span>Update status</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="pt-2 border-t border-[#2e3034] space-y-2">
                  <div className="text-[13px] font-bold text-white">This project is kicked off!</div>
                  <div className="text-[12px] text-[#a2a09e] font-medium">Summary</div>
                  <p className="text-[12px] text-[#8a8886] leading-relaxed">
                    This is a sample project status update in Asana. Use status updates to communicate the progress of your project with your teammates.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#6d6c6e]">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                      style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                    >
                      {currentUser.initials}
                    </div>
                    <span>{currentUser.name}</span>
                    <span>•</span>
                    <span>Yesterday at 11:18am</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2e3034] flex items-center gap-2 text-[12px] text-[#8a8886]">
                  <Calendar className="w-4 h-4 text-[#8a8886]" />
                  <span>Nov 3 – Dec 1</span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-[#242528] border border-[#37383b] rounded-2xl p-5 space-y-4 shadow-sm">
                <h4 className="text-[14px] font-bold text-white">Activity</h4>
                <div className="space-y-4 text-[12px]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#4cd195] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-white font-medium">This project is kicked off!</div>
                      <div className="text-[#8a8886] text-[11px]">{currentUser.name} • Yesterday at 11:18am</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Users className="w-3.5 h-3.5 text-[#8a8886] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white font-medium">{currentUser.workspace || 'My workspace'} team joined</div>
                      <div className="text-[#8a8886] text-[11px]">2 days ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <User className="w-3.5 h-3.5 text-[#8a8886] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white font-medium">You joined</div>
                      <div className="text-[#8a8886] text-[11px]">2 days ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8a8886] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white font-medium">Project created</div>
                      <div className="text-[#8a8886] text-[11px]">{currentUser.name} • 2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Column Options Drawer */}
      <ListOptionsDrawer
        isOpen={isOptionsDrawerOpen}
        onClose={() => setIsOptionsDrawerOpen(false)}
        columns={listColumns}
        onToggleColumn={(col) => setListColumns((prev) => ({ ...prev, [col]: !prev[col] }))}
        filterMode="all"
        onFilterModeChange={() => {}}
        sortField="none"
        onSortFieldChange={() => {}}
        groupField="none"
        onGroupFieldChange={() => {}}
      />

      {/* Asana Customize Workflow Drawer */}
      <CustomizeDrawer
        isOpen={isCustomizeDrawerOpen}
        onClose={() => setIsCustomizeDrawerOpen(false)}
        contextTitle={project.name}
      />

      {/* ============================================================== */}
      {/* Share Project Modal (Matching app.asana.com screenshot)         */}
      {/* ============================================================== */}
      {isShareModalOpen && (
        <div
          data-modal-overlay
          onClick={(e) => {
            if ((e.target as HTMLElement).getAttribute('data-modal-overlay')) {
              setIsShareModalOpen(false);
            }
          }}
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[540px] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header: Title + Network icon + Close button */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-[17px] font-semibold text-white tracking-tight">
                Share {project.name}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/project/${project.id}`;
                    navigator.clipboard.writeText(link);
                    setShareToast('Project link copied to clipboard');
                    setTimeout(() => setShareToast(null), 2500);
                  }}
                  className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Copy link / Share settings"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invite with email */}
            <div className="space-y-2.5">
              <label className="block text-[13px] font-semibold text-white">
                Invite with email
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center bg-[#141517] border border-[#37383b] focus-within:border-[#4573d2] rounded-xl px-3.5 py-1.5 transition-colors">
                  <input
                    type="text"
                    value={shareInviteEmail}
                    onChange={(e) => setShareInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && shareInviteEmail.trim()) {
                        const emails = shareInviteEmail
                          .split(',')
                          .map((em) => em.trim())
                          .filter(Boolean);
                        emails.forEach((em) => shareProject(project.id, em, shareInviteRole));
                        setShareToast(`Invited ${emails.join(', ')} as ${shareInviteRole}`);
                        setShareInviteEmail('');
                        setTimeout(() => setShareToast(null), 2500);
                      }
                    }}
                    placeholder="Add members by name or email"
                    className="bg-transparent text-[13px] text-white placeholder-[#717377] focus:outline-none flex-1 py-1"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsInviteRoleOpen((prev) => !prev)}
                      className="flex items-center gap-1 text-[13px] text-[#cfcecd] hover:text-white cursor-pointer px-2 py-0.5 rounded transition-colors"
                    >
                      <span>{shareInviteRole}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                    </button>
                    {isInviteRoleOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#252628] border border-[#38393c] rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                        {(['Editor', 'Commenter', 'Viewer'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setShareInviteRole(r);
                              setIsInviteRoleOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-[12.5px] flex items-center justify-between hover:bg-[#2f3135] cursor-pointer transition-colors ${
                              shareInviteRole === r ? 'text-[#4573d2] font-semibold' : 'text-white'
                            }`}
                          >
                            <span>{r}</span>
                            {shareInviteRole === r && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!shareInviteEmail.trim()}
                  onClick={() => {
                    if (!shareInviteEmail.trim()) return;
                    const emails = shareInviteEmail
                      .split(',')
                      .map((em) => em.trim())
                      .filter(Boolean);
                    emails.forEach((em) => shareProject(project.id, em, shareInviteRole));
                    setShareToast(`Invited ${emails.join(', ')} as ${shareInviteRole}`);
                    setShareInviteEmail('');
                    setTimeout(() => setShareToast(null), 2500);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    shareInviteEmail.trim()
                      ? 'bg-[#4573d2] hover:bg-[#3b66be] text-white cursor-pointer shadow-xs'
                      : 'bg-[#252628] text-[#55575a] cursor-not-allowed border border-[#303236]'
                  }`}
                >
                  Invite
                </button>
              </div>

              {/* Checkbox: Notify when tasks are added */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyTasksAdded}
                    onChange={(e) => setNotifyTasksAdded(e.target.checked)}
                    className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer w-4 h-4 accent-[#4573d2]"
                  />
                  <span className="text-[13px] text-[#cfcecd] font-normal leading-tight">
                    Notify when tasks are added to the project
                  </span>
                </label>
              </div>
            </div>

            {/* Access settings */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-white">
                Access settings
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccessSettingOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141517] border border-[#2e3034] hover:border-[#38393c] cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 text-[13.5px] text-white font-medium">
                    <Users className="w-4 h-4 text-[#8a8886]" />
                    <span>{accessSetting === 'workspace' ? (currentUser.workspace || 'My workspace') : 'Private to members'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                </button>

                {isAccessSettingOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#252628] border border-[#38393c] rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAccessSetting('workspace');
                        setIsAccessSettingOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#2f3135] cursor-pointer transition-colors flex items-start justify-between"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-white">{currentUser.workspace || 'My workspace'}</div>
                        <div className="text-[11.5px] text-[#8a8886]">Anyone in your workspace can access this project</div>
                      </div>
                      {accessSetting === 'workspace' && <Check className="w-4 h-4 text-[#4573d2] shrink-0 mt-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccessSetting('private');
                        setIsAccessSettingOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#2f3135] cursor-pointer transition-colors flex items-start justify-between"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-white">Private to members</div>
                        <div className="text-[11.5px] text-[#8a8886]">Only people invited to this project can access</div>
                      </div>
                      {accessSetting === 'private' && <Check className="w-4 h-4 text-[#4573d2] shrink-0 mt-0.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Who has access */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-white">Who has access</label>
                <button
                  type="button"
                  onClick={() => setIsManageNotificationsOpen(true)}
                  className="text-[12px] text-[#4573d2] hover:text-[#5f89e2] font-medium cursor-pointer"
                >
                  Manage notifications
                </button>
              </div>

              {/* Task collaborators row */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#252628] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#252628] border border-[#37383b] flex items-center justify-center text-[#8a8886] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-[13px] font-medium text-white">Task collaborators</div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTaskCollabRoleOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-[12.5px] text-[#cfcecd] hover:text-white px-2 py-1 rounded cursor-pointer"
                  >
                    <span>{taskCollaboratorsRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  </button>
                  {isTaskCollabRoleOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#252628] border border-[#38393c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                      {(['Editor', 'Commenter', 'Viewer'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setTaskCollaboratorsRole(r);
                            setIsTaskCollabRoleOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between hover:bg-[#2f3135] cursor-pointer ${
                            taskCollaboratorsRole === r ? 'text-[#4573d2] font-semibold' : 'text-white'
                          }`}
                        >
                          <span>{r}</span>
                          {taskCollaboratorsRole === r && <Check className="w-3 h-3 text-[#4573d2]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace row */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#252628] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#37383b] flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                    {(currentUser.workspace || 'M')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">{currentUser.workspace || 'My workspace'}</div>
                    <div className="text-[11.5px] text-[#8a8886]">
                      {users.filter((u) => !u.workspace || u.workspace === (currentUser.workspace || 'My workspace')).length || 1} person
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsWorkspaceRoleOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-[12.5px] text-[#cfcecd] hover:text-white px-2 py-1 rounded cursor-pointer"
                  >
                    <span>{workspaceRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  </button>
                  {isWorkspaceRoleOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#252628] border border-[#38393c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                      {(['Editor', 'Commenter', 'Viewer'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setWorkspaceRole(r);
                            setIsWorkspaceRoleOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between hover:bg-[#2f3135] cursor-pointer ${
                            workspaceRole === r ? 'text-[#4573d2] font-semibold' : 'text-white'
                          }`}
                        >
                          <span>{r}</span>
                          {workspaceRole === r && <Check className="w-3 h-3 text-[#4573d2]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current user (Creator / Project admin) */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#252628] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                    style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                  >
                    {currentUser.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">{currentUser.name}</div>
                    <div className="text-[11.5px] text-[#8a8886]">{currentUser.email}</div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCurrentUserRoleOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-[12.5px] text-[#cfcecd] hover:text-white px-2 py-1 rounded cursor-pointer"
                  >
                    <span>{currentUserProjectRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  </button>
                  {isCurrentUserRoleOpen && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-[#252628] border border-[#38393c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                      {(['Project admin', 'Editor', 'Commenter', 'Viewer'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setCurrentUserProjectRole(r);
                            setIsCurrentUserRoleOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between hover:bg-[#2f3135] cursor-pointer ${
                            currentUserProjectRole === r ? 'text-[#4573d2] font-semibold' : 'text-white'
                          }`}
                        >
                          <span>{r}</span>
                          {currentUserProjectRole === r && <Check className="w-3 h-3 text-[#4573d2]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Invited Project Members */}
              {project.members
                ?.filter(
                  (m) =>
                    m.email?.toLowerCase() !== currentUser.email?.toLowerCase() &&
                    m.name.toLowerCase() !== currentUser.name.toLowerCase()
                )
                .map((member, idx) => (
                  <div
                    key={`${member.email || member.name}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#252628] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                        style={{ backgroundColor: member.avatarColor || '#4573d2' }}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white">{member.name}</div>
                        <div className="text-[11.5px] text-[#8a8886]">{member.email}</div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMemberRoleDropdown(
                            activeMemberRoleDropdown === member.email ? null : member.email || ''
                          )
                        }
                        className="flex items-center gap-1 text-[12.5px] text-[#cfcecd] hover:text-white px-2 py-1 rounded cursor-pointer"
                      >
                        <span>{member.role || 'Editor'}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                      </button>
                      {activeMemberRoleDropdown === member.email && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#252628] border border-[#38393c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                          {(['Project admin', 'Editor', 'Commenter', 'Viewer'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                if (member.email) {
                                  updateProjectMemberRole(project.id, member.email, r);
                                }
                                setActiveMemberRoleDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between hover:bg-[#2f3135] cursor-pointer ${
                                member.role === r ? 'text-[#4573d2] font-semibold' : 'text-white'
                              }`}
                            >
                              <span>{r}</span>
                              {member.role === r && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                          ))}
                          <div className="border-t border-[#37383b] my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              if (member.email) {
                                removeProjectMember(project.id, member.email);
                                setShareToast(`Removed ${member.name} from project`);
                                setTimeout(() => setShareToast(null), 2500);
                              }
                              setActiveMemberRoleDropdown(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[12px] text-[#f06a6a] hover:bg-[#2f3135] cursor-pointer"
                          >
                            Remove from project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Connected Portfolio Info */}
            <div className="flex items-center justify-between text-[12.5px] text-[#8a8886] pt-1">
              <span>
                This project is connected to {project.portfolios?.length || 1} portfolio.
              </span>
              <Link
                href="/portfolios"
                onClick={() => setIsShareModalOpen(false)}
                className="text-[#a2a09e] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Manage access</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bottom Footer: Copy Project link */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/project/${project.id}`;
                  navigator.clipboard.writeText(link);
                  setShareToast('Project link copied to clipboard');
                  setTimeout(() => setShareToast(null), 2500);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2f3135] text-white text-[12.5px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5 text-[#8a8886]" />
                <span>Copy project link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Notifications Sub-Modal */}
      {isManageNotificationsOpen && (
        <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[420px] p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#2e3034]">
              <h4 className="text-[15px] font-bold text-white">Project notification settings</h4>
              <button
                type="button"
                onClick={() => setIsManageNotificationsOpen(false)}
                className="p-1 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.statusUpdates}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({ ...prev, statusUpdates: e.target.checked }))
                  }
                  className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 mt-0.5"
                />
                <div>
                  <div className="text-[13px] font-medium text-white">Status updates</div>
                  <div className="text-[11.5px] text-[#8a8886]">Get notified when status changes or milestones complete</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.conversations}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({ ...prev, conversations: e.target.checked }))
                  }
                  className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 mt-0.5"
                />
                <div>
                  <div className="text-[13px] font-medium text-white">Conversations</div>
                  <div className="text-[11.5px] text-[#8a8886]">Get notified when new discussions or messages are posted</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasksAdded}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({ ...prev, tasksAdded: e.target.checked }))
                  }
                  className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 mt-0.5"
                />
                <div>
                  <div className="text-[13px] font-medium text-white">Tasks added</div>
                  <div className="text-[11.5px] text-[#8a8886]">Get notified when someone creates a new task in this project</div>
                </div>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsManageNotificationsOpen(false);
                  setShareToast('Notification settings saved');
                  setTimeout(() => setShareToast(null), 2500);
                }}
                className="px-4 py-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white text-[12.5px] font-medium rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal (Single-select Status/Priority options matching Asana screenshots) */}
      <EditFieldModal
        isOpen={isEditFieldModalOpen}
        onClose={() => setIsEditFieldModalOpen(false)}
        fieldType={editFieldType}
        initialOptions={editFieldType === 'Status' ? statusOptions : priorityOptions}
        onSave={(title, newOptions) => {
          if (editFieldType === 'Status') {
            updateStatusOptions(newOptions);
          } else {
            updatePriorityOptions(newOptions);
          }
          setShareToast(`${title} options saved`);
          setTimeout(() => setShareToast(null), 2500);
        }}
      />

      {/* Add Field Modal (matching Asana frame f_038.jpg) */}
      <AddFieldModal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        onCreateField={handleCreateCustomField}
        workspaceName={currentUser.workspace || 'My workspace'}
      />

      {/* Toast Notification (matching Asana frame f_048.jpg) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[90] flex items-center justify-between gap-4 bg-[#1e1f21] border border-[#383a3d] text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8a8886] hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-[90] bg-[#141517] border border-[#37383b] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#4cd195]" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}
