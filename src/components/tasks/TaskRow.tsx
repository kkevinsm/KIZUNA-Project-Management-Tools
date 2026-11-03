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
  Building2,
  Users,
  Plus,
} from 'lucide-react';
import { Task, PriorityLevel, StatusLevel, CustomColumn } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskRowProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showProjectColumn?: boolean;
  showDueDateColumn?: boolean;
  showVisibilityColumn?: boolean;
  showCollaboratorsColumn?: boolean;
  customColumns?: CustomColumn[];
  onUpdateCustomField?: (taskId: string, fieldId: string, value: string) => void;
  onMoveSection?: (section: string) => void;
}

export default function TaskRow({
  task,
  isSelected = false,
  onToggleSelect,
  showProjectColumn = true,
  showDueDateColumn = true,
  showVisibilityColumn = true,
  showCollaboratorsColumn = true,
  customColumns = [],
  onUpdateCustomField,
  onMoveSection,
}: TaskRowProps) {
  const { toggleTaskComplete, openTaskDrawer, deleteTask, updateTask, projects, users } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task.name);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<string | null>(null);
  const [customFieldValue, setCustomFieldValue] = useState('');

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

  const handleSaveCustomField = (fieldId: string) => {
    const currentCustom = task.customFields || {};
    const updated = { ...currentCustom, [fieldId]: customFieldValue };
    updateTask(task.id, { customFields: updated });
    onUpdateCustomField?.(task.id, fieldId, customFieldValue);
    setEditingCustomField(null);
  };

  // Due date styling (overdue, today, normal)
  const getDueDateColor = () => {
    const text = (task.dueDate || '').toLowerCase();
    if (task.completed) return 'text-[#8a8886]';
    if (text.includes('today')) return 'text-[#4cd195] font-medium';
    if (text.includes('yesterday') || text.includes('nov 1') || text.includes('nov 2')) return 'text-[#f06a6a] font-medium';
    return 'text-[#4cd195]';
  };

  return (
    <div
      onClick={() => openTaskDrawer(task.id)}
      className={`group flex items-center h-[38px] min-w-max border-b border-[#262729] hover:bg-[#232427] cursor-pointer transition-colors text-[13px] select-none ${
        isSelected ? 'bg-[#1b2b48] hover:bg-[#203456]' : ''
      } ${task.completed ? 'opacity-65' : ''}`}
    >
      {/* 1. STICKY LEFT COLUMN: Task Name, Selection Checkbox & Complete Button */}
      <div className="w-[340px] sm:w-[400px] lg:w-[460px] shrink-0 sticky left-0 z-10 bg-[#1e1f21] group-hover:bg-[#232427] border-r border-[#262729] flex items-center px-3 h-full">
        {/* Selection checkbox */}
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

        {/* Complete Checkbox Circle Button */}
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

        {/* Task Name Input / Text */}
        <div className="flex-1 min-w-[180px] pr-2 flex items-center gap-2">
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
      </div>

      {/* 2. DUE DATE COLUMN (Horizontally Scrollable) */}
      {showDueDateColumn && (
        <div className="w-[140px] shrink-0 border-r border-[#262729] px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsProjectMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#28292c] transition-colors text-[12px] truncate ${getDueDateColor()}`}
          >
            <span className="truncate">{task.dueDate || ''}</span>
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
                { label: 'Nov 2 – 4', val: 'Nov 2 – 4' },
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

      {/* 3. COLLABORATORS COLUMN */}
      {showCollaboratorsColumn && (
        <div className="w-[150px] shrink-0 border-r border-[#262729] px-3 flex items-center h-full">
          <div className="flex items-center -space-x-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-[#1e1f21]"
              style={{ backgroundColor: task.assignee?.avatarColor || '#4573d2' }}
              title={task.assignee?.name || 'Assignee'}
            >
              {task.assignee?.initials || 'KS'}
            </div>
          </div>
        </div>
      )}

      {/* 4. PROJECTS COLUMN */}
      {showProjectColumn && (
        <div className="w-[190px] shrink-0 border-r border-[#262729] px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsProjectMenuOpen(!isProjectMenuOpen);
              setIsDateMenuOpen(false);
            }}
            className="bg-[#2a2b2e] hover:bg-[#343539] text-[#e0dedd] px-2 py-0.5 rounded-md text-[12px] truncate max-w-[180px] flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#424448]"
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

      {/* 5. TASK VISIBILITY COLUMN */}
      {showVisibilityColumn && (
        <div className="w-[150px] shrink-0 border-r border-[#262729] px-3 flex items-center gap-1.5 text-[#9c9a99] text-[12px] h-full truncate">
          <Building2 className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
          <span className="truncate">{task.visibility || 'My workspace'}</span>
        </div>
      )}

      {/* 6. DYNAMIC CUSTOM COLUMNS */}
      {customColumns.map((col) => {
        const val = task.customFields?.[col.id] || '';
        const isEditingThis = editingCustomField === col.id;

        return (
          <div
            key={col.id}
            onClick={(e) => {
              e.stopPropagation();
              setEditingCustomField(col.id);
              setCustomFieldValue(val);
            }}
            className="w-[150px] shrink-0 border-r border-[#262729] px-3 flex items-center h-full text-[12px] text-[#f5f4f3] truncate hover:bg-[#28292c]/50 transition-colors"
          >
            {isEditingThis ? (
              <input
                autoFocus
                type="text"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                onBlur={() => handleSaveCustomField(col.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCustomField(col.id);
                  if (e.key === 'Escape') setEditingCustomField(null);
                }}
                className="w-full bg-[#1e1f21] border border-[#4573d2] text-white px-1.5 py-0.5 rounded text-[12px] outline-none"
              />
            ) : (
              <span className={`truncate ${val ? 'text-white' : 'text-[#6d6c6e]'}`}>
                {val || '—'}
              </span>
            )}
          </div>
        );
      })}

      {/* 7. ROW HOVER ACTIONS */}
      <div className="w-[80px] shrink-0 px-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openTaskDrawer(task.id);
          }}
          className="p-1 rounded hover:bg-[#28292c] text-[#8a8886] hover:text-white"
          title="Open details"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="p-1 rounded hover:bg-[#47181c] text-[#8a8886] hover:text-[#ff6b72]"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
