'use client';

import React, { useState } from 'react';
import {
  Check,
  User,
  Trash2,
  Edit2,
  Sparkles,
  Building2,
  Lock,
  ArrowRight,
  ChevronDown,
  GripVertical,
  ArrowUpRight,
  Mail,
  Plus,
} from 'lucide-react';
import { Task, PriorityLevel, StatusLevel, CustomColumn, Assignee } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskRowProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showAssigneeColumn?: boolean;
  showDueDateColumn?: boolean;
  showPriorityColumn?: boolean;
  showStatusColumn?: boolean;
  showProjectColumn?: boolean;
  showVisibilityColumn?: boolean;
  showCollaboratorsColumn?: boolean;
  customColumns?: CustomColumn[];
  onUpdateCustomField?: (taskId: string, fieldId: string, value: string) => void;
  onMoveSection?: (section: string) => void;
  onOpenEditField?: (fieldType: 'Status' | 'Priority') => void;
}

export default function TaskRow({
  task,
  isSelected = false,
  onToggleSelect,
  showAssigneeColumn = false,
  showDueDateColumn = true,
  showPriorityColumn = false,
  showStatusColumn = false,
  showProjectColumn = true,
  showVisibilityColumn = true,
  showCollaboratorsColumn = true,
  customColumns = [],
  onUpdateCustomField,
  onMoveSection,
  onOpenEditField,
}: TaskRowProps) {
  const {
    toggleTaskComplete,
    openTaskDrawer,
    deleteTask,
    updateTask,
    projects,
    users,
    currentUser,
    statusOptions,
    priorityOptions,
    autoFillTaskStatus,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task.name);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [isInlineAssigneeActive, setIsInlineAssigneeActive] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<string | null>(null);
  const [customFieldValue, setCustomFieldValue] = useState('');

  const filteredUsers = [
    currentUser,
    ...users.filter((u) => u.email !== currentUser.email),
  ].filter(
    (u) =>
      u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

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

  // Due date styling matching screenshot media_1793780943197_1575253f.png
  // Active/current ranges (Nov 2 – Today, Nov 3 – 5) are green text, future ranges (Today – Nov 6) are white text
  const getDueDateColor = () => {
    const text = (task.dueDate || '').toLowerCase();
    if (task.completed) return 'text-[#8a8886]';
    if (text.includes('today – nov 6')) return 'text-white font-medium';
    if (text.includes('today') || text.includes('nov 2') || text.includes('nov 3') || text.includes('nov 5')) {
      return 'text-[#4cd195] font-medium';
    }
    if (text.includes('yesterday') || text.includes('nov 1')) return 'text-[#f06a6a] font-medium';
    return 'text-[#4cd195]';
  };

  // Helper to get status option styling
  const getStatusOpt = (statusName?: string) => {
    if (!statusName) return null;
    const found = statusOptions.find(
      (o) => o.name.toLowerCase() === statusName.toLowerCase()
    );
    if (found) return found;
    if (statusName.toLowerCase() === 'on track') {
      return { name: 'On track', color: '#79e2c6', textColor: '#0c392b' };
    }
    if (statusName.toLowerCase() === 'at risk') {
      return { name: 'At risk', color: '#fed648', textColor: '#473b00' };
    }
    if (statusName.toLowerCase() === 'off track') {
      return { name: 'Off track', color: '#fd8374', textColor: '#4a1813' };
    }
    return { name: statusName, color: '#79e2c6', textColor: '#0c392b' };
  };

  // Helper to get priority option styling
  const getPriorityOpt = (priorityName?: string) => {
    if (!priorityName) return null;
    const found = priorityOptions.find(
      (o) => o.name.toLowerCase() === priorityName.toLowerCase()
    );
    if (found) return found;
    if (priorityName.toLowerCase() === 'low') {
      return { name: 'Low', color: '#79e2c6', textColor: '#0c392b' };
    }
    if (priorityName.toLowerCase() === 'medium') {
      return { name: 'Medium', color: '#fec156', textColor: '#472d00' };
    }
    if (priorityName.toLowerCase() === 'high') {
      return { name: 'High', color: '#de9bf6', textColor: '#3e134f' };
    }
    return { name: priorityName, color: '#79e2c6', textColor: '#0c392b' };
  };

  const currentStatusOpt = getStatusOpt(task.status);
  const currentPriorityOpt = getPriorityOpt(task.priority);

  const isUnassigned =
    !task.assignee?.name ||
    task.assignee.name === 'Unassigned' ||
    (task.assignee as any).isPlaceholder;

  return (
    <div
      onClick={() => openTaskDrawer(task.id)}
      className={`group flex items-center h-[38px] min-w-max border-b border-[#262729] hover:bg-[#232427] cursor-pointer transition-colors text-[13px] select-none ${
        isSelected ? 'bg-[#1b2b48] hover:bg-[#203456]' : ''
      }`}
    >
      {/* 1. STICKY LEFT COLUMN: Task Name, Selection Checkbox & Complete Button */}
      <div
        className={`w-[440px] min-w-[440px] max-w-[440px] shrink-0 sticky left-0 z-10 flex items-center px-3 h-full transition-colors ${
          isSelected
            ? 'bg-[#1b2b48] group-hover:bg-[#203456]'
            : 'bg-[#1e1f21] group-hover:bg-[#232427]'
        }`}
      >
        {/* Drag handle ::: (matching f_018.jpg) */}
        <div className="w-[18px] shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#6d6c6e] hover:text-white cursor-grab">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Selection checkbox */}
        <div
          className="w-[22px] flex items-center justify-center shrink-0"
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
                ? 'bg-[#4cd195] border-[#4cd195] text-[#141517]'
                : isMilestone
                ? 'border-[#ffb020] text-transparent hover:text-[#ffb020] hover:bg-[#ffb020]/20'
                : 'border-[#555659] text-transparent hover:text-white hover:border-[#888]'
            }`}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Task Name Input or Text */}
        <div className="flex-1 min-w-0 pr-2 pl-1 flex items-center justify-between">
          {isEditingName ? (
            <input
              type="text"
              autoFocus
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setTaskName(task.name);
                  setIsEditingName(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-white outline-none border-b border-[#4573d2] py-0.5 text-[13px]"
            />
          ) : (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              className="flex items-center gap-2 truncate flex-1 min-w-0"
            >
              <span
                className={`truncate ${
                  task.completed ? 'line-through text-[#8a8886]' : 'text-white'
                }`}
              >
                {task.name}
              </span>

              {isMilestone && (
                <span className="shrink-0 text-[10px] bg-[#3a2e12] text-[#ffc83b] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>◆</span>
                  <span>Milestone</span>
                </span>
              )}
              {isApproval && (
                <span className="shrink-0 text-[10px] bg-[#1e2f47] text-[#85c5f8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Approval
                </span>
              )}

              {/* Open Details Drawer Arrow (matching f_018.jpg) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskDrawer(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#2e2f33] text-[#8a8886] hover:text-white transition-opacity ml-auto shrink-0"
                title="Open details"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. ASSIGNEE COLUMN (Matching f_010.jpg & f_012.jpg) */}
      {showAssigneeColumn && (
        <div className="w-[160px] shrink-0 px-2 flex items-center h-full relative" data-popover>
          {isInlineAssigneeActive ? (
            <div className="w-full relative">
              <div className="flex items-center bg-[#18191b] border border-[#4573d2] rounded-md px-2 py-0.5 w-full">
                <input
                  type="text"
                  autoFocus
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (assigneeSearch.trim()) {
                        const email = assigneeSearch.trim().toLowerCase();
                        updateTask(task.id, {
                          assignee: {
                            name: email.split('@')[0],
                            initials: email.substring(0, 2).toUpperCase(),
                            email,
                          },
                          assigneeEmail: email,
                        });
                      }
                      setIsInlineAssigneeActive(false);
                      setIsAssigneeMenuOpen(false);
                      setAssigneeSearch('');
                    } else if (e.key === 'Escape') {
                      setIsInlineAssigneeActive(false);
                      setIsAssigneeMenuOpen(false);
                      setAssigneeSearch('');
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsInlineAssigneeActive(false);
                      setIsAssigneeMenuOpen(false);
                    }, 200);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Name or email"
                  className="w-full bg-transparent text-white text-[12.5px] outline-none placeholder-[#6d6c6e]"
                />
              </div>

              {/* Dropdown Menu (matching f_012.jpg) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 w-64 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1.5 text-[12.5px] animate-in fade-in duration-100"
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886]">
                  Suggested people
                </div>

                {/* Filtered users list */}
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      updateTask(task.id, {
                        assignee: {
                          name: u.name,
                          initials: u.initials,
                          avatarColor: u.avatarColor,
                          email: u.email,
                        },
                        assigneeEmail: u.email,
                      });
                      setIsInlineAssigneeActive(false);
                      setIsAssigneeMenuOpen(false);
                      setAssigneeSearch('');
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#2f3135] text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: u.avatarColor || '#4573d2' }}
                      >
                        {u.initials}
                      </div>
                      <span className="font-medium text-white truncate">{u.name}</span>
                    </div>
                    <span className="text-[11px] text-[#8a8886] truncate max-w-[100px] ml-2">
                      {u.email}
                    </span>
                  </button>
                ))}

                <div className="border-t border-[#37383b] my-1.5" />

                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886]">
                  AI Teammates
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    updateTask(task.id, {
                      assignee: {
                        name: 'AI Agent',
                        initials: 'AI',
                        avatarColor: '#ab7ffb',
                        role: 'AI Teammate',
                      },
                    });
                    setIsInlineAssigneeActive(false);
                    setIsAssigneeMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2f3135] text-[#ab7ffb] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create and assign AI Teammate</span>
                </button>

                <div className="border-t border-[#37383b] my-1.5" />

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsInlineAssigneeActive(false);
                    setIsAssigneeMenuOpen(false);
                    const email = prompt('Enter teammate email to invite:');
                    if (email) {
                      updateTask(task.id, {
                        assignee: {
                          name: email.split('@')[0],
                          initials: email.substring(0, 2).toUpperCase(),
                          email,
                        },
                        assigneeEmail: email,
                      });
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2f3135] text-[#8a8886] hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Invite teammates via email</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsInlineAssigneeActive(true);
                setIsAssigneeMenuOpen(true);
                setIsDateMenuOpen(false);
                setIsPriorityMenuOpen(false);
                setIsStatusMenuOpen(false);
              }}
              className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[#28292c] transition-colors max-w-full truncate text-left w-full"
            >
              {!isUnassigned ? (
                <>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: task.assignee?.avatarColor || '#d84b7f' }}
                    title={task.assignee?.name}
                  >
                    {task.assignee?.initials || 'KS'}
                  </div>
                  <span className="text-[13px] text-white truncate font-normal">
                    {task.assignee?.name}
                  </span>
                </>
              ) : (
                <div
                  className="w-6 h-6 rounded-full border border-dashed border-[#57585c] flex items-center justify-center text-[#8a8886] hover:border-white hover:text-white transition-colors shrink-0"
                  title="Unassigned"
                >
                  <User className="w-3 h-3" />
                </div>
              )}
            </button>
          )}
        </div>
      )}

      {/* 3. DUE DATE COLUMN (Matching screenshot media_1793780943197_1575253f.png) */}
      {showDueDateColumn && (
        <div className="w-[130px] shrink-0 px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsAssigneeMenuOpen(false);
              setIsPriorityMenuOpen(false);
              setIsStatusMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#28292c] transition-colors text-[12px] truncate ${getDueDateColor()}`}
          >
            <span className="truncate">{task.dueDate || '—'}</span>
          </button>

          {isDateMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-48 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1 text-[12.5px] animate-in fade-in zoom-in-95 duration-100"
            >
              {[
                { label: 'Nov 2 – Today', val: 'Nov 2 – Today' },
                { label: 'Nov 3 – 5', val: 'Nov 3 – 5' },
                { label: 'Today – Nov 6', val: 'Today – Nov 6' },
                { label: 'Today', val: 'Today' },
                { label: 'Tomorrow', val: 'Tomorrow' },
                { label: 'Next week', val: 'Next week' },
                { label: 'Clear date', val: '' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { dueDate: d.val });
                    setIsDateMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#2e2f33] transition-colors ${
                    task.dueDate === d.val ? 'text-[#4573d2] font-semibold' : 'text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PRIORITY COLUMN (Matching screenshot media_1793780943197_1575253f.png) */}
      {showPriorityColumn && (
        <div className="w-[110px] shrink-0 px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPriorityMenuOpen(!isPriorityMenuOpen);
              setIsAssigneeMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsStatusMenuOpen(false);
            }}
            className="flex items-center"
          >
            {currentPriorityOpt ? (
              <span
                className="px-2 py-0.5 rounded-[6px] text-[12px] font-medium transition-transform hover:scale-105 shadow-xs"
                style={{
                  backgroundColor: currentPriorityOpt.color,
                  color: currentPriorityOpt.textColor || '#000',
                }}
              >
                {currentPriorityOpt.name}
              </span>
            ) : (
              <span className="text-[#6d6c6e] hover:text-white text-[12px] px-1.5 py-0.5 rounded hover:bg-[#28292c]">
                —
              </span>
            )}
          </button>

          {isPriorityMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-44 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1.5 text-[12.5px] animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Clear option */}
              <button
                type="button"
                onClick={() => {
                  updateTask(task.id, { priority: undefined });
                  setIsPriorityMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#2f3135] text-[#8a8886] hover:text-white flex items-center justify-between"
              >
                <span>—</span>
                {!task.priority && <Check className="w-3.5 h-3.5 text-[#cfcecd]" />}
              </button>

              {/* Priority options list */}
              {priorityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { priority: opt.name as PriorityLevel });
                    setIsPriorityMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] transition-colors"
                >
                  <span
                    className="px-2 py-0.5 rounded-[5px] text-[12px] font-medium"
                    style={{ backgroundColor: opt.color, color: opt.textColor || '#000' }}
                  >
                    {opt.name}
                  </span>
                  {task.priority?.toLowerCase() === opt.name.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-[#cfcecd]" />
                  )}
                </button>
              ))}

              <div className="border-t border-[#37383b] my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsPriorityMenuOpen(false);
                  onOpenEditField?.('Priority');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#2f3135] text-[#cfcecd] hover:text-white text-[12px] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#8a8886]" />
                <span>Edit options</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. STATUS COLUMN (Matching screenshot media_1793780962613_1b059ffd.png) */}
      {showStatusColumn && (
        <div className="w-[110px] shrink-0 px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStatusMenuOpen(!isStatusMenuOpen);
              setIsAssigneeMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsPriorityMenuOpen(false);
            }}
            className="flex items-center"
          >
            {currentStatusOpt ? (
              <span
                className="px-2 py-0.5 rounded-[6px] text-[12px] font-medium transition-transform hover:scale-105 shadow-xs"
                style={{
                  backgroundColor: currentStatusOpt.color,
                  color: currentStatusOpt.textColor || '#000',
                }}
              >
                {currentStatusOpt.name}
              </span>
            ) : (
              <span className="text-[#6d6c6e] hover:text-white text-[12px] px-1.5 py-0.5 rounded hover:bg-[#28292c]">
                —
              </span>
            )}
          </button>

          {/* Status Dropdown Menu (Exact match for media_1793780962613_1b059ffd.png) */}
          {isStatusMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1 w-48 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1.5 text-[12.5px] animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Clear status (—) */}
              <button
                type="button"
                onClick={() => {
                  updateTask(task.id, { status: undefined });
                  setIsStatusMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#2f3135] text-[#8a8886] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="text-[13px]">—</span>
                {!task.status && <Check className="w-3.5 h-3.5 text-[#cfcecd]" />}
              </button>

              {/* Status options pills */}
              {statusOptions.map((opt) => {
                const isSelected = task.status?.toLowerCase() === opt.name.toLowerCase();
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateTask(task.id, { status: opt.name as StatusLevel });
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2f3135] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 flex items-center justify-center">
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#cfcecd]" />}
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-[5px] text-[12px] font-medium"
                        style={{ backgroundColor: opt.color, color: opt.textColor || '#000' }}
                      >
                        {opt.name}
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-[#37383b] my-1" />

              {/* Edit options (Pencil icon) */}
              <button
                type="button"
                onClick={() => {
                  setIsStatusMenuOpen(false);
                  onOpenEditField?.('Status');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#2f3135] text-white text-[12.5px] transition-colors cursor-pointer group/item relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <Edit2 className="w-3.5 h-3.5 text-[#8a8886] group-hover/item:text-white" />
                <span>Edit options</span>
              </button>

              {/* Auto-fill field value (AI Sparkles icon) */}
              <button
                type="button"
                onClick={() => {
                  autoFillTaskStatus(task.id);
                  setIsStatusMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#2f3135] text-white text-[12.5px] transition-colors cursor-pointer group/item"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8a8886] group-hover/item:text-white" />
                <span>Auto-fill field value</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. COLLABORATORS COLUMN */}
      {showCollaboratorsColumn && (
        <div className="w-[150px] shrink-0 px-3 flex items-center h-full">
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

      {/* 7. PROJECTS COLUMN */}
      {showProjectColumn && (
        <div className="w-[190px] shrink-0 px-2 flex items-center h-full relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsProjectMenuOpen(!isProjectMenuOpen);
              setIsDateMenuOpen(false);
            }}
            className="bg-[#2a2b2e] hover:bg-[#343539] text-[#e0dedd] px-2 py-0.5 rounded-md text-[12px] truncate max-w-[180px] flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#424448]"
          >
            <span className="w-2.5 h-2 rounded-[2px] bg-white/90 shrink-0" />
            <span className="truncate">{task.projectName || "Kevin's first project"}</span>
          </button>

          {isProjectMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-full mt-1 w-52 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1 text-[12.5px]"
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
                  <span className="w-2.5 h-2 rounded-[2px] bg-white/90 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. TASK VISIBILITY COLUMN */}
      {showVisibilityColumn && (
        <div className="w-[150px] shrink-0 px-3 flex items-center gap-1.5 text-[#9c9a99] text-[12px] h-full truncate">
          {task.visibility === 'Only me' || task.visibility === 'private' || !task.projectName ? (
            <Lock className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
          )}
          <span className="truncate">
            {task.visibility || task.workspace || (task.projectName ? 'Workspace' : 'Only me')}
          </span>
        </div>
      )}

      {/* 9. DYNAMIC CUSTOM COLUMNS */}
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
            className="w-[150px] shrink-0 px-3 flex items-center h-full text-[12px] text-[#f5f4f3] truncate hover:bg-[#28292c]/50 transition-colors"
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

      {/* 10. ROW HOVER ACTIONS */}
      <div className="w-[80px] shrink-0 px-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openTaskDrawer(task.id);
          }}
          className="p-1 rounded hover:bg-[#28292c] text-[#8a8886] hover:text-white cursor-pointer"
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
          className="p-1 rounded hover:bg-[#47181c] text-[#8a8886] hover:text-[#ff6b72] cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
