'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Calendar,
  Plus,
  Edit2,
  CheckCircle2,
  ListTodo,
  Users,
  Target,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  Pin,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import EditProfileModal from '@/components/modals/EditProfileModal';
import CreateGoalModal from '@/components/modals/CreateGoalModal';

export default function PeopleProfilePage() {
  const {
    currentUser,
    tasks,
    projects,
    goals,
    toggleTaskComplete,
    openInviteModal,
    updateUserProfile,
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter tasks assigned to current user or default user
  const userTasks = tasks
    .filter(
      (t) =>
        t.assignee?.name === currentUser.name ||
        t.assignee?.name === 'Kevin Safrisal' ||
        !t.assignee?.isPlaceholder
    )
    .slice(0, 5);

  // Recent projects
  const recentProjects = projects.slice(0, 4);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateUserProfile({ avatarUrl: event.target.result as string });
          showToast('Profile photo updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1e1f21] text-[#f5f4f3] select-none p-8 max-w-[1320px] w-full mx-auto space-y-8 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. Header / Hero Profile Area (Matching Screenshot Exactly)    */}
      {/* ============================================================== */}
      <div className="flex items-start gap-6 pt-2">
        {/* Large Avatar Circle (100px) */}
        <div className="relative group shrink-0">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#383a3d] shadow-lg"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-[34px] font-bold shadow-lg"
              style={{ backgroundColor: currentUser.avatarColor || '#d84b7f' }}
            >
              {currentUser.initials}
            </div>
          )}

          {/* Camera overlay button */}
          <label
            htmlFor="hero-avatar-file"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#252628] border border-[#3b3d42] hover:bg-[#323438] hover:border-white/40 flex items-center justify-center text-[#cfcecd] hover:text-white transition-all cursor-pointer shadow-md"
            title="Update photo"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input
            id="hero-avatar-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* User Info & Quick Chips */}
        <div className="space-y-2.5 flex-1 min-w-0 pt-0.5">
          {/* Name & Status Pin */}
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-bold text-white tracking-tight truncate">
              {currentUser.name}
            </h1>
            <button
              onClick={() => showToast('Status pinned to profile')}
              className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="Pin status"
            >
              <Pin className="w-4 h-4 rotate-45" />
            </button>
          </div>

          {/* Out of Office Status */}
          <div>
            {currentUser.isOutOfOffice ? (
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[12px] font-medium hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Out of office: {currentUser.outOfOfficeNote || 'Away'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Set out of office</span>
              </button>
            )}
          </div>

          {/* Quick Action Chips (+ Add job title, + Add team or dept., + Add about me) */}
          <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[#a2a09e] pt-1">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-1 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>{currentUser.jobTitle || 'Add job title'}</span>
            </button>

            <span className="text-[#3e4044]">•</span>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-1 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>{currentUser.department || 'Add team or dept.'}</span>
            </button>

            <span className="text-[#3e4044]">•</span>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-1 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>{currentUser.aboutMe ? 'Edit about me' : 'Add about me'}</span>
            </button>
          </div>

          {/* About Me summary preview if set */}
          {currentUser.aboutMe && (
            <p className="text-[13px] text-[#cfcecd] leading-relaxed max-w-[650px] pt-1">
              {currentUser.aboutMe}
            </p>
          )}

          {/* Edit Profile Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2e3034] text-white border border-[#383a3d] text-[12.5px] font-medium transition-colors cursor-pointer shadow-xs"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Main 2-Column Content Grid                                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* Left Column (Span 7 / ~60%)                                   */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: My tasks (Matching Asana frame 001 exactly) */}
          <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-white tracking-tight">My tasks</h2>
                <Lock className="w-3.5 h-3.5 text-[#8a8886]" />
              </div>

              <Link
                href="/my-tasks"
                className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#1e1f21] hover:bg-[#2a2b2e] border border-[#37383b] text-[#cfcecd] hover:text-white transition-colors"
              >
                View all tasks
              </Link>
            </div>

            {/* Task list items */}
            <div className="space-y-1">
              {userTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e1f21] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        task.completed
                          ? 'border-[#4cd195] bg-[#4cd195] text-black'
                          : 'border-[#55575b] group-hover:border-[#4cd195]'
                      }`}
                    >
                      {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    <span
                      className={`text-[13px] truncate font-normal ${
                        task.completed ? 'line-through text-[#8a8886]' : 'text-white'
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pl-3 text-[11.5px]">
                    {/* Project Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1e1f21] border border-[#343639] text-[#cfcecd]">
                      <span className="w-2 h-2 rounded bg-white/40" />
                      <span className="max-w-[120px] truncate">
                        {task.projectName || "Kevin's first project"}
                      </span>
                    </div>

                    {/* Due Date */}
                    <span className="text-[#e54b4b] font-medium">
                      {task.dueDate || 'Nov 2'}
                    </span>
                  </div>
                </div>
              ))}

              {userTasks.length === 0 && (
                <div className="py-6 text-center text-[#8a8886] text-[13px]">
                  No tasks assigned to you right now.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: My recent projects */}
          <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-white tracking-tight">
              My recent projects
            </h2>

            <div className="space-y-1.5">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e1f21] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#8a8886] group-hover:text-white transition-colors">
                      <ListTodo className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-medium text-white group-hover:text-[#4573d2] transition-colors">
                      {project.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#8a8886]">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: currentUser.avatarColor }}
                    >
                      {currentUser.initials}
                    </div>
                    <span>...</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Right Column (Span 5 / ~40%)                                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Frequent collaborators (Matching Asana frame 001) */}
          <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-white tracking-tight">
                  Frequent collaborators
                </h2>
                <Lock className="w-3.5 h-3.5 text-[#8a8886]" />
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Invite Teammates Action Button */}
              <button
                onClick={openInviteModal}
                className="flex items-center gap-3 text-left w-full p-1 rounded-xl hover:bg-[#1e1f21] transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#55575b] group-hover:border-white flex items-center justify-center text-[#8a8886] group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-medium text-[#cfcecd] group-hover:text-white transition-colors">
                  Invite teammates
                </span>
              </button>

              {/* Placeholder text matching Asana */}
              <p className="text-[12.5px] text-[#8a8886] leading-relaxed pl-1 pb-1">
                This space is for your frequent collaborators.
              </p>
            </div>
          </div>

          {/* Card 2: My goals (Matching Asana frame 001 & 054) */}
          <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-white tracking-tight">My goals</h2>
                <Lock className="w-3.5 h-3.5 text-[#8a8886]" />
              </div>

              <button
                onClick={() => setIsCreateGoalOpen(true)}
                className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#1e1f21] hover:bg-[#2a2b2e] border border-[#37383b] text-[#cfcecd] hover:text-white transition-colors cursor-pointer"
              >
                Create goal
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-xl bg-[#1e1f21] border border-[#2e3034] space-y-2 hover:border-[#383a3e] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold text-white leading-tight">
                        {goal.title}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#4cd195]/15 text-[#4cd195] shrink-0">
                        {goal.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11.5px] text-[#8a8886]">
                      <span>{goal.timePeriod}</span>
                      <span className="font-medium text-white">{goal.progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#2a2b2e] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(goal.progress, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-[12.5px] text-[#8a8886]">
                <p className="font-medium text-[#cfcecd]">You don't own any goals yet</p>
                <p className="leading-relaxed">
                  Add a goal so the team can see what you hope to achieve.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
        onGoalCreated={(title) => showToast(`Goal "${title}" created`)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[90] bg-[#141517] border border-[#37383b] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#4cd195]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

