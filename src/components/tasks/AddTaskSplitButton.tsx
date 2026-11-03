'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronDown,
  CheckCircle2,
  UserCheck,
  Diamond,
} from 'lucide-react';

interface AddTaskSplitButtonProps {
  onAddTask: (type: 'task' | 'milestone' | 'approval') => void;
  onAddSection?: () => void;
  canAddSection?: boolean;
  className?: string;
}

export default function AddTaskSplitButton({
  onAddTask,
  onAddSection,
  canAddSection = false,
  className = '',
}: AddTaskSplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSectionHovered, setIsSectionHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsSectionHovered(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (type: 'task' | 'milestone' | 'approval') => {
    onAddTask(type);
    setIsOpen(false);
    setIsSectionHovered(false);
  };

  const handleSectionSelect = () => {
    if (!canAddSection) return;
    onAddSection?.();
    setIsOpen(false);
    setIsSectionHovered(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-stretch h-7 rounded-lg select-none ${className}`}>
      {/* Split button main action */}
      <div className="inline-flex items-stretch h-full rounded-lg overflow-hidden shadow-xs bg-[#4573d2]">
        <button
          type="button"
          onClick={() => handleSelect('task')}
          className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-2.5 font-medium text-[12.5px] transition-colors h-full"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add task</span>
        </button>
        <div className="w-px bg-white/20 h-full" />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center justify-center bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 transition-colors h-full ${
            isOpen ? 'bg-[#3562be]' : ''
          }`}
          title="More task types"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Asana Add Task Popover */}
      {isOpen && (
        <div className="absolute top-8.5 left-0 w-[240px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] animate-in fade-in duration-100">
          {/* Task */}
          <button
            type="button"
            onClick={() => handleSelect('task')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#252628] transition-colors group cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
            <span className="font-medium text-[13px]">Task</span>
            <span className="ml-auto text-[11px] bg-[#2a2b2e] text-[#8a8886] px-1.5 py-0.5 rounded font-normal">
              Default
            </span>
          </button>

          {/* Approval */}
          <button
            type="button"
            onClick={() => handleSelect('approval')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#252628] transition-colors group cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
            <span className="font-medium text-[13px]">Approval</span>
          </button>

          {/* Milestone */}
          <button
            type="button"
            onClick={() => handleSelect('milestone')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#252628] transition-colors group cursor-pointer"
          >
            <Diamond className="w-4 h-4 text-[#8a8886] group-hover:text-[#f8be4e] transition-colors" />
            <span className="font-medium text-[13px]">Milestone</span>
            <div className="ml-auto flex items-center gap-1 text-[11px] text-[#8a8886] font-medium">
              <kbd className="bg-[#2a2b2e] text-[#a2a09d] px-1.5 py-0.5 rounded text-[10.5px] font-sans">⇧</kbd>
              <kbd className="bg-[#2a2b2e] text-[#a2a09d] px-1.5 py-0.5 rounded text-[10.5px] font-sans">Tab</kbd>
              <kbd className="bg-[#2a2b2e] text-[#a2a09d] px-1.5 py-0.5 rounded text-[10.5px] font-sans">M</kbd>
            </div>
          </button>

          {/* Divider */}
          <div className="border-t border-[#313235] my-1" />

          {/* Section Row */}
          <div
            className="relative"
            onMouseEnter={() => setIsSectionHovered(true)}
            onMouseLeave={() => setIsSectionHovered(false)}
          >
            {canAddSection ? (
              /* Enabled Section Item (in Board) */
              <button
                type="button"
                onClick={handleSectionSelect}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-white hover:bg-[#252628] transition-colors group cursor-pointer"
              >
                {/* 3-line section icon */}
                <svg
                  className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors shrink-0"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="2" y="3.5" width="12" height="1.5" rx="0.75" />
                  <rect x="2" y="7.25" width="8" height="1.5" rx="0.75" />
                  <rect x="2" y="11" width="12" height="1.5" rx="0.75" />
                </svg>
                <span className="font-medium text-[13px]">Section</span>
                <div className="ml-auto flex items-center gap-1 text-[11px] text-[#8a8886] font-medium">
                  <kbd className="bg-[#2a2b2e] text-[#a2a09d] px-1.5 py-0.5 rounded text-[10.5px] font-sans">Tab</kbd>
                  <kbd className="bg-[#2a2b2e] text-[#a2a09d] px-1.5 py-0.5 rounded text-[10.5px] font-sans">N</kbd>
                </div>
              </button>
            ) : (
              /* Disabled Section Item (in List and Calendar) */
              <div className="w-full flex items-center px-3 py-1.5 text-[#555659] cursor-not-allowed select-none">
                <span className="font-medium text-[13px] pl-6.5">Section</span>
              </div>
            )}

            {/* Asana Tooltip: Cannot add section here (When hovered on disabled Section) */}
            {!canAddSection && isSectionHovered && (
              <div className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-[#2a2b2e] border border-[#3e4044] text-white text-[12px] font-normal px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none z-50 animate-in fade-in duration-100 flex items-center">
                <span>Cannot add section here</span>
                {/* Right pointing arrow */}
                <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-[#2a2b2e]" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
