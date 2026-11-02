'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Check,
  Users,
  Plus,
  MoreHorizontal,
  Lock,
  ListTodo,
  Play,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const {
    tasks,
    projects,
    currentUser,
    openTaskDrawer,
    toggleTaskComplete,
    openCreateModal,
  } = useApp();

  const [taskFilter, setTaskFilter] = useState<'Upcoming' | 'Overdue' | 'Completed'>('Upcoming');

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'Completed') return t.completed;
    if (taskFilter === 'Overdue') return !t.completed && t.dueDate.toLowerCase().includes('overdue');
    return !t.completed;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full select-none space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] text-[#8a8886] font-medium">
            Monday, November 2
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight mt-0.5">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
        </div>

        {/* Right stats bar */}
        <div className="flex items-center gap-4 text-[13px] text-[#8a8886]">
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <span>My week</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#4cd195]" />
            <span>{completedCount} tasks completed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#8a8886]" />
            <span>0 collaborators</span>
          </div>

          <button
            onClick={() => alert("Customize Dashboard: Add or rearrange widgets")}
            className="flex items-center gap-1 bg-[#252628] hover:bg-[#2e2f32] text-white px-3 py-1.5 rounded-lg border border-[#37383b] transition-colors font-medium text-[12px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add widgets</span>
          </button>
        </div>
      </div>

      {/* Row 1: My tasks & Projects widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: My tasks */}
        <div className="bg-[#252628] border border-[#333538] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                  <span>My tasks</span>
                  <Lock className="w-3.5 h-3.5 text-[#8a8886]" />
                </h2>
              </div>

              <button className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 mb-4 text-[13px]">
              {(['Upcoming', 'Overdue', 'Completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    taskFilter === tab
                      ? 'bg-[#4573d2] text-white shadow-sm'
                      : 'text-[#8a8886] hover:text-white hover:bg-[#2e2f32]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Create task inline button */}
            <button
              onClick={() => openCreateModal('task')}
              className="flex items-center gap-1.5 text-[13px] text-[#8a8886] hover:text-white mb-3 px-1 py-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create task</span>
            </button>

            {/* Task list rows */}
            <div className="space-y-1">
              {filteredTasks.length === 0 ? (
                <div className="text-[13px] text-[#6d6c6e] py-6 text-center">
                  No {taskFilter.toLowerCase()} tasks right now
                </div>
              ) : (
                filteredTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openTaskDrawer(task.id)}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#2c2d30] cursor-pointer transition-colors group text-[13px]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className={`w-[17px] h-[17px] rounded-full border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-[#38b273] border-[#38b273] text-white'
                            : 'border-[#555659] hover:border-white'
                        }`}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span
                        className={`truncate font-medium ${
                          task.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[12px] text-[#8a8886] flex-shrink-0">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold"
                        style={{ backgroundColor: task.assignee.avatarColor || '#d84b7f' }}
                      >
                        {task.assignee.initials || 'KS'}
                      </div>
                      <span className="truncate max-w-[90px] hidden sm:inline">
                        {task.assignee.name.split(' ')[0]}...
                      </span>
                      <span className="truncate">{task.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div className="bg-[#252628] border border-[#333538] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 font-bold text-[16px] text-white">
                <span>Projects</span>
                <button className="flex items-center gap-1 text-[13px] text-[#8a8886] hover:text-white font-normal ml-1">
                  <span>Recents</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Dashed Create Project Button */}
              <button
                onClick={() => openCreateModal('project')}
                className="border border-dashed border-[#3c3e42] hover:border-[#55585e] hover:bg-[#2b2c2f] rounded-xl p-4 flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg border border-dashed border-[#55585e] flex items-center justify-center text-[#8a8886]">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[13px] font-medium text-[#bdbbb9]">
                  Create project
                </span>
              </button>

              {/* Kevin's first project Card */}
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/project/${proj.id}`}
                  className="bg-[#2b2c2f] hover:bg-[#323337] border border-[#37383b] rounded-xl p-4 flex items-center gap-3 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#37383b] flex items-center justify-center text-white">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-[13px] font-semibold text-white truncate">
                      {proj.name}
                    </div>
                    <div className="text-[11px] text-[#8a8886] truncate">
                      {tasks.filter((t) => t.projectId === proj.id).length} tasks due soon
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Learn Asana Banner */}
      <div className="bg-[#252628] border border-[#333538] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-white">Learn Asana</h2>
          <button className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Getting started */}
          <div className="bg-[#1e1f21] rounded-xl overflow-hidden border border-[#333538] flex flex-col group hover:border-[#44464a] transition-all">
            <div className="h-32 bg-gradient-to-br from-[#4a1224] to-[#260912] flex items-center justify-center relative p-4">
              <span className="text-4xl">🚀</span>
              <span className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Play className="w-3 h-3 fill-white" /> 3 min
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[13px] text-white group-hover:text-[#4573d2] transition-colors">
                  Getting started
                </h3>
                <p className="text-[12px] text-[#8a8886] mt-1 leading-snug">
                  Learn the basics and see how Asana helps you get work done.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Automate work with automations */}
          <div className="bg-[#1e1f21] rounded-xl overflow-hidden border border-[#333538] flex flex-col group hover:border-[#44464a] transition-all">
            <div className="h-32 bg-gradient-to-br from-[#4a1224] to-[#260912] flex items-center justify-center relative p-4">
              <span className="text-4xl">⚡</span>
              <span className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Play className="w-3 h-3 fill-white" /> 3 min
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[13px] text-white group-hover:text-[#4573d2] transition-colors">
                  Automate work with automations
                </h3>
                <p className="text-[12px] text-[#8a8886] mt-1 leading-snug">
                  Learn how to streamline work by automating tasks in Asana.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Manage projects in Asana */}
          <div className="bg-[#1e1f21] rounded-xl overflow-hidden border border-[#333538] flex flex-col group hover:border-[#44464a] transition-all">
            <div className="h-32 bg-gradient-to-br from-[#4a1224] to-[#260912] flex items-center justify-center relative p-4">
              <span className="text-4xl">📊</span>
              <span className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Play className="w-3 h-3 fill-white" /> 15 min
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[13px] text-white group-hover:text-[#4573d2] transition-colors">
                  Manage projects in Asana
                </h3>
                <p className="text-[12px] text-[#8a8886] mt-1 leading-snug">
                  Plan, organize, and manage your projects effectively.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Avoid silos */}
          <div className="bg-[#1e1f21] rounded-xl overflow-hidden border border-[#333538] flex flex-col group hover:border-[#44464a] transition-all relative">
            <div className="h-32 bg-gradient-to-br from-[#4a1224] to-[#260912] flex items-center justify-center relative p-4">
              <span className="text-4xl">📖</span>
              <span className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 5 min read
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[13px] text-white group-hover:text-[#4573d2] transition-colors">
                  Avoid silos with...
                </h3>
                <p className="text-[12px] text-[#8a8886] mt-1 leading-snug">
                  Learn how to connect teams and achieve full visibility across workspaces.
                </p>
              </div>
            </div>

            {/* Circular next arrow */}
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#252628]/90 hover:bg-[#333538] text-white border border-[#37383b] flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

