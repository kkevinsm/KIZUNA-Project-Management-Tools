'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskList from '@/components/tasks/TaskList';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import FileManager from '@/components/files/FileManager';

export default function MyTasksPage() {
  const { tasks, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'List' | 'Board' | 'Calendar' | 'Dashboard' | 'Files'>('List');
  const sections = ['Recently assigned', 'Do today', 'Do next week', 'Do later'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none">
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

      {/* Main Content Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'List' && <TaskList tasks={tasks} initialSections={sections} />}

        {activeTab === 'Board' && <TaskBoard sections={sections} tasks={tasks} />}

        {activeTab === 'Calendar' && <TaskCalendar tasks={tasks} />}

        {activeTab === 'Dashboard' && (
          <TaskDashboard tasks={tasks} projectName="My Tasks" />
        )}

        {activeTab === 'Files' && <FileManager />}
      </div>
    </div>
  );
}
