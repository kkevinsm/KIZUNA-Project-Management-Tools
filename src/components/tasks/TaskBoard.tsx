'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Check,
  MoreHorizontal,
  Calendar,
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
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import AddTaskSplitButton from '@/components/tasks/AddTaskSplitButton';

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

  // Inline add task per column
  const [activeNewSection, setActiveNewSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  // Add new section state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Editing section name
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSectionValue, setEditingSectionValue] = useState('');

  // Section options menu
  const [openSectionMenu, setOpenSectionMenu] = useState<string | null>(null);
  const sectionMenuRef = useRef<HTMLDivElement>(null);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below');

  // Toolbar state: Filter, Sort, Search
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<'none' | 'alphabetical' | 'dueDate' | 'priority'>('none');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as Node)) {
        setOpenSectionMenu(null);
      }
    };
    if (openSectionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSectionMenu]);

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

  // Filter & Sort tasks
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!t.name.toLowerCase().includes(q)) return false;
    }
    if (filterMode === 'incomplete') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    return true;
  });

  const getSortedTasks = (colTasks: Task[]) => {
    if (sortField === 'alphabetical') {
      return [...colTasks].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortField === 'dueDate') {
      return [...colTasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }
    if (sortField === 'priority') {
      const pWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      return [...colTasks].sort((a, b) => (pWeights[b.priority || ''] || 0) - (pWeights[a.priority || ''] || 0));
    }
    return colTasks;
  };

  // Create task in specific section
  const handleCreateTask = (section: string, taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    if (!newTaskName.trim()) {
      setActiveNewSection(null);
      return;
    }

    const created = createTask({
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

  // Rename section
  const handleSaveRenameSection = (oldName: string) => {
    const trimmed = editingSectionValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingSection(null);
      return;
    }
    setBoardSections((prev) => prev.map((s) => (s === oldName ? trimmed : s)));
    // Update tasks with that section
    tasks.forEach((t) => {
      if (t.section === oldName || t.myTasksSection === oldName) {
        updateTask(t.id, { section: trimmed, myTasksSection: trimmed });
      }
    });
    setEditingSection(null);
  };

  // Delete section
  const handleDeleteSection = (sectionName: string) => {
    if (boardSections.length <= 1) return;
    setBoardSections((prev) => prev.filter((s) => s !== sectionName));
    setOpenSectionMenu(null);
  };

  // Move section left / right
  const handleMoveSection = (sectionName: string, direction: 'left' | 'right') => {
    const idx = boardSections.indexOf(sectionName);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= boardSections.length) return;
    const next = [...boardSections];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setBoardSections(next);
    setOpenSectionMenu(null);
  };

  // Toggle collapse section
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
    if (lower.includes('today') || lower.includes('nov 2') || lower.includes('nov 3') || lower.includes('nov 4') || lower.includes('nov 5')) {
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

    // If dropping directly onto column (not over a specific card)
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

    // Find last index of this column
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* 1. Asana Secondary Control Toolbar for Board */}
      <div className="h-[46px] min-h-[46px] px-6 border-b border-[#262729] flex items-center justify-between text-[13px] bg-[#1e1f21] shrink-0 relative z-50">
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

        {/* Right Side Controls: Filter, Sort, Group, Options, Search */}
        <div className="flex items-center gap-2 text-[#bdbbb9] text-[12px]">
          {/* FILTER BUTTON */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen((prev) => !prev);
                setIsSortOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                filterMode !== 'all'
                  ? 'bg-[#0d3880] text-white border-[#1d4ea8]'
                  : 'hover:bg-[#252628] border-transparent hover:border-[#383a3d]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-9 w-44 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[12.5px]">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                  Quick filters
                </div>
                {(['all', 'incomplete', 'completed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setFilterMode(mode);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#252628] text-left capitalize text-white cursor-pointer"
                  >
                    <span>{mode === 'all' ? 'All tasks' : `${mode} tasks`}</span>
                    {filterMode === mode && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SORT BUTTON */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen((prev) => !prev);
                setIsFilterOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                sortField !== 'none'
                  ? 'bg-[#0d3880] text-white border-[#1d4ea8]'
                  : 'hover:bg-[#252628] border-transparent hover:border-[#383a3d]'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-9 w-44 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[12.5px]">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                  Sort by
                </div>
                {[
                  { field: 'none', label: 'None' },
                  { field: 'dueDate', label: 'Due date' },
                  { field: 'alphabetical', label: 'Alphabetical' },
                  { field: 'priority', label: 'Priority' },
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    onClick={() => {
                      setSortField(field as any);
                      setIsSortOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                  >
                    <span>{label}</span>
                    {sortField === field && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GROUP BUTTON */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#252628] border border-transparent hover:border-[#383a3d] transition-colors"
            title="Group by sections (Default)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Group</span>
          </button>

          {/* OPTIONS BUTTON */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#252628] border border-transparent hover:border-[#383a3d] transition-colors"
            title="View options"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>

          {/* SEARCH ICON / INPUT */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#252628] border border-[#383a3d] rounded-lg px-2 py-1 text-[12px]">
                <Search className="w-3.5 h-3.5 text-[#8a8886] mr-1.5 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search in board..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white outline-none w-36 text-[12px] placeholder-[#8a8886]"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-[#8a8886] hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[#252628] text-[#bdbbb9] hover:text-white transition-colors"
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
        {boardSections.map((section, sectionIdx) => {
          const isCollapsed = !!collapsedSections[section];
          const rawColumnTasks = filteredTasks.filter(
            (t) => (t.myTasksSection || t.section || boardSections[0]) === section
          );
          const columnTasks = getSortedTasks(rawColumnTasks);
          const isDragOverThisCol = dragOverSection === section && dragOverCardId === null;

          // ================= COLLAPSED COLUMN =================
          if (isCollapsed) {
            return (
              <div
                key={section}
                onClick={() => toggleCollapse(section)}
                className="w-[42px] min-w-[42px] bg-[#252628] hover:bg-[#2a2b2e] border border-[#323438] hover:border-[#45474c] rounded-xl py-3 flex flex-col items-center justify-between cursor-pointer transition-all h-[calc(100vh-180px)] select-none shadow-sm"
                title={`Expand ${section}`}
              >
                {/* Expand button on top */}
                <button
                  type="button"
                  className="p-1 rounded text-[#8a8886] hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Vertical title */}
                <div
                  className="text-[13px] font-semibold text-white tracking-wide whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {section}
                </div>

                {/* Count badge */}
                <span className="text-[11px] font-semibold text-[#8a8886] bg-[#1e1f21] px-1.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            );
          }

          // ================= EXPANDED COLUMN =================
          return (
            <div
              key={section}
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
                      className="p-1 rounded hover:bg-[#343538] hover:text-white transition-colors"
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
                      className="p-1 rounded hover:bg-[#343538] hover:text-white transition-colors"
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
                          setOpenSectionMenu(openSectionMenu === section ? null : section);
                        }}
                        className="p-1 rounded hover:bg-[#343538] hover:text-white transition-colors"
                        title="Section actions"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu for Section */}
                      {openSectionMenu === section && (
                        <div
                          ref={sectionMenuRef}
                          className="absolute right-0 top-8 w-48 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[12.5px] text-[#f5f4f3] animate-in fade-in duration-100"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSection(section);
                              setEditingSectionValue(section);
                              setOpenSectionMenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Rename section</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSection(true);
                              setOpenSectionMenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
                            <span>Add section</span>
                          </button>

                          {sectionIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveSection(section, 'left')}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Move left</span>
                            </button>
                          )}

                          {sectionIdx < boardSections.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveSection(section, 'right')}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-white cursor-pointer"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-[#8a8886]" />
                              <span>Move right</span>
                            </button>
                          )}

                          <div className="border-t border-[#313235] my-1" />

                          <button
                            type="button"
                            onClick={() => handleDeleteSection(section)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#3d1a1f] text-left text-[#ff6b72] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#ff6b72]" />
                            <span>Delete section</span>
                          </button>
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
                        className={`bg-[#252628] hover:bg-[#2b2c2f] border border-[#323438] hover:border-[#45474c] rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all shadow-sm select-none relative group ${
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
                          </div>
                        </div>

                        {/* 2. Second Row: Project Badge [■] Kevin's first project */}
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2a2b2e] text-[#cfcecd] text-[11px] font-normal hover:bg-[#343539] transition-colors">
                            <span className="w-2.5 h-2.5 rounded-xs bg-white/70" />
                            <span>Kevin&apos;s first project</span>
                          </span>
                        </div>

                        {/* 3. Third Row: Due date */}
                        {task.dueDate && (
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
    </div>
  );
}
