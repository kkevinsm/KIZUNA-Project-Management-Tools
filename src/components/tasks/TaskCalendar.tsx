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
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import CalendarOptionsDrawer from './CalendarOptionsDrawer';

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
    endNum = text.includes('nov 4') ? 4 : 2;
  }

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
  const [showWeekends, setShowWeekends] = useState(true);
  const [showMultiDayTasks, setShowMultiDayTasks] = useState(true);
  const [taskColorMode, setTaskColorMode] = useState<'default' | 'priority' | 'project'>('default');

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

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'completed') return t.completed;
    if (filterMode === 'incomplete') return !t.completed;
    return true;
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
      <div className="h-[46px] min-h-[46px] px-6 border-b border-[#262729] flex items-center justify-between text-[13px] bg-[#1e1f21]">
        {/* Left Side: + Add task split button & Date Navigation */}
        <div className="flex items-center gap-3">
          {/* Blue + Add task split button */}
          <div className="flex items-center shadow-sm">
            <button
              onClick={() => openCreateModal('task')}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3 py-1.5 rounded-l-lg font-medium text-[12.5px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add task</span>
            </button>
            <button
              onClick={() => openCreateModal('task')}
              className="bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 py-1.5 rounded-r-lg border-l border-white/20 text-[12px] transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

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

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsViewDropdownOpen(false);
                setIsOptionsDrawerOpen(false);
              }}
              className="flex items-center gap-1.5 text-[#c5c3c0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
            >
              <ListFilter className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#252628] border border-[#343639] rounded-xl shadow-xl z-30 py-1">
                <button
                  onClick={() => {
                    setFilterMode('all');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                    filterMode === 'all' ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span>All tasks</span>
                  {filterMode === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setFilterMode('incomplete');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                    filterMode === 'incomplete' ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span>Incomplete tasks</span>
                  {filterMode === 'incomplete' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setFilterMode('completed');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                    filterMode === 'completed' ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span>Completed tasks</span>
                  {filterMode === 'completed' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Options Button */}
          <button
            onClick={() => {
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
            className="hover:text-white p-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
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
                  (day.dayNumber === 2 && text.includes('today'))
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
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openTaskDrawer(t.id)}
                        className={`bg-[#2a2b2f] hover:bg-[#333539] border text-white p-2 rounded-lg text-[12px] truncate cursor-pointer transition-colors shadow-sm flex items-center gap-2 ${
                          activeTaskId === t.id
                            ? 'border-white ring-1 ring-white/50'
                            : 'border-[#3a3b3e]'
                        }`}
                      >
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
                    ))}
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
                if (displayDay === 2 && (text.includes('today') || text.includes('nov 2'))) return true;
                if (displayDay === 3 && text.includes('nov 3')) return true;
                if (displayDay === 4 && text.includes('nov 4')) return true;
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
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        showWeekends={showWeekends}
        onToggleWeekends={() => setShowWeekends(!showWeekends)}
        showMultiDayTasks={showMultiDayTasks}
        onToggleMultiDayTasks={() => setShowMultiDayTasks(!showMultiDayTasks)}
        taskColorMode={taskColorMode}
        onTaskColorModeChange={(mode) => setTaskColorMode(mode)}
        filterMode={filterMode}
        onFilterModeChange={(mode) => setFilterMode(mode)}
      />
    </div>
  );
}
