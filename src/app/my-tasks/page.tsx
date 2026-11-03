'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Lock,
  Share2,
  SlidersHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  MoreHorizontal,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskRow from '@/components/tasks/TaskRow';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import FileManager from '@/components/files/FileManager';

export default function MyTasksPage() {
  const { tasks, currentUser, openCreateModal, createTask } = useApp();

  const [activeTab, setActiveTab] = useState<'List' | 'Board' | 'Calendar' | 'Dashboard' | 'Files'>('List');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [inlineNewTaskSection, setInlineNewTaskSection] = useState<string | null>(null);
  const [inlineTaskName, setInlineTaskName] = useState('');

  const sections = ['Recently assigned', 'Do today', 'Do next week', 'Do later'];

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInlineCreate = (section: string) => {
    if (!inlineTaskName.trim()) {
      setInlineNewTaskSection(null);
      return;
    }

    createTask({
      name: inlineTaskName.trim(),
      section: 'To do', // Map to default project section
      dueDate: 'Today – Nov 4',
      projectId: 'kevins-first-project',
    });

    setInlineTaskName('');
    setInlineNewTaskSection(null);
  };

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
              onClick={() => alert("Share settings for My Tasks")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => alert("Customize My Tasks")}
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
              className={`pb-2.5 transition-colors relative ${activeTab === tab
                  ? 'text-white font-semibold'
                  : 'text-[#8a8886] hover:text-[#bdbbb9]'
                }`}
            >
              <span>{tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2] rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={() => alert("Add view tab: Timeline, Gantt, Form")}
            className="text-[#8a8886] hover:text-white pb-2.5 font-bold"
            title="Add tab"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      {activeTab === 'List' && (
        <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px]">
          {/* Add task split button */}
          <div className="flex items-center">
            <button
              onClick={() => openCreateModal('task')}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3 py-1.5 rounded-l-lg font-medium text-[12px] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add task</span>
            </button>
            <button
              onClick={() => openCreateModal('task')}
              className="bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 py-1.5 rounded-r-lg border-l border-[#3562be] text-[12px] transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right action controls */}
          <div className="flex items-center gap-3 text-[#bdbbb9] text-[12px]">
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <Layers className="w-3.5 h-3.5" />
              <span>Group</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
            <button className="p-1 rounded hover:bg-[#28292c] hover:text-white">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'List' && (
          <div>
            {/* Table Header */}
            <div className="flex items-center h-[32px] px-4 border-b border-[#2b2c2e] text-[#8a8886] font-semibold text-[11px] uppercase tracking-wider select-none">
              <div className="w-[30px]" />
              <div className="flex-1 min-w-[200px] pr-4">Name</div>
              <div className="w-[180px] hidden md:block px-2">Projects</div>
              <div className="w-[140px] hidden lg:block px-2">Task visibility</div>
              <div className="w-[130px] hidden sm:block px-2">Due date</div>
              <div className="w-[30px] flex items-center justify-center">
                <Plus className="w-3 h-3 text-[#6d6c6e]" />
              </div>
            </div>

            {/* Sections */}
            <div className="pb-12">
              {sections.map((sectionName) => {
                const isCollapsed = collapsedSections[sectionName];
                // In Asana screenshot, Task 2 & Task 1 are under "Recently assigned"
                const sectionTasks =
                  sectionName === 'Recently assigned'
                    ? tasks
                    : [];

                return (
                  <div key={sectionName} className="border-b border-[#252628]">
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSection(sectionName)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#252628] cursor-pointer group text-[13px] font-bold text-white transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      )}
                      <span>{sectionName}</span>
                    </div>

                    {/* Section Tasks */}
                    {!isCollapsed && (
                      <div>
                        {sectionTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            showProjectColumn={true}
                            showVisibilityColumn={true}
                          />
                        ))}

                        {/* Inline add task input or button */}
                        {inlineNewTaskSection === sectionName ? (
                          <div className="flex items-center h-[38px] px-8 border-b border-[#2b2c2e] bg-[#252628]">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Write a task name..."
                              value={inlineTaskName}
                              onChange={(e) => setInlineTaskName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlineCreate(sectionName);
                                if (e.key === 'Escape') setInlineNewTaskSection(null);
                              }}
                              className="w-full bg-transparent text-white text-[13px] outline-none"
                            />
                            <button
                              onClick={() => handleInlineCreate(sectionName)}
                              className="text-[12px] bg-[#4573d2] text-white px-2.5 py-0.5 rounded font-medium ml-2"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setInlineNewTaskSection(null)}
                              className="text-[12px] text-[#8a8886] hover:text-white px-2 py-0.5 ml-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInlineNewTaskSection(sectionName)}
                            className="flex items-center gap-2 h-[34px] px-10 text-[12px] text-[#8a8886] hover:text-white hover:bg-[#252628] w-full text-left transition-colors"
                          >
                            <span>Add task</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add section button */}
              <button
                onClick={() => alert("Add new section")}
                className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#8a8886] hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add section</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Board' && (
          <TaskBoard sections={sections} tasks={tasks} />
        )}

        {activeTab === 'Calendar' && <TaskCalendar tasks={tasks} />}

        {activeTab === 'Dashboard' && (
          <TaskDashboard tasks={tasks} projectName="My Tasks" />
        )}

        {activeTab === 'Files' && <FileManager />}
      </div>
    </div>
  );
}

