'use client';

import React, { useState } from 'react';
import { X, User, Briefcase, Building2, FileText, Calendar, Camera } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, updateUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [pronouns, setPronouns] = useState(currentUser.pronouns || '');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [aboutMe, setAboutMe] = useState(currentUser.aboutMe || '');
  const [isOutOfOffice, setIsOutOfOffice] = useState(currentUser.isOutOfOffice || false);
  const [outOfOfficeNote, setOutOfOfficeNote] = useState(currentUser.outOfOfficeNote || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUserProfile({
      name: name.trim() || currentUser.name,
      pronouns: pronouns.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      aboutMe: aboutMe.trim(),
      isOutOfOffice,
      outOfOfficeNote: outOfOfficeNote.trim(),
      avatarUrl: avatarUrl || undefined,
    });
    onClose();
  };

  return (
    <div data-modal-overlay className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[560px] p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2e2f32]">
          <h3 className="text-[18px] font-bold text-white tracking-tight">Edit profile</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Photo Area */}
        <div className="flex items-center gap-4 py-1">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-18 h-18 rounded-full object-cover border-2 border-[#38393c]"
              />
            ) : (
              <div
                className="w-18 h-18 rounded-full flex items-center justify-center text-white text-[24px] font-bold shadow-md"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
            )}
            <label
              htmlFor="profile-pic-upload"
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition-opacity cursor-pointer"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Change</span>
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="space-y-1">
            <div className="text-[14px] font-semibold text-white">{currentUser.name}</div>
            <div className="text-[12px] text-[#8a8886]">{currentUser.email}</div>
            <label
              htmlFor="profile-pic-upload"
              className="inline-block text-[12px] text-[#4573d2] hover:text-[#5d8ae0] font-medium cursor-pointer"
            >
              Upload new photo
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-[13px]">
          {/* Full Name & Pronouns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Full name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Pronouns
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. they/them, he/him, she/her"
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white placeholder-[#717377] focus:outline-none"
              />
            </div>
          </div>

          {/* Job Title & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Job title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Product Designer, Lead Engineer"
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white placeholder-[#717377] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-white mb-1.5">
                Team or department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Product, Marketing, Core Team"
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white placeholder-[#717377] focus:outline-none"
              />
            </div>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-[12px] font-semibold text-white mb-1.5">
              About me
            </label>
            <textarea
              rows={3}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="What are your primary responsibilities, working hours, or hobbies? Share with your team..."
              className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-white placeholder-[#717377] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Out of Office Section */}
          <div className="p-3.5 rounded-xl bg-[#141517] border border-[#2e3034] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8a8886]" />
                <span className="text-[13px] font-semibold text-white">Out of office</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOutOfOffice}
                  onChange={(e) => setIsOutOfOffice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#252628] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4573d2]" />
              </label>
            </div>

            {isOutOfOffice && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={outOfOfficeNote}
                  onChange={(e) => setOutOfOfficeNote(e.target.value)}
                  placeholder="e.g. On vacation until Nov 10, reachable via Slack for emergencies"
                  className="w-full bg-[#1e1f21] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3 py-1.5 text-[12.5px] text-white placeholder-[#717377] focus:outline-none"
                />
                <p className="text-[11.5px] text-[#8a8886]">
                  A badge will appear on your profile and tasks to notify collaborators that you are away.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2e2f32]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#37383b] text-[#cfcecd] hover:bg-[#28292c] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13px] font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

