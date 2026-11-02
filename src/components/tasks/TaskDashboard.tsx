'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskDashboardProps {
  tasks: Task[];
  projectName?: string;
}

export default function TaskDashboard({ tasks, projectName }: TaskDashboardProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const onTrack = tasks.filter((t) => t.status === 'On track').length;
  const atRisk = tasks.filter((t) => t.status === 'At risk').length;
  const offTrack = tasks.filter((t) => t.status === 'Off track').length;

  const lowPrio = tasks.filter((t) => t.priority === 'Low').length;
  const medPrio = tasks.filter((t) => t.priority === 'Medium').length;
  const highPrio = tasks.filter((t) => t.priority === 'High').length;

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <div>
        <h2 className="text-[20px] font-bold text-white mb-1">
          {projectName || 'Dashboard'} Overview
        </h2>
        <p className="text-[13px] text-[#8a8886]">
          Real-time metrics and task health across your workflow
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider">
              Total Tasks
            </div>
            <div className="text-[28px] font-bold text-white mt-1">{total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#2e3034] flex items-center justify-center text-[#4573d2]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider">
              Completed
            </div>
            <div className="text-[28px] font-bold text-[#4cd195] mt-1">
              {completed}{' '}
              <span className="text-[13px] text-[#8a8886] font-normal">
                ({completionPct}%)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#183f30] flex items-center justify-center text-[#4cd195]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider">
              At Risk
            </div>
            <div className="text-[28px] font-bold text-[#f7c244] mt-1">
              {atRisk}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#4a3800] flex items-center justify-center text-[#f7c244]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Off Track */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider">
              Off Track
            </div>
            <div className="text-[28px] font-bold text-[#ff6b72] mt-1">
              {offTrack}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#47181c] flex items-center justify-center text-[#ff6b72]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-5">
          <h3 className="text-[14px] font-bold text-white mb-4">
            Tasks by Status
          </h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#4cd195] font-medium">On track</span>
                <span className="text-[#8a8886]">{onTrack} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4cd195] h-full rounded-full"
                  style={{ width: `${total ? (onTrack / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#f7c244] font-medium">At risk</span>
                <span className="text-[#8a8886]">{atRisk} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#f7c244] h-full rounded-full"
                  style={{ width: `${total ? (atRisk / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#ff6b72] font-medium">Off track</span>
                <span className="text-[#8a8886]">{offTrack} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ff6b72] h-full rounded-full"
                  style={{ width: `${total ? (offTrack / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-[#252628] border border-[#333538] rounded-xl p-5">
          <h3 className="text-[14px] font-bold text-white mb-4">
            Tasks by Priority
          </h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#c77dff] font-medium">High</span>
                <span className="text-[#8a8886]">{highPrio} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#c77dff] h-full rounded-full"
                  style={{ width: `${total ? (highPrio / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#f7c244] font-medium">Medium</span>
                <span className="text-[#8a8886]">{medPrio} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#f7c244] h-full rounded-full"
                  style={{ width: `${total ? (medPrio / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#4cd195] font-medium">Low</span>
                <span className="text-[#8a8886]">{lowPrio} tasks</span>
              </div>
              <div className="w-full bg-[#1e1f21] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4cd195] h-full rounded-full"
                  style={{ width: `${total ? (lowPrio / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
