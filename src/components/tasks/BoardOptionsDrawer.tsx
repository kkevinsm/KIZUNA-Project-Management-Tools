'use client';

import React, { useState } from 'react';
import {
  ArrowRightToLine,
  ArrowLeft,
  ChevronRight,
  Smile,
  Paintbrush,
  Columns2,
  SlidersHorizontal,
  ArrowUpDown,
  Kanban,
  Check,
  Plus,
  Calendar,
  User,
  Clock,
  Eye,
  Tag,
  Edit2,
  CheckCircle2,
  Hourglass,
  Users,
  Folder,
  LayoutGrid,
} from 'lucide-react';

interface BoardOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
  filterMode: string;
  onFilterModeChange: (mode: any) => void;
  sortField: string;
  onSortFieldChange: (field: any) => void;
  groupField: string;
  onGroupFieldChange: (field: any) => void;
  cardSize?: 'default' | 'compact';
  onCardSizeChange?: (size: 'default' | 'compact') => void;
  showCoverImages?: boolean;
  onToggleCoverImages?: () => void;
  showSubtasks?: boolean;
  onToggleSubtasks?: () => void;
}

export default function BoardOptionsDrawer({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  filterMode,
  onFilterModeChange,
  sortField,
  onSortFieldChange,
  groupField,
  onGroupFieldChange,
  cardSize = 'default',
  onCardSizeChange,
  showCoverImages = false,
  onToggleCoverImages,
  showSubtasks = true,
  onToggleSubtasks,
}: BoardOptionsDrawerProps) {
  const [currentView, setCurrentView] = useState<'main' | 'layout' | 'fields' | 'filters' | 'sorts' | 'groups'>('main');
  const [viewTitle, setViewTitle] = useState('Board');

  if (!isOpen) return null;

  const hiddenCount = Object.values(columns).filter((v) => !v).length;
  const isSortActive = sortField !== 'none';
  const isGroupActive = groupField !== 'section';
  const isFilterActive = filterMode !== 'all';

  return (
    <div className="fixed inset-y-0 right-0 w-[360px] bg-[#1e1f21] border-l border-[#2b2c2e] shadow-2xl z-50 flex flex-col text-white animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="h-[48px] px-4 border-b border-[#2b2c2e] flex items-center justify-between">
        {currentView === 'main' ? (
          <h2 className="text-[16px] font-semibold text-white">Board</h2>
        ) : (
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2 text-[14px] text-[#bdbbb9] hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">
              {currentView === 'layout' && 'Layout options'}
              {currentView === 'fields' && 'Show/hide fields'}
              {currentView === 'filters' && 'Filters'}
              {currentView === 'sorts' && 'Sorts'}
              {currentView === 'groups' && 'Groups'}
            </span>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          title="Close drawer"
        >
          <ArrowRightToLine className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentView === 'main' && (
          <>
            {/* View Icon & Name */}
            <div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-1">
                    Icon
                  </label>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg bg-[#252628] border border-[#37383b] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-1">
                    View name
                  </label>
                  <input
                    type="text"
                    value={viewTitle}
                    onChange={(e) => setViewTitle(e.target.value)}
                    className="w-full bg-[#1e1f21] border border-[#37383b] focus:border-[#4573d2] rounded-lg px-3 py-1.5 text-[13px] text-white outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Layout Options */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('layout')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Paintbrush className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                  <span className="text-[13px] font-medium">Layout options</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="h-px bg-[#2b2c2e] my-1" />

            {/* Menu Nav Links matching Asana Board Drawer */}
            <div className="space-y-1 text-[13px]">
              {/* Show/Hide Fields */}
              <button
                type="button"
                onClick={() => setCurrentView('fields')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Columns2 className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                  <span className="font-medium">Show/hide fields</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {hiddenCount > 0 && <span>{hiddenCount} hidden</span>}
                  <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Filters */}
              <button
                type="button"
                onClick={() => setCurrentView('filters')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                  <span className="font-medium">Filters</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isFilterActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Sorts */}
              <button
                type="button"
                onClick={() => setCurrentView('sorts')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpDown className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                  <span className="font-medium">Sorts</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isSortActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Groups */}
              <button
                type="button"
                onClick={() => setCurrentView('groups')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Kanban className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                  <span className="font-medium">Groups</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isGroupActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>

            <div className="h-px bg-[#2b2c2e] my-1" />

            {/* Send feedback */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Feedback submitted! Thank you.')}
                className="text-[13px] text-[#4573d2] hover:underline cursor-pointer"
              >
                Send feedback
              </button>
            </div>
          </>
        )}

        {/* Layout Options Subview */}
        {currentView === 'layout' && (
          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-[#8a8886] mb-2 font-medium">Card size</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onCardSizeChange && onCardSizeChange('default')}
                  className={`py-2 px-3 rounded-lg border text-left text-[13px] transition-colors cursor-pointer ${
                    cardSize === 'default'
                      ? 'border-[#4573d2] bg-[#1a2942] text-white font-medium'
                      : 'border-[#37383b] bg-[#252628] text-[#8a8886] hover:text-white'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => onCardSizeChange && onCardSizeChange('compact')}
                  className={`py-2 px-3 rounded-lg border text-left text-[13px] transition-colors cursor-pointer ${
                    cardSize === 'compact'
                      ? 'border-[#4573d2] bg-[#1a2942] text-white font-medium'
                      : 'border-[#37383b] bg-[#252628] text-[#8a8886] hover:text-white'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="h-px bg-[#2b2c2e]" />

            <div className="space-y-3">
              <p className="text-[12px] text-[#8a8886] font-medium">Card display elements</p>

              {/* Cover Images Toggle */}
              <div
                onClick={() => onToggleCoverImages && onToggleCoverImages()}
                className="flex items-center justify-between py-2 px-1 hover:bg-[#252628]/60 cursor-pointer rounded-md transition-colors"
              >
                <span className="text-[13px] text-[#f5f4f3]">Show cover images</span>
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    showCoverImages ? 'bg-[#4573d2]' : 'bg-[#3b3d42]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      showCoverImages ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Subtasks Toggle */}
              <div
                onClick={() => onToggleSubtasks && onToggleSubtasks()}
                className="flex items-center justify-between py-2 px-1 hover:bg-[#252628]/60 cursor-pointer rounded-md transition-colors"
              >
                <span className="text-[13px] text-[#f5f4f3]">Show subtask count</span>
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    showSubtasks ? 'bg-[#4573d2]' : 'bg-[#3b3d42]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      showSubtasks ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show/Hide Fields Subview */}
        {currentView === 'fields' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2c2e]">
              <span className="text-[12px] text-[#8a8886]">
                Show, hide, and reorder fields on cards in this view
              </span>
              <button
                type="button"
                onClick={() => alert('Add custom field')}
                className="flex items-center gap-1 px-2 py-1 bg-[#2b2c2e] hover:bg-[#3562be] rounded text-[12px] text-white font-medium transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="divide-y divide-[#28292c]">
              {[
                { id: 'dueDate', label: 'Due date', icon: Calendar },
                { id: 'project', label: 'Projects', icon: Folder },
                { id: 'collaborators', label: 'Collaborators', icon: Users },
                { id: 'visibility', label: 'Task visibility', icon: Eye },
                { id: 'tags', label: 'Tags', icon: Tag },
                { id: 'taskType', label: 'Task type (Milestones / Approvals)', icon: CheckCircle2 },
                { id: 'createdBy', label: 'Created by', icon: User },
                { id: 'createdOn', label: 'Created on', icon: Clock },
                { id: 'lastModifiedOn', label: 'Last modified on', icon: Edit2 },
                { id: 'completedOn', label: 'Completed on', icon: CheckCircle2 },
              ].map((col) => {
                const IconComponent = col.icon;
                const isEnabled = !!columns[col.id];

                return (
                  <div
                    key={col.id}
                    onClick={() => onToggleColumn(col.id)}
                    className="flex items-center justify-between py-2.5 px-1 hover:bg-[#252628]/60 cursor-pointer rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 text-[#8a8886]" />
                      <span className="text-[13px] text-[#f5f4f3]">{col.label}</span>
                    </div>

                    {/* iOS style toggle switch */}
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        isEnabled ? 'bg-[#4573d2]' : 'bg-[#3b3d42]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
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
                { id: 'all', label: 'All tasks' },
                { id: 'due_this_week', label: 'Due this week' },
                { id: 'due_next_week', label: 'Due next week' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFilterModeChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors cursor-pointer ${
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
                  type="button"
                  onClick={() => onSortFieldChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors cursor-pointer ${
                    sortField === opt.id
                      ? 'bg-[#1b2b48] text-[#4573d2] font-semibold'
                      : 'hover:bg-[#252628] text-[#f5f4f3]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortField === opt.id && <Check className="w-4 h-4 text-[#4573d2]" />}
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
                  type="button"
                  onClick={() => onGroupFieldChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors cursor-pointer ${
                    groupField === opt.id
                      ? 'bg-[#1b2b48] text-[#4573d2] font-semibold'
                      : 'hover:bg-[#252628] text-[#f5f4f3]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {groupField === opt.id && <Check className="w-4 h-4 text-[#4573d2]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
