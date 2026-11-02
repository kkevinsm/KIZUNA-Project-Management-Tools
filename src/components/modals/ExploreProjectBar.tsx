'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Calendar,
  Layers,
  SlidersHorizontal,
  Zap,
  Users,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function ExploreProjectBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const steps = [
    { label: 'Assign task', icon: UserPlus },
    { label: 'Change due dates', icon: Calendar },
    { label: 'Organize with sections', icon: Layers },
    { label: 'Add a custom field', icon: SlidersHorizontal },
    { label: 'Power up your project', icon: Zap },
    { label: 'Add your team', icon: Users },
    { label: 'Filter and sort work', icon: Filter },
    { label: 'Add a task', icon: CheckCircle2, completed: true },
  ];

  return (
    <div className="bg-[#1e1f21] border border-[#333538] rounded-2xl p-4 shadow-lg select-none mb-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[14px] text-white">Explore your project</span>
          {/* Progress bar */}
          <div className="w-20 bg-[#2e2f32] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4cd195] w-[12.5%] h-full rounded-full" />
          </div>
          <span className="text-[12px] text-[#8a8886]">1 of 8 completed</span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded hover:bg-[#2c2d30] text-[#8a8886] hover:text-white"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pill buttons list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px]">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <button
              key={idx}
              onClick={() => alert(`Feature: ${step.label}`)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                step.completed
                  ? 'bg-[#183f30] text-[#4cd195] border-[#215340]'
                  : 'bg-[#252628] hover:bg-[#2c2d30] text-[#bdbbb9] hover:text-white border-[#333538]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
