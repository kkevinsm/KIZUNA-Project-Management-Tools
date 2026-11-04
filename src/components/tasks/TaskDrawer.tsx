'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  Paperclip,
  ThumbsUp,
  Link as LinkIcon,
  Plus,
  Trash2,
  Calendar,
  Cloud,
  Download,
  Users,
  Maximize2,
  MoreHorizontal,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Type,
  Smile,
  AtSign,
  Star,
  ArrowUp,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PriorityLevel, StatusLevel } from '@/lib/types';
import DateRangePicker from './DateRangePicker';

export default function TaskDrawer() {
  const {
    activeTask,
    closeTaskDrawer,
    updateTask,
    toggleTaskComplete,
    addComment,
    addSubtask,
    toggleSubtask,
    addAttachment,
    removeAttachment,
    users,
    currentUser,
    statusOptions,
    priorityOptions,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom columns from localStorage to render in drawer properties
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kizuna_custom_columns');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('kizuna_custom_columns');
        if (saved) setCustomColumns(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!activeTask) return null;

  const currentStatusOpt = statusOptions.find(
    (o) => o.name.toLowerCase() === (activeTask.status || 'on track').toLowerCase()
  ) || { name: activeTask.status || 'On track', color: '#79e2c6', textColor: '#0c392b' };

  const currentPriorityOpt = priorityOptions.find(
    (o) => o.name.toLowerCase() === (activeTask.priority || 'medium').toLowerCase()
  ) || { name: activeTask.priority || 'Medium', color: '#fec156', textColor: '#472d00' };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading to Cloudflare R2...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', activeTask.id);

      const res = await fetch('/api/storage', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      addAttachment(activeTask.id, {
        id: `att-${Date.now()}`,
        name: data.name,
        size: data.size,
        url: data.url,
        uploadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isR2: data.isR2,
      });

      setUploadStatus(
        data.isR2
          ? 'Uploaded to Cloudflare R2 successfully!'
          : 'Uploaded to local storage (Add R2 credentials in .env to use live R2)'
      );
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setUploadStatus(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCommentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    addComment(activeTask.id, commentText);
    setCommentText('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    addSubtask(activeTask.id, subtaskInput);
    setSubtaskInput('');
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 ${
        isExpanded ? 'w-full' : 'w-full sm:w-[620px]'
      } max-w-full bg-[#1e1f21] border-l border-[#2e2f32] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200`}
    >
      {/* 1. Header Toolbar (matching Asana frame f_028.jpg) */}
      <div className="h-[52px] min-h-[52px] px-4 border-b border-[#2b2c2e] flex items-center justify-between bg-[#1e1f21]">
        {/* Left: Mark complete button */}
        <button
          onClick={() => toggleTaskComplete(activeTask.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
            activeTask.completed
              ? 'bg-[#183f30] text-[#4cd195] border-[#215340]'
              : 'border-[#44464a] text-white hover:bg-[#252628] hover:border-[#666]'
          }`}
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTask.completed ? 'Completed' : 'Mark complete'}</span>
        </button>

        {/* Right: Action icons */}
        <div className="flex items-center gap-1.5 text-[#a2a0a2]">
          {/* Avatar chip (KS) + */}
          <div className="relative">
            <button
              onClick={() => setIsAssigneeMenuOpen(!isAssigneeMenuOpen)}
              className="flex items-center gap-1 bg-[#252628] hover:bg-[#2e3034] border border-[#3b3d42] rounded-full pl-0.5 pr-1.5 py-0.5 text-white text-[11px] font-semibold transition-colors"
              title="Collaborators"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: activeTask.assignee?.avatarColor || '#d84b7f' }}
              >
                {activeTask.assignee?.initials || 'KS'}
              </div>
              <Plus className="w-3 h-3 text-[#8a8886]" />
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Task link copied to clipboard!');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border border-[#3b3d42] hover:bg-[#28292c] text-white transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#8a8886]" />
            <span>Share</span>
          </button>

          {/* Thumbs up */}
          <button
            onClick={() => alert('Task liked!')}
            className="p-1.5 rounded-lg hover:bg-[#28292c] hover:text-white transition-colors"
            title="Like task"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          {/* Link icon */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Task link copied to clipboard!');
            }}
            className="p-1.5 rounded-lg hover:bg-[#28292c] hover:text-white transition-colors"
            title="Copy task link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Maximize icon */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-[#28292c] hover:text-white transition-colors"
            title={isExpanded ? 'Restore size' : 'Expand fullscreen'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* More options */}
          <button
            onClick={() => alert('More task actions')}
            className="p-1.5 rounded-lg hover:bg-[#28292c] hover:text-white transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Close [Esc] with right arrow ->| */}
          <button
            onClick={() => closeTaskDrawer()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#28292c] text-[#8a8886] hover:text-white transition-colors text-[11px] font-medium ml-1"
            title="Close [Esc]"
          >
            <span>Close</span>
            <span className="text-[10px] bg-[#2a2b2e] px-1 py-0.5 rounded text-[#8a8886]">Esc</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 2. Drawer Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Task Title (Editable) */}
        <div>
          <input
            type="text"
            value={activeTask.name}
            onChange={(e) => updateTask(activeTask.id, { name: e.target.value })}
            placeholder="Write task name..."
            className="w-full bg-transparent text-[22px] font-bold text-white placeholder-[#6d6c6e] outline-none border-b border-transparent focus:border-[#4573d2] pb-1 transition-all"
          />
        </div>

        {/* Properties Grid (matching Asana frame f_028.jpg) */}
        <div className="grid grid-cols-[130px_1fr] gap-y-3.5 text-[13px] items-center">
          {/* Assignee */}
          <div className="text-[#8a8886]">Assignee</div>
          <div className="flex items-center gap-2 relative">
            <div className="inline-flex items-center gap-1.5 bg-[#252628] hover:bg-[#2e3034] border border-[#3b3d42] rounded-full pl-1 pr-2 py-0.5 text-[12.5px] text-white">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                style={{ backgroundColor: activeTask.assignee?.avatarColor || '#d84b7f' }}
              >
                {activeTask.assignee?.initials || 'KS'}
              </div>
              <span className="truncate max-w-[150px] font-medium">
                {activeTask.assignee?.name || 'Kevin Safrisal'}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateTask(activeTask.id, {
                    assignee: { name: 'Unassigned', initials: '', isPlaceholder: true },
                    assigneeEmail: undefined,
                  })
                }
                className="text-[#8a8886] hover:text-white ml-0.5 p-0.5"
                title="Unassign"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAssigneeMenuOpen(!isAssigneeMenuOpen)}
              className="text-[12px] text-[#8a8886] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Recently assigned</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isAssigneeMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 w-60 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1 text-[12.5px] animate-in fade-in duration-100"
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
                  Select Assignee
                </div>
                {[currentUser, ...users.filter((u) => u.email !== currentUser.email)].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      updateTask(activeTask.id, {
                        assignee: {
                          name: u.name,
                          initials: u.initials,
                          avatarColor: u.avatarColor,
                          email: u.email,
                        },
                        assigneeEmail: u.email,
                      });
                      setIsAssigneeMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2f3135] text-white transition-colors"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: u.avatarColor || '#4573d2' }}
                    >
                      {u.initials}
                    </div>
                    <span className="truncate">{u.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="text-[#8a8886]">Due date</div>
          <div className="flex items-center gap-2">
            {activeTask.dueDate ? (
              <div className="inline-flex items-center gap-1.5 bg-[#252628] hover:bg-[#2e3034] border border-[#3b3d42] rounded-full px-2.5 py-0.5 text-[12.5px] text-[#4cd195] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#4cd195]" />
                <span>{activeTask.dueDate}</span>
                <button
                  type="button"
                  onClick={() => updateTask(activeTask.id, { dueDate: '' })}
                  className="text-[#8a8886] hover:text-white ml-0.5 p-0.5"
                  title="Clear date"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <DateRangePicker
                value=""
                onChange={(newVal) => updateTask(activeTask.id, { dueDate: newVal })}
              />
            )}
          </div>

          {/* Dependencies */}
          <div className="text-[#8a8886]">Dependencies</div>
          <div>
            <button
              type="button"
              onClick={() => alert('Add task dependency')}
              className="text-[13px] text-[#8a8886] hover:text-white cursor-pointer transition-colors"
            >
              Add dependencies
            </button>
          </div>

          {/* Projects & Section */}
          <div className="flex items-center gap-1 text-[#8a8886]">
            <span>Projects</span>
            <span className="text-[11px] text-[#8a8886]">1</span>
            <button
              type="button"
              onClick={() => alert('Add to another project')}
              className="hover:text-white p-0.5"
              title="Add project"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="flex items-center gap-1.5 bg-[#252628] hover:bg-[#2e3034] text-white border border-[#3b3d42] rounded-md px-2 py-0.5 text-[12px] transition-colors"
            >
              <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              <span className="w-2.5 h-2 rounded-[2px] bg-white/90" />
              <span>{activeTask.projectName || "Kevin's first project"}</span>
            </button>
            <select
              value={activeTask.section}
              onChange={(e) => updateTask(activeTask.id, { section: e.target.value })}
              className="bg-[#252628] hover:bg-[#2e3034] text-[#bdbbb9] rounded-md px-2 py-0.5 text-[12px] border border-[#3b3d42] outline-none cursor-pointer"
            >
              <option value="To do">To do</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option>
              <option value="Recently assigned">Recently assigned</option>
              <option value="Do today">Do today</option>
              <option value="Do next week">Do next week</option>
              <option value="Do later">Do later</option>
            </select>
          </div>

          {/* Priority Pill Badge */}
          <div className="flex items-center gap-1.5 text-[#8a8886]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8a8886]" />
            <span>Priority</span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsPriorityMenuOpen(!isPriorityMenuOpen);
                setIsStatusMenuOpen(false);
              }}
              className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium transition-transform hover:scale-105 shadow-xs"
              style={{
                backgroundColor: currentPriorityOpt.color,
                color: currentPriorityOpt.textColor || '#000',
              }}
            >
              {currentPriorityOpt.name}
            </button>

            {isPriorityMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1.5 text-[12.5px] animate-in fade-in duration-100">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateTask(activeTask.id, { priority: opt.name as any });
                      setIsPriorityMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#2f3135] transition-colors"
                  >
                    <span
                      className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium"
                      style={{ backgroundColor: opt.color, color: opt.textColor || '#000' }}
                    >
                      {opt.name}
                    </span>
                    {activeTask.priority === opt.name && (
                      <Check className="w-3.5 h-3.5 text-[#4573d2]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Pill Badge */}
          <div className="flex items-center gap-1.5 text-[#8a8886]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8a8886]" />
            <span>Status</span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusMenuOpen(!isStatusMenuOpen);
                setIsPriorityMenuOpen(false);
              }}
              className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium transition-transform hover:scale-105 shadow-xs"
              style={{
                backgroundColor: currentStatusOpt.color,
                color: currentStatusOpt.textColor || '#000',
              }}
            >
              {currentStatusOpt.name}
            </button>

            {isStatusMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl z-50 py-1.5 text-[12.5px] animate-in fade-in duration-100">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateTask(activeTask.id, { status: opt.name as any });
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#2f3135] transition-colors"
                  >
                    <span
                      className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium"
                      style={{ backgroundColor: opt.color, color: opt.textColor || '#000' }}
                    >
                      {opt.name}
                    </span>
                    {activeTask.status === opt.name && (
                      <Check className="w-3.5 h-3.5 text-[#4573d2]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Custom Fields */}
          {customColumns.map((col) => {
            const val = activeTask.customFields?.[col.id] || '';
            return (
              <React.Fragment key={col.id}>
                <div className="flex items-center gap-1.5 text-[#8a8886] truncate">
                  <Type className="w-3.5 h-3.5 text-[#8a8886]" />
                  <span className="truncate">{col.name}</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const updated = { ...(activeTask.customFields || {}), [col.id]: e.target.value };
                      updateTask(activeTask.id, { customFields: updated });
                    }}
                    placeholder="—"
                    className="bg-transparent hover:bg-[#252628] focus:bg-[#252628] text-white px-2 py-0.5 rounded text-[12.5px] outline-none border border-transparent focus:border-[#4573d2] w-full max-w-[200px] transition-colors placeholder-[#6d6c6e]"
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-[#2b2c2e]">
          <label className="block text-[13px] font-semibold text-[#8a8886] mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={activeTask.description || ''}
            onChange={(e) => updateTask(activeTask.id, { description: e.target.value })}
            placeholder="What is this task about?"
            className="w-full bg-[#252628] hover:bg-[#28292c] focus:bg-[#202123] text-[#f5f4f3] placeholder-[#6d6c6e] p-3 rounded-lg border border-[#333538] focus:border-[#4573d2] outline-none text-[13px] transition-all resize-y"
          />
        </div>

        {/* Subtasks */}
        <div className="pt-2 border-t border-[#2b2c2e]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[#8a8886]">Subtasks</span>
            <span className="text-[11px] text-[#6d6c6e]">
              {activeTask.subtasks.filter((s) => s.completed).length} of{' '}
              {activeTask.subtasks.length}
            </span>
          </div>

          <div className="space-y-1.5 mb-2.5">
            {activeTask.subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-[#252628] group transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(activeTask.id, sub.id)}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    sub.completed
                      ? 'bg-[#38b273] border-[#38b273] text-white'
                      : 'border-[#555659] hover:border-white'
                  }`}
                >
                  {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </button>
                <span
                  className={`text-[13px] flex-1 ${
                    sub.completed ? 'line-through text-[#8a8886]' : 'text-[#f5f4f3]'
                  }`}
                >
                  {sub.name}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              placeholder="Add a subtask..."
              className="flex-1 bg-[#252628] text-white text-[13px] px-3 py-1.5 rounded-lg border border-[#333538] focus:border-[#4573d2] outline-none"
            />
            <button
              type="submit"
              disabled={!subtaskInput.trim()}
              className="bg-[#2f3135] hover:bg-[#383a3f] disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-[13px] font-medium"
            >
              Add
            </button>
          </form>
        </div>

        {/* Attachments (Cloudflare R2) */}
        <div className="pt-2 border-t border-[#2b2c2e]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[#8a8886]">Attachments</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-[12px] text-[#4573d2] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach file</span>
            </button>
          </div>

          {uploadStatus && (
            <div className="p-2 mb-2 bg-[#252628] border border-[#383a3d] rounded text-[12px] text-white">
              {uploadStatus}
            </div>
          )}

          {activeTask.attachments.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#37383b] hover:border-[#555] rounded-lg p-4 text-center cursor-pointer transition-colors bg-[#1c1d1f]"
            >
              <Cloud className="w-6 h-6 text-[#6d6c6e] mx-auto mb-1" />
              <p className="text-[12px] text-[#8a8886]">
                Upload files to your Cloudflare R2 bucket
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTask.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-[#252628] border border-[#333538] rounded-lg text-[13px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Paperclip className="w-4 h-4 text-[#8a8886] flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-white truncate max-w-[240px]">
                        {att.name}
                      </div>
                      <div className="text-[11px] text-[#8a8886]">
                        {(att.size / 1024).toFixed(1)} KB • {att.uploadedAt}
                        {att.isR2 && (
                          <span className="ml-1.5 text-[#4cd195] font-semibold">
                            (R2 Cloud)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#8a8886] hover:text-white"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => removeAttachment(activeTask.id, att.id)}
                      className="p-1 text-[#8a8886] hover:text-[#ff6b72]"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity & Rich Comment Box (matching Asana frame f_028.jpg) */}
        <div className="pt-2 border-t border-[#2b2c2e]">
          <span className="block text-[13px] font-semibold text-[#8a8886] mb-3">
            Activity & Comments
          </span>

          <div className="space-y-3.5 mb-4">
            {activeTask.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 text-[13px]">
                <div className="w-6 h-6 rounded-full bg-[#d84b7f] text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                  {c.initials}
                </div>
                <div className="flex-1 bg-[#252628] p-3 rounded-lg border border-[#333538]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-[12px]">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-[#8a8886]">{c.createdAt}</span>
                  </div>
                  <p className="text-[#e0dedd]">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Box Card */}
          <div className="border border-[#383a3d] bg-[#222326] rounded-xl overflow-hidden focus-within:border-[#4573d2] transition-colors">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or @mention a teammate"
              className="w-full bg-transparent text-white text-[13px] p-3 outline-none placeholder-[#6d6c6e] resize-none"
            />
            <div className="px-3 py-2 bg-[#1b1c1e] border-t border-[#2e3034] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#8a8886]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                  title="Add attachment"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCommentText((prev) => prev + ' 😊')}
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCommentText((prev) => prev + ' @')}
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                  title="Mention someone"
                >
                  <AtSign className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCommentText((prev) => prev + ' ⭐')}
                  className="p-1 rounded hover:bg-[#28292c] hover:text-white transition-colors"
                  title="Add star"
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                disabled={!commentText.trim()}
                onClick={handleCommentSubmit}
                className="w-7 h-7 rounded-full bg-[#4573d2] hover:bg-[#5282e4] disabled:opacity-30 disabled:hover:bg-[#4573d2] text-white flex items-center justify-center transition-colors shadow-xs"
                title="Post comment"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
