'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Smile,
  Check,
  Plus,
  X,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  Layers,
  Columns,
  Calendar,
  User,
  Clock,
  ThumbsUp,
  Tag,
  Folder,
  Eye,
} from 'lucide-react';
import { PriorityLevel } from '@/lib/types';

export interface ColumnConfig {
  id: string;
  name: string;
  visible: boolean;
  canToggle: boolean;
}

interface ListOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
  filterMode: string;
  onFilterModeChange: (mode: any) => void;
  sortMode: string;
  onSortModeChange: (mode: any) => void;
  groupMode: string;
  onGroupModeChange: (mode: any) => void;
  onOpenFiltersDrawer?: () => void;
}

export default function ListOptionsDrawer({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  filterMode,
  onFilterModeChange,
  sortMode,
  onSortModeChange,
  groupMode,
  onGroupModeChange,
}: ListOptionsDrawerProps) {
  const [currentView, setCurrentView] = useState<'main' | 'columns' | 'filters' | 'sorts' | 'groups'>('main');
  const [viewTitle, setViewTitle] = useState('List');

  if (!isOpen) return null;

  const hiddenCount = Object.values(columns).filter((v) => !v).length;

  return (
    <div className="fixed inset-y-0 right-0 w-[340px] bg-[#1e1f21] border-l border-[#2b2c2e] shadow-2xl z-50 flex flex-col text-white animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="h-[48px] px-4 border-b border-[#2b2c2e] flex items-center justify-between">
        {currentView === 'main' ? (
          <h2 className="text-[15px] font-bold text-white">List</h2>
        ) : (
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-1.5 text-[13px] text-[#bdbbb9] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold capitalize">{currentView}</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors"
          title="Close"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentView === 'main' && (
          <>
            {/* View Icon & Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#252628] border border-[#37383b] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer transition-colors">
                  <Smile className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#8a8886] font-semibold uppercase tracking-wider block">
                    View name
                  </label>
                  <input
                    type="text"
                    value={viewTitle}
                    onChange={(e) => setViewTitle(e.target.value)}
                    className="w-full bg-[#252628] border border-[#37383b] focus:border-[#4573d2] rounded px-2 py-1 text-[13px] text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#2b2c2e] my-3" />

            {/* Menu Nav Links */}
            <div className="space-y-1 text-[13px]">
              {/* Show/Hide Columns */}
              <button
                onClick={() => setCurrentView('columns')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Columns className="w-4 h-4 text-[#8a8886]" />
                  <span>Show/hide columns</span>
                </div>
                <div className="flex items-center gap-1 text-[#8a8886] text-[12px]">
                  <span>{hiddenCount} hidden</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Filters */}
              <button
                onClick={() => setCurrentView('filters')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4 text-[#8a8886]" />
                  <span>Filters</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886]" />
              </button>

              {/* Sorts */}
              <button
                onClick={() => setCurrentView('sorts')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpDown className="w-4 h-4 text-[#8a8886]" />
                  <span>Sorts</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886]" />
              </button>

              {/* Groups */}
              <button
                onClick={() => setCurrentView('groups')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#8a8886]" />
                  <span>Groups</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886]" />
              </button>
            </div>

            <div className="h-px bg-[#2b2c2e] my-3" />

            {/* Send feedback */}
            <div className="pt-2">
              <button
                onClick={() => alert('Feedback submitted! Thank you.')}
                className="text-[12px] text-[#8a8886] hover:text-[#4573d2] hover:underline"
              >
                Send feedback
              </button>
            </div>
          </>
        )}

        {/* Columns Subview */}
        {currentView === 'columns' && (
          <div className="space-y-3">
            <p className="text-[12px] text-[#8a8886]">
              Choose which fields appear as columns in your task list:
            </p>
            <div className="space-y-1">
              {[
                { id: 'project', label: 'Projects', icon: Folder },
                { id: 'dueDate', label: 'Due date', icon: Calendar },
                { id: 'priority', label: 'Priority', icon: SlidersHorizontal },
                { id: 'visibility', label: 'Task visibility', icon: Eye },
                { id: 'assignee', label: 'Assignee', icon: User },
                { id: 'createdBy', label: 'Created by', icon: User },
                { id: 'createdOn', label: 'Created on', icon: Clock },
                { id: 'completedOn', label: 'Completed on', icon: Clock },
                { id: 'likes', label: 'Likes', icon: ThumbsUp },
                { id: 'tags', label: 'Tags', icon: Tag },
              ].map((col) => {
                const IconComponent = col.icon;
                const isChecked = !!columns[col.id];

                return (
                  <label
                    key={col.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#252628] cursor-pointer text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 text-[#8a8886]" />
                      <span>{col.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleColumn(col.id)}
                      className="rounded accent-[#4573d2] w-4 h-4 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters Subview */}
        {currentView === 'filters' && (
          <div className="space-y-3">
            <p className="text-[12px] text-[#8a8886]">Active filters applied to this view:</p>
            <div className="space-y-1">
              {[
                { id: 'incomplete', label: 'Incomplete tasks' },
                { id: 'completed', label: 'Completed tasks' },
                { id: 'all', label: 'All tasks (No completion filter)' },
                { id: 'due_today', label: 'Due today' },
                { id: 'due_this_week', label: 'Due this week' },
                { id: 'due_next_week', label: 'Due next week' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onFilterModeChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
                    filterMode === opt.id
                      ? 'bg-[#1b2b48] text-[#4573d2] font-semibold'
                      : 'hover:bg-[#252628] text-[#f5f4f3]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {filterMode === opt.id && <Check className="w-4 h-4 text-[#4573d2]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sorts Subview */}
        {currentView === 'sorts' && (
          <div className="space-y-3">
            <p className="text-[12px] text-[#8a8886]">Order tasks by field:</p>
            <div className="space-y-1">
              {[
                { id: 'none', label: 'None (Default order)' },
                { id: 'start_date', label: 'Start date' },
                { id: 'due_date', label: 'Due date' },
                { id: 'created_by', label: 'Created by' },
                { id: 'created_on', label: 'Created on' },
                { id: 'last_modified', label: 'Last modified on' },
                { id: 'completed_on', label: 'Completed on' },
                { id: 'likes', label: 'Likes' },
                { id: 'alphabetical', label: 'Alphabetical' },
                { id: 'project', label: 'Project' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSortModeChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
                    sortMode === opt.id
                      ? 'bg-[#1b2b48] text-[#4573d2] font-semibold'
                      : 'hover:bg-[#252628] text-[#f5f4f3]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortMode === opt.id && <Check className="w-4 h-4 text-[#4573d2]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Groups Subview */}
        {currentView === 'groups' && (
          <div className="space-y-3">
            <p className="text-[12px] text-[#8a8886]">Group tasks into sections:</p>
            <div className="space-y-1">
              {[
                { id: 'section', label: 'Sections' },
                { id: 'start_date', label: 'Start date' },
                { id: 'due_date', label: 'Due date' },
                { id: 'created_by', label: 'Created by' },
                { id: 'created_on', label: 'Created on' },
                { id: 'last_modified', label: 'Last modified on' },
                { id: 'completed_on', label: 'Completed on' },
                { id: 'project', label: 'Project' },
                { id: 'none', label: 'None' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onGroupModeChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
                    groupMode === opt.id
                      ? 'bg-[#1b2b48] text-[#4573d2] font-semibold'
                      : 'hover:bg-[#252628] text-[#f5f4f3]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {groupMode === opt.id && <Check className="w-4 h-4 text-[#4573d2]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
