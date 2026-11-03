'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Check,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Diamond,
  UserCheck,
  Filter,
  ArrowUpDown,
  Layers,
  SlidersHorizontal,
  Search,
  X,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Zap,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  Info,
  Edit3,
  GripVertical,
  Clock,
  ThumbsUp,
  Type,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  User,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import AddTaskSplitButton from '@/components/tasks/AddTaskSplitButton';
import BoardOptionsDrawer from '@/components/tasks/BoardOptionsDrawer';
import FilterPopoverContent, { FilterRule, evaluateTaskFilters } from '@/components/tasks/FilterPopoverContent';

interface TaskBoardProps {
  sections: string[];
  tasks: Task[];
  projectId?: string;
}

export default function TaskBoard({ sections: initialSections, tasks, projectId }: TaskBoardProps) {
  const {
    openTaskDrawer,
    toggleTaskComplete,
    createTask,
    updateTask,
    reorderTasks,
    deleteTask,
  } = useApp();

  // Board sections
  const [boardSections, setBoardSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kizuna_board_sections');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialSections.length > 0
      ? initialSections
      : ['Recently assigned', 'Do today', 'Do next week', 'Do later'];
  });

  // Save board sections
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kizuna_board_sections', JSON.stringify(boardSections));
    }
  }, [boardSections]);

  // Section collapsing state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Hide empty columns toggle state
  const [hideAllEmptyColumns, setHideAllEmptyColumns] = useState(false);

  // Inline add task per column
  const [activeNewSection, setActiveNewSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  // Add new section state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Editing section name
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSectionValue, setEditingSectionValue] = useState('');

  // Section options menu & submenu state
  const [openSectionMenu, setOpenSectionMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'automation' | 'add_section' | 'expand_collapse' | null>(null);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const sectionMenuRef = useRef<HTMLDivElement>(null);

  // Toast message for automations and actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below');

  // ================= 1. FILTER STATE (Matching List & Calendar) =================
  const [filterMode, setFilterMode] = useState<
    'all' | 'incomplete' | 'completed' | 'due_this_week' | 'due_next_week'
  >('all');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const handleAddFilterRule = (field: FilterRule['field']) => {
    const newRule: FilterRule = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      field,
      operator: 'is',
      value: field === 'completion' ? 'incomplete' : field === 'task_type' ? 'task' : 'today',
    };
    setFilterRules((prev) => [...prev, newRule]);
  };

  const handleUpdateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    setFilterRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleRemoveFilterRule = (id: string) => {
    setFilterRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllFilters = () => {
    setFilterMode('all');
    setFilterRules([]);
  };

  // ================= 2. SORT STATE (Matching List & Calendar) =================
  const [sortField, setSortField] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);

  // ================= 3. GROUP STATE (Matching List & Calendar) =================
  const [groupField, setGroupField] = useState<string>('section');
  const [groupOrder, setGroupOrder] = useState<'Ascending' | 'Descending' | 'Custom order'>('Custom order');
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const [isGroupFieldPickerOpen, setIsGroupFieldPickerOpen] = useState(false);
  const [isGroupOrderPickerOpen, setIsGroupOrderPickerOpen] = useState(false);
  const [isGroupMoreMenuOpen, setIsGroupMoreMenuOpen] = useState(false);
  const [showEmptyGroups, setShowEmptyGroups] = useState(true);

  // ================= 4. OPTIONS DRAWER STATE =================
  const [isListOptionsDrawerOpen, setIsListOptionsDrawerOpen] = useState(false);
  const [boardVisibleFields, setBoardVisibleFields] = useState<Record<string, boolean>>({
    dueDate: true,
    project: true,
    collaborators: false,
    visibility: false,
    tags: false,
    taskType: true,
    createdBy: false,
    createdOn: false,
    lastModifiedOn: false,
    completedOn: false,
  });
  const [cardSize, setCardSize] = useState<'default' | 'compact'>('default');
  const [showCoverImages, setShowCoverImages] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);

  // ================= 5. SEARCH STATE =================
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close toolbar popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setIsFilterPopoverOpen(false);
        setIsSortPopoverOpen(false);
        setIsGroupPopoverOpen(false);
        setIsGroupFieldPickerOpen(false);
        setIsGroupOrderPickerOpen(false);
        setIsGroupMoreMenuOpen(false);
      }
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as Node)) {
        setOpenSectionMenu(null);
        setActiveSubmenu(null);
        setIsDeleteHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut: Tab + N to add section in Board view
  useEffect(() => {
    let tabPressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (tabPressed && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsAddingSection(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!evaluateTaskFilters(t, filterMode, filterRules)) return false;

      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesProject = (t.projectName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesProject) return false;
      }

      return true;
    });
  }, [tasks, filterMode, filterRules, searchKeyword]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortField === 'none') return list;

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'due_date' || sortField === 'start_date') {
        comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortField === 'alphabetical') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'project') {
        comparison = (a.projectName || '').localeCompare(b.projectName || '');
      } else if (sortField === 'created_by') {
        comparison = (a.assignee?.name || '').localeCompare(b.assignee?.name || '');
      } else if (sortField === 'created_on') {
        comparison = (a.createdAt || '').localeCompare(b.createdAt || '');
      } else if (sortField === 'priority') {
        const pWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        comparison = (pWeights[a.priority || ''] || 0) - (pWeights[b.priority || ''] || 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredTasks, sortField, sortDirection]);

  // Group columns data based on groupField
  const boardColumns = useMemo(() => {
    // 1. Group by project
    if (groupField === 'project') {
      const projectMap = new Map<string, Task[]>();
      sortedTasks.forEach((t) => {
        const pName = t.projectName || "Kevin's first project";
        if (!projectMap.has(pName)) projectMap.set(pName, []);
        projectMap.get(pName)!.push(t);
      });
      let groups = Array.from(projectMap.entries()).map(([pName, pTasks]) => ({
        columnTitle: pName,
        id: pName,
        tasks: pTasks,
      }));
      if (groupOrder === 'Descending') groups.reverse();
      return groups;
    }

    // 2. Group by date
    if (groupField === 'start_date' || groupField === 'due_date') {
      let groups = [
        { columnTitle: 'Before September 2026', id: 'before_sep', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('aug') || (t.dueDate || '').toLowerCase().includes('jul')) },
        { columnTitle: 'September 2026', id: 'sep_2026', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('sep')) },
        { columnTitle: 'October 2026', id: 'oct_2026', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('oct')) },
        { columnTitle: 'Last 30 days', id: 'last_30_days', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('last 30')) },
        { columnTitle: 'Last 7 days', id: 'last_7_days', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('last 7')) },
        { columnTitle: 'Yesterday', id: 'yesterday', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('yesterday') || (t.dueDate || '').toLowerCase().includes('nov 2')) },
        { columnTitle: 'Today', id: 'today', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('today') || (t.dueDate || '').toLowerCase().includes('nov 3')) },
        { columnTitle: 'Upcoming', id: 'upcoming', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('nov 4') || (t.dueDate || '').toLowerCase().includes('nov 5') || (t.dueDate || '').toLowerCase().includes('nov 10')) },
      ];
      if (!showEmptyGroups) {
        groups = groups.filter((g) => g.tasks.length > 0);
      }
      if (groupOrder === 'Descending') groups.reverse();
      return groups;
    }

    // 3. Group by none
    if (groupField === 'none') {
      return [{ columnTitle: 'All tasks', id: 'all', tasks: sortedTasks }];
    }

    // 4. Default: Group by Section
    return boardSections.map((sec) => {
      const secTasks = sortedTasks.filter((t) => {
        const assignedSec = t.myTasksSection || (boardSections.includes(t.section) ? t.section : boardSections[0]);
        return assignedSec === sec;
      });
      return {
        columnTitle: sec,
        id: sec,
        tasks: secTasks,
      };
    });
  }, [sortedTasks, groupField, groupOrder, showEmptyGroups, boardSections]);

  // Create task in specific section
  const handleCreateTask = (section: string, taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    if (!newTaskName.trim()) {
      setActiveNewSection(null);
      return;
    }

    createTask({
      name: newTaskName.trim(),
      section,
      myTasksSection: section,
      projectId: projectId || 'kevins-first-project',
      taskType,
      dueDate: 'Today',
    });

    setNewTaskName('');
    setActiveNewSection(null);
  };

  // Add section
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      setIsAddingSection(false);
      return;
    }
    const title = newSectionTitle.trim();
    if (!boardSections.includes(title)) {
      setBoardSections((prev) => [...prev, title]);
    }
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  // Add section to left or right of a specific index
  const handleAddSectionAt = (targetIdx: number) => {
    let baseName = 'New section';
    let counter = 1;
    let candidate = baseName;
    while (boardSections.includes(candidate)) {
      counter++;
      candidate = `${baseName} ${counter}`;
    }

    const next = [...boardSections];
    next.splice(targetIdx, 0, candidate);
    setBoardSections(next);
    setOpenSectionMenu(null);
    setActiveSubmenu(null);
    setIsDeleteHovered(false);

    setEditingSection(candidate);
    setEditingSectionValue(candidate);
  };

  // Rename section
  const handleSaveRenameSection = (oldName: string) => {
    const trimmed = editingSectionValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingSection(null);
      return;
    }
    setBoardSections((prev) => prev.map((s) => (s === oldName ? trimmed : s)));
    tasks.forEach((t) => {
      if (t.section === oldName || t.myTasksSection === oldName) {
        updateTask(t.id, { section: trimmed, myTasksSection: trimmed });
      }
    });
    setEditingSection(null);
  };

  // Delete section
  const handleDeleteSection = (sectionName: string) => {
    if (sectionName === 'Recently assigned') return;
    if (boardSections.length <= 1) return;

    tasks.forEach((t) => {
      if (t.section === sectionName || t.myTasksSection === sectionName) {
        updateTask(t.id, { section: 'Recently assigned', myTasksSection: 'Recently assigned' });
      }
    });

    setBoardSections((prev) => prev.filter((s) => s !== sectionName));
    setOpenSectionMenu(null);
    setActiveSubmenu(null);
    setIsDeleteHovered(false);
    showToast(`Section "${sectionName}" deleted`);
  };

  // Expand all columns
  const handleExpandAll = () => {
    setCollapsedSections({});
    setOpenSectionMenu(null);
    setActiveSubmenu(null);
    setIsDeleteHovered(false);
    showToast('All columns expanded');
  };

  // Collapse all columns
  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    boardSections.forEach((s) => {
      allCollapsed[s] = true;
    });
    setCollapsedSections(allCollapsed);
    setOpenSectionMenu(null);
    setActiveSubmenu(null);
    setIsDeleteHovered(false);
    showToast('All columns collapsed');
  };

  // Toggle collapse for single section
  const toggleCollapse = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper for due date styling matching Asana
  const getDueDateStyle = (dueDate?: string) => {
    if (!dueDate) return 'text-[#8a8886]';
    const lower = dueDate.toLowerCase();
    if (lower.includes('yesterday') || lower.includes('overdue')) {
      return 'text-[#ff6b72]'; // Red for overdue
    }
    if (
      lower.includes('today') ||
      lower.includes('nov 2') ||
      lower.includes('nov 3') ||
      lower.includes('nov 4') ||
      lower.includes('nov 5')
    ) {
      return 'text-[#4cd195]'; // Green for upcoming/today
    }
    return 'text-[#8a8886]';
  };

  // ================= DRAG AND DROP HANDLERS =================
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOverColumn = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSection !== section) {
      setDragOverSection(section);
    }
  };

  const handleDragOverCard = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const midY = cardRect.top + cardRect.height / 2;

    setDragOverCardId(cardId);
    setDropPosition(mouseY < midY ? 'above' : 'below');
  };

  const handleDropOnColumn = (e: React.DragEvent, targetSection: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const draggedTask = tasks[taskIndex];
    const newTasks = [...tasks];
    newTasks.splice(taskIndex, 1);

    const updatedTask = {
      ...draggedTask,
      section: targetSection,
      myTasksSection: targetSection,
    };

    const lastColIndex = newTasks.reduce((acc, t, idx) => {
      const tSec = t.myTasksSection || t.section || boardSections[0];
      return tSec === targetSection ? idx : acc;
    }, -1);

    if (lastColIndex === -1) {
      newTasks.push(updatedTask);
    } else {
      newTasks.splice(lastColIndex + 1, 0, updatedTask);
    }

    reorderTasks(newTasks);
    updateTask(taskId, { section: targetSection, myTasksSection: targetSection });

    setDraggedTaskId(null);
    setDragOverSection(null);
    setDragOverCardId(null);
  };

  const handleDropOnCard = (e: React.DragEvent, targetCardId: string, targetSection: string) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId || taskId === targetCardId) {
      setDraggedTaskId(null);
      setDragOverSection(null);
      setDragOverCardId(null);
      return;
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const draggedTask = tasks[taskIndex];
    const newTasks = [...tasks];
    newTasks.splice(taskIndex, 1);

    const updatedTask = {
      ...draggedTask,
      section: targetSection,
      myTasksSection: targetSection,
    };

    const targetIndex = newTasks.findIndex((t) => t.id === targetCardId);
    const insertIndex = dropPosition === 'above' ? targetIndex : targetIndex + 1;

    newTasks.splice(insertIndex, 0, updatedTask);

    reorderTasks(newTasks);
    updateTask(taskId, { section: targetSection, myTasksSection: targetSection });

    setDraggedTaskId(null);
    setDragOverSection(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverSection(null);
    setDragOverCardId(null);
  };

  // Active state booleans for Filter, Sort, Group (Matching Asana Screenshot)
  const activeFilterCount = (filterMode !== 'all' ? 1 : 0) + filterRules.length;
  const isFilterActive = activeFilterCount > 0;
  const isSortActive = sortField !== 'none';
  const isGroupActive = groupField !== 'section' || groupOrder !== 'Custom order';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#1e1f21] border border-[#383a3d] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2">
          <Zap className="w-4 h-4 text-[#f05542] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#8a8886] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Asana Secondary Control Toolbar for Board (Matching List and Calendar Exactly) */}
      <div
        ref={toolbarRef}
        className="h-[46px] min-h-[46px] px-6 border-b border-[#262729] flex items-center justify-between text-[13px] bg-[#1e1f21] shrink-0 relative z-50"
      >
        {/* Left Side: + Add task split button */}
        <div className="flex items-center gap-3">
          <AddTaskSplitButton
            canAddSection={true}
            onAddTask={(type) => {
              const defaultName =
                type === 'milestone'
                  ? 'New milestone'
                  : type === 'approval'
                  ? 'New approval'
                  : 'New task';
              const targetSection = boardSections[0] || 'Recently assigned';
              const created = createTask({
                name: defaultName,
                section: targetSection,
                myTasksSection: targetSection,
                projectId: projectId || 'kevins-first-project',
                taskType: type,
                dueDate: 'Today',
              });
              if (created?.id) {
                openTaskDrawer(created.id);
              }
            }}
            onAddSection={() => {
              setIsAddingSection(true);
            }}
          />
        </div>

        {/* Right Side Controls: Filter, Sort, Group, Options, Search (Matching Asana UI 1:1) */}
        <div className="flex items-center gap-2 text-[#bdbbb9] text-[12px]">
          {/* ================= 1. FILTER BUTTON ================= */}
          <div className="relative">
            {isFilterActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterPopoverOpen((prev) => !prev);
                    setIsSortPopoverOpen(false);
                    setIsGroupPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#1147a3] transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters: {activeFilterCount}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAllFilters();
                  }}
                  className="px-1.5 py-1 hover:bg-[#1147a3] border-l border-[#1d4ea8] text-[#a5c2f7] hover:text-white transition-colors cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsFilterPopoverOpen((prev) => !prev);
                  setIsSortPopoverOpen(false);
                  setIsGroupPopoverOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  isFilterPopoverOpen
                    ? 'bg-[#2b2c2e] text-white border border-[#37383b]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            )}

            {/* Filter Popover */}
            {isFilterPopoverOpen && (
              <div className="absolute right-0 top-8.5 z-50">
                <FilterPopoverContent
                  quickFilter={filterMode}
                  onQuickFilterChange={(mode) => setFilterMode(mode)}
                  rules={filterRules}
                  onAddRule={handleAddFilterRule}
                  onUpdateRule={handleUpdateFilterRule}
                  onRemoveRule={handleRemoveFilterRule}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}
          </div>

          {/* ================= 2. SORT BUTTON (Matching User Screenshot Exactly) ================= */}
          <div className="relative">
            {isSortActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortPopoverOpen((prev) => !prev);
                    setIsFilterPopoverOpen(false);
                    setIsGroupPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#1147a3] transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sorts: 1</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortField('none');
                  }}
                  className="px-1.5 py-1 hover:bg-[#1147a3] border-l border-[#1d4ea8] text-[#a5c2f7] hover:text-white transition-colors cursor-pointer"
                  title="Clear sort"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSortPopoverOpen((prev) => !prev);
                  setIsFilterPopoverOpen(false);
                  setIsGroupPopoverOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  isSortPopoverOpen
                    ? 'bg-[#2b2c2e] text-white border border-[#37383b]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort</span>
              </button>
            )}

            {/* Sort Popover */}
            {isSortPopoverOpen && (
              <div className="absolute right-0 top-8.5 w-56 bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] animate-in fade-in duration-150">
                {[
                  { id: 'start_date', label: 'Start date', icon: CalendarIcon },
                  { id: 'due_date', label: 'Due date', icon: CalendarIcon },
                  { id: 'created_by', label: 'Created by', icon: User },
                  { id: 'created_on', label: 'Created on', icon: Clock },
                  { id: 'last_modified', label: 'Last modified on', icon: Clock },
                  { id: 'completed_on', label: 'Completed on', icon: Clock },
                  { id: 'likes', label: 'Likes', icon: ThumbsUp },
                  { id: 'alphabetical', label: 'Alphabetical', icon: Type },
                  { id: 'project', label: 'Project', icon: ClipboardList },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = sortField === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortField(item.id);
                          setSortDirection('asc');
                        }
                        setIsSortPopoverOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className="w-4 h-4 text-[#8a8886]" />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[11px] text-[#4573d2] font-semibold">
                          {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </span>
                      )}
                    </button>
                  );
                })}

                {sortField !== 'none' && (
                  <div className="pt-1 mt-1 border-t border-[#37383b]">
                    <button
                      type="button"
                      onClick={() => {
                        setSortField('none');
                        setIsSortPopoverOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-[12px] text-[#ff6b72] hover:bg-[#2f3135] transition-colors cursor-pointer"
                    >
                      Clear sort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= 3. GROUP BUTTON ================= */}
          <div className="relative">
            {isGroupActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupPopoverOpen((prev) => !prev);
                    setIsFilterPopoverOpen(false);
                    setIsSortPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#1147a3] transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Groups: 1</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupField('section');
                    setGroupOrder('Custom order');
                  }}
                  className="px-1.5 py-1 hover:bg-[#1147a3] border-l border-[#1d4ea8] text-[#a5c2f7] hover:text-white transition-colors cursor-pointer"
                  title="Clear group"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsGroupPopoverOpen((prev) => !prev);
                  setIsFilterPopoverOpen(false);
                  setIsSortPopoverOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  isGroupPopoverOpen
                    ? 'bg-[#2b2c2e] text-white border border-[#37383b]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Group</span>
              </button>
            )}

            {/* Group Popover */}
            {isGroupPopoverOpen && (
              <div className="absolute right-0 top-8.5 w-[420px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl p-4 z-50 text-[13px] animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[14px]">Groups</span>
                    <button
                      type="button"
                      onClick={() => showToast('Feedback submitted! Thank you.')}
                      className="text-[12px] text-[#8b5cf6] hover:underline cursor-pointer"
                    >
                      Send feedback
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupField('none');
                      setGroupOrder('Custom order');
                    }}
                    className="text-[12px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center gap-2 py-1 relative">
                  <GripVertical className="w-4 h-4 text-[#6d6c6e] cursor-grab shrink-0" />

                  {/* Group Field Selector */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGroupFieldPickerOpen((prev) => !prev);
                        setIsGroupOrderPickerOpen(false);
                        setIsGroupMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between bg-[#252628] border border-[#37383b] hover:border-[#525357] rounded-lg px-3 py-1.5 text-[13px] text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="w-3.5 h-3.5 text-[#8a8886]" />
                        <span>
                          {groupField === 'section' && 'Sections'}
                          {groupField === 'start_date' && 'Start date'}
                          {groupField === 'due_date' && 'Due date'}
                          {groupField === 'created_by' && 'Created by'}
                          {groupField === 'created_on' && 'Created on'}
                          {groupField === 'last_modified' && 'Last modified on'}
                          {groupField === 'completed_on' && 'Completed on'}
                          {groupField === 'project' && 'Project'}
                          {groupField === 'none' && 'None'}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                    </button>

                    {isGroupFieldPickerOpen && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl py-1 z-50 text-[13px]">
                        {[
                          { id: 'none', label: 'None', icon: SlidersHorizontal },
                          { id: 'section', label: 'Sections', icon: Layers },
                          { id: 'start_date', label: 'Start date', icon: CalendarIcon },
                          { id: 'due_date', label: 'Due date', icon: CalendarIcon },
                          { id: 'created_by', label: 'Created by', icon: User },
                          { id: 'created_on', label: 'Created on', icon: Clock },
                          { id: 'last_modified', label: 'Last modified on', icon: Clock },
                          { id: 'completed_on', label: 'Completed on', icon: Clock },
                          { id: 'project', label: 'Project', icon: ClipboardList },
                        ].map((gf) => {
                          const GIcon = gf.icon;
                          const isCur = groupField === gf.id;

                          return (
                            <button
                              key={gf.id}
                              type="button"
                              onClick={() => {
                                setGroupField(gf.id);
                                if (gf.id === 'section') {
                                  setGroupOrder('Custom order');
                                } else {
                                  setGroupOrder('Ascending');
                                }
                                setIsGroupFieldPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#2f3135] transition-colors cursor-pointer"
                            >
                              <GIcon className="w-4 h-4 text-[#8a8886]" />
                              <span>{gf.label}</span>
                              {isCur && <Check className="w-3.5 h-3.5 text-[#4573d2] ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Selector */}
                  <div className="relative w-36">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGroupOrderPickerOpen((prev) => !prev);
                        setIsGroupFieldPickerOpen(false);
                        setIsGroupMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between bg-[#252628] border border-[#37383b] hover:border-[#525357] rounded-lg px-2.5 py-1.5 text-[13px] text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {groupOrder === 'Ascending' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                        ) : groupOrder === 'Descending' ? (
                          <ArrowDown className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                        ) : null}
                        <span className="truncate">{groupOrder}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                    </button>

                    {isGroupOrderPickerOpen && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-50 text-[12.5px]">
                        {groupField === 'section' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setGroupOrder('Custom order');
                              setIsGroupOrderPickerOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#2f3135] text-white cursor-pointer"
                          >
                            Custom order
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setGroupOrder('Ascending');
                                setIsGroupOrderPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-white cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Ascending</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGroupOrder('Descending');
                                setIsGroupOrderPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-white cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Descending</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* More options button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGroupMoreMenuOpen((prev) => !prev);
                        setIsGroupOrderPickerOpen(false);
                        setIsGroupFieldPickerOpen(false);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isGroupMoreMenuOpen
                          ? 'bg-[#323336] text-white'
                          : 'text-[#8a8886] hover:text-white hover:bg-[#28292c]'
                      }`}
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isGroupMoreMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl py-1.5 z-50 text-[12.5px]">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEmptyGroups(false);
                            setIsGroupMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left text-white transition-colors cursor-pointer"
                        >
                          <span>Hide empty groups</span>
                          {!showEmptyGroups && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEmptyGroups(true);
                            setIsGroupMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left text-white transition-colors cursor-pointer"
                        >
                          <span>Show empty groups</span>
                          {showEmptyGroups && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={() => {
                      setGroupField('section');
                      setGroupOrder('Custom order');
                    }}
                    className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] cursor-pointer"
                    title="Remove grouping"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('Subgroup feature opened')}
                    className="flex items-center gap-1.5 text-[12.5px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add subgroup</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= 4. OPTIONS BUTTON ================= */}
          <button
            type="button"
            onClick={() => setIsListOptionsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>

          {/* ================= 5. SEARCH INPUT ================= */}
          <div className="relative flex items-center">
            {isSearchExpanded ? (
              <div className="flex items-center bg-[#252628] border border-[#383a3d] rounded-lg px-2 py-0.5 text-[12px]">
                <Search className="w-3.5 h-3.5 text-[#8a8886] mr-1.5 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search in board..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="bg-transparent text-white outline-none w-32 md:w-44 text-[12px] placeholder-[#8a8886]"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSearchKeyword('')}
                    className="text-[#8a8886] hover:text-white ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchKeyword('');
                  }}
                  className="text-[#8a8886] hover:text-white ml-1.5 text-[11px] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchExpanded(true)}
                className="p-1.5 rounded-lg hover:bg-[#28292c] text-[#bdbbb9] hover:text-white transition-colors cursor-pointer"
                title="Search tasks"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Board Columns Area with Horizontal Scroll */}
      <div className="flex-1 flex gap-4 px-6 py-4 overflow-x-auto h-full items-start">
        {boardColumns.map((colGroup, colIdx) => {
          const section = colGroup.columnTitle;
          const isCollapsed = !!collapsedSections[section];
          const columnTasks = colGroup.tasks;
          const isDragOverThisCol = dragOverSection === section && dragOverCardId === null;

          // If hideAllEmptyColumns is active and column is empty, hide it
          if (hideAllEmptyColumns && columnTasks.length === 0) {
            return null;
          }

          // ================= COLLAPSED COLUMN =================
          if (isCollapsed) {
            return (
              <div
                key={colGroup.id}
                onClick={() => toggleCollapse(section)}
                className="w-[42px] min-w-[42px] bg-[#252628] hover:bg-[#2a2b2e] border border-[#323438] hover:border-[#45474c] rounded-xl py-3 flex flex-col items-center justify-between cursor-pointer transition-all h-[calc(100vh-180px)] select-none shadow-sm"
                title={`Expand ${section}`}
              >
                <button
                  type="button"
                  className="p-1 rounded text-[#8a8886] hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <div
                  className="text-[13px] font-semibold text-white tracking-wide whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {section}
                </div>

                <span className="text-[11px] font-semibold text-[#8a8886] bg-[#1e1f21] px-1.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            );
          }

          // ================= EXPANDED COLUMN =================
          const isRecentlyAssigned = section === 'Recently assigned';
          const isNearRightEdge = colIdx >= boardColumns.length - 2;

          return (
            <div
              key={colGroup.id}
              onDragOver={(e) => handleDragOverColumn(e, section)}
              onDrop={(e) => handleDropOnColumn(e, section)}
              className={`w-[290px] min-w-[290px] max-w-[290px] flex flex-col max-h-full transition-all duration-150 ${
                isDragOverThisCol ? 'ring-2 ring-[#4573d2]/60 rounded-xl' : ''
              }`}
            >
              {/* Asana Column Header */}
              <div className="bg-[#252628] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-white font-medium text-[13.5px] border border-transparent hover:border-[#383a3e] group/col-header transition-all relative mb-3 shadow-xs">
                {/* Title & Count */}
                {editingSection === section ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingSectionValue}
                    onChange={(e) => setEditingSectionValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRenameSection(section);
                      if (e.key === 'Escape') setEditingSection(null);
                    }}
                    onBlur={() => handleSaveRenameSection(section)}
                    className="bg-[#1e1f21] border border-[#4573d2] rounded px-2 py-0.5 text-[13px] text-white outline-none w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-[13.5px] text-[#f5f4f3] truncate">
                      {section}
                    </span>
                    <span className="text-[13px] text-[#8a8886] font-normal shrink-0">
                      {columnTasks.length}
                    </span>
                  </div>
                )}

                {/* Action Icons on Right: Collapse, +, More */}
                {editingSection !== section && (
                  <div className="flex items-center gap-0.5 text-[#8a8886] ml-2 shrink-0">
                    {/* 1. Collapse column button (|<-) */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(section)}
                      className="p-1 rounded hover:bg-[#343538] hover:text-white transition-colors cursor-pointer"
                      title="Collapse section"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="3" y1="3" x2="3" y2="13" />
                        <polyline points="13 4 8 8 13 12" />
                        <line x1="8" y1="8" x2="13" y2="8" />
                      </svg>
                    </button>

                    {/* 2. Add task button (+) */}
                    <button
                      type="button"
                      onClick={() => setActiveNewSection(section)}
                      className="p-1 rounded hover:bg-[#343538] hover:text-white transition-colors cursor-pointer"
                      title="Add task to this section"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* 3. More options (...) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextOpen = openSectionMenu === section ? null : section;
                          setOpenSectionMenu(nextOpen);
                          setActiveSubmenu(null);
                          setIsDeleteHovered(false);
                        }}
                        className={`p-1 rounded hover:bg-[#343538] hover:text-white transition-colors cursor-pointer ${
                          openSectionMenu === section ? 'bg-[#343538] text-white' : ''
                        }`}
                        title="Section actions"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu for Section Matching Asana */}
                      {openSectionMenu === section && (
                        <div
                          ref={sectionMenuRef}
                          className="absolute right-0 top-8.5 w-[240px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] text-[#f5f4f3] animate-in fade-in duration-100"
                        >
                          {/* 1. Add automation to section > */}
                          <div
                            className="relative"
                            onMouseEnter={() => {
                              setActiveSubmenu('automation');
                              setIsDeleteHovered(false);
                            }}
                          >
                            <button
                              type="button"
                              className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#252628] text-left transition-colors cursor-pointer group ${
                                activeSubmenu === 'automation' ? 'bg-[#252628]' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Zap className="w-4 h-4 text-[#f05542] shrink-0" />
                                <span className="text-[13px] text-white">Add automation to section</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886] group-hover:text-white" />
                            </button>

                            {/* Automation Submenu */}
                            {activeSubmenu === 'automation' && (
                              <div
                                className={`absolute top-0 w-[280px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-2 z-50 text-[13px] text-[#f5f4f3] animate-in fade-in duration-100 ${
                                  isNearRightEdge
                                    ? 'right-[calc(100%+6px)]'
                                    : 'left-[calc(100%+6px)]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Custom automation builder opened for "${section}"`);
                                    setOpenSectionMenu(null);
                                    setActiveSubmenu(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-[#8a8886]" />
                                  <span className="font-medium text-[13px]">New automation</span>
                                </button>

                                <div className="border-t border-[#313235] my-1.5" />

                                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886]">
                                  Suggested AI Studio automations
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Smart section sorting automation enabled for "${section}"`);
                                    setOpenSectionMenu(null);
                                    setActiveSubmenu(null);
                                  }}
                                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-[#252628] text-left cursor-pointer group"
                                >
                                  <Sparkles className="w-4 h-4 text-[#8a8886] group-hover:text-white mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-[13px] text-white">Smart section sorting</div>
                                    <div className="text-[11.5px] text-[#8a8886] leading-snug mt-0.5">
                                      Automatically sort relevant tasks into this section
                                    </div>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Automatic task naming automation enabled for "${section}"`);
                                    setOpenSectionMenu(null);
                                    setActiveSubmenu(null);
                                  }}
                                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-[#252628] text-left cursor-pointer group"
                                >
                                  <Edit3 className="w-4 h-4 text-[#8a8886] group-hover:text-white mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-[13px] text-white">Automatically name tasks</div>
                                    <div className="text-[11.5px] text-[#8a8886] leading-snug mt-0.5">
                                      Ensures consistent naming for tasks in this section
                                    </div>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Summary automation enabled for "${section}"`);
                                    setOpenSectionMenu(null);
                                    setActiveSubmenu(null);
                                  }}
                                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-[#252628] text-left cursor-pointer group"
                                >
                                  <MessageSquare className="w-4 h-4 text-[#8a8886] group-hover:text-white mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-[13px] text-white">Summarize work that&apos;s been done</div>
                                    <div className="text-[11.5px] text-[#8a8886] leading-snug mt-0.5">
                                      Writes a summary of work done so far as a comment when the task moves to this section
                                    </div>
                                  </div>
                                </button>

                                <div className="border-t border-[#313235] my-1.5" />

                                <div className="px-3 py-1 flex items-start gap-2 text-[11px] text-[#8a8886]">
                                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8a8886]" />
                                  <span className="leading-snug">
                                    New automations will only run for new tasks added to this project
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Rename section */}
                          <button
                            type="button"
                            onMouseEnter={() => {
                              setActiveSubmenu(null);
                              setIsDeleteHovered(false);
                            }}
                            onClick={() => {
                              setEditingSection(section);
                              setEditingSectionValue(section);
                              setOpenSectionMenu(null);
                              setActiveSubmenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-[#8a8886]" />
                            <span className="text-[13px]">Rename section</span>
                          </button>

                          {/* 3. Add section > */}
                          <div
                            className="relative"
                            onMouseEnter={() => {
                              setActiveSubmenu('add_section');
                              setIsDeleteHovered(false);
                            }}
                          >
                            <button
                              type="button"
                              className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#252628] text-left transition-colors cursor-pointer group ${
                                activeSubmenu === 'add_section' ? 'bg-[#252628]' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <svg
                                  className="w-4 h-4 text-[#8a8886] group-hover:text-white shrink-0"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                >
                                  <rect x="2" y="3.5" width="12" height="1.5" rx="0.75" />
                                  <rect x="2" y="7.25" width="8" height="1.5" rx="0.75" />
                                  <rect x="2" y="11" width="12" height="1.5" rx="0.75" />
                                </svg>
                                <span className="text-[13px] text-white">Add section</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886] group-hover:text-white" />
                            </button>

                            {activeSubmenu === 'add_section' && (
                              <div
                                className={`absolute top-0 w-[200px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] text-[#f5f4f3] animate-in fade-in duration-100 ${
                                  isNearRightEdge
                                    ? 'right-[calc(100%+6px)]'
                                    : 'left-[calc(100%+6px)]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleAddSectionAt(colIdx)}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                                >
                                  <ArrowLeft className="w-4 h-4 text-[#8a8886]" />
                                  <span>Add section to left</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddSectionAt(colIdx + 1)}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                                >
                                  <ArrowRight className="w-4 h-4 text-[#8a8886]" />
                                  <span>Add section to right</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-[#313235] my-1" />

                          {/* 4. Expand or collapse columns > */}
                          <div
                            className="relative"
                            onMouseEnter={() => {
                              setActiveSubmenu('expand_collapse');
                              setIsDeleteHovered(false);
                            }}
                          >
                            <button
                              type="button"
                              className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#252628] text-left transition-colors cursor-pointer group ${
                                activeSubmenu === 'expand_collapse' ? 'bg-[#252628]' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <svg
                                  className="w-4 h-4 text-[#8a8886] group-hover:text-white shrink-0"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect x="2" y="2.5" width="12" height="11" rx="2" />
                                  <line x1="6.5" y1="2.5" x2="6.5" y2="13.5" />
                                  <line x1="10" y1="2.5" x2="10" y2="13.5" />
                                </svg>
                                <span className="text-[13px] text-white">Expand or collapse columns</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886] group-hover:text-white" />
                            </button>

                            {activeSubmenu === 'expand_collapse' && (
                              <div
                                className={`absolute top-0 w-[160px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] text-[#f5f4f3] animate-in fade-in duration-100 ${
                                  isNearRightEdge
                                    ? 'right-[calc(100%+6px)]'
                                    : 'left-[calc(100%+6px)]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={handleExpandAll}
                                  className="w-full px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                                >
                                  Expand all
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCollapseAll}
                                  className="w-full px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                                >
                                  Collapse all
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 5. Hide all empty columns */}
                          <button
                            type="button"
                            onMouseEnter={() => {
                              setActiveSubmenu(null);
                              setIsDeleteHovered(false);
                            }}
                            onClick={() => {
                              setHideAllEmptyColumns((prev) => !prev);
                              setOpenSectionMenu(null);
                              setActiveSubmenu(null);
                              showToast(
                                !hideAllEmptyColumns
                                  ? 'Empty columns hidden'
                                  : 'Showing all columns'
                              );
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                          >
                            {hideAllEmptyColumns ? (
                              <>
                                <Eye className="w-4 h-4 text-[#8a8886]" />
                                <span>Show all empty columns</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 text-[#8a8886]" />
                                <span>Hide all empty columns</span>
                              </>
                            )}
                          </button>

                          {/* Divider */}
                          <div className="border-t border-[#313235] my-1" />

                          {/* 6. Delete section */}
                          <div
                            className="relative"
                            onMouseEnter={() => {
                              setActiveSubmenu(null);
                              if (isRecentlyAssigned) setIsDeleteHovered(true);
                            }}
                            onMouseLeave={() => setIsDeleteHovered(false)}
                          >
                            {isRecentlyAssigned ? (
                              <div className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[#555659] cursor-not-allowed select-none">
                                <Trash2 className="w-4 h-4 text-[#555659]" />
                                <span>Delete section</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section)}
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#3d1a1f] text-left text-[#ff6b72] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-[#ff6b72]" />
                                <span>Delete section</span>
                              </button>
                            )}

                            {isRecentlyAssigned && isDeleteHovered && (
                              <div className="absolute top-[calc(100%+6px)] right-0 w-[230px] bg-[#2a2b2e] border border-[#3e4044] text-[#cfcecd] text-[12px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none z-[100] animate-in fade-in duration-100">
                                <div className="absolute -top-[6px] right-6 w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-[#2a2b2e]" />
                                <span className="leading-snug block">
                                  This section can&apos;t be deleted because new tasks assigned to you appear here
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cards Container with Drag and Drop */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2 min-h-[50px]">
                {columnTasks.map((task) => {
                  const isDragging = draggedTaskId === task.id;
                  const isCardOver = dragOverCardId === task.id;
                  const isMilestone =
                    (task as any).taskType === 'milestone' ||
                    task.name.toLowerCase().includes('milestone');
                  const isApproval =
                    (task as any).taskType === 'approval' ||
                    task.name.toLowerCase().includes('approval');

                  return (
                    <div key={task.id} className="relative">
                      {/* Insertion indicator above */}
                      {isCardOver && dropPosition === 'above' && (
                        <div className="h-0.5 bg-[#4573d2] rounded-full mx-1 my-1 shadow-sm transition-all" />
                      )}

                      {/* Asana Task Card */}
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleDragOverCard(e, task.id)}
                        onDrop={(e) => handleDropOnCard(e, task.id, section)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openTaskDrawer(task.id)}
                        className={`bg-[#252628] hover:bg-[#2b2c2f] border border-[#323438] hover:border-[#45474c] rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm select-none relative group ${
                          cardSize === 'compact' ? 'p-2.5' : 'p-3.5'
                        } ${
                          isDragging ? 'opacity-30 scale-[0.98]' : 'opacity-100'
                        } ${task.completed ? 'opacity-60' : ''}`}
                      >
                        {/* 1. First Row: Checkbox circle + Task Name */}
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-[#38b273] border-[#38b273] text-white'
                                : isMilestone
                                ? 'border-[#f8be4e] text-[#f8be4e] rotate-45 rounded-xs'
                                : 'border-[#555659] hover:border-white'
                            }`}
                          >
                            {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </button>

                          <div className="flex-1 flex flex-col gap-1">
                            <span
                              className={`text-[13px] font-medium leading-snug ${
                                task.completed
                                  ? 'line-through text-[#8a8886]'
                                  : 'text-[#f5f4f3] group-hover:text-white'
                              }`}
                            >
                              {task.name}
                            </span>

                            {/* Milestone / Approval badge */}
                            {boardVisibleFields.taskType !== false && (
                              <>
                                {isMilestone && (
                                  <span className="self-start text-[10px] bg-[#3e2c1c] text-[#f8be4e] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span>◆</span>
                                    <span>Milestone</span>
                                  </span>
                                )}
                                {isApproval && (
                                  <span className="self-start text-[10px] bg-[#1e2f47] text-[#85c5f8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Approval
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* 2. Second Row: Project Badge [■] Kevin's first project */}
                        {boardVisibleFields.project && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2a2b2e] text-[#cfcecd] text-[11px] font-normal hover:bg-[#343539] transition-colors">
                              <span className="w-2.5 h-2.5 rounded-xs bg-white/70" />
                              <span>{task.projectName || "Kevin's first project"}</span>
                            </span>
                          </div>
                        )}

                        {/* 3. Third Row: Due date */}
                        {boardVisibleFields.dueDate && task.dueDate && (
                          <div className="mt-2">
                            <span
                              className={`text-[11px] font-medium ${getDueDateStyle(
                                task.dueDate
                              )}`}
                            >
                              {task.dueDate}
                            </span>
                          </div>
                        )}

                        {/* 4. Collaborators */}
                        {boardVisibleFields.collaborators && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#4573d2] text-white flex items-center justify-center text-[10px] font-semibold">
                              KS
                            </div>
                            <span className="text-[11px] text-[#8a8886]">Kevin S</span>
                          </div>
                        )}

                        {/* 5. Task visibility */}
                        {boardVisibleFields.visibility && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8a8886]">
                            <Eye className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>My workspace</span>
                          </div>
                        )}

                        {/* 6. Tags */}
                        {boardVisibleFields.tags && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-[#2a2b2e] text-[10px] text-[#cfcecd] font-medium flex items-center gap-1">
                              <Tag className="w-3 h-3 text-[#8a8886]" />
                              <span>Task</span>
                            </span>
                          </div>
                        )}

                        {/* 7. Created by */}
                        {boardVisibleFields.createdBy && (
                          <div className="mt-1.5 text-[10px] text-[#8a8886] flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Created by Kevin S</span>
                          </div>
                        )}

                        {/* 8. Created on */}
                        {boardVisibleFields.createdOn && (
                          <div className="mt-1.5 text-[10px] text-[#8a8886] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Created Nov 3</span>
                          </div>
                        )}

                        {/* 9. Completed on */}
                        {boardVisibleFields.completedOn && task.completed && (
                          <div className="mt-1.5 text-[10px] text-[#38b273] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed Nov 3</span>
                          </div>
                        )}
                      </div>

                      {/* Insertion indicator below */}
                      {isCardOver && dropPosition === 'below' && (
                        <div className="h-0.5 bg-[#4573d2] rounded-full mx-1 my-1 shadow-sm transition-all" />
                      )}
                    </div>
                  );
                })}

                {/* Inline Add Task Form */}
                {activeNewSection === section ? (
                  <div className="bg-[#252628] border border-[#4573d2] rounded-xl p-3 shadow-lg animate-in fade-in duration-100">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Write a task name..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTask(section);
                        if (e.key === 'Escape') setActiveNewSection(null);
                      }}
                      className="w-full bg-transparent text-white text-[13px] outline-none placeholder-[#6b6967] mb-2"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#343639]">
                      <button
                        type="button"
                        onClick={() => setActiveNewSection(null)}
                        className="text-[12px] text-[#8a8886] hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateTask(section)}
                        className="text-[12px] bg-[#4573d2] hover:bg-[#3562be] text-white px-3 py-1 rounded font-medium transition-colors cursor-pointer"
                      >
                        Add task
                      </button>
                    </div>
                  </div>
                ) : (
                  /* + Add task button at bottom of column */
                  <button
                    type="button"
                    onClick={() => setActiveNewSection(section)}
                    className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Section Column Button / Form */}
        <div className="w-[290px] min-w-[290px] shrink-0">
          {isAddingSection ? (
            <div className="p-3 bg-[#252628] rounded-xl border border-[#4573d2] shadow-lg animate-in fade-in duration-100">
              <input
                type="text"
                autoFocus
                placeholder="New section name..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection();
                  if (e.key === 'Escape') setIsAddingSection(false);
                }}
                className="w-full bg-[#1e1f21] border border-[#383a3d] rounded-lg px-2.5 py-1.5 text-white text-[13px] outline-none mb-2.5 placeholder-[#6b6967]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="text-[#8a8886] hover:text-white text-[12px] px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="bg-[#4573d2] text-white px-3 py-1 rounded-lg text-[12px] font-medium hover:bg-[#3562be] transition-colors cursor-pointer"
                >
                  Add section
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSection(true)}
              className="w-full flex items-center gap-2 p-3 text-[13px] font-medium text-[#8a8886] hover:text-white rounded-xl border border-dashed border-[#37383b] hover:border-[#555659] hover:bg-[#252628]/40 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add section</span>
            </button>
          )}
        </div>
      </div>

      {/* Options Drawer for Board View */}
      <BoardOptionsDrawer
        isOpen={isListOptionsDrawerOpen}
        onClose={() => setIsListOptionsDrawerOpen(false)}
        columns={boardVisibleFields}
        onToggleColumn={(colKey) => {
          setBoardVisibleFields((prev) => ({
            ...prev,
            [colKey]: !prev[colKey],
          }));
        }}
        filterMode={filterMode}
        onFilterModeChange={(mode) => setFilterMode(mode)}
        sortField={sortField}
        onSortFieldChange={(sf) => setSortField(sf)}
        groupField={groupField}
        onGroupFieldChange={(gf) => setGroupField(gf)}
        cardSize={cardSize}
        onCardSizeChange={(size) => setCardSize(size)}
        showCoverImages={showCoverImages}
        onToggleCoverImages={() => setShowCoverImages((v) => !v)}
        showSubtasks={showSubtasks}
        onToggleSubtasks={() => setShowSubtasks((v) => !v)}
      />
    </div>
  );
}
