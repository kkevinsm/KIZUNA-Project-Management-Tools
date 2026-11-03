'use client';

import React, { useState } from 'react';
import {
  Check,
  User,
  Calendar,
  Trash2,
  ChevronRight,
  Edit2,
  MoreHorizontal,
  Folder,
  ArrowRight,
  Flag,
  Sparkles,
} from 'lucide-react';
import { Task, PriorityLevel, StatusLevel } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskRowProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showProjectColumn?: boolean;
  showDueDateColumn?: boolean;
  showVisibilityColumn?: boolean;
  showPriorityColumn?: boolean;
  showSectionColumn?: boolean;
  onMoveSection?: (section: string) => void;
}

export default function TaskRow({
  task,
  isSelected = false,
  onToggleSelect,
  showProjectColumn = true,
  showDueDateColumn = true,
  showVisibilityColumn = false,
  showPriorityColumn = true,
  showSectionColumn = false,
  onMoveSection,
}: TaskRowProps) {
  const { toggleTaskComplete, openTaskDrawer, deleteTask, updateTask, projects } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task.name);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

  const isMilestone = (task as any).taskType === 'milestone' || task.name.toLowerCase().includes('milestone');
  const isApproval = (task as any).taskType === 'approval' || task.name.toLowerCase().includes('approval');

  const handleSaveName = () => {
    if (taskName.trim() && taskName.trim() !== task.name) {
      updateTask(task.id, { name: taskName.trim() });
    } else {
      setTaskName(task.name);
    }
    setIsEditingName(false);
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#183f30] text-[#4cd195] border border-[#215340] hover:bg-[#204d3b]';
      case 'Medium':
        return 'bg-[#4a3800] text-[#f7c244] border border-[#634b00] hover:bg-[#5a4400]';
      case 'High':
        return 'bg-[#47181c] text-[#ff6b72] border border-[#612127] hover:bg-[#571e23]';
      default:
        return 'text-[#8a8886] hover:bg-[#28292c] border border-transparent';
    }
  };

  // Due date styling (overdue, today, normal)
  const getDueDateColor = () => {
    const text = (task.dueDate || '').toLowerCase();
    if (task.completed) return 'text-[#8a8886]';
    if (text.includes('today')) return 'text-[#4cd195] font-medium';
    if (text.includes('yesterday') || text.includes('nov 1') || text.includes('nov 2')) return 'text-[#f06a6a] font-medium';
    return 'text-[#c5c3c0]';
  };

  return (
    <div
      onClick={() => openTaskDrawer(task.id)}
      className={`group flex items-center h-[38px] px-3 border-b border-[#262729] hover:bg-[#232427] cursor-pointer transition-colors text-[13px] select-none ${
        isSelected ? 'bg-[#1b2b48] hover:bg-[#203456]' : ''
      } ${task.completed ? 'opacity-65' : ''}`}
    >
      {/* 1. Selection checkbox (revealed on hover or when selected) */}
      <div
        className="w-[24px] flex items-center justify-center shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.();
        }}
      >
        <div
          className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center cursor-pointer ${
            isSelected
              ? 'bg-[#4573d2] border-[#4573d2] text-white'
              : 'border-[#4a4b4e] group-hover:border-[#7a7b7e] hover:border-white'
          } ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
      </div>

      {/* 2. Complete Checkbox Circle Button */}
      <div className="w-[28px] flex items-center justify-center shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-[#38b273] border-[#38b273] text-white'
              : isMilestone
              ? 'border-[#f8be4e] hover:border-white text-[#f8be4e] rotate-45 rounded-xs'
              : 'border-[#555659] hover:border-white group-hover:border-[#888]'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>

      {/* 3. Task Name (Inline Editable & Badges) */}
      <div className="flex-1 min-w-[200px] pr-4 flex items-center gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={taskName}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') {
                setTaskName(task.name);
                setIsEditingName(false);
              }
            }}
            className="w-full bg-[#1e1f21] border border-[#4573d2] text-white px-2 py-0.5 rounded text-[13px] outline-none"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="flex items-center gap-2 truncate flex-1"
          >
            <span
              className={`truncate font-normal ${
                task.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
              }`}
            >
              {task.name}
            </span>

            {/* Badges for Milestone and Approval */}
            {isMilestone && (
              <span className="shrink-0 text-[10px] bg-[#3e2c1c] text-[#f8be4e] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                <span>◆</span>
                <span>Milestone</span>
              </span>
            )}
            {isApproval && (
              <span className="shrink-0 text-[10px] bg-[#1e2f47] text-[#85c5f8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Approval
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Projects Column (Interactive Popover) */}
      {showProjectColumn && (
        <div className="w-[180px] hidden md:flex items-center px-2 relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsProjectMenuOpen(!isProjectMenuOpen);
              setIsPriorityMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsSectionMenuOpen(false);
            }}
            className="bg-[#2a2b2e] hover:bg-[#343539] text-[#e0dedd] px-2 py-1 rounded text-[12px] truncate max-w-[170px] flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#424448]"
          >
            <span className="w-2 h-2 rounded-full bg-[#80eed2] shrink-0" />
            <span className="truncate">{task.projectName || "Kevin's first project"}</span>
          </button>

          {isProjectMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-52 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-40 py-1 text-[12.5px]"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                Change Project
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { projectId: p.id, projectName: p.name });
                    setIsProjectMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2e2f33] transition-colors ${
                    task.projectId === p.id ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#80eed2] shrink-0" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Due date column (Interactive Quick Presets) */}
      {showDueDateColumn && (
        <div className="w-[140px] hidden sm:flex items-center gap-1.5 px-2 relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsPriorityMenuOpen(false);
              setIsProjectMenuOpen(false);
              setIsSectionMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#28292c] transition-colors text-[12px] ${getDueDateColor()}`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
            <span className="truncate">{task.dueDate || 'No due date'}</span>
          </button>

          {isDateMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-44 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-40 py-1 text-[12.5px]"
            >
              {[
                { label: 'Today', val: 'Today' },
                { label: 'Tomorrow', val: 'Nov 4' },
                { label: 'Next week', val: 'Nov 10' },
                { label: 'Today – Nov 4', val: 'Today – Nov 4' },
                { label: 'Clear date', val: '' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { dueDate: d.val });
                    setIsDateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-white hover:bg-[#2e2f33] transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Priority Column (Interactive Dropdown) */}
      {showPriorityColumn && (
        <div className="w-[110px] hidden md:flex items-center px-2 relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPriorityMenuOpen(!isPriorityMenuOpen);
              setIsProjectMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsSectionMenuOpen(false);
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium leading-none transition-colors ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority || 'No priority'}
          </button>

          {isPriorityMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-32 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-40 py-1 text-[12px]"
            >
              {(['Low', 'Medium', 'High', undefined] as const).map((p) => (
                <button
                  key={p || 'none'}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { priority: p });
                    setIsPriorityMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#2e2f33] transition-colors ${
                    task.priority === p ? 'text-[#4573d2] font-bold' : 'text-white'
                  }`}
                >
                  <span>{p || 'None'}</span>
                  {task.priority === p && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Visibility Column */}
      {showVisibilityColumn && (
        <div className="w-[120px] hidden lg:flex items-center text-[#9c9a99] text-[12px] px-2 truncate">
          <span>{task.visibility || 'My workspace'}</span>
        </div>
      )}

      {/* 8. Move to Section Pill (My Tasks) */}
      {showSectionColumn && (
        <div className="w-[140px] hidden xl:flex items-center px-2 relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSectionMenuOpen(!isSectionMenuOpen);
              setIsPriorityMenuOpen(false);
              setIsProjectMenuOpen(false);
              setIsDateMenuOpen(false);
            }}
            className="text-[11.5px] text-[#8a8886] hover:text-white px-2 py-0.5 rounded hover:bg-[#28292c] truncate max-w-[130px] transition-colors flex items-center gap-1"
          >
            <span>{task.myTasksSection || 'Recently assigned'}</span>
          </button>

          {isSectionMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-44 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-40 py-1 text-[12px]"
            >
              {['Recently assigned', 'Do today', 'Do next week', 'Do later'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { myTasksSection: sec });
                    onMoveSection?.(sec);
                    setIsSectionMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-white hover:bg-[#2e2f33] transition-colors"
                >
                  {sec}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. Hover Actions: Open Details Arrow & Delete */}
      <div className="w-[60px] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openTaskDrawer(task.id);
          }}
          className="p-1 rounded hover:bg-[#343538] text-[#8a8886] hover:text-white transition-colors"
          title="Open details"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${task.name}"?`)) {
              deleteTask(task.id);
            }
          }}
          className="p-1 rounded hover:bg-[#343538] text-[#8a8886] hover:text-[#ff6b72] transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

