'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  ListFilter,
  SlidersHorizontal,
  Search,
  CalendarDays,
  Check,
  X,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import CalendarOptionsDrawer, { CalendarFilterItem } from './CalendarOptionsDrawer';
import AddTaskSplitButton from './AddTaskSplitButton';

interface TaskCalendarProps {
  tasks: Task[];
}

// Function to calculate start and end day column in the current week
function getTaskWeekSpan(
  task: Task,
  weekDays: { dayNumber: number }[],
  defaultIndex: number
) {
  const text = (task.dueDate || '').toLowerCase().trim();

  let startNum = 2;
  let endNum = 4;

  if (text.includes('today')) {
    startNum = 2;
    const nums = text.match(/\d+/g);
    endNum = nums && nums.length > 0 ? parseInt(nums[0], 10) : (text.includes('nov 4') ? 4 : 2);
  } else {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) {
      startNum = parseInt(nums[0], 10);
      endNum = parseInt(nums[nums.length - 1], 10);
    } else if (nums && nums.length === 1) {
      startNum = parseInt(nums[0], 10);
      endNum = parseInt(nums[0], 10);
    } else if (!text) {
      // If no due date, fallback for Task 1 and Task 2
      if (defaultIndex === 0) {
        startNum = 2;
        endNum = 4;
      } else if (defaultIndex === 1) {
        startNum = 3;
        endNum = 5;
      } else {
        return null;
      }
    }
  }

  if (startNum > endNum) {
    const tmp = startNum;
    startNum = endNum;
    endNum = tmp;
  }

  const startIdx = weekDays.findIndex((d) => d.dayNumber === startNum);
  const endIdx = weekDays.findIndex((d) => d.dayNumber === endNum);

  if (startIdx === -1 && endIdx === -1) {
    return null;
  }

  const actualStart = startIdx !== -1 ? startIdx : 0;
  const actualEnd = endIdx !== -1 ? endIdx : weekDays.length - 1;

  return {
    colStart: actualStart + 1, // 1-indexed for CSS grid
    colEnd: actualEnd + 2,     // CSS grid column end is exclusive (+1 +1)
    isMultiDay: actualEnd > actualStart,
  };
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const {
    openTaskDrawer,
    activeTaskId,
    toggleTaskComplete,
    openCreateModal,
    createTask,
  } = useApp();

  const [viewMode, setViewMode] = useState<'weeks' | 'month'>('weeks');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
  const [drawerInitialView, setDrawerInitialView] = useState<'main' | 'filters'>('main');
  const [showWeekends, setShowWeekends] = useState(true);
  const [showMultiDayTasks, setShowMultiDayTasks] = useState(true);
  const [taskColorMode, setTaskColorMode] = useState<'default' | 'priority' | 'project'>('default');

  // Stackable filters for Calendar Options (matching Asana)
  const [calendarFilters, setCalendarFilters] = useState<CalendarFilterItem[]>([
    { id: 'filter-default-1', type: 'completion', operator: 'is', value: 'incomplete' },
  ]);

  const handleAddFilter = (type: CalendarFilterItem['type']) => {
    const newId = `filter-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFilter: CalendarFilterItem = {
      id: newId,
      type,
      operator: 'is',
      value:
        type === 'completion'
          ? 'incomplete'
          : type === 'creator'
          ? 'Kevin Safrisal'
          : type === 'task_type'
          ? 'tasks'
          : 'today',
    };
    setCalendarFilters((prev) => [...prev, newFilter]);
  };

  const handleUpdateFilter = (id: string, updates: Partial<CalendarFilterItem>) => {
    setCalendarFilters((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates };
          if (
            updated.type === 'completion' &&
            (updated.value === 'all' || updated.value === 'incomplete' || updated.value === 'completed')
          ) {
            setFilterMode(updated.value as any);
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleRemoveFilter = (id: string) => {
    setCalendarFilters((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.type === 'completion') {
        setFilterMode('all');
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleClearFilters = () => {
    setCalendarFilters([]);
    setFilterMode('all');
  };

  // Synchronized toolbar filter handler
  const handleToolbarFilterChange = (mode: 'all' | 'incomplete' | 'completed') => {
    setFilterMode(mode);
    setCalendarFilters((prev) => {
      const exists = prev.some((f) => f.type === 'completion');
      if (exists) {
        return prev.map((f) => (f.type === 'completion' ? { ...f, value: mode } : f));
      }
      return [
        ...prev,
        {
          id: `filter-comp-${Date.now()}`,
          type: 'completion',
          operator: 'is',
          value: mode,
        },
      ];
    });
  };

  // Week offset from base week (November 1-7, 2026)
  const [weekOffset, setWeekOffset] = useState(0);

  // Base week: Sunday Nov 1 – Saturday Nov 7, 2026
  const baseWeekDays = [
    { name: 'Sun', dayNumber: 1, fullDate: '2026-11-01' },
    { name: 'Mon', dayNumber: 2, fullDate: '2026-11-02' },
    { name: 'Tue', dayNumber: 3, fullDate: '2026-11-03' }, // Today in Asana screenshot
    { name: 'Wed', dayNumber: 4, fullDate: '2026-11-04' },
    { name: 'Thu', dayNumber: 5, fullDate: '2026-11-05' },
    { name: 'Fri', dayNumber: 6, fullDate: '2026-11-06' },
    { name: 'Sat', dayNumber: 7, fullDate: '2026-11-07' },
  ];

  // Calculate current week days with offset
  const weekDays = baseWeekDays
    .map((d) => {
      const dayNum = d.dayNumber + weekOffset * 7;
      return {
        ...d,
        dayNumber: dayNum > 0 ? (dayNum <= 30 ? dayNum : ((dayNum - 1) % 30) + 1) : 30 + dayNum,
      };
    })
    .filter((d) => (showWeekends ? true : d.name !== 'Sun' && d.name !== 'Sat'));

  const handlePrev = () => setWeekOffset((prev) => prev - 1);
  const handleNext = () => setWeekOffset((prev) => prev + 1);
  const handleToday = () => setWeekOffset(0);

  const handleCreateForDay = (dayNum: number) => {
    createTask({
      name: `New task for Nov ${dayNum}`,
      dueDate: `Nov ${dayNum}`,
      section: 'To do',
    });
  };

  // Stacked filter evaluation (AND condition across all active filters)
  const filteredTasks = tasks.filter((t) => {
    // Evaluate all stacked filters
    return calendarFilters.every((f) => {
      // 1. Completion status
      if (f.type === 'completion') {
        if (f.value === 'completed') return t.completed === true;
        if (f.value === 'incomplete') return t.completed !== true;
        return true; // 'all'
      }

      // 2. Created by
      if (f.type === 'creator') {
        const targetPerson = (f.value || 'Kevin Safrisal').toLowerCase().trim();
        if (targetPerson === 'any teammate') return true;

        const assigneeName = (t.assignee?.name || '').toLowerCase().trim();
        const matchesAssignee =
          assigneeName.includes(targetPerson) ||
          (targetPerson.includes('kevin') && assigneeName.includes('kevin'));

        return f.operator === 'is_not' ? !matchesAssignee : matchesAssignee;
      }

      // 3. Task type (Tasks, Milestones, Approvals)
      if (f.type === 'task_type') {
        const types = f.value
          .split(',')
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean);
        if (types.length === 0) return true;

        const isMilestone =
          (t as any).taskType === 'milestone' || t.name.toLowerCase().includes('milestone');
        const isApproval =
          (t as any).taskType === 'approval' || t.name.toLowerCase().includes('approval');
        const isRegularTask = !isMilestone && !isApproval;

        let matchesType = false;
        if (types.includes('milestones') && isMilestone) matchesType = true;
        if (types.includes('approvals') && isApproval) matchesType = true;
        if (types.includes('tasks') && isRegularTask) matchesType = true;

        return f.operator === 'is_not' ? !matchesType : matchesType;
      }

      // 4. Date based filters (created_on, last_modified, completed_on)
      if (f.type === 'created_on' || f.type === 'last_modified' || f.type === 'completed_on') {
        const dStr = t.createdAt || '';
        let taskDay = 3;
        let taskMonth = 11;
        let taskYear = 2026;

        if (dStr) {
          const parsed = new Date(dStr);
          if (!isNaN(parsed.getTime())) {
            taskDay = parsed.getUTCDate();
            taskMonth = parsed.getUTCMonth() + 1; // 1-12
            taskYear = parsed.getUTCFullYear();
          }
        }

        const isToday = taskYear === 2026 && taskMonth === 11 && taskDay === 3;
        const isYesterday = taskYear === 2026 && taskMonth === 11 && taskDay === 2;
        const isThisWeek = taskYear === 2026 && taskMonth === 11 && taskDay >= 1 && taskDay <= 7;
        const isLastWeek = taskYear === 2026 && taskMonth === 10 && taskDay >= 25 && taskDay <= 31;
        const isLast14Days =
          (taskYear === 2026 && taskMonth === 11 && taskDay <= 3) ||
          (taskYear === 2026 && taskMonth === 10 && taskDay >= 20);
        const isInLastMonth = taskYear === 2026 && taskMonth === 10;
        const isOverOneMonthAgo = taskYear < 2026 || (taskYear === 2026 && taskMonth < 10);

        let matchesDate = false;
        if (f.value === 'today') matchesDate = isToday;
        else if (f.value === 'yesterday') matchesDate = isYesterday;
        else if (f.value === 'this_week') matchesDate = isThisWeek;
        else if (f.value === 'last_week') matchesDate = isLastWeek;
        else if (f.value === 'last_14_days') matchesDate = isLast14Days;
        else if (f.value === 'in_the_last_month') matchesDate = isInLastMonth;
        else if (f.value === 'over_one_month_ago') matchesDate = isOverOneMonthAgo;
        else matchesDate = true;

        if (f.operator === 'is_before') return !isToday && !isThisWeek;
        if (f.operator === 'is_after') return isToday;
        return matchesDate;
      }

      return true;
    });
  });

  // Calculate dynamic multi-day spanning tasks
  const palettes = [
    {
      bg: 'bg-[#80eed2] hover:bg-[#8ef3da]',
      text: 'text-[#0a382b]',
      checkBorder: 'border-[#0a382b]/50 hover:border-[#0a382b]',
      checkBg: 'bg-[#0a382b]',
      checkText: 'text-[#80eed2]',
      handleBorder: 'border-[#0a382b]/50',
    },
    {
      bg: 'bg-[#f8be4e] hover:bg-[#fac561]',
      text: 'text-[#3d2402]',
      checkBorder: 'border-[#3d2402]/50 hover:border-[#3d2402]',
      checkBg: 'bg-[#3d2402]',
      checkText: 'text-[#f8be4e]',
      handleBorder: 'border-[#3d2402]/50',
    },
    {
      bg: 'bg-[#85c5f8] hover:bg-[#99d0fa]',
      text: 'text-[#0d2f4d]',
      checkBorder: 'border-[#0d2f4d]/50 hover:border-[#0d2f4d]',
      checkBg: 'bg-[#0d2f4d]',
      checkText: 'text-[#85c5f8]',
      handleBorder: 'border-[#0d2f4d]/50',
    },
    {
      bg: 'bg-[#bca3f5] hover:bg-[#c9b4f7]',
      text: 'text-[#2e1859]',
      checkBorder: 'border-[#2e1859]/50 hover:border-[#2e1859]',
      checkBg: 'bg-[#2e1859]',
      checkText: 'text-[#bca3f5]',
      handleBorder: 'border-[#2e1859]/50',
    },
  ];

  // Map spanning tasks
  const spanningTasks = showMultiDayTasks
    ? filteredTasks
        .map((task, idx) => {
          const span = getTaskWeekSpan(task, weekDays, idx);
          let palette = palettes[idx % palettes.length];
          if (taskColorMode === 'priority') {
            if (task.priority === 'High') {
              palette = {
                bg: 'bg-[#f58e8e] hover:bg-[#f7a4a4]',
                text: 'text-[#421111]',
                checkBorder: 'border-[#421111]/50 hover:border-[#421111]',
                checkBg: 'bg-[#421111]',
                checkText: 'text-[#f58e8e]',
                handleBorder: 'border-[#421111]/50',
              };
            } else if (task.priority === 'Medium') {
              palette = {
                bg: 'bg-[#f8be4e] hover:bg-[#fac561]',
                text: 'text-[#3d2402]',
                checkBorder: 'border-[#3d2402]/50 hover:border-[#3d2402]',
                checkBg: 'bg-[#3d2402]',
                checkText: 'text-[#f8be4e]',
                handleBorder: 'border-[#3d2402]/50',
              };
            } else {
              palette = {
                bg: 'bg-[#80eed2] hover:bg-[#8ef3da]',
                text: 'text-[#0a382b]',
                checkBorder: 'border-[#0a382b]/50 hover:border-[#0a382b]',
                checkBg: 'bg-[#0a382b]',
                checkText: 'text-[#80eed2]',
                handleBorder: 'border-[#0a382b]/50',
              };
            }
          }
          return { task, span, palette };
        })
        .filter(
          (
            item
          ): item is {
            task: Task;
            span: { colStart: number; colEnd: number; isMultiDay: boolean };
            palette: typeof palettes[0];
          } => item.span !== null && item.span.isMultiDay
        )
    : [];

  const spanningTaskIds = new Set(spanningTasks.map((s) => s.task.id));
  const otherTasks = filteredTasks.filter((t) => !spanningTaskIds.has(t.id));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* 1. Asana Secondary Control Toolbar */}
      <div className="h-[46px] min-h-[46px] px-6 border-b border-[#262729] flex items-center justify-between text-[13px] bg-[#1e1f21] relative z-50">
        {/* Left Side: + Add task split button & Date Navigation */}
        <div className="flex items-center gap-3">
          {/* Blue + Add task split button */}
          <AddTaskSplitButton
            canAddSection={false}
            onAddTask={(type) => {
              const defaultName = type === 'milestone' ? 'New milestone' : type === 'approval' ? 'New approval' : 'New task';
              const created = createTask({
                name: defaultName,
                dueDate: 'Today – Nov 3',
                section: 'To do',
                taskType: type,
                projectId: 'kevins-first-project',
                priority: 'Low',
              });
              if (created?.id) {
                openTaskDrawer(created.id);
              }
            }}
          />

          {/* Navigation: < Today > */}
          <div className="flex items-center gap-1 ml-1 text-[#8a8886]">
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-[13px] font-medium text-[#c5c3c0] hover:text-white hover:bg-[#28292c] rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month & Year Label */}
          <span className="text-[13.5px] font-medium text-[#c5c3c0] ml-1">
            November 2026
          </span>
        </div>

        {/* Right Side: Weeks Dropdown, Filter, Options, Search */}
        <div className="flex items-center gap-2 text-[#bdbbb9] text-[12.5px]">
          {/* Weeks View Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsViewDropdownOpen(!isViewDropdownOpen);
                setIsFilterOpen(false);
                setIsOptionsDrawerOpen(false);
              }}
              className="flex items-center gap-1.5 text-[#c5c3c0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>{viewMode === 'weeks' ? 'Weeks' : 'Month'}</span>
              <ChevronDown className="w-3 h-3 text-[#8a8886]" />
            </button>

            {isViewDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#252628] border border-[#343639] rounded-xl shadow-xl z-30 py-1">
                <button
                  onClick={() => {
                    setViewMode('weeks');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                    viewMode === 'weeks' ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span>Weeks</span>
                  {viewMode === 'weeks' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setViewMode('month');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                    viewMode === 'month' ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span>Month</span>
                  {viewMode === 'month' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

            {/* Vertical Divider */}
            <div className="h-4 w-px bg-[#323337] mx-0.5" />

            {/* Filter Button: Active Blue Pill (Filters: N ✕) or Inactive Neutral Button */}
            {calendarFilters.length > 0 ? (
              <div className="flex items-center bg-[#153468] hover:bg-[#1a3f7c] border border-[#2b529a] text-[#8ab4f8] rounded-lg h-7 px-2.5 text-[12px] font-medium transition-colors shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerInitialView('filters');
                    setIsOptionsDrawerOpen(true);
                    setIsViewDropdownOpen(false);
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ListFilter className="w-3.5 h-3.5 text-[#8ab4f8]" />
                  <span>Filters: {calendarFilters.length}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilters();
                  }}
                  className="ml-1.5 p-0.5 rounded hover:bg-white/10 hover:text-white text-[#8ab4f8] transition-colors"
                  title="Clear all filters"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDrawerInitialView('filters');
                  setIsOptionsDrawerOpen(true);
                  setIsViewDropdownOpen(false);
                  setIsFilterOpen(false);
                }}
                className="flex items-center gap-1.5 text-[#c5c3c0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
              >
                <ListFilter className="w-3.5 h-3.5 text-[#8a8886]" />
                <span>Filter</span>
              </button>
            )}

            {/* Vertical Divider */}
            <div className="h-4 w-px bg-[#323337] mx-0.5" />

            {/* Options Button */}
            <button
              onClick={() => {
                setDrawerInitialView('main');
                setIsOptionsDrawerOpen(true);
                setIsViewDropdownOpen(false);
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-1.5 text-[#c5c3c0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Options</span>
            </button>

            {/* Search Icon */}
            <button
              onClick={() => alert('Search in calendar view')}
              className="hover:text-white p-1.5 rounded-lg hover:bg-[#28292c] transition-colors ml-0.5"
              title="Search tasks"
            >
              <Search className="w-3.5 h-3.5 text-[#8a8886]" />
            </button>
        </div>
      </div>

      {/* 2. Main Calendar Content: Weeks View (Matching Asana screenshot) */}
      {viewMode === 'weeks' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Day of week header columns */}
          <div
            className={`grid border-b border-[#262729] bg-[#1e1f21]`}
            style={{
              gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
            }}
          >
            {weekDays.map((day) => {
              // Today is Tuesday 3 (in base week offset 0)
              const isToday = weekOffset === 0 && day.dayNumber === 3;

              return (
                <div
                  key={day.dayNumber}
                  className={`px-4 py-2.5 flex flex-col items-start border-r border-[#262729] last:border-r-0 ${
                    isToday ? 'bg-[#212327]' : ''
                  }`}
                >
                  <span className="text-[12px] font-medium text-[#8a8886] mb-1">
                    {day.name}
                  </span>
                  {isToday ? (
                    <div className="w-7 h-7 rounded-lg bg-[#4573d2] text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                      {day.dayNumber}
                    </div>
                  ) : (
                    <span className="text-[19px] font-bold text-[#f5f4f3] leading-tight">
                      {day.dayNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Spanning Task Bars Area (Directly below header) */}
          <div
            className="grid border-b border-[#262729] py-2 px-1 gap-y-2 bg-[#1e1f21] relative min-h-[76px]"
            style={{
              gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
            }}
          >
            {spanningTasks.map(({ task, span, palette }) => {
              const isActive = activeTaskId === task.id;

              return (
                <div
                  key={task.id}
                  style={{
                    gridColumnStart: span.colStart,
                    gridColumnEnd: span.colEnd,
                  }}
                  onClick={() => openTaskDrawer(task.id)}
                  className={`h-[30px] rounded-lg ${palette.bg} ${palette.text} flex items-center justify-between px-2.5 shadow-sm cursor-pointer transition-all mx-1 group ${
                    isActive ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-[#1e1f21]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed
                          ? `${palette.checkBg} border-transparent ${palette.checkText}`
                          : palette.checkBorder
                      }`}
                    >
                      {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                    <span
                      className={`truncate font-semibold text-[13px] ${
                        task.completed ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>

                  {/* Right square resize handle */}
                  <span
                    className={`w-3 h-3 rounded-xs border ${palette.handleBorder} opacity-60 group-hover:opacity-100 flex-shrink-0`}
                  ></span>
                </div>
              );
            })}
          </div>

          {/* Vertical Day Columns Grid with subtle '+ Add task' centered in each */}
          <div
            className="flex-1 grid min-h-[460px] bg-[#1e1f21]"
            style={{
              gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
            }}
          >
            {weekDays.map((day) => {
              const isToday = weekOffset === 0 && day.dayNumber === 3;

              // Any tasks specifically due on this day
              const dayTasks = otherTasks.filter((t) => {
                const text = (t.dueDate || '').toLowerCase();
                return (
                  text.includes(`nov ${day.dayNumber}`) ||
                  (isToday && text.includes('today'))
                );
              });

              return (
                <div
                  key={day.dayNumber}
                  className={`border-r border-[#262729] last:border-r-0 flex flex-col justify-start p-2.5 relative group transition-colors ${
                    isToday ? 'bg-[#202226]/40' : 'hover:bg-[#232427]/40'
                  }`}
                >
                  {/* Single day task chips */}
                  <div className="space-y-1.5 w-full">
                    {dayTasks.map((t) => {
                      const isMilestone = (t as any).taskType === 'milestone' || t.name.toLowerCase().includes('milestone');
                      const isApproval = (t as any).taskType === 'approval' || t.name.toLowerCase().includes('approval');

                      return (
                        <div
                          key={t.id}
                          onClick={() => openTaskDrawer(t.id)}
                          className={`bg-[#2a2b2f] hover:bg-[#333539] border text-white p-2 rounded-lg text-[12px] truncate cursor-pointer transition-colors shadow-sm flex items-center justify-between gap-2 ${
                            activeTaskId === t.id
                              ? 'border-white ring-1 ring-white/50'
                              : 'border-[#3a3b3e]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                t.completed
                                  ? 'bg-[#38b273] border-[#38b273] text-white'
                                  : 'border-[#5e5c5a] hover:border-white'
                              }`}
                            >
                              {t.completed && <Check className="w-2 h-2 stroke-[3]" />}
                            </button>
                            <span
                              className={`truncate font-medium ${
                                t.completed ? 'line-through text-[#8a8886]' : ''
                              }`}
                            >
                              {t.name}
                            </span>
                          </div>

                          {isMilestone && (
                            <span className="shrink-0 text-[10px] bg-[#3e2c1c] text-[#f8be4e] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Milestone
                            </span>
                          )}
                          {isApproval && (
                            <span className="shrink-0 text-[10px] bg-[#1e2f47] text-[#85c5f8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Approval
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Centered subtle '+ Add task' button matching Asana screenshot */}
                  <div className="pt-6 flex justify-center w-full">
                    <button
                      onClick={() => handleCreateForDay(day.dayNumber)}
                      className="text-[12.5px] text-[#8a8886] hover:text-white flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-all hover:bg-[#28292c] px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Month View (Full 35-day grid) */
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4">
          <div className="grid grid-cols-7 border-b border-[#2b2c2e] pb-2 text-[12px] font-semibold text-[#8a8886] text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-5 flex-1 border-b border-r border-[#262729] min-h-[500px]">
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i + 1;
              const isNov = dayNumber <= 30;
              const displayDay = isNov ? dayNumber : dayNumber - 30;
              const isToday = isNov && displayDay === 3;

              const matching = filteredTasks.filter((t) => {
                if (!isNov) return false;
                const text = (t.dueDate || '').toLowerCase();
                if (text.includes(`nov ${displayDay}`)) return true;
                if (displayDay === 3 && text.includes('today')) return true;
                if (displayDay === 2 && text.includes('yesterday')) return true;
                return false;
              });

              return (
                <div
                  key={i}
                  onClick={() => isNov && handleCreateForDay(displayDay)}
                  className={`border-t border-l border-[#262729] p-2 flex flex-col justify-start transition-colors cursor-pointer group ${
                    isNov ? 'bg-[#1e1f21] hover:bg-[#232427]' : 'bg-[#18191a] opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday
                          ? 'bg-[#4573d2] text-white shadow-sm'
                          : 'text-[#8a8886] group-hover:text-white'
                      }`}
                    >
                      {displayDay}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {matching.map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDrawer(task.id);
                        }}
                        className={`text-[11px] p-1.5 rounded-md truncate font-medium cursor-pointer transition-colors shadow-sm ${
                          task.name.toLowerCase().includes('task 1')
                            ? 'bg-[#80eed2] text-[#0a382b]'
                            : task.name.toLowerCase().includes('task 2')
                            ? 'bg-[#f8be4e] text-[#3d2402]'
                            : 'bg-[#2a2b2f] text-white'
                        }`}
                      >
                        {task.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Options Side Panel matching Asana screenshots */}
      <CalendarOptionsDrawer
        isOpen={isOptionsDrawerOpen}
        onClose={() => setIsOptionsDrawerOpen(false)}
        initialView={drawerInitialView}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        showWeekends={showWeekends}
        onToggleWeekends={() => setShowWeekends(!showWeekends)}
        showMultiDayTasks={showMultiDayTasks}
        onToggleMultiDayTasks={() => setShowMultiDayTasks(!showMultiDayTasks)}
        taskColorMode={taskColorMode}
        onTaskColorModeChange={(mode) => setTaskColorMode(mode)}
        filters={calendarFilters}
        onAddFilter={handleAddFilter}
        onUpdateFilter={handleUpdateFilter}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
