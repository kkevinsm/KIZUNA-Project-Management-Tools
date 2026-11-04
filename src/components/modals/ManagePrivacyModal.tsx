'use client';

import React, { useState } from 'react';
import { X, User, Lock, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ManagePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManagePrivacyModal({ isOpen, onClose }: ManagePrivacyModalProps) {
  const { currentUser } = useApp();
  const [teammateInput, setTeammateInput] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMember = (nameOrEmail: string) => {
    if (!nameOrEmail.trim()) return;
    if (!invitedMembers.includes(nameOrEmail.trim())) {
      setInvitedMembers((prev) => [...prev, nameOrEmail.trim()]);
    }
    setTeammateInput('');
  };

  const handleRemoveMember = (name: string) => {
    setInvitedMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleInvite = () => {
    if (teammateInput.trim()) {
      handleAddMember(teammateInput.trim());
    }
    setToastMessage('Teammates updated for My tasks');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div data-modal-overlay className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[460px] p-6 space-y-4 shadow-2xl relative">
        {/* Header (matching Video 3 frame 005-015) */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-bold text-white tracking-tight">
              Manage privacy
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2a2b2e] text-[#8a8886] font-medium border border-[#37383b] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#8a8886]" />
              <span>Private</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input area with tags / chips */}
        <div className="space-y-2">
          <div className="min-h-[46px] p-2 bg-[#141517] border border-[#37383b] focus-within:border-white rounded-xl flex flex-wrap items-center gap-1.5 transition-colors">
            {invitedMembers.map((member) => (
              <span
                key={member}
                className="flex items-center gap-1.5 bg-[#252628] border border-[#37383b] text-white text-[12.5px] px-2.5 py-1 rounded-lg"
              >
                <span className="w-4 h-4 rounded-full bg-[#d84b7f] text-white flex items-center justify-center text-[9px] font-bold">
                  {member.charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[150px]">{member}</span>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="text-[#8a8886] hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <input
              type="text"
              value={teammateInput}
              onChange={(e) => setTeammateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember(teammateInput);
                }
              }}
              placeholder={invitedMembers.length === 0 ? "Add teammates by adding their name or email..." : "Add more..."}
              autoFocus
              className="bg-transparent text-[13.5px] text-white placeholder-[#717377] focus:outline-none flex-1 min-w-[180px] py-1 px-1"
            />
          </div>

          {/* Quick suggestions if typing */}
          {teammateInput.trim().length > 1 && (
            <div className="bg-[#141517] border border-[#37383b] rounded-xl p-1.5 space-y-1 shadow-lg">
              {[
                { name: 'Kevin Safrisal', email: 'kevinsafrisal@gmail.com', initials: 'KS', color: '#d84b7f' },
                { name: 'Sarah Chen', email: 'sarah.chen@example.com', initials: 'SC', color: '#20c997' },
                { name: 'Alex Rivera', email: 'alex.rivera@example.com', initials: 'AR', color: '#f5b324' },
              ]
                .filter((p) => p.name.toLowerCase().includes(teammateInput.toLowerCase()) || p.email.toLowerCase().includes(teammateInput.toLowerCase()))
                .map((person) => (
                  <button
                    key={person.email}
                    onClick={() => handleAddMember(person.email)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#252628] text-left transition-colors cursor-pointer"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-white">{person.name}</div>
                      <div className="text-[11px] text-[#8a8886]">{person.email}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Privacy Explanation Note (exact text from Asana video) */}
        <p className="text-[12.5px] text-[#8a8886] leading-relaxed">
          This view is private to only you. Adding teammates will allow them to view, edit, and organize your work. They will only be able to see tasks they already have access to.{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Asana Privacy Policy & Work Access Rules"); }} className="text-[#4573d2] hover:underline">
            Learn more
          </a>
        </p>

        {/* Action Button: Invite */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleInvite}
            className="px-5 py-2 bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Invite
          </button>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-[#141517] border border-[#37383b] text-white px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-[12.5px]">
            <Check className="w-4 h-4 text-[#4cd195]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

