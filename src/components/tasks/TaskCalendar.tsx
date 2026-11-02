'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const { openTaskDrawer } = useApp();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Grid of 35 days for November 2026 (Nov 1 is Sunday)
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i + 1;
    return {
      day: dayNumber <= 30 ? dayNumber : dayNumber - 30,
      isCurrentMonth: dayNumber <= 30,
      dateString: dayNumber <= 30 ? `2026-11-${String(dayNumber).padStart(2, '0')}` : '',
    };
  });

  return (
    <div className="p-4 flex flex-col h-full select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-bold text-white">November 2026</h2>
          <div className="flex items-center gap-1 border border-[#37383b] rounded-lg p-0.5">
            <button className="p-1 rounded hover:bg-[#28292c] text-[#8a8886] hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-[#28292c] text-[#8a8886] hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="text-[12px] font-medium bg-[#252628] hover:bg-[#2e2f32] text-white px-3 py-1.5 rounded-lg border border-[#37383b]">
          Today
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-[#2b2c2e] pb-2 text-[12px] font-semibold text-[#8a8886] text-center">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 border-b border-r border-[#2b2c2e] min-h-[500px]">
        {calendarDays.map((cal, idx) => {
          // Find tasks that match this day (Nov 2, Nov 3, Nov 4, etc.)
          const matchingTasks = tasks.filter((t) => {
            if (!cal.isCurrentMonth) return false;
            if (cal.day === 2 && t.dueDate.includes('Today')) return true;
            if (cal.day === 3 && t.dueDate.includes('Nov 3')) return true;
            if (cal.day === 4 && t.dueDate.includes('Nov 4')) return true;
            return false;
          });

          const isToday = cal.isCurrentMonth && cal.day === 2;

          return (
            <div
              key={idx}
              className={`border-t border-l border-[#2b2c2e] p-2 flex flex-col justify-start transition-colors ${
                cal.isCurrentMonth ? 'bg-[#1e1f21]' : 'bg-[#18191a] opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-[#4573d2] text-white'
                      : 'text-[#8a8886]'
                  }`}
                >
                  {cal.day}
                </span>
              </div>

              {/* Day task chips */}
              <div className="space-y-1 overflow-hidden">
                {matchingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openTaskDrawer(task.id)}
                    className="bg-[#2a2b2e] hover:bg-[#333538] border border-[#3a3b3e] text-white text-[11px] p-1.5 rounded truncate cursor-pointer transition-colors shadow-sm"
                  >
                    <span className="font-medium">{task.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
