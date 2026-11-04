'use client';

import React, { useState } from 'react';
import { X, Target, Users, Calendar, Lock, Globe, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated?: (title: string) => void;
}

export default function CreateGoalModal({ isOpen, onClose, onGoalCreated }: CreateGoalModalProps) {
  const { currentUser, createGoal } = useApp();

  const [title, setTitle] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [timePeriod, setTimePeriod] = useState('Q4 FY26 Oct 1 - Dec 31');
  const [privacy, setPrivacy] = useState<'Public' | 'Private'>('Public');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    createGoal({
      title: title.trim(),
      timePeriod,
      privacy: privacy === 'Public' ? 'Public to My workspace' : 'Private to members',
    });
    if (onGoalCreated) onGoalCreated(title.trim());
    onClose();
  };

  return (
    <div data-modal-overlay className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[540px] p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4573d2]" />
            <h3 className="text-[18px] font-bold text-white tracking-tight">Create a new goal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body matching Video Frame 054 */}
        <div className="space-y-4 text-[13px]">
          {/* Goal title */}
          <div>
            <label className="block text-[12px] font-semibold text-white mb-1.5">
              Goal title *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Increase product adoption by 25%"
              className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white placeholder-[#717377] focus:outline-none"
            />
          </div>

          {/* Goal owner & Members */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Goal owner
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#141517] border border-[#37383b] rounded-xl">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <span className="text-white text-[13px] truncate font-medium">{currentUser.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Members
              </label>
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Name or email"
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3 py-2 text-white placeholder-[#717377] focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox: Notify new members */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifyMembers}
              onChange={(e) => setNotifyMembers(e.target.checked)}
              className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer"
            />
            <span className="text-[12.5px] text-[#cfcecd]">Notify new members about joining this goal</span>
          </label>

          {/* Time period & Privacy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5 flex items-center gap-1">
                <span>Time period</span>
                <Info className="w-3.5 h-3.5 text-[#8a8886]" />
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer text-[12.5px]"
              >
                <option value="Q4 FY26 Oct 1 - Dec 31">Q4 FY26 Oct 1 - Dec 31</option>
                <option value="Q1 FY27 Jan 1 - Mar 31">Q1 FY27 Jan 1 - Mar 31</option>
                <option value="Q2 FY27 Apr 1 - Jun 30">Q2 FY27 Apr 1 - Jun 30</option>
                <option value="FY26 Full Year">FY26 Full Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Privacy
              </label>
              <div className="flex items-center gap-1.5 bg-[#141517] border border-[#37383b] rounded-xl p-1 text-[12px]">
                <button
                  type="button"
                  onClick={() => setPrivacy('Public')}
                  className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    privacy === 'Public'
                      ? 'bg-[#252628] text-white shadow-xs'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('Private')}
                  className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    privacy === 'Private'
                      ? 'bg-[#252628] text-white shadow-xs'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
              </div>
            </div>
          </div>

          {/* Asana tip note */}
          <div className="p-3 bg-[#141517] border border-[#2e3034] rounded-xl flex items-start gap-2.5 text-[12px] text-[#bdbbb9] leading-relaxed">
            <span className="text-[#4573d2] font-semibold shrink-0">@ Asana tip:</span>
            <span>You can edit these details and progress settings after creating this goal.</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-[#2e2f32]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#37383b] text-[#cfcecd] hover:bg-[#28292c] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
              title.trim()
                ? 'bg-[#4573d2] hover:bg-[#3b66be] text-white shadow-sm'
                : 'bg-[#252628] text-[#5d5f63] cursor-not-allowed border border-[#303236]'
            }`}
          >
            Save goal
          </button>
        </div>
      </div>
    </div>
  );
}

