'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle2,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskTimelineProps {
  tasks: Task[];
  sections: string[];
  projectId?: string;
}

// Generate calendar days around late Oct - mid Nov (matching Asana video frame 100)
interface DayCol {
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  dateKey: string;
}

export default function TaskTimeline({ tasks, sections, projectId }: TaskTimelineProps) {
  const { openTaskDrawer, createTask } = useApp();
  const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks'>('days');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Today is November 4
  const todayDay = 4;
  const todayMonth = 'November';

  // Build 30 days: Oct 21 - Oct 31, and Nov 1 - Nov 19
  const days: DayCol[] = useMemo(() => {
    const list: DayCol[] = [];
    // Oct 21 - 31
    for (let d = 21; d <= 31; d++) {
      list.push({
        dayNumber: d,
        monthName: 'October',
        isToday: false,
        dateKey: `2026-10-${d}`,
      });
    }
    // Nov 1 - 19
    for (let d = 1; d <= 19; d++) {
      list.push({
        dayNumber: d,
        monthName: 'November',
        isToday: d === todayDay,
        dateKey: `2026-11-${d}`,
      });
    }
    return list;
  }, []);

  // Today col index
  const todayIndex = days.findIndex((d) => d.isToday);

  // Group days by month for top header
  const octCount = days.filter((d) => d.monthName === 'October').length;
  const novCount = days.filter((d) => d.monthName === 'November').length;

  const colWidth = 44; // pixels per day

  // Color assignments matching Asana timeline video
  const getTaskBarColor = (index: number) => {
    const colors = [
      'bg-[#45d3b6] text-black', // cyan / teal
      'bg-[#f5b324] text-black', // amber / orange
      'bg-[#b28df5] text-black', // purple
      'bg-[#4573d2] text-white', // blue
      'bg-[#f06a6a] text-white', // red
    ];
    return colors[index % colors.length];
  };

  // Helper to determine start and duration days for a task
  const getTaskRange = (t: Task, index: number) => {
    // Nov 2 - Today (Task 1)
    if (t.name.toLowerCase().includes('task 1') || index === 0) {
      return { startCol: octCount + 1, span: 3 }; // Nov 2 - Nov 4
    }
    // Nov 3 - 5 (Task 2)
    if (t.name.toLowerCase().includes('task 2') || index === 1) {
      return { startCol: octCount + 2, span: 3 }; // Nov 3 - Nov 5
    }
    // Nov 4 - 6 (Task 3)
    if (t.name.toLowerCase().includes('task 3') || index === 2) {
      return { startCol: octCount + 3, span: 3 }; // Nov 4 - Nov 6
    }
    // Fallback: staggered placement around today
    const start = Math.max(0, octCount + (index % 10) - 2);
    return { startCol: start, span: 3 };
  };

  const handleQuickCreate = (section: string) => {
    createTask({
      name: `New task in ${section}`,
      section,
      projectId,
      dueDate: 'Nov 5',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* Timeline Toolbar (matching video frame 100) */}
      <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px]">
        {/* Left: Add task + Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuickCreate(sections[0] || 'To do')}
            className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add task</span>
          </button>

          {/* Today Navigation */}
          <div className="flex items-center border border-[#37383b] rounded-lg bg-[#252628] text-[12px] overflow-hidden">
            <button
              onClick={() => alert("Navigate earlier")}
              className="px-2 py-1 hover:bg-[#2e3034] text-[#8a8886] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => alert("Scroll to today")}
              className="px-2.5 py-1 hover:bg-[#2e3034] text-white font-medium border-x border-[#37383b] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => alert("Navigate later")}
              className="px-2 py-1 hover:bg-[#2e3034] text-[#8a8886] hover:text-white transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Days Zoom + Filter + Sort + Options */}
        <div className="flex items-center gap-2 text-[12px]">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#37383b] bg-[#252628] text-white">
            <span className="font-medium mr-1">Days</span>
            <button
              onClick={() => setZoomLevel('weeks')}
              className="p-0.5 hover:text-[#4573d2] text-[#8a8886]"
              title="Zoom out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel('days')}
              className="p-0.5 hover:text-[#4573d2] text-[#8a8886]"
              title="Zoom in"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#37383b] bg-[#252628] text-[#cfcecd] hover:text-white hover:bg-[#2e3034] transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-44 bg-[#252628] border border-[#383a3e] rounded-xl shadow-2xl py-1 text-[12px]">
                <button
                  onClick={() => {
                    setFilterPriority('all');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#2e3034] text-white"
                >
                  All tasks
                </button>
                <button
                  onClick={() => {
                    setFilterPriority('High');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#2e3034] text-white"
                >
                  High priority only
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => alert("Sort timeline")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#37383b] bg-[#252628] text-[#cfcecd] hover:text-white hover:bg-[#2e3034] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8886]" />
            <span>Sort</span>
          </button>

          <button
            onClick={() => alert("Timeline display options")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#37383b] bg-[#252628] text-[#cfcecd] hover:text-white hover:bg-[#2e3034] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8a8886]" />
            <span>Options</span>
          </button>
        </div>
      </div>

      {/* Main Gantt Grid */}
      <div className="flex-1 flex overflow-auto relative">
        {/* Left Side: Section Names */}
        <div className="w-[180px] min-w-[180px] border-r border-[#2b2c2e] bg-[#1e1f21] z-20 shrink-0 select-none">
          {/* Header Spacer */}
          <div className="h-[52px] border-b border-[#2b2c2e] px-4 flex items-end pb-1.5 text-[11px] font-bold uppercase text-[#888684] tracking-wider">
            Sections
          </div>

          {/* Section rows */}
          <div className="py-2 space-y-8">
            {sections.map((sec) => (
              <div key={sec} className="px-4">
                <div className="flex items-center gap-1 text-[13px] font-bold text-white hover:text-[#4573d2] cursor-pointer">
                  <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                  <span>{sec}</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => alert("Add section")}
              className="flex items-center gap-1.5 px-4 text-[12px] text-[#8a8886] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add section</span>
            </button>
          </div>
        </div>

        {/* Right Side: Scrollable Calendar Grid */}
        <div className="flex-1 overflow-x-auto relative min-w-[1200px]">
          {/* Calendar Headers: Months & Days */}
          <div className="sticky top-0 z-10 bg-[#1e1f21] border-b border-[#2b2c2e]">
            {/* Top Month Header */}
            <div className="flex border-b border-[#2b2c2e]/60 text-[11px] font-semibold text-[#8a8886]">
              <div
                style={{ width: octCount * colWidth }}
                className="px-3 py-1 border-r border-[#2b2c2e]/60"
              >
                October
              </div>
              <div style={{ width: novCount * colWidth }} className="px-3 py-1">
                November
              </div>
            </div>

            {/* Bottom Day Numbers */}
            <div className="flex text-[11.5px] text-[#8a8886] h-[28px] items-center">
              {days.map((d, idx) => (
                <div
                  key={d.dateKey}
                  style={{ width: colWidth }}
                  className={`text-center shrink-0 flex items-center justify-center font-medium ${
                    d.isToday ? 'text-white' : ''
                  }`}
                >
                  <span
                    className={
                      d.isToday
                        ? 'w-5 h-5 rounded-full bg-[#4573d2] text-white flex items-center justify-center font-bold text-[11px]'
                        : ''
                    }
                  >
                    {d.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today Vertical Line Indicator */}
          {todayIndex >= 0 && (
            <div
              className="absolute top-[52px] bottom-0 z-10 pointer-events-none border-l-2 border-[#4573d2]"
              style={{ left: todayIndex * colWidth + colWidth / 2 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#4573d2] -ml-[4px] -mt-1" />
            </div>
          )}

          {/* Vertical Day Grid Background Lines */}
          <div className="absolute inset-0 top-[52px] flex pointer-events-none">
            {days.map((d) => (
              <div
                key={`line-${d.dateKey}`}
                style={{ width: colWidth }}
                className={`border-r border-[#252628]/70 shrink-0 h-full ${
                  d.isToday ? 'bg-[#4573d2]/5' : ''
                }`}
              />
            ))}
          </div>

          {/* Task Bars Content Rows */}
          <div className="relative pt-4 pb-12 space-y-8 z-10">
            {sections.map((sectionName) => {
              const secTasks = tasks.filter((t) => t.section === sectionName);

              return (
                <div key={sectionName} className="space-y-3 min-h-[50px]">
                  {secTasks.length > 0 ? (
                    secTasks.map((t, idx) => {
                      const range = getTaskRange(t, idx);
                      const barColor = getTaskBarColor(idx);
                      const leftPos = range.startCol * colWidth + 4;
                      const barWidth = range.span * colWidth - 8;

                      return (
                        <div key={t.id} className="relative h-[34px]">
                          <div
                            onClick={() => openTaskDrawer(t.id)}
                            style={{
                              left: leftPos,
                              width: barWidth,
                            }}
                            className={`absolute top-0 h-[32px] rounded-lg ${barColor} px-2.5 py-1 text-[12px] font-semibold flex items-center gap-2 cursor-pointer shadow-md hover:brightness-110 transition-all truncate`}
                          >
                            {/* KS Avatar badge */}
                            <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {t.assignee?.initials || 'KS'}
                            </div>
                            <span className="truncate">{t.name}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Dotted Empty Slot placeholder matching Asana */
                    <div className="relative h-[34px]">
                      <div
                        onClick={() => handleQuickCreate(sectionName)}
                        style={{
                          left: (octCount + 3) * colWidth + 4,
                          width: colWidth * 3 - 8,
                        }}
                        className="absolute top-0 h-[32px] rounded-lg border border-dashed border-[#44464a] hover:border-[#4573d2] text-[#8a8886] hover:text-white px-3 flex items-center justify-center text-[11.5px] cursor-pointer transition-colors"
                      >
                        Click anywhere to create a task
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
