'use client';

import React, { useState } from 'react';
import { X, CheckSquare, FolderPlus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PriorityLevel, StatusLevel } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function CreateModal() {
  const {
    isCreateModalOpen,
    createModalType,
    closeCreateModal,
    createTask,
    createProject,
    projects,
    users,
    currentUser,
  } = useApp();

  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'task' | 'project'>(createModalType || 'task');

  // Task form state
  const [taskName, setTaskName] = useState('');
  const [taskProject, setTaskProject] = useState('kevins-first-project');
  const [taskSection, setTaskSection] = useState('To do');
  const [taskAssignee, setTaskAssignee] = useState(currentUser.name);
  const [taskDueDate, setTaskDueDate] = useState('Today – Nov 4');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('Low');
  const [taskStatus, setTaskStatus] = useState<StatusLevel>('On track');
  const [taskDesc, setTaskDesc] = useState('');

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  if (!isCreateModalOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const selectedUser = users.find((u) => u.name === taskAssignee) || currentUser;

    createTask({
      name: taskName,
      projectId: taskProject,
      section: taskSection,
      assignee: {
        name: selectedUser.name,
        initials: selectedUser.initials,
        avatarColor: selectedUser.avatarColor,
      },
      dueDate: taskDueDate,
      priority: taskPriority,
      status: taskStatus,
      description: taskDesc,
    });

    setTaskName('');
    setTaskDesc('');
    closeCreateModal();
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProj = createProject(projectName, projectDesc);
    setProjectName('');
    setProjectDesc('');
    closeCreateModal();
    router.push(`/project/${newProj.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1e1f21] border border-[#333538] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2c2e]">
          {/* Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-2 pb-1 border-b-2 font-medium text-[14px] transition-colors ${
                activeTab === 'task'
                  ? 'border-[#4573d2] text-white'
                  : 'border-transparent text-[#8a8886] hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Create Task</span>
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex items-center gap-2 pb-1 border-b-2 font-medium text-[14px] transition-colors ${
                activeTab === 'project'
                  ? 'border-[#4573d2] text-white'
                  : 'border-transparent text-[#8a8886] hover:text-white'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          <button
            onClick={closeCreateModal}
            className="p-1 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {activeTab === 'task' ? (
          <form onSubmit={handleTaskSubmit} className="p-6 space-y-4 text-[13px]">
            <div>
              <label className="block text-[#8a8886] font-semibold mb-1.5">
                Task Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="What needs to be done?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-[#252628] text-white px-3.5 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Project
                </label>
                <select
                  value={taskProject}
                  onChange={(e) => setTaskProject(e.target.value)}
                  className="w-full bg-[#252628] text-white px-3.5 py-2 rounded-lg border border-[#37383b] outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Section
                </label>
                <select
                  value={taskSection}
                  onChange={(e) => setTaskSection(e.target.value)}
                  className="w-full bg-[#252628] text-white px-3.5 py-2 rounded-lg border border-[#37383b] outline-none"
                >
                  <option value="To do">To do</option>
                  <option value="Doing">Doing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Assignee
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-[#252628] text-white px-2.5 py-2 rounded-lg border border-[#37383b] outline-none text-[12px]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Due Date
                </label>
                <input
                  type="text"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  placeholder="e.g. Nov 5"
                  className="w-full bg-[#252628] text-white px-3 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                  className="w-full bg-[#252628] text-white px-3 py-2 rounded-lg border border-[#37383b] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8a8886] font-semibold mb-1.5">
                  Status
                </label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as StatusLevel)}
                  className="w-full bg-[#252628] text-white px-3 py-2 rounded-lg border border-[#37383b] outline-none"
                >
                  <option value="On track">On track</option>
                  <option value="At risk">At risk</option>
                  <option value="Off track">Off track</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#8a8886] font-semibold mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Add more details about this task..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full bg-[#252628] text-white p-3 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#2b2c2e]">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-4 py-2 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#4573d2] hover:bg-[#3562be] text-white font-medium px-5 py-2 rounded-lg shadow-sm"
              >
                Create Task
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleProjectSubmit} className="p-6 space-y-4 text-[13px]">
            <div>
              <label className="block text-[#8a8886] font-semibold mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Website Redesign, Marketing Q4"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#252628] text-white px-3.5 py-2 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8a8886] font-semibold mb-1.5">
                Description (optional)
              </label>
              <textarea
                rows={3}
                placeholder="What is this project aimed to achieve?"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full bg-[#252628] text-white p-3 rounded-lg border border-[#37383b] focus:border-[#4573d2] outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#2b2c2e]">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-4 py-2 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#4573d2] hover:bg-[#3562be] text-white font-medium px-5 py-2 rounded-lg shadow-sm"
              >
                Create Project
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

