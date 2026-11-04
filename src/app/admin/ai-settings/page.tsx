'use client';

import React, { useState } from 'react';
import { Sparkles, Bot, Shield, Check, Info } from 'lucide-react';

export default function AiSettingsPage() {
  const [agenticTeammates, setAgenticTeammates] = useState(true);
  const [meetingSummaries, setMeetingSummaries] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [aiDataPrivacy, setAiDataPrivacy] = useState(true);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Dash AI</h1>
        <p className="text-[#8a8886] text-[13px] mt-1">
          Configure organization-wide generative intelligence, Dash AI teammates, and model privacy parameters.
        </p>
      </div>

      <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#2d2f32] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-white">AI Capabilities & Permissions</h2>
          <span className="text-[11.5px] font-semibold bg-[#2f2238] border border-[#6b357d] text-[#e091fa] px-2.5 py-0.5 rounded-full">
            Advanced AI Enabled
          </span>
        </div>

        <div className="divide-y divide-[#262729] text-[13.5px]">
          {/* AI Teammates */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-[#ff7043] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">AI Teammates & Agents</div>
                <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                  Allow members to assign tasks and collaborate with autonomous AI agents across projects.
                </div>
              </div>
            </div>
            <button
              onClick={() => setAgenticTeammates(!agenticTeammates)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                agenticTeammates ? 'bg-[#4573d2]' : 'bg-[#3e4044]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  agenticTeammates ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Meeting Summaries */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#f06a6a] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Smart Summaries & Action Items</div>
                <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                  Automatically generate task breakdowns, status briefings, and subtasks from meeting notes.
                </div>
              </div>
            </div>
            <button
              onClick={() => setMeetingSummaries(!meetingSummaries)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                meetingSummaries ? 'bg-[#4573d2]' : 'bg-[#3e4044]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  meetingSummaries ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Data Privacy */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#48c774] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Enterprise Data Commitment</div>
                <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                  Guarantee your workspace data is never used to train foundational AI models.
                </div>
              </div>
            </div>
            <span className="text-[12px] bg-[#1d3524] text-[#48c774] px-2.5 py-1 rounded-lg font-medium">
              Enforced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
