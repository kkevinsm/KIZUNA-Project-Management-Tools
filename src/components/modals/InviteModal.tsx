'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, Check, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function InviteModal() {
  const { isInviteModalOpen, closeInviteModal, projects, inviteTeammates, currentUser } = useApp();
  const [emailsInput, setEmailsInput] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize selected projects to the default project when opened
  useEffect(() => {
    if (isInviteModalOpen) {
      setEmailsInput('');
      setIsSuccess(false);
      setStatusMessage(null);
      setIsProjectDropdownOpen(false);
      if (projects.length > 0) {
        setSelectedProjectIds([projects[0].id]);
      }
    }
  }, [isInviteModalOpen, projects]);

  if (!isInviteModalOpen) return null;

  const hasEmails = emailsInput.trim().length > 0;

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const handleAddProject = (projectId: string) => {
    if (!selectedProjectIds.includes(projectId)) {
      setSelectedProjectIds((prev) => [...prev, projectId]);
    }
    setIsProjectDropdownOpen(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEmails) return;

    // Parse emails split by commas, semicolons, spaces, or newlines
    const rawTokens = emailsInput.split(/[,;\s\n]+/);
    const validEmails = rawTokens
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && t.includes('@'));

    if (validEmails.length === 0) {
      setStatusMessage('Please enter at least one valid email address.');
      return;
    }

    const { addedCount, existingCount } = inviteTeammates(validEmails, selectedProjectIds);

    setIsSuccess(true);
    if (addedCount > 0) {
      setStatusMessage(`Successfully invited ${addedCount} teammate${addedCount > 1 ? 's' : ''}!`);
    } else if (existingCount > 0) {
      setStatusMessage('These email addresses are already in your workspace.');
    }

    setTimeout(() => {
      closeInviteModal();
    }, 1500);
  };

  const unselectedProjects = projects.filter((p) => !selectedProjectIds.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#212224] border border-[#343639] rounded-2xl w-full max-w-[540px] shadow-2xl flex flex-col overflow-hidden text-[#f5f4f3] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-[19px] font-semibold text-white tracking-tight">
            Invite people to {currentUser?.workspace || 'My workspace'}
          </h2>
          <button
            onClick={closeInviteModal}
            title="Close this dialog"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="px-6 pb-6 flex flex-col gap-5 text-[13px]">
          {/* Email Addresses Field */}
          <div>
            <label className="block text-[#a2a09e] font-medium text-[13px] mb-2">
              Email addresses
            </label>
            <textarea
              rows={4}
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="name@gmail.com, name@gmail.com, ..."
              className="w-full bg-[#1b1c1e] text-white placeholder-[#606266] rounded-xl px-3.5 py-3 border border-[#343639] focus:border-[#4573d2] focus:ring-1 focus:ring-[#4573d2] outline-none text-[13.5px] leading-relaxed resize-none transition-colors"
              autoFocus
            />
          </div>

          {/* Add to Projects Field */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-[#a2a09e] font-medium text-[13px]">
                Add to projects
              </label>
              <div
                className="text-[#83817f] hover:text-[#b4b2b0] transition-colors cursor-help"
                title="Select which projects invited teammates should be added to"
              >
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-[#1b1c1e] border border-[#343639] rounded-xl p-2 min-h-[46px] flex flex-wrap items-center gap-2 relative">
              {selectedProjectIds.map((projectId) => {
                const project = projects.find((p) => p.id === projectId);
                if (!project) return null;
                return (
                  <span
                    key={projectId}
                    className="inline-flex items-center gap-1.5 bg-[#2c2d30] hover:bg-[#343639] border border-[#3e4044] text-white px-2.5 py-1 rounded-md text-[12.5px] font-normal transition-colors"
                  >
                    {/* Gray circular bullet */}
                    <span className="w-2 h-2 rounded-full bg-[#9c9a99]"></span>
                    <span>{project.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(projectId)}
                      className="ml-1 text-[#8c8a88] hover:text-white p-0.5 rounded"
                      title={`Remove from ${project.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {/* Add more projects button */}
              {unselectedProjects.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="inline-flex items-center gap-1 text-[#8c8a88] hover:text-white px-2 py-1 text-[12px] rounded hover:bg-[#2c2d30] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add project</span>
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-52 bg-[#252628] border border-[#383a3d] rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
                      {unselectedProjects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProject(p.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#2d2f33] text-[12.5px] text-white flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#757371]"></span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`text-[12.5px] px-3 py-2 rounded-lg flex items-center gap-2 ${
                isSuccess
                  ? 'bg-[#1b3829] text-[#4cd98b] border border-[#235838]'
                  : 'bg-[#3d2024] text-[#ff7b82] border border-[#61272d]'
              }`}
            >
              {isSuccess && <Check className="w-4 h-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Footer with Send Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={!hasEmails || isSuccess}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                hasEmails && !isSuccess
                  ? 'bg-[#4573d2] hover:bg-[#3862b5] text-white shadow-sm cursor-pointer'
                  : 'bg-[#28292c] text-[#5e5c5a] border border-[#343639] cursor-not-allowed'
              }`}
            >
              {isSuccess ? 'Sent!' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

