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
import { StatusLevel, PriorityLevel } from '@/lib/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'kevins-first-project';

  const {
    projects,
    tasks,
    currentUser,
    openCreateModal,
    createTask,
    viewConfigs,
    openTaskDrawer,
  } = useApp();

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
            <div className="flex items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
                title={currentUser.name}
              >
                {currentUser.initials}
              </div>
              <button
                onClick={() => alert("Project member management")}
                className="w-7 h-7 rounded-full bg-[#2a2b2e] border border-[#37383b] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => alert("Share project modal")}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setIsCustomizeDrawerOpen(true)}
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
              {/* Table Column Headers */}
              <div className="flex items-center h-[32px] px-4 border-b border-[#2b2c2e] text-[#8a8886] font-semibold text-[11px] uppercase tracking-wider select-none">
                <div className="w-[30px]" />
                <div className="flex-1 min-w-[200px] pr-4">Name</div>
                {listColumns.assignee && <div className="w-[160px] hidden md:block px-2">Assignee</div>}
                {listColumns.dueDate && <div className="w-[130px] hidden sm:block px-2">Due date</div>}
                {listColumns.priority && <div className="w-[110px] hidden sm:block px-2">Priority</div>}
                {listColumns.status && <div className="w-[110px] hidden lg:block px-2">Status</div>}
                <div className="w-[30px] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-[#6d6c6e]" />
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
                              showDueDateColumn={listColumns.dueDate}
                              showCollaboratorsColumn={listColumns.assignee}
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
                      <div className="text-white font-medium">My workspace team joined</div>
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
    </div>
  );
}
