'use client';

import React, { useState } from 'react';
import { Plus, Check, MoreHorizontal, Calendar, User } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface TaskBoardProps {
  sections: string[];
  tasks: Task[];
  projectId?: string;
}

export default function TaskBoard({ sections, tasks, projectId }: TaskBoardProps) {
  const { openTaskDrawer, toggleTaskComplete, createTask, updateTask } = useApp();
  const [activeNewSection, setActiveNewSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const handleCreateTask = (section: string) => {
    if (!newTaskName.trim()) {
      setActiveNewSection(null);
      return;
    }

    createTask({
      name: newTaskName.trim(),
      section,
      projectId,
    });
    setNewTaskName('');
    setActiveNewSection(null);
  };

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
    <div className="flex gap-4 p-4 overflow-x-auto h-full min-h-[calc(100vh-160px)] items-start">
      {sections.map((section) => {
        const columnTasks = tasks.filter((t) => t.section === section);

        return (
          <div
            key={section}
            className="w-[300px] min-w-[300px] bg-[#1e1f21] rounded-xl flex flex-col max-h-full"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2b2c2e]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px] text-white">
                  {section}
                </span>
                <span className="text-[12px] text-[#8a8886] font-medium bg-[#28292c] px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#8a8886]">
                <button
                  onClick={() => setActiveNewSection(section)}
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white"
                  title="Add task to this column"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white"
                  title="Column actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Add Input */}
            {activeNewSection === section && (
              <div className="p-2 border-b border-[#2b2c2e] bg-[#252628]">
                <input
                  type="text"
                  autoFocus
                  placeholder="Task name..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTask(section);
                    if (e.key === 'Escape') setActiveNewSection(null);
                  }}
                  className="w-full bg-[#1c1d1f] text-white text-[13px] px-2.5 py-1.5 rounded border border-[#4573d2] outline-none mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setActiveNewSection(null)}
                    className="text-[12px] text-[#8a8886] hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCreateTask(section)}
                    className="text-[12px] bg-[#4573d2] hover:bg-[#3562be] text-white px-3 py-1 rounded font-medium"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openTaskDrawer(task.id)}
                  className={`bg-[#252628] hover:bg-[#2b2c2f] border border-[#333538] hover:border-[#444649] rounded-lg p-3 cursor-pointer transition-all shadow-sm group select-none ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  {/* Card Header: Checkbox + Name */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className={`w-[17px] h-[17px] rounded-full border mt-0.5 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-[#38b273] border-[#38b273] text-white'
                          : 'border-[#555659] hover:border-white'
                      }`}
                    >
                      {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                    <span
                      className={`text-[13px] font-medium leading-snug flex-1 ${
                        task.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>

                  {/* Pills (Priority & Status) */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {task.priority && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    )}
                    {task.status && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    )}
                  </div>

                  {/* Footer: Due date + Assignee + Move column */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#303236] text-[11px] text-[#8a8886]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#6d6c6e]" />
                      <span>{task.dueDate || 'No date'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move to next section selector */}
                      <select
                        value={task.section}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, { section: e.target.value });
                        }}
                        className="bg-[#1e1f21] text-[#9c9a99] text-[10px] px-1.5 py-0.5 rounded border border-[#37383b] outline-none"
                      >
                        {sections.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* Avatar */}
                      {task.assignee.isPlaceholder ? (
                        <div className="w-5 h-5 rounded-full border border-dashed border-[#555] flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-[#888]" />
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{
                            backgroundColor: task.assignee.avatarColor || '#d84b7f',
                          }}
                        >
                          {task.assignee.initials || 'KS'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bottom inline add task */}
              {activeNewSection !== section && (
                <button
                  onClick={() => setActiveNewSection(section)}
                  className="w-full flex items-center gap-1.5 py-2 px-2.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] text-[12px] font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add task</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

