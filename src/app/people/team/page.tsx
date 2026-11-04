'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Info,
  UserPlus,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  MessageSquare,
  Calendar as CalendarIcon,
  BookOpen,
  FolderClosed,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  ThumbsUp,
  Send,
  Sparkles,
  Layers,
  ListTodo,
  ExternalLink,
  Target,
  FileText,
  Lock,
  Clock,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import CreateGoalModal from '@/components/modals/CreateGoalModal';

export default function PeopleTeamPage() {
  const {
    currentUser,
    users,
    projects,
    portfolios,
    tasks,
    goals,
    teamMessages,
    addTeamMessage,
    teamDescription,
    setTeamDescription,
    openInviteModal,
    openCreateModal,
  } = useApp();

  // Active tab in team view: Overview | Members | All work | Messages | Calendar | Knowledge
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Members' | 'All work' | 'Messages' | 'Calendar' | 'Knowledge'
  >('Overview');

  // Overview description editing
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(teamDescription || '');

  // Members tab filter & search
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Messages tab composer state
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageLikes, setMessageLikes] = useState<Record<string, number>>({});

  // Goals modal
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveDescription = () => {
    setTeamDescription(descInput);
    setIsEditingDesc(false);
    showToast('Team description updated');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageSubject.trim() || !messageBody.trim()) return;
    addTeamMessage(messageSubject.trim(), messageBody.trim());
    setMessageSubject('');
    setMessageBody('');
    showToast('Message sent to team');
  };

  const toggleLike = (msgId: string) => {
    setMessageLikes((prev) => ({
      ...prev,
      [msgId]: (prev[msgId] || 0) + 1,
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1e1f21] text-[#f5f4f3] select-none flex flex-col">
      {/* ============================================================== */}
      {/* 1. Header (Matching Asana frame 005)                           */}
      {/* ============================================================== */}
      <div className="px-8 pt-5 pb-0 border-b border-[#2b2c2e] bg-[#1e1f21]">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2a2b2e] border border-[#3b3d41] flex items-center justify-center text-white font-bold text-[15px] shadow-sm">
              M
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white tracking-tight">My workspace</h1>
              <button
                onClick={() => showToast('My workspace • Organization default team')}
                className="p-1 rounded text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                title="Team info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action button: + Invite */}
          <button
            onClick={openInviteModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[12.5px] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>

        {/* Navigation Tabs (Overview, Members, All work, Messages, Calendar, Knowledge +) */}
        <div className="flex items-center gap-2 text-[13px] font-medium overflow-x-auto pb-0 -mb-[1px]">
          {(['Overview', 'Members', 'All work', 'Messages', 'Calendar', 'Knowledge'] as const).map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 px-2 relative transition-colors cursor-pointer ${
                    isActive ? 'text-white font-semibold' : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  <span>{tab}</span>
                  {tab === 'Knowledge' && <span className="ml-1 text-[#8a8886]">+</span>}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Tab Contents                                                */}
      {/* ============================================================== */}
      <div className="flex-1 p-8 max-w-[1320px] w-full mx-auto">
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW (Matching Video frames 005-010)               */}
        {/* ============================================================ */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
            {/* Left 8 Cols: Overview Setup & Curated Work */}
            <div className="lg:col-span-8 space-y-8">
              {/* Team Description Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2a2b2e] flex items-center justify-center text-white font-bold text-[14px]">
                    M
                  </div>
                  <h2 className="text-[18px] font-bold text-white">My workspace</h2>
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="Describe your team's purpose and responsibilities..."
                      className="w-full bg-[#141517] border border-[#38393c] focus:border-[#4573d2] rounded-xl p-3 text-[13px] text-white focus:outline-none resize-none leading-relaxed"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="px-3.5 py-1.5 rounded-lg bg-[#4573d2] text-white text-[12px] font-semibold hover:bg-[#3b66be] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#37383b] text-[#cfcecd] hover:bg-[#28292c] text-[12px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => {
                      setDescInput(teamDescription || '');
                      setIsEditingDesc(true);
                    }}
                    className="text-[13.5px] text-[#8a8886] hover:text-white cursor-pointer py-1 transition-colors italic"
                  >
                    {teamDescription || 'Click to add team description...'}
                  </p>
                )}
              </div>

              {/* Finish Setting Up Your Team Checklist (from Frame 005) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-white tracking-tight">
                    Finish setting up your team
                  </h3>
                  <span className="text-[11.5px] text-[#8a8886]">
                    {teamDescription ? '1' : '0'} of 3 steps completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1: Add team description */}
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] cursor-pointer transition-colors space-y-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#4573d2] group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-[13px] font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                      Add team description
                    </div>
                    <p className="text-[11.5px] text-[#8a8886] leading-relaxed">
                      Describe your team's purpose and responsibilities
                    </p>
                  </div>

                  {/* Step 2: Add work */}
                  <div
                    onClick={() => setActiveTab('All work')}
                    className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] cursor-pointer transition-colors space-y-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#f5b324] group-hover:scale-105 transition-transform">
                      <ListTodo className="w-4 h-4" />
                    </div>
                    <div className="text-[13px] font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                      Add work
                    </div>
                    <p className="text-[11.5px] text-[#8a8886] leading-relaxed">
                      Link existing projects, portfolios, or templates your team may find helpful
                    </p>
                  </div>

                  {/* Step 3: Add teammates */}
                  <div
                    onClick={openInviteModal}
                    className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] cursor-pointer transition-colors space-y-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#4cd195] group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="text-[13px] font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                      Add teammates
                    </div>
                    <p className="text-[11.5px] text-[#8a8886] leading-relaxed">
                      Start collaborating by inviting teammates to your new team
                    </p>
                  </div>
                </div>
              </div>

              {/* Curated Work Section (Matching frame 005) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-white tracking-tight">Curated work</h3>
                  <button
                    onClick={() => openCreateModal('project')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2e3034] border border-[#383a3d] text-white text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add work</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((proj) => (
                    <Link
                      key={proj.id}
                      href={`/project/${proj.id}`}
                      className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] transition-all cursor-pointer group flex items-start gap-3.5"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#8a8886] group-hover:text-white shrink-0">
                        <ListTodo className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-semibold text-white group-hover:text-[#4573d2] transition-colors truncate">
                          {proj.name}
                        </div>
                        <div className="text-[11.5px] text-[#8a8886] mt-0.5">
                          {proj.status || 'On track'} • {proj.members.length} member(s)
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Members & Goals Widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Members Widget */}
              <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-white tracking-tight">Members</h3>
                  <button
                    onClick={() => setActiveTab('Members')}
                    className="text-[12px] text-[#4573d2] hover:text-[#5d8ae0] font-medium cursor-pointer"
                  >
                    View all {users.length}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-[#252628] shadow-sm"
                      style={{ backgroundColor: u.avatarColor }}
                      title={`${u.name} (${u.email})`}
                    >
                      {u.initials}
                    </div>
                  ))}
                  <button
                    onClick={openInviteModal}
                    className="w-8 h-8 rounded-full border border-dashed border-[#55575b] hover:border-white flex items-center justify-center text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                    title="Add members"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Goals Widget */}
              <div className="bg-[#252628] border border-[#2e3034] rounded-2xl p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-white tracking-tight">Goals</h3>
                  <button
                    onClick={() => setIsCreateGoalOpen(true)}
                    className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#1e1f21] hover:bg-[#2a2b2e] border border-[#37383b] text-[#cfcecd] hover:text-white transition-colors cursor-pointer"
                  >
                    Create goal
                  </button>
                </div>

                {goals.length > 0 ? (
                  <div className="space-y-2.5">
                    {goals.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-xl bg-[#1e1f21] border border-[#2e3034] space-y-1.5"
                      >
                        <div className="text-[12.5px] font-semibold text-white truncate">
                          {g.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#8a8886]">
                          <span className="text-emerald-400 font-medium">{g.status}</span>
                          <span>{g.progress}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-[#2a2b2e] overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.max(g.progress, 10)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-[12px] text-[#8a8886]">
                    <p className="text-[#cfcecd] font-medium">
                      This team hasn't created any goals yet
                    </p>
                    <p className="leading-relaxed">
                      Add a goal so the team can see what you hope to achieve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MEMBERS (Matching Video frame 012)                     */}
        {/* ============================================================ */}
        {activeTab === 'Members' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Filter & Add Member Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-[420px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8a8886] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl pl-9 pr-3.5 py-1.5 text-[13px] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openInviteModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add member</span>
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-[#252628] border border-[#2e3034] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#2e3034] text-[11.5px] font-semibold text-[#8a8886] bg-[#1e1f21]/70 uppercase tracking-wider">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Email</th>
                    <th className="py-3 px-5">Job title</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e3034]">
                  {users
                    .filter((u) => {
                      if (!memberSearchQuery.trim()) return true;
                      const q = memberSearchQuery.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((member) => (
                      <tr key={member.id} className="hover:bg-[#1e1f21]/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.initials}
                            </div>
                            <span className="font-semibold text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#8a8886]">{member.email}</td>
                        <td className="py-3.5 px-5 text-[#cfcecd]">
                          {member.jobTitle || 'Team Member'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1e1f21] border border-[#383a3d] text-[11.5px] font-medium text-[#cfcecd]">
                            {member.role || 'Member'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => showToast(`Options for ${member.name}`)}
                            className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#1e1f21] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ALL WORK (Matching Video frame 018)                    */}
        {/* ============================================================ */}
        {activeTab === 'All work' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-white tracking-tight">Projects</h3>
                  <span className="text-[12px] text-[#8a8886]">({projects.length})</span>
                </div>

                <button
                  onClick={() => openCreateModal('project')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/project/${proj.id}`}
                    className="p-5 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#8a8886] group-hover:text-white shrink-0">
                        <ListTodo className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[14px] font-semibold text-white group-hover:text-[#4573d2] transition-colors truncate">
                          {proj.name}
                        </h4>
                        <span className="text-[11.5px] text-[#8a8886]">
                          {proj.status || 'On track'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2e3034] text-[11.5px] text-[#8a8886]">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: currentUser.avatarColor }}
                        >
                          {currentUser.initials}
                        </div>
                        <span>Kevin Safrisal</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Templates Section matching Frame 018 */}
            <div className="space-y-4 pt-4 border-t border-[#2e2f32]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-white tracking-tight">Templates</h3>
                  <p className="text-[12px] text-[#8a8886]">Explore ready-made workflows for your team</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Project timeline', desc: 'Map out dependencies, milestones, and deadlines.' },
                  { title: 'Request tracking', desc: 'Capture, prioritize, and monitor incoming team requests.' },
                  { title: 'New hire checklist', desc: 'Outline onboarding steps and track progress seamlessly.' },
                ].map((tpl) => (
                  <div
                    key={tpl.title}
                    onClick={() => {
                      openCreateModal('project');
                      showToast(`Using template: ${tpl.title}`);
                    }}
                    className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1e1f21] border border-[#383a3d] flex items-center justify-center text-[#4573d2] group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-[13.5px] font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                      {tpl.title}
                    </div>
                    <p className="text-[11.5px] text-[#8a8886] leading-relaxed">{tpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: MESSAGES (Matching Video frame 024)                    */}
        {/* ============================================================ */}
        {activeTab === 'Messages' && (
          <div className="space-y-6 max-w-[800px] mx-auto animate-in fade-in duration-150">
            {/* Header info banner */}
            <div className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] space-y-1">
              <h3 className="text-[15px] font-bold text-white">Connect your words to your work</h3>
              <p className="text-[12.5px] text-[#8a8886] leading-relaxed">
                Send a message to kick off projects, discuss tasks, or brainstorm ideas with your teammates.
              </p>
            </div>

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-5 rounded-2xl bg-[#252628] border border-[#2e3034] space-y-3.5 shadow-sm"
            >
              <h4 className="text-[14px] font-bold text-white">Send message to members</h4>

              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Subject..."
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-[13.5px] text-white focus:outline-none placeholder-[#717377]"
              />

              <textarea
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write your message to the team..."
                className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2.5 text-[13px] text-white focus:outline-none placeholder-[#717377] resize-none leading-relaxed"
              />

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!messageSubject.trim() || !messageBody.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                    messageSubject.trim() && messageBody.trim()
                      ? 'bg-[#4573d2] hover:bg-[#3b66be] text-white cursor-pointer shadow-sm'
                      : 'bg-[#1e1f21] text-[#5c5e62] cursor-not-allowed border border-[#2e3034]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send message</span>
                </button>
              </div>
            </form>

            {/* Messages Feed */}
            <div className="space-y-4">
              {teamMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-2xl bg-[#252628] border border-[#2e3034] space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                        style={{ backgroundColor: msg.author.avatarColor }}
                      >
                        {msg.author.initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white">{msg.author.name}</div>
                        <div className="text-[11px] text-[#8a8886]">{msg.createdAt}</div>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-[15px] font-bold text-white">{msg.title}</h4>
                  <p className="text-[13.5px] text-[#cfcecd] leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-[12px] text-[#8a8886] border-t border-[#2e2f32]">
                    <button
                      onClick={() => toggleLike(msg.id)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{msg.likes + (messageLikes[msg.id] || 0)}</span>
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{msg.commentsCount} comments</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: CALENDAR                                              */}
        {/* ============================================================ */}
        {activeTab === 'Calendar' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-white tracking-tight">November 2026</h3>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="flex items-center gap-1.5 text-[#cfcecd]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4573d2]" />
                  <span>Tasks scheduled</span>
                </span>
              </div>
            </div>

            <div className="bg-[#252628] border border-[#2e3034] rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 border-b border-[#2e2f32] text-center text-[11.5px] font-semibold text-[#8a8886] py-2.5 bg-[#1e1f21]/70 uppercase">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-[#2e2f32] text-[12px]">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 1; // Align to Nov 2026
                  const isCurrentMonth = dayNum >= 1 && dayNum <= 30;
                  const dayTasks = isCurrentMonth
                    ? tasks.filter((t) => (dayNum === 2 || dayNum === 4 || dayNum === 12) && t)
                    : [];

                  return (
                    <div
                      key={i}
                      className={`min-h-[96px] p-2 flex flex-col justify-between transition-colors ${
                        isCurrentMonth ? 'bg-[#252628] hover:bg-[#282a2e]' : 'bg-[#1b1c1e] text-[#55575b]'
                      }`}
                    >
                      <div className="font-medium text-[11px] text-[#8a8886]">
                        {isCurrentMonth ? dayNum : ''}
                      </div>

                      {dayTasks.length > 0 && isCurrentMonth && (
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              className="px-2 py-0.5 rounded bg-[#4573d2]/20 border border-[#4573d2]/30 text-[#6ea3ff] text-[10.5px] font-medium truncate"
                            >
                              {t.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: KNOWLEDGE                                             */}
        {/* ============================================================ */}
        {activeTab === 'Knowledge' && (
          <div className="space-y-6 max-w-[800px] mx-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-white tracking-tight">
                  Team Knowledge & Docs
                </h3>
                <p className="text-[12px] text-[#8a8886]">
                  Keep important guides, wiki articles, and team standards accessible to all members.
                </p>
              </div>

              <button
                onClick={() => showToast('New knowledge page draft created')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3b66be] text-white text-[12px] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Page +</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Engineering Architecture & Conventions',
                  updated: 'Updated 2 days ago',
                  author: 'Kevin Safrisal',
                  snippet: 'Best practices for repository architecture, state synchronization, and component hierarchy.',
                },
                {
                  title: 'Workspace Onboarding & Guidelines',
                  updated: 'Updated last week',
                  author: 'Kevin Safrisal',
                  snippet: 'Welcome packet for new workspace members, including project workflows and permissions.',
                },
                {
                  title: 'Design System & UI Components',
                  updated: 'Updated Oct 28',
                  author: 'Kevin Safrisal',
                  snippet: 'Dark theme color palettes, typography scale, and standard Asana spacing patterns.',
                },
              ].map((doc) => (
                <div
                  key={doc.title}
                  onClick={() => showToast(`Opening document: ${doc.title}`)}
                  className="p-4 rounded-2xl bg-[#252628] border border-[#2e3034] hover:border-[#4573d2] cursor-pointer transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#4573d2]" />
                      <h4 className="text-[14px] font-bold text-white group-hover:text-[#4573d2] transition-colors">
                        {doc.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#8a8886]">{doc.updated}</span>
                  </div>
                  <p className="text-[12.5px] text-[#8a8886] leading-relaxed pl-6">{doc.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

