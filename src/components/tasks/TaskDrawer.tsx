'use client';

import React, { useState, useRef } from 'react';
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
  Loader2,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PriorityLevel, StatusLevel } from '@/lib/types';

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
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeTask) return null;

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[580px] max-w-full bg-[#1e1f21] border-l border-[#2e2f32] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header Toolbar */}
      <div className="h-[52px] min-h-[52px] px-4 border-b border-[#2b2c2e] flex items-center justify-between">
        {/* Mark complete button */}
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

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[#a2a0a2]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-[#2a2b2e] hover:text-white"
            title="Attach file to Cloudflare R2"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Task link copied to clipboard!');
            }}
            className="p-1.5 rounded hover:bg-[#2a2b2e] hover:text-white"
            title="Copy task link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => closeTaskDrawer()}
            className="p-1.5 rounded hover:bg-[#2a2b2e] hover:text-white ml-2"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Body (Scrollable) */}
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

        {/* Properties Grid */}
        <div className="grid grid-cols-[120px_1fr] gap-y-3.5 text-[13px] items-center">
          {/* Assignee */}
          <div className="text-[#8a8886]">Assignee</div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
              style={{ backgroundColor: activeTask.assignee.avatarColor || '#d84b7f' }}
            >
              {activeTask.assignee.initials || 'KS'}
            </div>
            <select
              value={activeTask.assignee.name}
              onChange={(e) => {
                const selectedUser = users.find((u) => u.name === e.target.value);
                if (selectedUser) {
                  updateTask(activeTask.id, {
                    assignee: {
                      name: selectedUser.name,
                      initials: selectedUser.initials,
                      avatarColor: selectedUser.avatarColor,
                      isPlaceholder: false,
                    },
                  });
                } else {
                  updateTask(activeTask.id, {
                    assignee: {
                      name: 'Unassigned',
                      initials: '',
                      isPlaceholder: true,
                    },
                  });
                }
              }}
              className="bg-[#252628] hover:bg-[#2e3034] text-[#f5f4f3] rounded px-2.5 py-1 text-[13px] outline-none border border-[#37383b] focus:border-[#4573d2]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.email})
                </option>
              ))}
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          {/* Due date */}
          <div className="text-[#8a8886]">Due date</div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8a8886]" />
            <input
              type="text"
              value={activeTask.dueDate || ''}
              onChange={(e) => updateTask(activeTask.id, { dueDate: e.target.value })}
              placeholder="e.g. Today – Nov 4"
              className="bg-transparent hover:bg-[#28292c] text-[#f5f4f3] rounded px-2 py-0.5 outline-none border border-transparent focus:border-[#4573d2]"
            />
          </div>

          {/* Projects & Section */}
          <div className="text-[#8a8886]">Projects</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#2a2b2e] text-[#f5f4f3] px-2.5 py-1 rounded text-[12px] font-medium border border-[#37383b]">
              {activeTask.projectName || "Kevin's first project"}
            </span>
            <select
              value={activeTask.section}
              onChange={(e) => updateTask(activeTask.id, { section: e.target.value })}
              className="bg-[#2a2b2e] text-[#bdbbb9] px-2.5 py-1 rounded text-[12px] border border-[#37383b] outline-none"
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

          {/* Priority */}
          <div className="text-[#8a8886]">Priority</div>
          <div>
            <select
              value={activeTask.priority || 'Low'}
              onChange={(e) =>
                updateTask(activeTask.id, { priority: e.target.value as PriorityLevel })
              }
              className="bg-[#2a2b2e] text-[#f5f4f3] px-2.5 py-1 rounded text-[12px] border border-[#37383b] outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status */}
          <div className="text-[#8a8886]">Status</div>
          <div>
            <select
              value={activeTask.status || 'On track'}
              onChange={(e) =>
                updateTask(activeTask.id, { status: e.target.value as StatusLevel })
              }
              className="bg-[#2a2b2e] text-[#f5f4f3] px-2.5 py-1 rounded text-[12px] border border-[#37383b] outline-none"
            >
              <option value="On track">On track</option>
              <option value="At risk">At risk</option>
              <option value="Off track">Off track</option>
            </select>
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#8a8886]">
                Attachments
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#f7c244] bg-[#4a3800] px-2 py-0.5 rounded-full font-medium">
                <Cloud className="w-3 h-3" />
                Cloudflare R2
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 bg-[#252628] hover:bg-[#2f3033] border border-[#37383b] text-white px-2.5 py-1 rounded-md text-[12px] font-medium transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4573d2]" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>

          {uploadStatus && (
            <div className="mb-3 text-[12px] px-3 py-1.5 rounded bg-[#252628] border border-[#37383b] text-[#bdbbb9] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#f5b324]" />
              <span>{uploadStatus}</span>
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

        {/* Activity & Comments */}
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

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ask a question or post an update..."
              className="flex-1 bg-[#252628] text-white text-[13px] px-3 py-2 rounded-lg border border-[#333538] focus:border-[#4573d2] outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-[#4573d2] hover:bg-[#3562be] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
            >
              Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

