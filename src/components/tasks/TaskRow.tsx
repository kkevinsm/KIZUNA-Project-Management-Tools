'use client';

import React from 'react';
import { Check, User, Calendar, Trash2 } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskRowProps {
  task: Task;
  showProjectColumn?: boolean;
  showVisibilityColumn?: boolean;
}

export default function TaskRow({
  task,
  showProjectColumn = false,
  showVisibilityColumn = false,
}: TaskRowProps) {
  const { toggleTaskComplete, openTaskDrawer, deleteTask, updateTask } = useApp();

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#183f30] text-[#4cd195] border border-[#215340]';
      case 'Medium':
        return 'bg-[#4a3800] text-[#f7c244] border border-[#634b00]';
      case 'High':
        return 'bg-[#3c1e55] text-[#c77dff] border border-[#532975]';
      default:
        return 'text-[#8a8886]';
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'On track':
        return 'bg-[#183f30] text-[#4cd195] border border-[#215340]';
      case 'At risk':
        return 'bg-[#4a3400] text-[#f7c244] border border-[#634800]';
      case 'Off track':
        return 'bg-[#47181c] text-[#ff6b72] border border-[#612127]';
      default:
        return 'text-[#8a8886]';
    }
  };

  return (
    <div
      onClick={() => openTaskDrawer(task.id)}
      className={`group flex items-center h-[38px] px-4 border-b border-[#2b2c2e] hover:bg-[#252628] cursor-pointer transition-colors text-[13px] select-none ${
        task.completed ? 'opacity-55' : ''
      }`}
    >
      {/* Complete Checkbox */}
      <div className="w-[30px] flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-[#38b273] border-[#38b273] text-white'
              : 'border-[#555659] hover:border-white group-hover:border-[#888]'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>

      {/* Task Name */}
      <div className="flex-1 min-w-[200px] pr-4 flex items-center">
        <span
          className={`truncate font-normal ${
            task.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
          }`}
        >
          {task.name}
        </span>
      </div>

      {/* Project Column (for My tasks view) */}
      {showProjectColumn && (
        <div className="w-[180px] hidden md:flex items-center px-2">
          {task.projectName && (
            <span className="bg-[#2e2f32] hover:bg-[#38393d] text-[#e0dedd] px-2.5 py-0.5 rounded text-[12px] truncate max-w-[160px]">
              {task.projectName}
            </span>
          )}
        </div>
      )}

      {/* Visibility Column (for My tasks view) */}
      {showVisibilityColumn && (
        <div className="w-[140px] hidden lg:flex items-center text-[#9c9a99] text-[12px] px-2 truncate">
          <span>{task.visibility || 'My workspace'}</span>
        </div>
      )}

      {/* Assignee Column (for Project view) */}
      {!showProjectColumn && (
        <div className="w-[160px] hidden md:flex items-center gap-2 px-2">
          {task.assignee.isPlaceholder ? (
            <div className="flex items-center gap-1.5 text-[#8a8886]">
              <div className="w-5 h-5 rounded-full border border-dashed border-[#555659] flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                style={{ backgroundColor: task.assignee.avatarColor || '#d84b7f' }}
              >
                {task.assignee.initials || 'KS'}
              </div>
              <span className="text-[#bdbbb9] text-[12px] truncate max-w-[120px]">
                {task.assignee.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Due date column */}
      <div className="w-[130px] hidden sm:flex items-center gap-1.5 px-2 text-[#9c9a99] text-[12px]">
        {task.dueDate ? (
          <span className="truncate">{task.dueDate}</span>
        ) : (
          <Calendar className="w-3.5 h-3.5 text-[#555659]" />
        )}
      </div>

      {/* Priority Column (for Project view) */}
      {!showProjectColumn && (
        <div className="w-[110px] hidden sm:flex items-center px-2">
          {task.priority && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium leading-none ${getPriorityStyle(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          )}
        </div>
      )}

      {/* Status Column (for Project view) */}
      {!showProjectColumn && (
        <div className="w-[110px] hidden lg:flex items-center px-2">
          {task.status && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium leading-none ${getStatusStyle(
                task.status
              )}`}
            >
              {task.status}
            </span>
          )}
        </div>
      )}

      {/* Hover delete action */}
      <div className="w-[30px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${task.name}"?`)) {
              deleteTask(task.id);
            }
          }}
          className="p-1 rounded hover:bg-[#3a3b3e] text-[#8a8886] hover:text-[#ff6b72]"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
