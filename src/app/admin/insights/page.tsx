'use client';

import React from 'react';
import { TrendingUp, Users, CheckCircle2, FolderGit2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminInsightsPage() {
  const { allUsers, projects, tasks } = useApp();

  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Insights</h1>
        <p className="text-[#8a8886] text-[13px] mt-1">
          Workspace adoption, task throughput, and collaboration analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#4573d2]/15 border border-[#4573d2]/30 flex items-center justify-center text-[#4573d2]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-white">{allUsers?.length || 1}</div>
            <div className="text-[12.5px] text-[#8a8886]">Total Members</div>
          </div>
        </div>

        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#2ecc71]/15 border border-[#2ecc71]/30 flex items-center justify-center text-[#2ecc71]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-white">{completedTasks}</div>
            <div className="text-[12.5px] text-[#8a8886]">Completed Tasks</div>
          </div>
        </div>

        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#f06a6a]/15 border border-[#f06a6a]/30 flex items-center justify-center text-[#f06a6a]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-white">{projects.length}</div>
            <div className="text-[12.5px] text-[#8a8886]">Active Projects</div>
          </div>
        </div>

        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#9b59b6]/15 border border-[#9b59b6]/30 flex items-center justify-center text-[#9b59b6]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-white">99.8%</div>
            <div className="text-[12.5px] text-[#8a8886]">System Health</div>
          </div>
        </div>
      </div>
    </div>
  );
}
