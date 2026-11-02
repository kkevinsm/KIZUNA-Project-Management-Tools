'use client';

import React from 'react';
import {
  ArrowRight,
  Plus,
  Check,
  Target,
  Folder,
  CheckSquare,
  FileText,
  MessageSquare,
  FileCode,
  Calendar,
  AtSign,
} from 'lucide-react';

export interface WidgetDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: 'goals',
    name: 'Goals',
    icon: Target,
    description: 'Track team and organizational goals with progress bars',
  },
  {
    id: 'portfolios',
    name: 'Portfolios',
    icon: Folder,
    description: 'Monitor high-level progress across groups of related projects',
  },
  {
    id: 'status_updates',
    name: 'Status updates',
    icon: CheckSquare,
    description: 'See the latest health reports across all projects',
  },
  {
    id: 'notepad',
    name: 'Private notepad',
    icon: FileText,
    description: 'Jot down personal notes and reminders that only you can see',
  },
  {
    id: 'draft_comments',
    name: 'Draft comments',
    icon: MessageSquare,
    description: 'Quickly resume writing unsent comments on tasks',
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: FileCode,
    description: 'Access and share intake forms to collect work requests',
  },
  {
    id: 'upcoming_meetings',
    name: 'Upcoming meetings',
    icon: Calendar,
    description: 'View scheduled meetings and calendar events at a glance',
  },
  {
    id: 'mentions',
    name: 'Comments mentioning me',
    icon: AtSign,
    description: 'Catch up on comments and updates where teammates mentioned you',
  },
];

interface AddWidgetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
}

export default function AddWidgetsDrawer({
  isOpen,
  onClose,
  activeWidgets,
  onToggleWidget,
}: AddWidgetsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[380px] bg-[#1a1b1d] border-l border-[#2e2f32] shadow-2xl flex flex-col text-[#f5f4f3] animate-in slide-in-from-right duration-200">
          {/* Header matching Asana screenshot */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#28292c]">
            <h2 className="text-[17px] font-bold text-white tracking-tight">
              Add widgets
            </h2>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#28292c] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Widgets List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {/* 1. Goals */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Goals</span>
                <button
                  onClick={() => onToggleWidget('goals')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('goals')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('goals') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              {/* Skeleton preview matching Asana screenshot */}
              <div className="space-y-2 opacity-70">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#8a8886] text-[13px]">△</span>
                  <div className="h-2 w-32 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#8a8886] text-[13px]">△</span>
                  <div className="h-2 w-56 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#8a8886] text-[13px]">△</span>
                  <div className="h-2 w-44 bg-[#3a3b3f] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 2. Portfolios */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Portfolios</span>
                <button
                  onClick={() => onToggleWidget('portfolios')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('portfolios')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('portfolios') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              {/* Colored folders preview */}
              <div className="grid grid-cols-2 gap-2 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 text-[14px]">📁</span>
                  <div className="h-2 w-16 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-[14px]">📁</span>
                  <div className="h-2 w-16 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-[14px]">📁</span>
                  <div className="h-2 w-16 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 text-[14px]">📁</span>
                  <div className="h-2 w-16 bg-[#3a3b3f] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 3. Status updates */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Status updates</span>
                <button
                  onClick={() => onToggleWidget('status_updates')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('status_updates')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('status_updates') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2.5 opacity-70">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-400">✓</div>
                  <div className="h-2 w-32 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                  </div>
                  <div className="h-2 w-52 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500/30 border border-rose-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  </div>
                  <div className="h-2 w-44 bg-[#3a3b3f] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 4. Private notepad */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Private notepad</span>
                <button
                  onClick={() => onToggleWidget('notepad')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('notepad')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('notepad') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 opacity-70">
                <div className="h-2 w-36 bg-[#3a3b3f] rounded-full"></div>
                <div className="h-2 w-56 bg-[#3a3b3f] rounded-full"></div>
                <div className="h-2 w-44 bg-[#3a3b3f] rounded-full"></div>
                <div className="h-2 w-32 bg-[#3a3b3f] rounded-full"></div>
              </div>
            </div>

            {/* 5. Draft comments */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Draft comments</span>
                <button
                  onClick={() => onToggleWidget('draft_comments')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('draft_comments')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('draft_comments') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 opacity-70">
                <div className="flex items-start gap-2">
                  <span className="text-[#8a8886] text-[13px]">💬</span>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-40 bg-[#3a3b3f] rounded-full"></div>
                    <div className="h-2 w-28 bg-[#3a3b3f] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-[#8a8886] text-[13px]">💬</span>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-48 bg-[#3a3b3f] rounded-full"></div>
                    <div className="h-2 w-20 bg-[#3a3b3f] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Forms */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Forms</span>
                <button
                  onClick={() => onToggleWidget('forms')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('forms')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('forms') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="text-[#8a8886] text-[13px]">📄</span>
                  <div className="h-2 w-32 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8a8886] text-[13px]">📄</span>
                  <div className="h-2 w-48 bg-[#3a3b3f] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8a8886] text-[13px]">📄</span>
                  <div className="h-2 w-36 bg-[#3a3b3f] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 7. Upcoming meetings */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Upcoming meetings</span>
                <button
                  onClick={() => onToggleWidget('upcoming_meetings')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('upcoming_meetings')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('upcoming_meetings') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#1e1f21] rounded-lg p-2.5 border border-[#343639] space-y-2 opacity-80">
                <div className="h-2 w-48 bg-[#3a3b3f] rounded-full"></div>
                <div className="h-2 w-28 bg-[#3a3b3f] rounded-full"></div>
                <div className="flex items-center gap-1 pt-1">
                  <div className="w-4 h-4 rounded-full bg-[#84cc16] flex items-center justify-center text-[8px] text-black font-bold">👤</div>
                  <div className="w-4 h-4 rounded-full bg-[#14b8a6] flex items-center justify-center text-[8px] text-white font-bold">👤</div>
                  <div className="w-4 h-4 rounded-full bg-[#60a5fa] flex items-center justify-center text-[8px] text-white font-bold">👤</div>
                </div>
              </div>
            </div>

            {/* 8. Comments mentioning me */}
            <div className="bg-[#242528] hover:bg-[#28292c] border border-[#343639] rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold text-white">Comments mentioning me</span>
                <button
                  onClick={() => onToggleWidget('mentions')}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeWidgets.includes('mentions')
                      ? 'bg-[#1b3829] text-[#4cd98b] border-[#255e39]'
                      : 'bg-[#1e1f21] hover:bg-[#303134] text-[#c5c3c0] hover:text-white border-[#3b3d41]'
                  }`}
                >
                  {activeWidgets.includes('mentions') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 opacity-70">
                <div className="flex items-start gap-2">
                  <span className="text-[#8a8886] text-[13px] font-bold">@</span>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-40 bg-[#3a3b3f] rounded-full"></div>
                    <div className="h-2 w-24 bg-[#3a3b3f] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-[#8a8886] text-[13px] font-bold">@</span>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-48 bg-[#3a3b3f] rounded-full"></div>
                    <div className="h-2 w-32 bg-[#3a3b3f] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
