'use client';

import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  Edit2,
  Plus,
  ChevronDown,
  X,
} from 'lucide-react';
import { Task } from '@/lib/types';

export interface FilterRule {
  id: string;
  field:
    | 'completion'
    | 'start_date'
    | 'due_date'
    | 'created_by'
    | 'created_on'
    | 'last_modified'
    | 'completed_on'
    | 'task_type';
  operator: 'is' | 'is_not' | 'is_before' | 'is_after';
  value: string;
}

interface FilterPopoverContentProps {
  quickFilter: 'all' | 'incomplete' | 'completed' | 'due_this_week' | 'due_next_week';
  onQuickFilterChange: (
    mode: 'all' | 'incomplete' | 'completed' | 'due_this_week' | 'due_next_week'
  ) => void;
  rules: FilterRule[];
  onAddRule: (field: FilterRule['field']) => void;
  onUpdateRule: (id: string, updates: Partial<FilterRule>) => void;
  onRemoveRule: (id: string) => void;
  onClearAll: () => void;
}

export function evaluateTaskFilters(
  task: Task,
  quickFilter: string,
  rules: FilterRule[]
): boolean {
  // 1. Quick Filters evaluation
  if (quickFilter === 'incomplete' && task.completed) return false;
  if (quickFilter === 'completed' && !task.completed) return false;

  const dueLower = (task.dueDate || '').toLowerCase();
  if (quickFilter === 'due_this_week') {
    const isThisWeek =
      dueLower.includes('today') ||
      dueLower.includes('yesterday') ||
      dueLower.includes('nov 2') ||
      dueLower.includes('nov 3') ||
      dueLower.includes('nov 4') ||
      dueLower.includes('nov 5') ||
      dueLower.includes('nov 6');
    if (!isThisWeek) return false;
  }

  if (quickFilter === 'due_next_week') {
    const isNextWeek =
      dueLower.includes('next week') ||
      dueLower.includes('nov 7') ||
      dueLower.includes('nov 8') ||
      dueLower.includes('nov 9') ||
      dueLower.includes('nov 10');
    if (!isNextWeek) return false;
  }

  // 2. Custom Stackable Filter Rules evaluation
  for (const rule of rules) {
    if (rule.field === 'completion') {
      const isCompleted = !!task.completed;
      const target = rule.value === 'completed';
      const matches = rule.operator === 'is' ? isCompleted === target : isCompleted !== target;
      if (!matches) return false;
    }

    if (rule.field === 'due_date' || rule.field === 'start_date') {
      const val = rule.value.toLowerCase();
      let matches = false;
      if (val === 'today') {
        matches = dueLower.includes('today') || dueLower.includes('nov 3');
      } else if (val === 'yesterday') {
        matches = dueLower.includes('yesterday') || dueLower.includes('nov 2');
      } else if (val === 'this week') {
        matches =
          dueLower.includes('nov 2') ||
          dueLower.includes('nov 3') ||
          dueLower.includes('nov 4') ||
          dueLower.includes('nov 5') ||
          dueLower.includes('nov 6') ||
          dueLower.includes('today');
      } else if (val === 'next week') {
        matches = dueLower.includes('next week') || dueLower.includes('nov 10');
      } else {
        matches = dueLower.includes(val);
      }

      if (rule.operator === 'is_not') matches = !matches;
      if (!matches) return false;
    }

    if (rule.field === 'created_by') {
      const assigneeName = (task.assignee?.name || 'Kevin Safrisal').toLowerCase();
      const val = rule.value.toLowerCase();
      let matches = val === 'anyone' ? true : assigneeName.includes(val);
      if (rule.operator === 'is_not') matches = !matches;
      if (!matches) return false;
    }

    if (rule.field === 'task_type') {
      const tType = ((task as any).taskType || 'task').toLowerCase();
      const val = rule.value.toLowerCase();
      let matches = tType === val;
      if (rule.operator === 'is_not') matches = !matches;
      if (!matches) return false;
    }

    if (rule.field === 'completed_on') {
      let matches = task.completed === true;
      if (rule.operator === 'is_not') matches = !matches;
      if (!matches) return false;
    }
  }

  return true;
}

