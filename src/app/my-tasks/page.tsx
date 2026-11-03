'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Share2,
  SlidersHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  MoreHorizontal,
  Search,
  Check,
  Calendar as CalendarIcon,
  Trash2,
  X,
  Diamond,
  ThumbsUp,
  Folder,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskRow from '@/components/tasks/TaskRow';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import FileManager from '@/components/files/FileManager';
import { Task, PriorityLevel } from '@/lib/types';

export default function MyTasksPage() {
  const {
    tasks,
    currentUser,
    openCreateModal,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    projects,
  } = useApp();

  // Tab state
  const [activeTab, setActiveTab] = useState<'List' | 'Board' | 'Calendar' | 'Dashboard' | 'Files'>('List');

  // Sections state
  const [sections, setSections] = useState<string[]>([
    'Recently assigned',
    'Do today',
    'Do next week',
    'Do later',
  ]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [editSectionValue, setEditSectionValue] = useState('');
  const [openSectionMenu, setOpenSectionMenu] = useState<string | null>(null);

  // Inline add task per section
  const [inlineNewTaskSection, setInlineNewTaskSection] = useState<string | null>(null);
  const [inlineTaskName, setInlineTaskName] = useState('');

  // Add section
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Toolbar menus
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  // Filter, Sort, Group & Column visibility
  const [filterMode, setFilterMode] = useState<'incomplete' | 'completed' | 'all' | 'due_today' | 'due_this_week'>('incomplete');
  const [sortMode, setSortMode] = useState<'none' | 'due_date' | 'priority' | 'alphabetical'>('none');
  const [groupMode, setGroupMode] = useState<'section' | 'priority' | 'due_date' | 'project' | 'none'>('section');
  const [columnVisibility, setColumnVisibility] = useState({
    project: true,
    dueDate: true,
    priority: true,
    visibility: false,
  });

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Multi-selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsAddMenuOpen(false);
        setIsFilterMenuOpen(false);
        setIsSortMenuOpen(false);
        setIsGroupMenuOpen(false);
        setIsOptionsMenuOpen(false);
        setOpenSectionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Section collapse toggle
  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Section rename handlers
  const handleStartRenameSection = (section: string) => {
    setEditingSectionName(section);
    setEditSectionValue(section);
    setOpenSectionMenu(null);
  };

  const handleSaveRenameSection = (oldName: string) => {
    const trimmed = editSectionValue.trim();
    if (trimmed && trimmed !== oldName) {
      setSections((prev) => prev.map((s) => (s === oldName ? trimmed : s)));
      // Also update tasks assigned to oldName
      tasks.forEach((t) => {
        const currentSec = t.myTasksSection || t.section;
        if (currentSec === oldName) {
          updateTask(t.id, { myTasksSection: trimmed });
        }
      });
    }
    setEditingSectionName(null);
  };

  // Section delete
  const handleDeleteSection = (sectionToDelete: string) => {
    setSections((prev) => prev.filter((s) => s !== sectionToDelete));
    // Move any tasks in this section back to Recently assigned
    tasks.forEach((t) => {
      const currentSec = t.myTasksSection || t.section;
      if (currentSec === sectionToDelete) {
        updateTask(t.id, { myTasksSection: 'Recently assigned' });
      }
    });
    setOpenSectionMenu(null);
  };

  // Add section
  const handleCreateSection = () => {
    const trimmed = newSectionTitle.trim();
    if (trimmed && !sections.includes(trimmed)) {
      setSections((prev) => [...prev, trimmed]);
    }
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  // Inline add task
  const handleInlineCreate = (section: string, taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    if (!inlineTaskName.trim()) {
      setInlineNewTaskSection(null);
      return;
    }

    createTask({
      name: inlineTaskName.trim(),
      section: 'To do',
      myTasksSection: section,
      taskType,
      dueDate: 'Today – Nov 4',
      projectId: 'kevins-first-project',
      priority: 'Low',
    });

    setInlineTaskName('');
    // Keep inline creator open for quick consecutive task additions
  };

  // Split button quick add
  const handleQuickAdd = (taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    const targetSection = sections[0] || 'Recently assigned';
    setInlineNewTaskSection(targetSection);
    setIsAddMenuOpen(false);
  };

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Completion / Status filter
      if (filterMode === 'incomplete' && t.completed) return false;
      if (filterMode === 'completed' && !t.completed) return false;
      if (filterMode === 'due_today') {
        const due = (t.dueDate || '').toLowerCase();
        if (!due.includes('today') && !due.includes('nov 3')) return false;
      }
      if (filterMode === 'due_this_week') {
        const due = (t.dueDate || '').toLowerCase();
        if (!due || due.includes('later')) return false;
      }

      // 2. Search keyword filter
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesProject = (t.projectName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesProject) return false;
      }

      return true;
    });
  }, [tasks, filterMode, searchKeyword]);

  // Sort logic
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortMode === 'due_date') {
      return list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }
    if (sortMode === 'priority') {
      const rank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      return list.sort((a, b) => (rank[b.priority || ''] || 0) - (rank[a.priority || ''] || 0));
    }
    if (sortMode === 'alphabetical') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredTasks, sortMode]);

  // Group logic
  const groupedData = useMemo(() => {
    if (groupMode === 'none') {
      return [{ groupName: 'All tasks', tasks: sortedTasks, id: 'all' }];
    }

    if (groupMode === 'priority') {
      const priorities: PriorityLevel[] = ['High', 'Medium', 'Low'];
      const groups: { groupName: string; id: string; tasks: Task[] }[] = priorities.map((p) => ({
        groupName: `${p} Priority`,
        id: p,
        tasks: sortedTasks.filter((t) => t.priority === p),
      }));
      const noneTasks = sortedTasks.filter((t) => !t.priority);
      if (noneTasks.length > 0) {
        groups.push({ groupName: 'No Priority', id: 'none', tasks: noneTasks });
      }
      return groups;
    }

    if (groupMode === 'project') {
      const projectMap = new Map<string, Task[]>();
      sortedTasks.forEach((t) => {
        const pName = t.projectName || 'No project';
        if (!projectMap.has(pName)) projectMap.set(pName, []);
        projectMap.get(pName)!.push(t);
      });
      return Array.from(projectMap.entries()).map(([pName, pTasks]) => ({
        groupName: pName,
        id: pName,
        tasks: pTasks,
      }));
    }

    // Default: Group by Section
    return sections.map((sec) => {
      const secTasks = sortedTasks.filter((t) => {
        const assignedSec = t.myTasksSection || (sections.includes(t.section) ? t.section : 'Recently assigned');
        return assignedSec === sec;
      });
      return {
        groupName: sec,
        id: sec,
        tasks: secTasks,
      };
    });
  }, [sortedTasks, groupMode, sections]);

  // Multi-select handlers
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    if (selectedTaskIds.size === sortedTasks.length && sortedTasks.length > 0) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(sortedTasks.map((t) => t.id)));
    }
  };

  // Mass actions
  const handleMassComplete = () => {
    selectedTaskIds.forEach((id) => {
      updateTask(id, { completed: true });
    });
    setSelectedTaskIds(new Set());
  };

  const handleMassIncomplete = () => {
    selectedTaskIds.forEach((id) => {
      updateTask(id, { completed: false });
    });
    setSelectedTaskIds(new Set());
  };

  const handleMassDelete = () => {
    if (confirm(`Delete ${selectedTaskIds.size} selected tasks?`)) {
      selectedTaskIds.forEach((id) => {
        deleteTask(id);
      });
      setSelectedTaskIds(new Set());
    }
  };

  const handleMassMoveSection = (targetSection: string) => {
    selectedTaskIds.forEach((id) => {
      updateTask(id, { myTasksSection: targetSection });
    });
    setSelectedTaskIds(new Set());
  };

  const handleMassSetDueDate = (datePreset: string) => {
    selectedTaskIds.forEach((id) => {
      updateTask(id, { dueDate: datePreset });
    });
    setSelectedTaskIds(new Set());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-4 pb-2 border-b border-[#2b2c2e]">
        <div className="flex items-center justify-between mb-3">
          {/* Title & User Avatar */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.initials}
            </div>
            <h1 className="text-[20px] font-bold text-white flex items-center gap-1.5 cursor-pointer hover:bg-[#28292c] px-2 py-0.5 rounded-lg transition-colors">
              <span>My tasks</span>
              <ChevronDown className="w-4 h-4 text-[#8a8886]" />
            </h1>
          </div>

          {/* Action buttons: Share & Customize */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Share settings for My Tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => alert('Customize My Tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-6 text-[13px] font-medium">
          {(['List', 'Board', 'Calendar', 'Dashboard', 'Files'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-colors relative ${
                activeTab === tab ? 'text-white font-semibold' : 'text-[#8a8886] hover:text-[#bdbbb9]'
              }`}
            >
              <span>{tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2] rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={() => alert('Add view tab: Timeline, Gantt, Form')}
            className="text-[#8a8886] hover:text-white pb-2.5 font-bold"
            title="Add tab"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Toolbar for List View */}
      {activeTab === 'List' && (
        <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px] relative z-20">
          {/* Add task split button with dropdown */}
          <div className="relative inline-flex items-stretch h-7 rounded-lg overflow-hidden shadow-xs bg-[#4573d2]" data-dropdown>
            <button
              type="button"
              onClick={() => handleQuickAdd('task')}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-2.5 font-medium text-[12.5px] transition-colors h-full"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add task</span>
            </button>
            <div className="w-px bg-white/20 h-full" />
            <button
              type="button"
              onClick={() => setIsAddMenuOpen((prev) => !prev)}
              className="flex items-center justify-center bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 transition-colors h-full"
              title="More task types"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Split button dropdown */}
            {isAddMenuOpen && (
              <div className="absolute top-8 left-0 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-30 text-[13px]">
                <button
                  onClick={() => handleQuickAdd('task')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                  <span>Task</span>
                </button>
                <button
                  onClick={() => handleQuickAdd('milestone')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                >
                  <Diamond className="w-3.5 h-3.5 text-[#e5a000]" />
                  <span>Milestone</span>
                </button>
                <button
                  onClick={() => handleQuickAdd('approval')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#4573d2]" />
                  <span>Approval</span>
                </button>
              </div>
            )}
          </div>

          {/* Right action controls */}
          <div className="flex items-center gap-2 text-[#bdbbb9] text-[12px]">
            {/* Filter Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  filterMode !== 'all'
                    ? 'bg-[#1b2b48] text-[#4573d2] border border-[#2d4370]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {filterMode === 'incomplete' && 'Incomplete tasks'}
                  {filterMode === 'completed' && 'Completed tasks'}
                  {filterMode === 'due_today' && 'Due today'}
                  {filterMode === 'due_this_week' && 'Due this week'}
                  {filterMode === 'all' && 'Filter'}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {isFilterMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-30 text-[13px]">
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                    Task filter
                  </div>
                  {[
                    { id: 'incomplete', label: 'Incomplete tasks' },
                    { id: 'completed', label: 'Completed tasks' },
                    { id: 'all', label: 'All tasks' },
                    { id: 'due_today', label: 'Due today' },
                    { id: 'due_this_week', label: 'Due this week' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setFilterMode(opt.id as any);
                        setIsFilterMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                    >
                      <span>{opt.label}</span>
                      {filterMode === opt.id && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsSortMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  sortMode !== 'none'
                    ? 'bg-[#1b2b48] text-[#4573d2] border border-[#2d4370]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>
                  {sortMode === 'none' && 'Sort'}
                  {sortMode === 'due_date' && 'Sort: Due date'}
                  {sortMode === 'priority' && 'Sort: Priority'}
                  {sortMode === 'alphabetical' && 'Sort: Alphabetical'}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 top-8 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-30 text-[13px]">
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                    Sort by
                  </div>
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'due_date', label: 'Due date' },
                    { id: 'priority', label: 'Priority' },
                    { id: 'alphabetical', label: 'Alphabetical' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortMode(opt.id as any);
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                    >
                      <span>{opt.label}</span>
                      {sortMode === opt.id && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Group Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsGroupMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  groupMode !== 'section'
                    ? 'bg-[#1b2b48] text-[#4573d2] border border-[#2d4370]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {groupMode === 'section' && 'Group: Section'}
                  {groupMode === 'priority' && 'Group: Priority'}
                  {groupMode === 'project' && 'Group: Project'}
                  {groupMode === 'none' && 'Group: None'}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {isGroupMenuOpen && (
                <div className="absolute right-0 top-8 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-30 text-[13px]">
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                    Group by
                  </div>
                  {[
                    { id: 'section', label: 'Section' },
                    { id: 'priority', label: 'Priority' },
                    { id: 'project', label: 'Project' },
                    { id: 'none', label: 'None' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setGroupMode(opt.id as any);
                        setIsGroupMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                    >
                      <span>{opt.label}</span>
                      {groupMode === opt.id && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Options Dropdown (Column Toggles) */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsOptionsMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:text-white hover:bg-[#28292c] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Options</span>
              </button>

              {isOptionsMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1.5 z-30 text-[13px]">
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                    Visible fields
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] cursor-pointer text-[#f5f4f3]">
                    <input
                      type="checkbox"
                      checked={columnVisibility.project}
                      onChange={(e) =>
                        setColumnVisibility((prev) => ({ ...prev, project: e.target.checked }))
                      }
                      className="rounded accent-[#4573d2]"
                    />
                    <span>Projects</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] cursor-pointer text-[#f5f4f3]">
                    <input
                      type="checkbox"
                      checked={columnVisibility.dueDate}
                      onChange={(e) =>
                        setColumnVisibility((prev) => ({ ...prev, dueDate: e.target.checked }))
                      }
                      className="rounded accent-[#4573d2]"
                    />
                    <span>Due date</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] cursor-pointer text-[#f5f4f3]">
                    <input
                      type="checkbox"
                      checked={columnVisibility.priority}
                      onChange={(e) =>
                        setColumnVisibility((prev) => ({ ...prev, priority: e.target.checked }))
                      }
                      className="rounded accent-[#4573d2]"
                    />
                    <span>Priority</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] cursor-pointer text-[#f5f4f3]">
                    <input
                      type="checkbox"
                      checked={columnVisibility.visibility}
                      onChange={(e) =>
                        setColumnVisibility((prev) => ({ ...prev, visibility: e.target.checked }))
                      }
                      className="rounded accent-[#4573d2]"
                    />
                    <span>Task visibility</span>
                  </label>
                </div>
              )}
            </div>

            {/* Search Input Box */}
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <div className="flex items-center bg-[#252628] border border-[#37383b] rounded-lg px-2 py-0.5 text-[12px]">
                  <Search className="w-3.5 h-3.5 text-[#8a8886] mr-1.5 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search tasks..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="bg-transparent text-white outline-none w-32 md:w-44 text-[12px]"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      className="text-[#8a8886] hover:text-white ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchKeyword('');
                    }}
                    className="text-[#8a8886] hover:text-white ml-1.5 text-[11px]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-1.5 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                  title="Search tasks"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'List' && (
          <div>
            {/* Table Header with Select All checkbox */}
            <div className="flex items-center h-[32px] px-3 border-b border-[#2b2c2e] text-[#8a8886] font-semibold text-[11px] uppercase tracking-wider select-none bg-[#1e1f21] sticky top-0 z-10">
              {/* Select All Checkbox */}
              <div
                className="w-[24px] flex items-center justify-center shrink-0 cursor-pointer"
                onClick={handleSelectAllVisible}
                title="Select all"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${
                    selectedTaskIds.size === sortedTasks.length && sortedTasks.length > 0
                      ? 'bg-[#4573d2] border-[#4573d2]'
                      : selectedTaskIds.size > 0
                      ? 'bg-[#4573d2]/30 border-[#4573d2]'
                      : 'border-[#555659] hover:border-[#8a8886]'
                  }`}
                >
                  {selectedTaskIds.size === sortedTasks.length && sortedTasks.length > 0 && (
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  )}
                  {selectedTaskIds.size > 0 && selectedTaskIds.size < sortedTasks.length && (
                    <div className="w-1.5 h-0.5 bg-[#4573d2]" />
                  )}
                </div>
              </div>

              {/* Task Complete Checkbox Spacer */}
              <div className="w-[24px] shrink-0" />

              {/* Name Column */}
              <div className="flex-1 min-w-[200px] pr-4">Task Name</div>

              {/* Projects Column */}
              {columnVisibility.project && (
                <div className="w-[170px] hidden md:block px-2">Projects</div>
              )}

              {/* Due Date Column */}
              {columnVisibility.dueDate && (
                <div className="w-[130px] hidden sm:block px-2">Due Date</div>
              )}

              {/* Priority Column */}
              {columnVisibility.priority && (
                <div className="w-[110px] hidden md:block px-2">Priority</div>
              )}

              {/* Task Visibility Column */}
              {columnVisibility.visibility && (
                <div className="w-[130px] hidden lg:block px-2">Task visibility</div>
              )}

              {/* Actions Header Spacer */}
              <div className="w-[60px] flex items-center justify-center">
                <button
                  onClick={() => setIsOptionsMenuOpen((prev) => !prev)}
                  className="p-1 hover:text-white rounded hover:bg-[#28292c]"
                  title="Customize columns"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6d6c6e]" />
                </button>
              </div>
            </div>

            {/* Grouped Sections */}
            <div className="pb-24">
              {groupedData.map((group) => {
                const isCollapsed = collapsedSections[group.id];

                return (
                  <div key={group.id} className="border-b border-[#252628]">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-3 py-2 hover:bg-[#252628]/70 group text-[13px] font-bold text-white transition-colors cursor-pointer">
                      <div
                        onClick={() => toggleSection(group.id)}
                        className="flex items-center gap-2 flex-1"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        )}

                        {/* Inline rename or plain text */}
                        {editingSectionName === group.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={editSectionValue}
                            onChange={(e) => setEditSectionValue(e.target.value)}
                            onBlur={() => handleSaveRenameSection(group.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRenameSection(group.id);
                              if (e.key === 'Escape') setEditingSectionName(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1e1f21] border border-[#4573d2] rounded px-1.5 py-0.5 text-white text-[13px] outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{group.groupName}</span>
                            <span className="text-[11px] font-normal text-[#8a8886] bg-[#2a2b2d] px-1.5 py-0.2 rounded-full">
                              {group.tasks.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Section hover menu */}
                      <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity" data-dropdown>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInlineNewTaskSection(group.id);
                          }}
                          className="p-1 hover:bg-[#323336] rounded text-[#8a8886] hover:text-white mr-1"
                          title="Add task to section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSectionMenu((prev) => (prev === group.id ? null : group.id));
                          }}
                          className="p-1 hover:bg-[#323336] rounded text-[#8a8886] hover:text-white"
                          title="Section actions"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {/* Section Menu Popup */}
                        {openSectionMenu === group.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-30 text-[13px]"
                          >
                            <button
                              onClick={() => {
                                setInlineNewTaskSection(group.id);
                                setOpenSectionMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Add task</span>
                            </button>
                            <button
                              onClick={() => handleStartRenameSection(group.id)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Rename section</span>
                            </button>
                            {sections.length > 1 && (
                              <button
                                onClick={() => handleDeleteSection(group.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#ff6b72] hover:bg-[#2f3135] transition-colors border-t border-[#37383b] mt-1 pt-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#ff6b72]" />
                                <span>Delete section</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Tasks */}
                    {!isCollapsed && (
                      <div>
                        {group.tasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelect={() => handleToggleSelectTask(task.id)}
                            showProjectColumn={columnVisibility.project}
                            showDueDateColumn={columnVisibility.dueDate}
                            showPriorityColumn={columnVisibility.priority}
                            showVisibilityColumn={columnVisibility.visibility}
                            onMoveSection={(sec) => updateTask(task.id, { myTasksSection: sec })}
                          />
                        ))}

                        {/* Inline add task input or button */}
                        {inlineNewTaskSection === group.id ? (
                          <div className="flex items-center h-[38px] px-8 border-b border-[#2b2c2e] bg-[#252628]">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Write a task name..."
                              value={inlineTaskName}
                              onChange={(e) => setInlineTaskName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlineCreate(group.id);
                                if (e.key === 'Escape') setInlineNewTaskSection(null);
                              }}
                              className="w-full bg-transparent text-white text-[13px] outline-none"
                            />
                            <button
                              onClick={() => handleInlineCreate(group.id)}
                              className="text-[12px] bg-[#4573d2] text-white px-2.5 py-0.5 rounded font-medium ml-2"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setInlineNewTaskSection(null)}
                              className="text-[12px] text-[#8a8886] hover:text-white px-2 py-0.5 ml-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInlineNewTaskSection(group.id)}
                            className="flex items-center gap-2 h-[34px] px-10 text-[12px] text-[#8a8886] hover:text-white hover:bg-[#252628] w-full text-left transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#6d6c6e]" />
                            <span>Add task...</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add section button / input */}
              {groupMode === 'section' && (
                <div className="px-4 py-3">
                  {isAddingSection ? (
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type="text"
                        autoFocus
                        placeholder="New section name..."
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateSection();
                          if (e.key === 'Escape') setIsAddingSection(false);
                        }}
                        className="bg-[#252628] border border-[#4573d2] rounded px-3 py-1 text-white text-[13px] outline-none flex-1"
                      />
                      <button
                        onClick={handleCreateSection}
                        className="bg-[#4573d2] text-white text-[12px] px-3 py-1 rounded font-medium hover:bg-[#3562be]"
                      >
                        Add section
                      </button>
                      <button
                        onClick={() => setIsAddingSection(false)}
                        className="text-[#8a8886] hover:text-white text-[12px] px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSection(true)}
                      className="flex items-center gap-2 text-[13px] font-medium text-[#8a8886] hover:text-white transition-colors py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add section</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Board' && (
          <TaskBoard sections={sections} tasks={tasks} />
        )}

        {activeTab === 'Calendar' && <TaskCalendar tasks={tasks} />}

        {activeTab === 'Dashboard' && (
          <TaskDashboard tasks={tasks} projectName="My Tasks" />
        )}

        {activeTab === 'Files' && <FileManager />}
      </div>

      {/* Floating Multi-select Mass Actions Bar */}
      {selectedTaskIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl px-4 py-2 flex items-center gap-3 text-white text-[13px] animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="flex items-center gap-2 pr-3 border-r border-[#3b3d42]">
            <span className="w-5 h-5 rounded-full bg-[#4573d2] text-white text-[11px] font-bold flex items-center justify-center">
              {selectedTaskIds.size}
            </span>
            <span className="font-medium text-[#c5c3c0]">
              {selectedTaskIds.size === 1 ? 'task selected' : 'tasks selected'}
            </span>
          </div>

          {/* Mark Complete */}
          <button
            onClick={handleMassComplete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#4cd195] transition-colors"
            title="Mark complete"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[12px]">Complete</span>
          </button>

          {/* Mark Incomplete */}
          <button
            onClick={handleMassIncomplete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#bdbbb9] hover:text-white transition-colors"
            title="Mark incomplete"
          >
            <Clock className="w-4 h-4" />
            <span className="text-[12px]">Incomplete</span>
          </button>

          {/* Quick Due Date */}
          <div className="relative group/date">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#bdbbb9] hover:text-white transition-colors"
              title="Set due date"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[12px]">Due date</span>
            </button>
            <div className="hidden group-hover/date:block absolute bottom-full left-0 mb-1 w-36 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 text-[12px]">
              {['Today', 'Tomorrow', 'Next week'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleMassSetDueDate(preset)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2f3135] text-[#f5f4f3]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Move to Section */}
          <div className="relative group/sec">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#bdbbb9] hover:text-white transition-colors"
              title="Move to section"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-[12px]">Move to</span>
            </button>
            <div className="hidden group-hover/sec:block absolute bottom-full left-0 mb-1 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 text-[12px]">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleMassMoveSection(sec)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2f3135] text-[#f5f4f3] truncate"
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Delete tasks */}
          <button
            onClick={handleMassDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#47181c] text-[#ff6b72] transition-colors"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[12px]">Delete</span>
          </button>

          {/* Deselect All */}
          <button
            onClick={() => setSelectedTaskIds(new Set())}
            className="p-1.5 rounded-lg hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
