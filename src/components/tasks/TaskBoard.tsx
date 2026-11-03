'use client';

import React, { useState } from 'react';
import { Plus, Check, MoreHorizontal, Calendar, User, Diamond, UserCheck } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import AddTaskSplitButton from '@/components/tasks/AddTaskSplitButton';

interface TaskBoardProps {
  sections: string[];
  tasks: Task[];
  projectId?: string;
}

export default function TaskBoard({ sections: initialSections, tasks, projectId }: TaskBoardProps) {
  const { openTaskDrawer, toggleTaskComplete, createTask, updateTask } = useApp();
  const [boardSections, setBoardSections] = useState<string[]>(initialSections);
  const [activeNewSection, setActiveNewSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleCreateTask = (section: string, taskType: 'task' | 'milestone' | 'approval' = 'task') => {
    if (!newTaskName.trim()) {
      setActiveNewSection(null);
      return;
    }

    createTask({
      name: newTaskName.trim(),
      section,
      projectId,
      taskType,
      dueDate: 'Today',
    });
    setNewTaskName('');
    setActiveNewSection(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      setIsAddingSection(false);
      return;
    }
    const title = newSectionTitle.trim();
    if (!boardSections.includes(title)) {
      setBoardSections((prev) => [...prev, title]);
    }
    setNewSectionTitle('');
    setIsAddingSection(false);
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
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* 1. Asana Secondary Control Toolbar for Board */}
      <div className="h-[46px] min-h-[46px] px-6 border-b border-[#262729] flex items-center justify-between text-[13px] bg-[#1e1f21] shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <AddTaskSplitButton
            canAddSection={true}
            onAddTask={(type) => {
              const defaultName = type === 'milestone' ? 'New milestone' : type === 'approval' ? 'New approval' : 'New task';
              const targetSection = boardSections[0] || 'Recently assigned';
              const created = createTask({
                name: defaultName,
                section: targetSection,
                projectId,
                taskType: type,
                dueDate: 'Today',
              });
              if (created?.id) {
                openTaskDrawer(created.id);
              }
            }}
            onAddSection={() => {
              setIsAddingSection(true);
            }}
          />
        </div>
      </div>

      {/* 2. Board Columns Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto h-full items-start">
        {boardSections.map((section) => {
          const columnTasks = tasks.filter((t) => (t.section === section || t.myTasksSection === section));

          return (
            <div
              key={section}
              className="w-[300px] min-w-[300px] bg-[#1e1f21] border border-[#2b2c2e] rounded-xl flex flex-col max-h-full"
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
                  <div className="flex items-center justify-end gap-2">
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
                {columnTasks.map((task) => {
                  const isMilestone = (task as any).taskType === 'milestone' || task.name.toLowerCase().includes('milestone');
                  const isApproval = (task as any).taskType === 'approval' || task.name.toLowerCase().includes('approval');

                  return (
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
                              : isMilestone
                              ? 'border-[#f8be4e] text-[#f8be4e] rotate-45 rounded-xs'
                              : 'border-[#555659] hover:border-white'
                          }`}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1">
                          <span
                            className={`text-[13px] font-medium leading-snug ${
                              task.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
                            }`}
                          >
                            {task.name}
                          </span>
                          {isMilestone && (
                            <span className="self-start text-[10px] bg-[#3e2c1c] text-[#f8be4e] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                              <span>◆</span>
                              <span>Milestone</span>
                            </span>
                          )}
                          {isApproval && (
                            <span className="self-start text-[10px] bg-[#1e2f47] text-[#85c5f8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Approval
                            </span>
                          )}
                        </div>
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
                          <select
                            value={task.section}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              updateTask(task.id, { section: e.target.value });
                            }}
                            className="bg-[#1e1f21] text-[#9c9a99] text-[10px] px-1.5 py-0.5 rounded border border-[#37383b] outline-none"
                          >
                            {boardSections.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {/* Avatar */}
                          {task.assignee?.isPlaceholder ? (
                            <div className="w-5 h-5 rounded-full border border-dashed border-[#555] flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-[#888]" />
                            </div>
                          ) : (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{
                                backgroundColor: task.assignee?.avatarColor || '#d84b7f',
                              }}
                            >
                              {task.assignee?.initials || 'KS'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

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

        {/* Add column button */}
        <div className="w-[300px] min-w-[300px] shrink-0">
          {isAddingSection ? (
            <div className="p-3 bg-[#1e1f21] rounded-xl border border-[#37383b]">
              <input
                type="text"
                autoFocus
                placeholder="New section name..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection();
                  if (e.key === 'Escape') setIsAddingSection(false);
                }}
                className="w-full bg-[#252628] border border-[#4573d2] rounded px-2.5 py-1 text-white text-[13px] outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddSection}
                  className="bg-[#4573d2] text-white px-3 py-1 rounded text-[12px] font-medium hover:bg-[#3562be]"
                >
                  Add section
                </button>
                <button
                  onClick={() => setIsAddingSection(false)}
                  className="text-[#8a8886] hover:text-white text-[12px] px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="w-full flex items-center gap-2 p-3 text-[13px] font-medium text-[#8a8886] hover:text-white rounded-xl border border-dashed border-[#37383b] hover:border-[#555659] hover:bg-[#252628]/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add section</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
