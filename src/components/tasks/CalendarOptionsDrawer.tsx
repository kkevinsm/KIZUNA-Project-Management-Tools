'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRightToLine,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Paintbrush,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  User,
  Clock,
  Edit2,
  Smile,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import EmojiPickerPopover from '@/components/common/EmojiPickerPopover';

export interface CalendarFilterItem {
  id: string;
  type: 'completion' | 'creator' | 'created_on' | 'last_modified' | 'completed_on' | 'task_type';
  operator: string; // 'is' | 'is_not' | 'is_before' | 'is_after'
  value: string;
}

interface CalendarOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'main' | 'layout' | 'filters' | 'add_filter';
  viewMode: 'weeks' | 'month';
  onViewModeChange: (mode: 'weeks' | 'month') => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
  showMultiDayTasks: boolean;
  onToggleMultiDayTasks: () => void;
  taskColorMode: 'default' | 'priority' | 'project';
  onTaskColorModeChange: (mode: 'default' | 'priority' | 'project') => void;
  filters: CalendarFilterItem[];
  onAddFilter: (type: CalendarFilterItem['type']) => void;
  onUpdateFilter: (id: string, updates: Partial<CalendarFilterItem>) => void;
  onRemoveFilter: (id: string) => void;
  onClearFilters: () => void;
}

