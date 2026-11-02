'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ChevronDown,
  ListTodo,
  MoreHorizontal,
  X,
  GanttChartSquare,
  FileCheck2,
  FlaskConical,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ProjectsPage() {
  const { projects, openCreateModal, currentUser } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [showTemplatesBanner, setShowTemplatesBanner] = useState(true);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-white">Browse projects</h1>
        <button
          onClick={() => openCreateModal('project')}
          className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a8886] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Find a project"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#252628] hover:bg-[#2a2b2e] focus:bg-[#202123] text-white text-[13px] pl-10 pr-4 py-2 rounded-lg border border-[#333538] focus:border-[#4573d2] outline-none transition-all placeholder-[#6d6c6e]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-[12px]">
          {(['Owner', 'Members', 'Portfolios', 'Status'] as const).map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 bg-[#252628] hover:bg-[#2e2f32] text-[#bdbbb9] hover:text-white px-3 py-1.5 rounded-full border border-[#37383b] transition-colors"
            >
              <span>{filter}</span>
              <ChevronDown className="w-3 h-3 text-[#8a8886]" />
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#252628] border border-[#333538] rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_160px_160px_160px] items-center h-[36px] px-6 border-b border-[#333538] text-[#8a8886] text-[11px] font-semibold uppercase tracking-wider">
          <div>Name</div>
          <div>Members</div>
          <div>Portfolios</div>
          <div className="flex items-center gap-1 justify-end">
            <span>Last modified</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </div>

        {/* Project Rows */}
        <div className="divide-y divide-[#2f3135]">
          {filteredProjects.map((proj) => (
            <Link
              key={proj.id}
              href={`/project/${proj.id}`}
              className="grid grid-cols-[1fr_160px_160px_160px] items-center py-3.5 px-6 hover:bg-[#2e2f32] transition-colors text-[13px] group"
            >
              {/* Name & Icon */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#333538] flex items-center justify-center text-white">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                    {proj.name}
                  </div>
                  {proj.joined && (
                    <div className="text-[11px] text-[#4cd195] font-medium">Joined</div>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <div className="w-6 h-6 rounded-full bg-[#37383b] flex items-center justify-center text-[#8a8886] text-[10px]">
                  <MoreHorizontal className="w-3 h-3" />
                </div>
              </div>

              {/* Portfolios */}
              <div className="text-[#8a8886] text-[12px]">
                {proj.portfolios.length > 0 ? proj.portfolios.join(', ') : '—'}
              </div>

              {/* Last Modified */}
              <div className="text-right text-[#8a8886] text-[12px]">
                {proj.lastModified}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Templates Banner */}
      {showTemplatesBanner && (
        <div className="pt-8 border-t border-[#2b2c2e] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-white">
              Explore ready-made templates to jumpstart your next project
            </h2>
            <button
              onClick={() => setShowTemplatesBanner(false)}
              className="p-1 rounded hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Template 1 */}
            <div className="bg-[#252628] border border-[#333538] hover:border-[#4573d2] rounded-xl p-5 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-[#2e3034] flex items-center justify-center text-white mb-3 group-hover:bg-[#4573d2] transition-colors">
                <GanttChartSquare className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-white mb-1.5">
                Project timeline
              </h3>
              <p className="text-[12px] text-[#8a8886] leading-relaxed">
                Map out dependencies, milestones, and deadlines to keep your projects on schedule.
              </p>
            </div>

            {/* Template 2 */}
            <div className="bg-[#252628] border border-[#333538] hover:border-[#4573d2] rounded-xl p-5 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-[#2e3034] flex items-center justify-center text-white mb-3 group-hover:bg-[#4573d2] transition-colors">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-white mb-1.5">
                Request tracking
              </h3>
              <p className="text-[12px] text-[#8a8886] leading-relaxed">
                Capture, prioritize, and monitor requests until completion.
              </p>
            </div>

            {/* Template 3 */}
            <div className="bg-[#252628] border border-[#333538] hover:border-[#4573d2] rounded-xl p-5 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-[#2e3034] flex items-center justify-center text-white mb-3 group-hover:bg-[#4573d2] transition-colors">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-white mb-1.5">
                New hire checklist
              </h3>
              <p className="text-[12px] text-[#8a8886] leading-relaxed">
                Outline onboarding steps, assign tasks with due dates, and track team progress.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => alert("Template Gallery: Choose from 100+ templates")}
              className="bg-[#252628] hover:bg-[#2f3135] border border-[#37383b] text-white px-5 py-2 rounded-lg text-[13px] font-medium transition-colors"
            >
              View the template gallery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