export default function FilterPopoverContent({
  quickFilter,
  onQuickFilterChange,
  rules,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onClearAll,
}: FilterPopoverContentProps) {
  const [isAddFilterMenuOpen, setIsAddFilterMenuOpen] = useState(false);
  const [isCompletedSubmenuOpen, setIsCompletedSubmenuOpen] = useState(false);

  const getFieldLabel = (field: FilterRule['field']) => {
    switch (field) {
      case 'completion':
        return 'Completion status';
      case 'start_date':
        return 'Start date';
      case 'due_date':
        return 'Due date';
      case 'created_by':
        return 'Created by';
      case 'created_on':
        return 'Created on';
      case 'last_modified':
        return 'Last modified on';
      case 'completed_on':
        return 'Completed on';
      case 'task_type':
        return 'Task type';
    }
  };

  const getFieldIcon = (field: FilterRule['field']) => {
    switch (field) {
      case 'completion':
      case 'completed_on':
      case 'task_type':
        return CheckCircle2;
      case 'start_date':
      case 'due_date':
        return Calendar;
      case 'created_by':
        return User;
      case 'created_on':
        return Clock;
      case 'last_modified':
        return Edit2;
    }
  };

  const getFieldOptions = (field: FilterRule['field']) => {
    switch (field) {
      case 'completion':
        return [
          { value: 'incomplete', label: 'Incomplete' },
          { value: 'completed', label: 'Completed' },
        ];
      case 'due_date':
      case 'start_date':
        return [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'this week', label: 'This week' },
          { value: 'next week', label: 'Next week' },
        ];
      case 'created_by':
        return [
          { value: 'kevin safrisal', label: 'Kevin Safrisal' },
          { value: 'anyone', label: 'Anyone' },
        ];
      case 'task_type':
        return [
          { value: 'task', label: 'Tasks' },
          { value: 'milestone', label: 'Milestones' },
          { value: 'approval', label: 'Approvals' },
        ];
      default:
        return [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'this week', label: 'This week' },
          { value: 'this month', label: 'This month' },
        ];
    }
  };

  return (
    <div className="w-[450px] bg-[#1e1f21] border border-[#383a3d] rounded-2xl shadow-2xl p-4 text-[13px] text-[#f5f4f3] animate-in fade-in duration-150">
      {/* 1. Header: Filters & Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2b2c2e]">
        <span className="font-semibold text-white text-[14px]">Filters</span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[12px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* 2. Quick filters section */}
      <div className="pt-3 pb-2">
        <span className="text-[12px] font-medium text-[#8a8886] block mb-2">
          Quick filters
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chip 1: Incomplete tasks */}
          <button
            type="button"
            onClick={() =>
              onQuickFilterChange(quickFilter === 'incomplete' ? 'all' : 'incomplete')
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
              quickFilter === 'incomplete'
                ? 'bg-[#252628] border-[#4573d2] text-white shadow-xs'
                : 'border-[#37383b] text-[#cfcecd] hover:text-white hover:border-[#525357]'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                quickFilter === 'incomplete' ? 'text-[#4573d2]' : 'text-[#8a8886]'
              }`}
            />
            <span>Incomplete tasks</span>
          </button>

          {/* Chip 2: Completed tasks with dropdown chevron */}
          <div className="relative inline-flex items-center">
            <div
              className={`inline-flex items-center rounded-full border transition-colors ${
                quickFilter === 'completed'
                  ? 'bg-[#252628] border-[#4573d2] text-white shadow-xs'
                  : 'border-[#37383b] text-[#cfcecd] hover:border-[#525357]'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  onQuickFilterChange(quickFilter === 'completed' ? 'all' : 'completed')
                }
                className="flex items-center gap-1.5 pl-3 pr-2 py-1 text-[12px] font-medium cursor-pointer"
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    quickFilter === 'completed' ? 'text-[#4573d2]' : 'text-[#8a8886]'
                  }`}
                />
                <span>Completed tasks</span>
              </button>
              <div className="w-px h-3.5 bg-[#37383b]" />
              <button
                type="button"
                onClick={() => setIsCompletedSubmenuOpen((prev) => !prev)}
                className="px-1.5 py-1 text-[#8a8886] hover:text-white cursor-pointer"
                title="Completion filter presets"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {isCompletedSubmenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[12px]">
                {['All completed', 'Completed today', 'Completed this week'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onQuickFilterChange('completed');
                      setIsCompletedSubmenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#252628] text-white cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chip 3: Due this week */}
          <button
            type="button"
            onClick={() =>
              onQuickFilterChange(quickFilter === 'due_this_week' ? 'all' : 'due_this_week')
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
              quickFilter === 'due_this_week'
                ? 'bg-[#252628] border-[#4573d2] text-white shadow-xs'
                : 'border-[#37383b] text-[#cfcecd] hover:text-white hover:border-[#525357]'
            }`}
          >
            <Calendar
              className={`w-3.5 h-3.5 ${
                quickFilter === 'due_this_week' ? 'text-[#4573d2]' : 'text-[#8a8886]'
              }`}
            />
            <span>Due this week</span>
          </button>

          {/* Chip 4: Due next week */}
          <button
            type="button"
            onClick={() =>
              onQuickFilterChange(quickFilter === 'due_next_week' ? 'all' : 'due_next_week')
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
              quickFilter === 'due_next_week'
                ? 'bg-[#252628] border-[#4573d2] text-white shadow-xs'
                : 'border-[#37383b] text-[#cfcecd] hover:text-white hover:border-[#525357]'
            }`}
          >
            <Calendar
              className={`w-3.5 h-3.5 ${
                quickFilter === 'due_next_week' ? 'text-[#4573d2]' : 'text-[#8a8886]'
              }`}
            />
            <span>Due next week</span>
          </button>
        </div>
      </div>

      {/* 3. Active Custom Stackable Filters List */}
      {rules.length > 0 && (
        <div className="py-2.5 space-y-2 border-t border-[#2b2c2e] max-h-[220px] overflow-y-auto pr-1">
          {rules.map((rule) => {
            const IconComp = getFieldIcon(rule.field);
            return (
              <div
                key={rule.id}
                className="flex items-center gap-2 bg-[#252628] border border-[#37383b] rounded-xl p-2 text-[12.5px] animate-in fade-in duration-100"
              >
                <div className="flex items-center gap-1.5 min-w-[130px] text-white font-medium truncate">
                  <IconComp className="w-3.5 h-3.5 text-[#8a8886] shrink-0" />
                  <span className="truncate">{getFieldLabel(rule.field)}</span>
                </div>

                {/* Operator select */}
                <select
                  value={rule.operator}
                  onChange={(e) =>
                    onUpdateRule(rule.id, { operator: e.target.value as any })
                  }
                  className="bg-[#1e1f21] border border-[#383a3d] text-white rounded-lg px-2 py-1 text-[12px] outline-none cursor-pointer"
                >
                  <option value="is">is</option>
                  <option value="is_not">is not</option>
                  {(rule.field === 'due_date' ||
                    rule.field === 'start_date' ||
                    rule.field.includes('on')) && (
                    <>
                      <option value="is_before">is before</option>
                      <option value="is_after">is after</option>
                    </>
                  )}
                </select>

                {/* Value select */}
                <select
                  value={rule.value}
                  onChange={(e) => onUpdateRule(rule.id, { value: e.target.value })}
                  className="flex-1 bg-[#1e1f21] border border-[#383a3d] text-white rounded-lg px-2.5 py-1 text-[12px] outline-none cursor-pointer"
                >
                  {getFieldOptions(rule.field).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Remove filter button */}
                <button
                  type="button"
                  onClick={() => onRemoveRule(rule.id)}
                  className="p-1 text-[#8a8886] hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer shrink-0"
                  title="Remove filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. + Add filter ▾ Dropdown (Matching Asana Screenshot Exactly) */}
      <div className="pt-2.5 border-t border-[#2b2c2e] relative">
        <button
          type="button"
          onClick={() => setIsAddFilterMenuOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-[13px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add filter</span>
          <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
        </button>

        {isAddFilterMenuOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-[220px] bg-[#1e1f21] border border-[#383a3d] rounded-xl shadow-2xl py-1.5 z-[60] text-[13px] animate-in fade-in duration-100">
            {[
              { id: 'completion', label: 'Completion status', icon: CheckCircle2 },
              { id: 'start_date', label: 'Start date', icon: Calendar },
              { id: 'due_date', label: 'Due date', icon: Calendar },
              { id: 'created_by', label: 'Created by', icon: User },
              { id: 'created_on', label: 'Created on', icon: Clock },
              { id: 'last_modified', label: 'Last modified on', icon: Edit2 },
              { id: 'completed_on', label: 'Completed on', icon: CheckCircle2 },
              { id: 'task_type', label: 'Task type', icon: CheckCircle2 },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onAddRule(item.id as any);
                    setIsAddFilterMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#252628] text-left text-[#f5f4f3] transition-colors cursor-pointer group"
                >
                  <IconComp className="w-4 h-4 text-[#8a8886] group-hover:text-white shrink-0" />
                  <span className="text-[13px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

