'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function CreateWorkspaceModal() {
  const { isCreateWorkspaceModalOpen, closeCreateWorkspaceModal, createWorkspace } = useApp();
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCreateWorkspaceModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter a workspace name.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    // Parse member emails separated by comma, semicolon, newline, or space
    const emails = members
      .split(/[,;\n\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));

    try {
      await createWorkspace(trimmedName, emails);
      // Brief smooth transition matching Asana video frame
      setTimeout(() => {
        setIsSubmitting(false);
        setName('');
        setMembers('');
        closeCreateWorkspaceModal();
      }, 600);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Failed to create workspace. Please try again.');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setName('');
    setMembers('');
    setErrorMessage(null);
    closeCreateWorkspaceModal();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[500px] shadow-2xl flex flex-col overflow-hidden text-[#f5f4f3] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Matching modal_01.jpg & modal_02.jpg) */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-[17px] font-semibold text-white tracking-tight">
            Create new workspace
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            title="Close this dialog"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {isSubmitting ? (
          /* Loading State (Matching modal_02.jpg) */
          <div className="min-h-[180px] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#8a8886]" />
          </div>
        ) : (
          /* Form (Matching modal_01.jpg) */
          <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-5 text-[13px]">
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#3d2323] border border-[#663535] text-[#fca5a5] text-[12.5px]">
                {errorMessage}
              </div>
            )}

            {/* Field 1: Workspace Name */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="workspace-name-input"
                className="w-[125px] shrink-0 text-[#cfcecd] font-medium text-[13px]"
              >
                Workspace Name
              </label>
              <input
                id="workspace-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Company or Team Name"
                autoFocus
                className="flex-1 bg-[#1e1f21] text-white placeholder-[#606266] rounded-lg px-3 py-2 border border-[#3e4044] focus:border-white focus:outline-none text-[13px] transition-colors"
              />
            </div>

            {/* Field 2: Members */}
            <div className="flex items-start gap-4">
              <label
                htmlFor="workspace-members-input"
                className="w-[125px] shrink-0 text-[#cfcecd] font-medium text-[13px] pt-2"
              >
                Members
              </label>
              <textarea
                id="workspace-members-input"
                rows={4}
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder="name@company.com, ..."
                className="flex-1 bg-[#1e1f21] text-white placeholder-[#606266] rounded-lg px-3 py-2 border border-[#3e4044] focus:border-white focus:outline-none text-[13px] resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Action Button: Create workspace */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Create workspace
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
