'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRightToLine,
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
  GripVertical,
  ClipboardList,
  Edit2,
  CheckCircle2,
  Hourglass,
  Users,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import EmojiPickerPopover from '@/components/common/EmojiPickerPopover';

interface ListOptionsDrawerProps {
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
}

export default function ListOptionsDrawer({
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
}: ListOptionsDrawerProps) {
  const { viewConfigs, updateViewConfig } = useApp();
  const listConfig = viewConfigs['List'] || { name: 'List', icon: '' };

  const [currentView, setCurrentView] = useState<'main' | 'columns' | 'filters' | 'sorts' | 'groups'>('main');
  const [viewTitle, setViewTitle] = useState(listConfig.name || 'List');
  const [viewIcon, setViewIcon] = useState(listConfig.icon || '');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  useEffect(() => {
    if (listConfig.name) setViewTitle(listConfig.name);
    if (listConfig.icon !== undefined) setViewIcon(listConfig.icon);
  }, [listConfig.name, listConfig.icon]);

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
          <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
            {viewIcon && <span className="text-[18px]">{viewIcon}</span>}
            <span>{viewTitle || 'List'}</span>
          </h2>
        ) : (
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2 text-[14px] text-[#bdbbb9] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">
              {currentView === 'columns' && 'Show/hide columns'}
              {currentView === 'filters' && 'Filters'}
              {currentView === 'sorts' && 'Sorts'}
              {currentView === 'groups' && 'Groups'}
            </span>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors"
          title="Close"
        >
          <ArrowRightToLine className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentView === 'main' && (
          <>
            {/* View Icon & Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <label className="text-[10px] text-[#8a8886] font-semibold uppercase tracking-wider block mb-1">
                    Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-lg bg-[#252628] border border-[#37383b] hover:border-[#4573d2] flex items-center justify-center text-[#8a8886] hover:text-white cursor-pointer transition-colors"
                    title="Change icon"
                  >
                    {viewIcon ? (
                      <span className="text-[18px] leading-none">{viewIcon}</span>
                    ) : (
                      <Smile className="w-4 h-4" />
                    )}
                  </button>

                  {/* Emoji Picker Popover */}
                  {isEmojiPickerOpen && (
                    <div className="absolute top-16 left-0 z-50">
                      <EmojiPickerPopover
                        isOpen={isEmojiPickerOpen}
                        onClose={() => setIsEmojiPickerOpen(false)}
                        onSelectEmoji={(emoji) => {
                          setViewIcon(emoji);
                          updateViewConfig('List', { icon: emoji });
                        }}
                        onClear={() => {
                          setViewIcon('');
                          updateViewConfig('List', { icon: '' });
                        }}
                        currentEmoji={viewIcon}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#8a8886] font-semibold uppercase tracking-wider block mb-1">
                    View name
                  </label>
                  <input
                    type="text"
                    value={viewTitle}
                    onChange={(e) => {
                      setViewTitle(e.target.value);
                      updateViewConfig('List', { name: e.target.value });
                    }}
                    className="w-full bg-[#252628] border border-[#37383b] focus:border-[#4573d2] rounded px-2.5 py-1 text-[13px] text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#2b2c2e] my-3" />

            {/* Menu Nav Links (Image 4) */}
            <div className="space-y-1 text-[13px]">
              {/* Show/Hide Columns */}
              <button
                onClick={() => setCurrentView('columns')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Columns className="w-4 h-4 text-[#8a8886]" />
                  <span>Show/hide columns</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  <span>{hiddenCount} hidden</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Filters */}
              <button
                onClick={() => setCurrentView('filters')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-[#8a8886]" />
                  <span>Filters</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isFilterActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Sorts */}
              <button
                onClick={() => setCurrentView('sorts')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpDown className="w-4 h-4 text-[#8a8886]" />
                  <span>Sorts</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isSortActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Groups */}
              <button
                onClick={() => setCurrentView('groups')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#252628] text-[#f5f4f3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#8a8886]" />
                  <span>Groups</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8886] text-[12px]">
                  {isGroupActive && <span>1 applied</span>}
                  <ChevronRight className="w-4 h-4" />
                </div>
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

        {/* Columns Subview with iOS Style Toggles (Image 3) */}
        {currentView === 'columns' && (
          <div className="space-y-3">
            {/* Subheader with description & Add button */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2c2e]">
              <span className="text-[12px] text-[#8a8886]">
                Show, hide, and reorder columns in this view
              </span>
              <button
                onClick={() => alert('Add custom field / column')}
                className="flex items-center gap-1 px-2 py-1 bg-[#2b2c2e] hover:bg-[#3562be] rounded text-[12px] text-white font-medium transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of Columns matching Image 3 */}
            <div className="divide-y divide-[#28292c]">
              {[
                { id: 'dueDate', label: 'Due date', icon: Calendar },
                { id: 'collaborators', label: 'Collaborators', icon: GripVertical },
                { id: 'project', label: 'Projects', icon: ClipboardList },
                { id: 'visibility', label: 'Task visibility', icon: Eye },
                { id: 'createdBy', label: 'Created by', icon: User },
                { id: 'createdOn', label: 'Created on', icon: Clock },
                { id: 'lastModifiedOn', label: 'Last modified on', icon: Edit2 },
                { id: 'completedOn', label: 'Completed on', icon: CheckCircle2 },
                { id: 'tags', label: 'Tags', icon: Tag },
                { id: 'blockedBy', label: 'Blocked by', icon: Hourglass },
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
                  onClick={() => onFilterModeChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors ${
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
                  onClick={() => onSortFieldChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors ${
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
                  onClick={() => onGroupFieldChange(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors ${
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
