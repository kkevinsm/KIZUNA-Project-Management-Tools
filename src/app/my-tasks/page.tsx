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
import TaskFiles from '@/components/tasks/TaskFiles';
import ManagePrivacyModal from '@/components/modals/ManagePrivacyModal';
import CustomizeDrawer from '@/components/layout/CustomizeDrawer';

export default function MyTasksPage() {
  const { tasks, currentUser, viewConfigs } = useApp();

  const [activeTab, setActiveTab] = useState<'List' | 'Board' | 'Calendar' | 'Dashboard' | 'Files'>('List');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
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
              onClick={() => setIsPrivacyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
          <div className="flex items-center gap-1.5 text-[13px] font-medium pb-1">
            {(['List', 'Board', 'Calendar', 'Dashboard', 'Files'] as const).map((tab) => {
              const config = viewConfigs[tab] || { name: tab, icon: '' };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${isActive
                      ? 'bg-[#0c326f] text-white font-medium shadow-xs'
                      : 'text-[#a2a09e] hover:text-white hover:bg-[#252628]/40'
                    }`}
                >
                  {config.icon && <span className="text-[14px] leading-none">{config.icon}</span>}
                  <span>{config.name || tab}</span>
                </button>
              );
            })}
            <button
              onClick={() => alert('Add view tab: Timeline, Gantt, Form')}
              className="text-[#8a8886] hover:text-white px-2 py-1 font-bold rounded-lg hover:bg-[#252628]/40 transition-colors cursor-pointer text-[14px]"
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

          {activeTab === 'Files' && <TaskFiles tasks={tasks} projectName="My tasks" />}
        </div>

        {/* Share: Manage Privacy Modal (matching Video 3 frame 005-015) */}
        <ManagePrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

        {/* Customize Right-Side Drawer (matching Video 3 frame 020-068) */}
        <CustomizeDrawer
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          contextTitle="My tasks"
        />
      </div>
      );
}
