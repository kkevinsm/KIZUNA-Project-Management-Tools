'use client';

import React, { useState } from 'react';
import {
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
  Calendar as CalendarIcon,
  Smile,
  Check,
} from 'lucide-react';

interface CalendarOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'weeks' | 'month';
  onViewModeChange: (mode: 'weeks' | 'month') => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
  showMultiDayTasks: boolean;
  onToggleMultiDayTasks: () => void;
  taskColorMode: 'default' | 'priority' | 'project';
  onTaskColorModeChange: (mode: 'default' | 'priority' | 'project') => void;
  filterMode: 'all' | 'incomplete' | 'completed';
  onFilterModeChange: (mode: 'all' | 'incomplete' | 'completed') => void;
}

export default function CalendarOptionsDrawer({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  showWeekends,
  onToggleWeekends,
  showMultiDayTasks,
  onToggleMultiDayTasks,
  taskColorMode,
  onTaskColorModeChange,
  filterMode,
  onFilterModeChange,
}: CalendarOptionsDrawerProps) {
  const [currentView, setCurrentView] = useState<'main' | 'layout' | 'filters'>('main');
  const [viewName, setViewName] = useState('Calendar');
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

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
        <div className="w-screen max-w-[340px] sm:max-w-[360px] bg-[#1a1b1d] border-l border-[#2e2f32] shadow-2xl flex flex-col text-[#f5f4f3] animate-in slide-in-from-right duration-200">
          {/* VIEW 1: MAIN OPTIONS PANEL (Image 1) */}
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
                  <ArrowRight className="w-4 h-4" />
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
                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg bg-[#242528] hover:bg-[#2d2e32] border border-[#37383b] flex items-center justify-center text-[#9c9a99] hover:text-white transition-colors shrink-0"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
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
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
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

          {/* VIEW 2: LAYOUT OPTIONS SUB-PANEL (Image 2) */}
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

          {/* VIEW 3: FILTERS / ADD FILTER SUB-PANEL (Image 3) */}
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

                {/* Filter items list matching Asana screenshot 3 */}
                <div className="space-y-1">
                  {/* 1. Completion status */}
                  <button
                    onClick={() => {
                      onFilterModeChange(filterMode === 'incomplete' ? 'all' : 'incomplete');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                      <span className="text-[13.5px]">Completion status</span>
                    </div>
                    <span className="text-[11px] text-[#4573d2] uppercase font-semibold">
                      {filterMode}
                    </span>
                  </button>

                  {/* 2. Created by */}
                  <button
                    onClick={() => {
                      alert('Filtered by creator: Kevin Safrisal');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-[#8a8886]" />
                    <span className="text-[13.5px]">Created by</span>
                  </button>

                  {/* 3. Created on */}
                  <button
                    onClick={() => {
                      alert('Filtered by created date');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <Clock className="w-4 h-4 text-[#8a8886]" />
                    <span className="text-[13.5px]">Created on</span>
                  </button>

                  {/* 4. Last modified on */}
                  <button
                    onClick={() => {
                      alert('Filtered by last modified date');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[#8a8886]" />
                    <span className="text-[13.5px]">Last modified on</span>
                  </button>

                  {/* 5. Completed on */}
                  <button
                    onClick={() => {
                      onFilterModeChange('completed');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                    <span className="text-[13.5px]">Completed on</span>
                  </button>

                  {/* 6. Task type */}
                  <button
                    onClick={() => {
                      alert('Filtered by task type: Standard task');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-[#242528] text-white text-left transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#8a8886]" />
                    <span className="text-[13.5px]">Task type</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
