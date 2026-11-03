'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
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
  User,
  Type,
  GripVertical,
  ClipboardList,
  Eye,
  Tag,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  CheckSquare,
  Target,
  Hash,
  Code,
  Timer,
  Library,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskRow from '@/components/tasks/TaskRow';
import ListOptionsDrawer from '@/components/tasks/ListOptionsDrawer';
import AddTaskSplitButton from '@/components/tasks/AddTaskSplitButton';
import FilterPopoverContent, { FilterRule, evaluateTaskFilters } from '@/components/tasks/FilterPopoverContent';
import { Task, PriorityLevel, CustomColumn } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  initialSections?: string[];
}

export default function TaskList({
  tasks,
  initialSections = ['Recently assigned', 'Do today', 'Do next week', 'Do later'],
}: TaskListProps) {
  const {
    createTask,
    updateTask,
    deleteTask,
    openTaskDrawer,
  } = useApp();

  // Sections state
  const [sections, setSections] = useState<string[]>(initialSections);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [editSectionValue, setEditSectionValue] = useState('');
  const [openSectionMenu, setOpenSectionMenu] = useState<string | null>(null);

  // Custom columns state (persisted in localStorage)
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kizuna_custom_columns');
        if (saved) return JSON.parse(saved);
      } catch {
        // default empty
      }
    }
    return [];
  });

  // Add custom column state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Save customColumns to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kizuna_custom_columns', JSON.stringify(customColumns));
      } catch {}
    }
  }, [customColumns]);

  // Inline add task per section
  const [inlineNewTaskSection, setInlineNewTaskSection] = useState<string | null>(null);
  const [inlineTaskName, setInlineTaskName] = useState('');

  // Add section
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Toolbar popovers
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const [isGroupFieldPickerOpen, setIsGroupFieldPickerOpen] = useState(false);
  const [isGroupOrderPickerOpen, setIsGroupOrderPickerOpen] = useState(false);
  const [isGroupMoreMenuOpen, setIsGroupMoreMenuOpen] = useState(false);
  const [showEmptyGroups, setShowEmptyGroups] = useState(true);
  const [isAddFilterMenuOpen, setIsAddFilterMenuOpen] = useState(false);
  const [isCompletedTasksSubmenuOpen, setIsCompletedTasksSubmenuOpen] = useState(false);

  // Right-side Options Drawer
  const [isListOptionsDrawerOpen, setIsListOptionsDrawerOpen] = useState(false);

  // Filter, Sort, Group State
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

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
  const [sortField, setSortField] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupField, setGroupField] = useState<string>('none');
  const [groupOrder, setGroupOrder] = useState<string>('Custom order');

  // Columns visibility state
  const [columns, setColumns] = useState<Record<string, boolean>>({
    dueDate: true,
    collaborators: true,
    project: true,
    visibility: true,
    priority: true,
    createdBy: false,
    createdOn: false,
    lastModifiedOn: false,
    completedOn: false,
    tags: false,
    blockedBy: false,
  });

  const handleToggleColumn = (colKey: string) => {
    setColumns((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Multi-selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-popover]')) {
        setIsAddMenuOpen(false);
        setIsFilterPopoverOpen(false);
        setIsSortPopoverOpen(false);
        setIsGroupPopoverOpen(false);
        setIsGroupFieldPickerOpen(false);
        setIsGroupOrderPickerOpen(false);
        setIsGroupMoreMenuOpen(false);
        setIsAddFilterMenuOpen(false);
        setIsCompletedTasksSubmenuOpen(false);
        setIsAddColumnOpen(false);
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

  // Add custom column handler
  const handleCreateCustomColumn = (type: CustomColumn['type'], defaultLabel?: string) => {
    const colName = newColumnName.trim() || defaultLabel || 'New field';
    const newCol: CustomColumn = {
      id: `custom_${Date.now()}`,
      name: colName,
      type,
    };
    setCustomColumns((prev) => [...prev, newCol]);
    setNewColumnName('');
    setIsAddColumnOpen(false);
  };

  // Delete custom column handler
  const handleDeleteCustomColumn = (colId: string) => {
    setCustomColumns((prev) => prev.filter((c) => c.id !== colId));
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
  };

  // Split button quick add
  const handleQuickAdd = (taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    const targetSection = sections[0] || 'Recently assigned';
    setInlineNewTaskSection(targetSection);
    setIsAddMenuOpen(false);
  };

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
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredTasks, sortField, sortDirection]);

  // Group tasks
  const groupedData = useMemo(() => {
    if (groupField === 'none') {
      return [{ groupName: 'All tasks', tasks: sortedTasks, id: 'all' }];
    }

    if (groupField === 'start_date' || groupField === 'due_date') {
      let groups = [
        { groupName: 'Before September 2026', id: 'before_sep', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('aug') || (t.dueDate || '').toLowerCase().includes('jul')) },
        { groupName: 'September 2026', id: 'sep_2026', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('sep')) },
        { groupName: 'October 2026', id: 'oct_2026', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('oct')) },
        { groupName: 'Last 30 days', id: 'last_30_days', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('last 30')) },
        { groupName: 'Last 7 days', id: 'last_7_days', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('last 7')) },
        { groupName: 'Yesterday', id: 'yesterday', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('yesterday') || (t.dueDate || '').toLowerCase().includes('nov 2')) },
        { groupName: 'Today', id: 'today', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('today') || (t.dueDate || '').toLowerCase().includes('nov 3')) },
        { groupName: 'Upcoming', id: 'upcoming', tasks: sortedTasks.filter((t) => (t.dueDate || '').toLowerCase().includes('nov 4') || (t.dueDate || '').toLowerCase().includes('nov 10')) },
      ];
      if (!showEmptyGroups) {
        groups = groups.filter((g) => g.tasks.length > 0);
      }
      if (groupOrder === 'Descending') {
        groups.reverse();
      }
      return groups;
    }

    if (groupField === 'project') {
      const projectMap = new Map<string, Task[]>();
      sortedTasks.forEach((t) => {
        const pName = t.projectName || 'No project';
        if (!projectMap.has(pName)) projectMap.set(pName, []);
        projectMap.get(pName)!.push(t);
      });
      let groups = Array.from(projectMap.entries()).map(([pName, pTasks]) => ({
        groupName: pName,
        id: pName,
        tasks: pTasks,
      }));
      if (groupOrder === 'Descending') {
        groups.reverse();
      }
      return groups;
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
  }, [sortedTasks, groupField, groupOrder, showEmptyGroups, sections]);

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
    selectedTaskIds.forEach((id) => updateTask(id, { completed: true }));
    setSelectedTaskIds(new Set());
  };

  const handleMassIncomplete = () => {
    selectedTaskIds.forEach((id) => updateTask(id, { completed: false }));
    setSelectedTaskIds(new Set());
  };

  const handleMassDelete = () => {
    if (confirm(`Delete ${selectedTaskIds.size} selected tasks?`)) {
      selectedTaskIds.forEach((id) => deleteTask(id));
      setSelectedTaskIds(new Set());
    }
  };

  const handleMassMoveSection = (targetSection: string) => {
    selectedTaskIds.forEach((id) => updateTask(id, { myTasksSection: targetSection }));
    setSelectedTaskIds(new Set());
  };

  const handleMassSetDueDate = (datePreset: string) => {
    selectedTaskIds.forEach((id) => updateTask(id, { dueDate: datePreset }));
    setSelectedTaskIds(new Set());
  };

  const activeFilterCount = (filterMode !== 'all' ? 1 : 0) + filterRules.length;
  const isFilterActive = activeFilterCount > 0;
  const isSortActive = sortField !== 'none';
  const isGroupActive = groupField !== 'none';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none relative overflow-hidden">
      {/* Action Toolbar for List View */}
      <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px] relative z-50 bg-[#1e1f21]">
        {/* Add task split button */}
        <AddTaskSplitButton
          canAddSection={false}
          onAddTask={(type) => {
            const defaultName = type === 'milestone' ? 'New milestone' : type === 'approval' ? 'New approval' : 'New task';
            const created = createTask({
              name: defaultName,
              section: 'To do',
              myTasksSection: sections[0] || 'Recently assigned',
              taskType: type,
              dueDate: 'Today',
              projectId: 'kevins-first-project',
              priority: 'Low',
            });
            if (created?.id) {
              openTaskDrawer(created.id);
            }
          }}
        />

        {/* Right action controls */}
        <div className="flex items-center gap-2 text-[#bdbbb9] text-[12px]">
          {/* 1. FILTER BUTTON */}
          <div className="relative" data-popover>
            {isFilterActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
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

            {isFilterPopoverOpen && (
              <div className="absolute right-0 top-8.5 z-50">
                <FilterPopoverContent
                  quickFilter={filterMode as any}
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

          {/* 2. SORT BUTTON */}
          <div className="relative" data-popover>
            {isSortActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  onClick={() => {
                    setIsSortPopoverOpen((prev) => !prev);
                    setIsFilterPopoverOpen(false);
                    setIsGroupPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#1147a3] transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sorts: 1</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortField('none');
                  }}
                  className="px-1.5 py-1 hover:bg-[#1147a3] border-l border-[#1d4ea8] text-[#a5c2f7] hover:text-white transition-colors"
                  title="Clear sort"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSortPopoverOpen((prev) => !prev);
                  setIsFilterPopoverOpen(false);
                  setIsGroupPopoverOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  isSortPopoverOpen
                    ? 'bg-[#2b2c2e] text-white border border-[#37383b]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort</span>
              </button>
            )}

            {isSortPopoverOpen && (
              <div className="absolute right-0 top-8 w-56 bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl py-1.5 z-40 text-[13px] animate-in fade-in duration-150">
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
                      onClick={() => {
                        if (isSelected) {
                          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortField(item.id);
                          setSortDirection('asc');
                        }
                        setIsSortPopoverOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
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
                      onClick={() => {
                        setSortField('none');
                        setIsSortPopoverOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-[12px] text-[#ff6b72] hover:bg-[#2f3135] transition-colors"
                    >
                      Clear sort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. GROUP BUTTON */}
          <div className="relative" data-popover>
            {isGroupActive ? (
              <div className="inline-flex items-center bg-[#0d3880] text-white border border-[#1d4ea8] rounded-lg text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  onClick={() => {
                    setIsGroupPopoverOpen((prev) => !prev);
                    setIsFilterPopoverOpen(false);
                    setIsSortPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[#1147a3] transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Groups: 1</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupField('section');
                    setGroupOrder('Custom order');
                  }}
                  className="px-1.5 py-1 hover:bg-[#1147a3] border-l border-[#1d4ea8] text-[#a5c2f7] hover:text-white transition-colors"
                  title="Clear group"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsGroupPopoverOpen((prev) => !prev);
                  setIsFilterPopoverOpen(false);
                  setIsSortPopoverOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  isGroupPopoverOpen
                    ? 'bg-[#2b2c2e] text-white border border-[#37383b]'
                    : 'hover:text-white hover:bg-[#28292c]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Group</span>
              </button>
            )}

            {isGroupPopoverOpen && (
              <div className="absolute right-0 top-8 w-[420px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl p-4 z-40 text-[13px] animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[14px]">Groups</span>
                    <button
                      onClick={() => alert('Feedback submitted! Thank you.')}
                      className="text-[12px] text-[#8b5cf6] hover:underline"
                    >
                      Send feedback
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setGroupField('none');
                      setGroupOrder('Custom order');
                    }}
                    className="text-[12px] text-[#8a8886] hover:text-white transition-colors"
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
                      className="w-full flex items-center justify-between bg-[#252628] border border-[#37383b] hover:border-[#525357] rounded-lg px-3 py-1.5 text-[13px] text-white transition-colors"
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
                              onClick={() => {
                                setGroupField(gf.id);
                                if (gf.id === 'section') {
                                  setGroupOrder('Custom order');
                                } else {
                                  setGroupOrder('Ascending');
                                }
                                setIsGroupFieldPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#2f3135] transition-colors"
                            >
                              <GIcon className="w-4 h-4 text-[#8a8886]" />
                              <span>{gf.label}</span>
                              {isCur && <Check className="w-3.5 h-3.5 text-[#4573d2] ml-auto" />}
                            </button>
                          );
                        })}
                        <div className="border-t border-[#37383b] mt-1 pt-1">
                          <button
                            onClick={() => {
                              alert('Add custom field popup');
                              setIsGroupFieldPickerOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#8a8886] hover:text-white hover:bg-[#2f3135] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add custom field</span>
                          </button>
                        </div>
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
                      className="w-full flex items-center justify-between bg-[#252628] border border-[#37383b] hover:border-[#525357] rounded-lg px-2.5 py-1.5 text-[13px] text-white transition-colors"
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
                            onClick={() => {
                              setGroupOrder('Custom order');
                              setIsGroupOrderPickerOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#2f3135] text-white"
                          >
                            Custom order
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setGroupOrder('Ascending');
                                setIsGroupOrderPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-white"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Ascending</span>
                            </button>
                            <button
                              onClick={() => {
                                setGroupOrder('Descending');
                                setIsGroupOrderPickerOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#2f3135] text-white"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Descending</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* More button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGroupMoreMenuOpen((prev) => !prev);
                        setIsGroupOrderPickerOpen(false);
                        setIsGroupFieldPickerOpen(false);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isGroupMoreMenuOpen ? 'bg-[#323336] text-white' : 'text-[#8a8886] hover:text-white hover:bg-[#28292c]'
                      }`}
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isGroupMoreMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl py-1.5 z-50 text-[12.5px]">
                        <button
                          onClick={() => {
                            setShowEmptyGroups(false);
                            setIsGroupMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left text-white transition-colors"
                        >
                          <span>Hide empty groups</span>
                          {!showEmptyGroups && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                        </button>
                        <button
                          onClick={() => {
                            setShowEmptyGroups(true);
                            setIsGroupMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] text-left text-white transition-colors"
                        >
                          <span>Show empty groups</span>
                          {showEmptyGroups && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clear button */}
                  <button
                    onClick={() => {
                      setGroupField('section');
                      setGroupOrder('Custom order');
                    }}
                    className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c]"
                    title="Remove grouping"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-2">
                  <button
                    onClick={() => alert('Add subgroup')}
                    className="flex items-center gap-1.5 text-[12.5px] text-[#8a8886] hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add subgroup</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. OPTIONS BUTTON */}
          <button
            onClick={() => setIsListOptionsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:text-white hover:bg-[#28292c] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>

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

      {/* Main Table Area with Horizontal Scrolling */}
      <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
        <div className="min-w-max">
          {/* Table Header */}
          <div className="flex items-center h-[34px] border-b border-[#262729] text-[#8a8886] font-semibold text-[11px] select-none bg-[#1e1f21] sticky top-0 z-30">
            {/* Sticky Name Column Header */}
            <div className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-35 bg-[#1e1f21] px-3 flex items-center h-full">
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

              <div className="w-[28px] shrink-0" />
              <div
                onClick={() => {
                  setSortField('alphabetical');
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                className="flex items-center gap-1.5 text-white hover:text-white cursor-pointer group"
              >
                <span className="font-medium text-[12px]">Name</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#6d6c6e] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Horizontally Scrollable Column Headers (No vertical borders) */}
            {columns.dueDate && (
              <div className="w-[140px] shrink-0 px-2 flex items-center h-full font-medium text-[12px] text-white">
                Due date
              </div>
            )}

            {columns.collaborators && (
              <div className="w-[150px] shrink-0 px-3 flex items-center h-full font-medium text-[12px] text-white">
                Collaborators
              </div>
            )}

            {columns.project && (
              <div className="w-[190px] shrink-0 px-2 flex items-center h-full font-medium text-[12px] text-white">
                Projects
              </div>
            )}

            {columns.visibility && (
              <div className="w-[150px] shrink-0 px-3 flex items-center h-full font-medium text-[12px] text-white">
                Task visibility
              </div>
            )}

            {/* Dynamic Custom Column Headers */}
            {customColumns.map((col) => (
              <div
                key={col.id}
                className="w-[150px] shrink-0 px-3 flex items-center justify-between h-full font-medium text-[12px] text-white group/col"
              >
                <span className="truncate">{col.name}</span>
                <button
                  onClick={() => handleDeleteCustomColumn(col.id)}
                  className="opacity-0 group-hover/col:opacity-100 hover:text-[#ff6b72] text-[#8a8886] p-0.5 rounded transition-opacity"
                  title="Remove column"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* + Add Column Button & Popover (Exact Asana Screenshot) */}
            <div className="relative shrink-0 flex items-center h-full" data-popover>
              {isAddColumnOpen ? (
                <div className="flex items-center px-2 relative">
                  <input
                    autoFocus
                    placeholder="New field"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCustomColumn('text');
                      if (e.key === 'Escape') setIsAddColumnOpen(false);
                    }}
                    className="bg-[#1e1f21] border border-[#4573d2] rounded-md px-2.5 py-0.5 text-white text-[12.5px] outline-none w-[170px]"
                  />

                  {/* Asana Field Types Dropdown Popover */}
                  <div className="absolute left-2 top-full mt-1.5 w-[220px] bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] animate-in fade-in duration-150">
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886]">
                      Field types
                    </div>

                    {[
                      { id: 'single_select', label: 'Single-select', icon: CheckCircle2 },
                      { id: 'multi_select', label: 'Multi-select', icon: CheckSquare },
                      { id: 'date', label: 'Date', icon: CalendarIcon },
                      { id: 'people', label: 'People', icon: User },
                      { id: 'reference', label: 'Reference', icon: Target },
                      { id: 'text', label: 'Text', icon: Type },
                      { id: 'number', label: 'Number', icon: Hash },
                      { id: 'formula', label: 'Formula', icon: Code },
                      { id: 'timer', label: 'Timer', icon: Timer },
                      { id: 'time_tracking', label: 'Time tracking', icon: Clock },
                      { id: 'rollup', label: 'Rollup', icon: ChevronUp },
                    ].map((ft) => {
                      const IconComp = ft.icon;
                      return (
                        <button
                          key={ft.id}
                          onClick={() => handleCreateCustomColumn(ft.id as any, ft.label)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                        >
                          <IconComp className="w-4 h-4 text-[#8a8886]" />
                          <span>{ft.label}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => alert('Show more field types')}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-[#4573d2] hover:underline"
                    >
                      Show more
                    </button>

                    <div className="border-t border-[#37383b] my-1" />

                    <button
                      onClick={() => alert('Choose from library')}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[#f5f4f3] hover:bg-[#2f3135] transition-colors"
                    >
                      <Library className="w-4 h-4 text-[#8a8886]" />
                      <span>Choose from library</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddColumnOpen(true)}
                  className="px-3 py-1 text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors h-full flex items-center justify-center"
                  title="Add field"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8a8886] hover:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Sections with Synchronized Horizontal Table Rows */}
          <div className="pb-24">
            {groupedData.map((group) => {
              const isCollapsed = collapsedSections[group.id];
              const isUngrouped = groupField === 'none' || group.id === 'all';

              return (
                <div key={group.id} className={isUngrouped ? '' : 'border-b border-[#252628]'}>
                  {/* Section Header Row (Only shown when grouped) */}
                  {!isUngrouped && (
                    <div className="flex items-center h-[38px] border-b border-[#252628] bg-[#1e1f21] group/sec">
                      {/* Sticky Left Section Header */}
                      <div className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] group-hover/sec:bg-[#252628] px-3 h-full flex items-center justify-between transition-colors">
                        <div
                          onClick={() => toggleSection(group.id)}
                          className="flex items-center gap-2 flex-1 cursor-pointer select-none"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover/sec:text-white" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#8a8886] group-hover/sec:text-white" />
                          )}

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
                            <div className="flex items-center gap-2 text-[13px] font-bold text-white">
                              <span>{group.groupName}</span>
                              <span className="text-[11px] font-normal text-[#8a8886] bg-[#2a2b2d] px-1.5 py-0.2 rounded-full">
                                {group.tasks.length}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="relative flex items-center opacity-0 group-hover/sec:opacity-100 transition-opacity" data-popover>
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

                      {/* Rest of Section row background spanning into columns */}
                      <div className="flex-1 h-full bg-[#1e1f21] group-hover/sec:bg-[#252628] transition-colors" />
                    </div>
                  )}

                  {/* Section Tasks Table Rows */}
                  {!isCollapsed && (
                    <div>
                      {group.tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          isSelected={selectedTaskIds.has(task.id)}
                          onToggleSelect={() => handleToggleSelectTask(task.id)}
                          showProjectColumn={columns.project}
                          showDueDateColumn={columns.dueDate}
                          showVisibilityColumn={columns.visibility}
                          showCollaboratorsColumn={columns.collaborators}
                          customColumns={customColumns}
                          onUpdateCustomField={(taskId, fieldId, value) => {
                            const cur = task.customFields || {};
                            updateTask(taskId, { customFields: { ...cur, [fieldId]: value } });
                          }}
                          onMoveSection={(sec) => updateTask(task.id, { myTasksSection: sec })}
                        />
                      ))}

                      {/* Ungrouped Add Task row */}
                      {isUngrouped && (
                        <div className="flex items-center h-[36px] border-b border-transparent hover:bg-[#232427]/40 transition-colors group/add">
                          <div
                            onClick={() => handleQuickAdd('task')}
                            className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] group-hover/add:bg-[#232427] px-9 h-full flex items-center gap-2 text-[13px] text-[#8a8886] group-hover/add:text-white cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#6d6c6e] group-hover/add:text-white transition-colors" />
                            <span>Add task</span>
                          </div>
                          <div className="flex-1 h-full" />
                        </div>
                      )}

                      {/* Grouped Inline Task Creation Row */}
                      {!isUngrouped && inlineNewTaskSection === group.id ? (
                        <div className="flex items-center h-[38px] border-b border-[#262729] bg-[#1e1f21]">
                          <div className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] px-3 h-full flex items-center gap-2">
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
                              className="w-full bg-[#252628] border border-[#4573d2] rounded px-2.5 py-1 text-white text-[13px] outline-none"
                            />
                            <button
                              onClick={() => handleInlineCreate(group.id)}
                              className="text-[12px] bg-[#4573d2] hover:bg-[#3562be] text-white px-2.5 py-1 rounded font-medium transition-colors shrink-0"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setInlineNewTaskSection(null)}
                              className="text-[12px] text-[#8a8886] hover:text-white px-2 py-1 transition-colors shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="flex-1 h-full bg-[#1e1f21]" />
                        </div>
                      ) : !isUngrouped ? (
                        <div className="flex items-center h-[34px] border-b border-transparent hover:bg-[#232427]/40 transition-colors group/add">
                          <div
                            onClick={() => setInlineNewTaskSection(group.id)}
                            className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] group-hover/add:bg-[#232427] px-9 h-full flex items-center gap-2 text-[12.5px] text-[#8a8886] group-hover/add:text-white cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#6d6c6e] group-hover/add:text-white transition-colors" />
                            <span>Add task</span>
                          </div>
                          <div className="flex-1 h-full" />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Section Button / Input (Only when Group by Section is active) */}
            {groupField === 'section' && (
              <div className="flex items-center h-[42px] border-b border-transparent mt-1">
                <div className="w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] px-3 h-full flex items-center">
                  {isAddingSection ? (
                    <div className="flex items-center gap-2 w-full">
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
                        className="bg-[#4573d2] text-white text-[12px] px-3 py-1 rounded font-medium hover:bg-[#3562be] shrink-0"
                      >
                        Add section
                      </button>
                      <button
                        onClick={() => setIsAddingSection(false)}
                        className="text-[#8a8886] hover:text-white text-[12px] px-2 shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSection(true)}
                      className="flex items-center gap-2 text-[13px] font-medium text-[#8a8886] hover:text-white transition-colors py-1 px-2 rounded hover:bg-[#28292c]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add section</span>
                    </button>
                  )}
                </div>
                <div className="flex-1 h-full" />
              </div>
            )}
          </div>
        </div>
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

          <button
            onClick={handleMassComplete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#4cd195] transition-colors"
            title="Mark complete"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[12px]">Complete</span>
          </button>

          <button
            onClick={handleMassIncomplete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#323336] text-[#bdbbb9] hover:text-white transition-colors"
            title="Mark incomplete"
          >
            <Clock className="w-4 h-4" />
            <span className="text-[12px]">Incomplete</span>
          </button>

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

          <button
            onClick={handleMassDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#47181c] text-[#ff6b72] transition-colors"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[12px]">Delete</span>
          </button>

          <button
            onClick={() => setSelectedTaskIds(new Set())}
            className="p-1.5 rounded-lg hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right-side List Options Drawer */}
      <ListOptionsDrawer
        isOpen={isListOptionsDrawerOpen}
        onClose={() => setIsListOptionsDrawerOpen(false)}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        filterMode={filterMode}
        onFilterModeChange={(m) => setFilterMode(m)}
        sortField={sortField}
        onSortFieldChange={(s) => setSortField(s)}
        groupField={groupField}
        onGroupFieldChange={(g) => setGroupField(g)}
      />
    </div>
  );
}
