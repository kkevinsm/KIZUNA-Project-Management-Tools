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

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const { openTaskDrawer, toggleTaskComplete, openCreateModal, createTask } = useApp();

  const [viewMode, setViewMode] = useState<'weeks' | 'month'>('weeks');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showWeekends, setShowWeekends] = useState(true);

  // Week offset from November 1-7, 2026 (base week 0)
  const [weekOffset, setWeekOffset] = useState(0);

  // Default week: Sunday Nov 1 – Saturday Nov 7, 2026
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

  // Multi-day spanning tasks matching Asana screenshot exactly:
  // Task 1: spans Mon 2 to Wed 4 (col 2 to col 4, 3 days)
  // Task 2: spans Tue 3 to Thu 5 (col 3 to col 5, 3 days)
  const task1 = filteredTasks.find((t) => t.name.toLowerCase().includes('task 1')) || filteredTasks[0];
  const task2 = filteredTasks.find((t) => t.name.toLowerCase().includes('task 2')) || filteredTasks[1];

  // Additional tasks that fall on specific days
  const otherTasks = filteredTasks.filter((t) => t.id !== task1?.id && t.id !== task2?.id);

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
                setIsOptionsOpen(false);
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
                setIsOptionsOpen(false);
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

          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsOptionsOpen(!isOptionsOpen);
                setIsViewDropdownOpen(false);
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-1.5 text-[#c5c3c0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Options</span>
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#252628] border border-[#343639] rounded-xl shadow-xl z-30 py-1.5">
                <button
                  onClick={() => setShowWeekends(!showWeekends)}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] text-white"
                >
                  <span>Show weekends</span>
                  {showWeekends && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
              </div>
            )}
          </div>

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
            {/* Task 1: Spans Mon 2 to Wed 4 (Mint / Turquoise #80eed2) */}
            {task1 && weekOffset === 0 && (
              <div
                style={{
                  gridColumnStart: showWeekends ? 2 : 1, // Mon is col 2 with weekends, col 1 without
                  gridColumnEnd: showWeekends ? 5 : 4,   // Spans through Wed 4
                }}
                onClick={() => openTaskDrawer(task1.id)}
                className="h-[30px] rounded-lg bg-[#80eed2] hover:bg-[#8ef3da] text-[#0a382b] flex items-center justify-between px-2.5 shadow-sm cursor-pointer transition-all mx-1 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task1.id);
                    }}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      task1.completed
                        ? 'bg-[#0a382b] border-[#0a382b] text-[#80eed2]'
                        : 'border-[#0a382b]/50 hover:border-[#0a382b]'
                    }`}
                  >
                    {task1.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span
                    className={`truncate font-semibold text-[13px] ${
                      task1.completed ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {task1.name}
                  </span>
                </div>

                {/* Right square resize handle */}
                <span className="w-3 h-3 rounded-xs border border-[#0a382b]/50 opacity-60 group-hover:opacity-100 flex-shrink-0"></span>
              </div>
            )}

            {/* Task 2: Spans Tue 3 to Thu 5 (Amber / Gold #f8be4e) */}
            {task2 && weekOffset === 0 && (
              <div
                style={{
                  gridColumnStart: showWeekends ? 3 : 2, // Tue is col 3 with weekends, col 2 without
                  gridColumnEnd: showWeekends ? 6 : 5,   // Spans through Thu 5
                }}
                onClick={() => openTaskDrawer(task2.id)}
                className="h-[30px] rounded-lg bg-[#f8be4e] hover:bg-[#fac561] text-[#3d2402] flex items-center justify-between px-2.5 shadow-sm cursor-pointer transition-all mx-1 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task2.id);
                    }}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      task2.completed
                        ? 'bg-[#3d2402] border-[#3d2402] text-[#f8be4e]'
                        : 'border-[#3d2402]/50 hover:border-[#3d2402]'
                    }`}
                  >
                    {task2.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span
                    className={`truncate font-semibold text-[13px] ${
                      task2.completed ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {task2.name}
                  </span>
                </div>

                {/* Right square resize handle */}
                <span className="w-3 h-3 rounded-xs border border-[#3d2402]/50 opacity-60 group-hover:opacity-100 flex-shrink-0"></span>
              </div>
            )}
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

              // Any other tasks specifically due on this day
              const dayTasks = otherTasks.filter((t) =>
                t.dueDate.toLowerCase().includes(`nov ${day.dayNumber}`)
              );

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
                        className="bg-[#2a2b2f] hover:bg-[#333539] border border-[#3a3b3e] text-white p-2 rounded-lg text-[12px] truncate cursor-pointer transition-colors shadow-sm flex items-center gap-2"
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
                        <span className={`truncate font-medium ${t.completed ? 'line-through text-[#8a8886]' : ''}`}>
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
                if (displayDay === 2 && t.dueDate.includes('Nov 2')) return true;
                if (displayDay === 3 && (t.dueDate.includes('Today') || t.dueDate.includes('Nov 3'))) return true;
                if (displayDay === 4 && t.dueDate.includes('Nov 4')) return true;
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
    </div>
  );
}