export default function CalendarOptionsDrawer({
  isOpen,
  onClose,
  initialView = 'main',
  viewMode,
  onViewModeChange,
  showWeekends,
  onToggleWeekends,
  showMultiDayTasks,
  onToggleMultiDayTasks,
  taskColorMode,
  onTaskColorModeChange,
  filters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  onClearFilters,
}: CalendarOptionsDrawerProps) {
  const [currentView, setCurrentView] = useState<'main' | 'layout' | 'filters' | 'add_filter'>(initialView);

  const { viewConfigs, updateViewConfig } = useApp();
  const calendarConfig = viewConfigs['Calendar'] || { name: 'Calendar', icon: '' };
  const [viewName, setViewName] = useState(calendarConfig.name || 'Calendar');
  const [viewIcon, setViewIcon] = useState(calendarConfig.icon || '');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  useEffect(() => {
    if (calendarConfig.name) setViewName(calendarConfig.name);
    if (calendarConfig.icon !== undefined) setViewIcon(calendarConfig.icon);
  }, [calendarConfig.name, calendarConfig.icon]);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView || 'main');
    }
  }, [isOpen, initialView]);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[340px] sm:max-w-[380px] bg-[#1a1b1d] border-l border-[#2e2f32] shadow-2xl flex flex-col text-[#f5f4f3] animate-in slide-in-from-right duration-200">
          {/* VIEW 1: MAIN OPTIONS PANEL */}
          {currentView === 'main' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-[52px] min-h-[52px] px-5 border-b border-[#28292c] flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-white tracking-tight">Calendar</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#28292c] transition-colors"
                  title="Close"
                >
                  <ArrowRightToLine className="w-4 h-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[13px]">
                {/* Icon & View Name */}
                <div>
                  <div className="flex items-center gap-4 text-[12px] text-[#8a8886] font-medium mb-1.5">
                    <span className="w-9 text-center">Icon</span>
                    <span>View name</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                        className="w-10 h-10 rounded-lg bg-[#242528] hover:bg-[#2d2e32] border border-[#37383b] hover:border-[#4573d2] flex items-center justify-center text-[#9c9a99] hover:text-white transition-colors shrink-0 cursor-pointer"
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
                        <div className="absolute top-12 left-0 z-50">
                          <EmojiPickerPopover
                            isOpen={isEmojiPickerOpen}
                            onClose={() => setIsEmojiPickerOpen(false)}
                            onSelectEmoji={(emoji) => {
                              setViewIcon(emoji);
                              updateViewConfig('Calendar', { icon: emoji });
                            }}
                            onClear={() => {
                              setViewIcon('');
                              updateViewConfig('Calendar', { icon: '' });
                            }}
                            currentEmoji={viewIcon}
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={viewName}
                      onChange={(e) => {
                        setViewName(e.target.value);
                        updateViewConfig('Calendar', { name: e.target.value });
                      }}
                      className="flex-1 h-10 bg-[#1e1f21] border border-[#37383b] focus:border-[#4573d2] rounded-lg px-3 text-white text-[13.5px] outline-none"
                    />
                  </div>
                </div>

                {/* Menu list */}
                <div className="space-y-1 pt-1">
                  {/* Layout options link */}
                  <button
                    onClick={() => setCurrentView('layout')}
                    className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Paintbrush className="w-4 h-4 text-[#9c9a99] group-hover:text-white" />
                      <span className="text-[13.5px] font-medium">Layout options</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                  </button>

                  {/* Zoom selector */}
                  <div className="relative">
                    <div
                      onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
                      className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-[#9c9a99] group-hover:text-white" />
                        <span className="text-[13.5px] font-medium">Zoom</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-[#9c9a99] group-hover:text-white">
                        <span>{viewMode === 'weeks' ? 'Weeks' : 'Month'}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                      </div>
                    </div>

                    {isZoomDropdownOpen && (
                      <div className="absolute right-2 top-full mt-1 w-32 bg-[#252628] border border-[#383a3d] rounded-xl shadow-xl z-20 py-1">
                        <button
                          onClick={() => {
                            onViewModeChange('weeks');
                            setIsZoomDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                            viewMode === 'weeks' ? 'text-[#4573d2] font-semibold' : 'text-white'
                          }`}
                        >
                          <span>Weeks</span>
                          {viewMode === 'weeks' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            onViewModeChange('month');
                            setIsZoomDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12.5px] flex items-center justify-between hover:bg-[#2e2f33] ${
                            viewMode === 'month' ? 'text-[#4573d2] font-semibold' : 'text-white'
                          }`}
                        >
                          <span>Month</span>
                          {viewMode === 'month' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#28292c] pt-2">
                  {/* Filters link */}
                  <button
                    onClick={() => setCurrentView('filters')}
                    className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="w-4 h-4 text-[#9c9a99] group-hover:text-white" />
                      <span className="text-[13.5px] font-medium">Filters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {filters.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#4573d2] text-white text-[11px] font-bold flex items-center justify-center">
                          {filters.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                    </div>
                  </button>
                </div>

                <div className="border-t border-[#28292c] pt-4">
                  <button
                    onClick={() => alert('Feedback submitted! Thank you for using Kizuna.')}
                    className="text-[#8a8886] hover:text-[#4573d2] transition-colors text-[13px] hover:underline"
                  >
                    Send feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: LAYOUT OPTIONS SUB-PANEL */}
          {currentView === 'layout' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-[52px] min-h-[52px] px-4 border-b border-[#28292c] flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('main')}
                  className="p-1 rounded-lg hover:bg-[#28292c] text-[#8a8886] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-[17px] font-bold text-white tracking-tight">Layout options</h2>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[13px]">
                {/* Color tasks by */}
                <div>
                  <label className="block text-[12.5px] text-[#8a8886] font-medium mb-2">
                    Color tasks by
                  </label>
                  <div className="relative">
                    <select
                      value={taskColorMode}
                      onChange={(e) =>
                        onTaskColorModeChange(e.target.value as 'default' | 'priority' | 'project')
                      }
                      className="w-full h-10 bg-[#1e1f21] border border-[#37383b] rounded-lg px-3 text-[13.5px] text-white appearance-none outline-none focus:border-[#4573d2] pr-8"
                    >
                      <option value="default">Asana Default</option>
                      <option value="priority">Priority</option>
                      <option value="project">Project</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#8a8886] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="border-t border-[#28292c] pt-4 space-y-4">
                  {/* Show weekends toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-white font-medium">Show weekends</span>
                    <button
                      type="button"
                      onClick={onToggleWeekends}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                        showWeekends ? 'bg-[#4573d2] justify-end' : 'bg-[#37383b] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm block"></span>
                    </button>
                  </div>

                  {/* Show multi-day tasks toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-white font-medium">
                      Show multi-day tasks
                    </span>
                    <button
                      type="button"
                      onClick={onToggleMultiDayTasks}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                        showMultiDayTasks ? 'bg-[#4573d2] justify-end' : 'bg-[#37383b] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm block"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: FILTERS (STACKABLE FILTERS VIEW - Images 1, 2, 3, 4, 5) */}
          {currentView === 'filters' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-[52px] min-h-[52px] px-4 border-b border-[#28292c] flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('main')}
                  className="p-1 rounded-lg hover:bg-[#28292c] text-[#8a8886] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-[17px] font-bold text-white tracking-tight">Filters</h2>
              </div>

              {/* Subheader: Manage filters on this view & Clear */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between text-[12.5px]">
                <span className="text-[#8a8886] font-medium">Manage filters on this view</span>
                {filters.length > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-[#a2a09e] hover:text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter Items Stack (Stackable) */}
              <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 text-[13px] pb-36">
                {filters.map((filter) => {
                  return (
                    <div key={filter.id} className="space-y-1.5 group">
                      {/* Filter Label with Icon */}
                      <div className="flex items-center gap-2 text-[#f5f4f3] font-medium text-[13px]">
                        {filter.type === 'completion' && (
                          <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                        )}
                        {filter.type === 'creator' && <User className="w-4 h-4 text-[#8a8886]" />}
                        {filter.type === 'created_on' && <Clock className="w-4 h-4 text-[#8a8886]" />}
                        {filter.type === 'last_modified' && (
                          <Edit2 className="w-4 h-4 text-[#8a8886]" />
                        )}
                        {filter.type === 'completed_on' && (
                          <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                        )}
                        {filter.type === 'task_type' && (
                          <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                        )}

                        <span>
                          {filter.type === 'completion' && 'Completion status'}
                          {filter.type === 'creator' && 'Created by'}
                          {filter.type === 'created_on' && 'Created on'}
                          {filter.type === 'last_modified' && 'Last modified on'}
                          {filter.type === 'completed_on' && 'Completed on'}
                          {filter.type === 'task_type' && 'Task type'}
                        </span>
                      </div>

                      {/* Filter Controls Row */}
                      <div className="flex items-center gap-2">
                        {/* 1. Completion status */}
                        {filter.type === 'completion' && (
                          <div className="relative flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === `comp-${filter.id}`
                                    ? null
                                    : `comp-${filter.id}`
                                )
                              }
                              className="w-full h-10 bg-[#1e1f21] border border-[#37383b] hover:border-[#4d4f54] rounded-lg px-3 flex items-center justify-between text-white text-[13px] transition-colors"
                            >
                              <span>
                                {filter.value === 'completed'
                                  ? 'Completed tasks'
                                  : filter.value === 'all'
                                  ? 'All tasks'
                                  : 'Incomplete tasks'}
                              </span>
                              <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                            </button>

                            {openDropdownId === `comp-${filter.id}` && (
                              <div className="absolute left-0 top-full mt-1 w-full bg-[#1e1f21] border border-[#37383b] rounded-xl shadow-2xl z-40 py-1 overflow-hidden">
                                {[
                                  { val: 'incomplete', label: 'Incomplete tasks' },
                                  { val: 'completed', label: 'Completed tasks' },
                                  { val: 'all', label: 'All tasks' },
                                ].map((item) => (
                                  <button
                                    key={item.val}
                                    type="button"
                                    onClick={() => {
                                      onUpdateFilter(filter.id, { value: item.val });
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[13px] flex items-center gap-2.5 hover:bg-[#28292c] transition-colors text-white"
                                  >
                                    <span className="w-4 flex items-center justify-center">
                                      {filter.value === item.val && (
                                        <Check className="w-3.5 h-3.5 text-[#f5f4f3]" />
                                      )}
                                    </span>
                                    <span>{item.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Created by */}
                        {filter.type === 'creator' && (
                          <>
                            <div className="w-24 shrink-0 relative">
                              <select
                                value={filter.operator}
                                onChange={(e) =>
                                  onUpdateFilter(filter.id, { operator: e.target.value })
                                }
                                className="w-full h-10 bg-[#1e1f21] border border-[#37383b] rounded-lg px-2.5 text-white appearance-none outline-none text-[13px]"
                              >
                                <option value="is">is</option>
                                <option value="is_not">is not</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] absolute right-2.5 top-3.5 pointer-events-none" />
                            </div>
                            <div className="flex-1 relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === `creator-${filter.id}`
                                      ? null
                                      : `creator-${filter.id}`
                                  )
                                }
                                className="w-full h-10 bg-[#1e1f21] border border-[#37383b] hover:border-[#4d4f54] rounded-lg px-3 flex items-center justify-between text-white text-[13px] transition-colors"
                              >
                                <span className="truncate">
                                  {filter.value || 'Kevin Safrisal'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[#8a8886] shrink-0" />
                              </button>

                              {openDropdownId === `creator-${filter.id}` && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-[#1e1f21] border border-[#37383b] rounded-xl shadow-2xl z-40 py-1 overflow-hidden">
                                  {['Kevin Safrisal', 'Any teammate'].map((person) => (
                                    <button
                                      key={person}
                                      type="button"
                                      onClick={() => {
                                        onUpdateFilter(filter.id, { value: person });
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-[13px] flex items-center gap-2.5 hover:bg-[#28292c] transition-colors text-white"
                                    >
                                      <span className="w-4 flex items-center justify-center">
                                        {(filter.value === person || (!filter.value && person === 'Kevin Safrisal')) && (
                                          <Check className="w-3.5 h-3.5 text-[#f5f4f3]" />
                                        )}
                                      </span>
                                      <span>{person}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* 3. Created on / Last modified / Completed on */}
                        {(filter.type === 'created_on' ||
                          filter.type === 'last_modified' ||
                          filter.type === 'completed_on') && (
                          <>
                            <div className="w-24 shrink-0 relative">
                              <select
                                value={filter.operator}
                                onChange={(e) =>
                                  onUpdateFilter(filter.id, { operator: e.target.value })
                                }
                                className="w-full h-10 bg-[#1e1f21] border border-[#37383b] rounded-lg px-2.5 text-white appearance-none outline-none text-[13px]"
                              >
                                <option value="is">is</option>
                                <option value="is_before">is before</option>
                                <option value="is_after">is after</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] absolute right-2.5 top-3.5 pointer-events-none" />
                            </div>
                            <div className="flex-1 relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === `date-${filter.id}`
                                      ? null
                                      : `date-${filter.id}`
                                  )
                                }
                                className="w-full h-10 bg-[#1e1f21] border border-[#37383b] hover:border-[#4d4f54] rounded-lg px-3 flex items-center justify-between text-white text-[13px] transition-colors"
                              >
                                <span className="capitalize">
                                  {filter.value.replace(/_/g, ' ') || 'Today'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                              </button>

                              {openDropdownId === `date-${filter.id}` && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-[#1e1f21] border border-[#37383b] rounded-xl shadow-2xl z-40 py-1 overflow-hidden">
                                  {[
                                    { id: 'today', label: 'Today' },
                                    { id: 'yesterday', label: 'Yesterday' },
                                    { id: 'this_week', label: 'This week' },
                                    { id: 'last_week', label: 'Last week' },
                                    { id: 'last_14_days', label: 'Last 14 days' },
                                    { id: 'in_the_last_month', label: 'In the last month' },
                                    { id: 'over_one_month_ago', label: 'Over one month ago' },
                                    { id: 'specific_date', label: 'Specific date' },
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        onUpdateFilter(filter.id, { value: opt.id });
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-[13px] flex items-center gap-2.5 hover:bg-[#28292c] transition-colors text-white"
                                    >
                                      <span className="w-4 flex items-center justify-center">
                                        {filter.value === opt.id && (
                                          <Check className="w-3.5 h-3.5 text-[#f5f4f3]" />
                                        )}
                                      </span>
                                      <span>{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* 4. Task type (Milestones, Tasks, Approvals) */}
                        {filter.type === 'task_type' && (
                          <>
                            <div className="w-24 shrink-0 relative">
                              <select
                                value={filter.operator}
                                onChange={(e) =>
                                  onUpdateFilter(filter.id, { operator: e.target.value })
                                }
                                className="w-full h-10 bg-[#1e1f21] border border-[#37383b] rounded-lg px-2.5 text-white appearance-none outline-none text-[13px]"
                              >
                                <option value="is">is</option>
                                <option value="is_not">is not</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] absolute right-2.5 top-3.5 pointer-events-none" />
                            </div>
                            <div className="flex-1 relative">
                              <div
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === `type-${filter.id}`
                                      ? null
                                      : `type-${filter.id}`
                                  )
                                }
                                className="w-full min-h-[40px] bg-[#1e1f21] border border-[#37383b] hover:border-[#4d4f54] rounded-lg px-2 py-1 flex items-center justify-between text-white text-[13px] cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {filter.value.split(',').filter(Boolean).map((t) => (
                                    <span
                                      key={t}
                                      className="bg-[#2c2d30] border border-[#3e4044] text-[#f5f4f3] px-2 py-0.5 rounded text-[11.5px] font-medium flex items-center gap-1"
                                    >
                                      <span className="capitalize">{t}</span>
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const curr = filter.value.split(',').filter(Boolean);
                                          const next = curr.filter((x) => x !== t);
                                          onUpdateFilter(filter.id, {
                                            value: next.join(',') || 'tasks',
                                          });
                                        }}
                                        className="text-[#8a8886] hover:text-white cursor-pointer ml-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </span>
                                    </span>
                                  ))}
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-[#8a8886] shrink-0 ml-1" />
                              </div>

                              {/* Dropdown with checkboxes */}
                              {openDropdownId === `type-${filter.id}` && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-[#1e1f21] border border-[#37383b] rounded-xl shadow-2xl z-40 p-1.5 space-y-1">
                                  {(['milestones', 'tasks', 'approvals'] as const).map((opt) => {
                                    const activeList = filter.value.split(',').filter(Boolean);
                                    const isSelected = activeList.includes(opt);
                                    return (
                                      <div
                                        key={opt}
                                        onClick={() => {
                                          let next: string[];
                                          if (isSelected) {
                                            next = activeList.filter((x) => x !== opt);
                                            if (next.length === 0) next = ['tasks'];
                                          } else {
                                            // If only default 'tasks' was selected and clicking milestone/approval, switch to it
                                            if (activeList.length === 1 && activeList[0] === 'tasks' && opt !== 'tasks') {
                                              next = [opt];
                                            } else {
                                              next = [...activeList, opt];
                                            }
                                          }
                                          onUpdateFilter(filter.id, {
                                            value: next.join(','),
                                          });
                                        }}
                                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#28292c] cursor-pointer text-[12.5px] text-white transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          readOnly
                                          className="rounded accent-[#4573d2] pointer-events-none"
                                        />
                                        <span className="capitalize">{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Remove Filter Button ✕ */}
                        <button
                          type="button"
                          onClick={() => onRemoveFilter(filter.id)}
                          className="w-10 h-10 rounded-lg border border-[#37383b] hover:border-[#4d4f54] hover:bg-[#28292c] flex items-center justify-center text-[#8a8886] hover:text-white shrink-0 transition-colors"
                          title="Remove filter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* + Add filter button */}
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentView('add_filter')}
                    className="flex items-center gap-2 text-[#c5c3c0] hover:text-white font-medium text-[13px] py-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add filter</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: ADD FILTER LIST (Sub-view to add another filter to stack) */}
          {currentView === 'add_filter' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-[52px] min-h-[52px] px-4 border-b border-[#28292c] flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('filters')}
                  className="p-1 rounded-lg hover:bg-[#28292c] text-[#8a8886] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-[17px] font-bold text-white tracking-tight">Add filter</h2>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px]">
                {/* Search bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8a8886] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Filter by"
                    className="w-full h-9 bg-[#1b1c1e] border-2 border-white/90 rounded-lg pl-9 pr-3 text-white text-[13px] outline-none"
                    autoFocus
                  />
                </div>

                {/* Filter items list */}
                <div className="space-y-1">
                  {[
                    { type: 'completion' as const, label: 'Completion status', icon: CheckCircle2 },
                    { type: 'creator' as const, label: 'Created by', icon: User },
                    { type: 'created_on' as const, label: 'Created on', icon: Clock },
                    { type: 'last_modified' as const, label: 'Last modified on', icon: Edit2 },
                    { type: 'completed_on' as const, label: 'Completed on', icon: CheckCircle2 },
                    { type: 'task_type' as const, label: 'Task type', icon: CheckCircle2 },
                  ]
                    .filter((item) =>
                      item.label.toLowerCase().includes(filterSearch.toLowerCase())
                    )
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          onClick={() => {
                            onAddFilter(item.type);
                            setCurrentView('filters');
                          }}
                          className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                        >
                          <Icon className="w-4 h-4 text-[#8a8886]" />
                          <span className="text-[13.5px]">{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
