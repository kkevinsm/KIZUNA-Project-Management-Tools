'use client';

import React, { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Folder,
  Send,
  Video,
  FileText,
  ExternalLink,
  Target,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface WidgetContainerProps {
  title: string;
  subtitle?: string;
  onRemove: () => void;
  children: React.ReactNode;
}

function WidgetContainer({ title, subtitle, onRemove, children }: WidgetContainerProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-[#252628] border border-[#333538] rounded-2xl p-5 flex flex-col justify-between shadow-sm relative text-[#f5f4f3]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-white">{title}</h2>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-[#2b2c2f] border border-[#3a3b3e] rounded-xl shadow-xl z-20 py-1"
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={onRemove}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#ff6b72] hover:bg-[#3a1d22] flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove widget</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-[12.5px] text-[#8a8886] mb-4">{subtitle}</p>
        )}

        {/* Content */}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

// 1. Private Notepad Widget
export function PrivateNotepadWidget({ onRemove }: { onRemove: () => void }) {
  const [note, setNote] = useState('');
  const [savedTime, setSavedTime] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kizuna_private_notepad');
    if (saved) setNote(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    localStorage.setItem('kizuna_private_notepad', val);
    setSavedTime('Saved just now');
  };

  return (
    <WidgetContainer
      title="Private notepad"
      subtitle="Only you can see this. Great for quick notes, todo drafts, and ideas."
      onRemove={onRemove}
    >
      <div className="flex flex-col gap-2">
        <textarea
          rows={6}
          value={note}
          onChange={handleChange}
          placeholder="Type quick thoughts, meeting notes, or ideas here..."
          className="w-full bg-[#1b1c1e] text-[#f5f4f3] placeholder-[#606266] rounded-xl p-3 border border-[#343639] focus:border-[#4573d2] focus:ring-1 focus:ring-[#4573d2] outline-none text-[13px] leading-relaxed resize-none transition-colors"
        />
        <div className="flex items-center justify-between text-[11px] text-[#8a8886] px-1">
          <span>{note.length} characters</span>
          <span>{savedTime || 'Autosaved locally'}</span>
        </div>
      </div>
    </WidgetContainer>
  );
}

// 2. Goals Widget
export function GoalsWidget({ onRemove }: { onRemove: () => void }) {
  const [goals, setGoals] = useState([
    { id: 'g1', title: 'Launch Kizuna v1.0 MVP', progress: 85, status: 'On track', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { id: 'g2', title: '100% UI fidelity with Asana.com', progress: 95, status: 'On track', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { id: 'g3', title: 'Multi-user Workspace & Cloud Storage', progress: 90, status: 'On track', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setGoals((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        title: newGoalTitle.trim(),
        progress: 0,
        status: 'On track',
        statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      },
    ]);
    setNewGoalTitle('');
    setShowAdd(false);
  };

  return (
    <WidgetContainer
      title="Goals"
      subtitle="Track team and company milestones"
      onRemove={onRemove}
    >
      <div className="space-y-3">
        {goals.map((g) => (
          <div
            key={g.id}
            className="p-3 bg-[#1e1f21] border border-[#333538] rounded-xl hover:border-[#45474c] transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[13px] font-semibold text-white truncate">
                {g.title}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${g.statusColor} shrink-0`}>
                {g.status}
              </span>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#333538] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#4573d2] h-full rounded-full transition-all duration-300"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
              <span className="text-[12px] text-[#9c9a99] font-medium shrink-0">
                {g.progress}%
              </span>
            </div>
          </div>
        ))}

        {showAdd ? (
          <form onSubmit={handleAdd} className="flex gap-2 pt-1">
            <input
              type="text"
              autoFocus
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Goal title..."
              className="flex-1 bg-[#1e1f21] border border-[#343639] focus:border-[#4573d2] text-white text-[13px] px-3 py-1.5 rounded-lg outline-none"
            />
            <button
              type="submit"
              className="bg-[#4573d2] hover:bg-[#3862b5] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-[#8a8886] hover:text-white text-[12px] px-2 py-1.5"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-[12.5px] text-[#8a8886] hover:text-white pt-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add goal</span>
          </button>
        )}
      </div>
    </WidgetContainer>
  );
}

// 3. Portfolios Widget
export function PortfoliosWidget({ onRemove }: { onRemove: () => void }) {
  const portfolios = [
    { id: 'pf1', name: 'Product Core MVP', color: 'text-emerald-400', count: 3, status: 'On track', progress: '75%' },
    { id: 'pf2', name: 'Design & UX Polish', color: 'text-purple-400', count: 2, status: 'On track', progress: '90%' },
    { id: 'pf3', name: 'Cloud Infrastructure & R2', color: 'text-blue-400', count: 1, status: 'On track', progress: '100%' },
  ];

  return (
    <WidgetContainer
      title="Portfolios"
      subtitle="Groups of related projects and overall health"
      onRemove={onRemove}
    >
      <div className="grid grid-cols-1 gap-2.5">
        {portfolios.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 bg-[#1e1f21] hover:bg-[#252629] border border-[#343639] rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Folder className={`w-5 h-5 ${p.color}`} />
              <div>
                <div className="text-[13px] font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                  {p.name}
                </div>
                <div className="text-[11px] text-[#8a8886]">
                  {p.count} projects • {p.progress} completed
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

// 4. Status Updates Widget
export function StatusUpdatesWidget({ onRemove }: { onRemove: () => void }) {
  const [updates, setUpdates] = useState([
    {
      id: 'su1',
      project: "Kevin's first project",
      author: 'Kevin Safrisal',
      time: 'Today',
      status: 'On track',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      text: 'Sprint milestones progressing smoothly. Asana widgets integration completed.',
    },
    {
      id: 'su2',
      project: 'Cloud Storage Migration',
      author: 'Cloudflare Admin',
      time: 'Yesterday',
      status: 'On track',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      text: 'R2 Object storage connected and tested with S3 client SDK.',
    },
  ]);

  return (
    <WidgetContainer
      title="Status updates"
      subtitle="Latest health reports from your projects"
      onRemove={onRemove}
    >
      <div className="space-y-3">
        {updates.map((u) => (
          <div
            key={u.id}
            className="p-3 bg-[#1e1f21] border border-[#333538] rounded-xl space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[13px] font-semibold text-white truncate">
                  {u.project}
                </span>
                <span className="text-[11px] text-[#8a8886] shrink-0">• {u.time}</span>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${u.color} shrink-0`}>
                {u.status}
              </span>
            </div>
            <p className="text-[12.5px] text-[#c5c3c0] leading-snug">{u.text}</p>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

// 5. Upcoming Meetings Widget
export function UpcomingMeetingsWidget({ onRemove }: { onRemove: () => void }) {
  const meetings = [
    {
      id: 'm1',
      title: 'Sprint Planning & Asana Demo',
      time: '10:00 AM – 10:45 AM',
      date: 'Today',
      participants: ['Kevin', 'Teammate', 'Guest'],
      link: '#',
    },
    {
      id: 'm2',
      title: 'UI Review: Dark Theme Fidelity',
      time: '2:30 PM – 3:00 PM',
      date: 'Today',
      participants: ['Kevin', 'Designer'],
      link: '#',
    },
  ];

  return (
    <WidgetContainer
      title="Upcoming meetings"
      subtitle="Synced events from your team calendar"
      onRemove={onRemove}
    >
      <div className="space-y-2.5">
        {meetings.map((m) => (
          <div
            key={m.id}
            className="p-3 bg-[#1e1f21] border border-[#333538] rounded-xl flex items-center justify-between gap-3 hover:border-[#45474c] transition-all"
          >
            <div>
              <div className="text-[13px] font-semibold text-white">{m.title}</div>
              <div className="flex items-center gap-2 text-[11px] text-[#8a8886] mt-0.5">
                <Clock className="w-3 h-3 text-[#4573d2]" />
                <span>{m.time} ({m.date})</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-5 h-5 rounded-full bg-[#84cc16] flex items-center justify-center text-[9px] text-black font-bold">KS</div>
                <div className="w-5 h-5 rounded-full bg-[#14b8a6] flex items-center justify-center text-[9px] text-white font-bold">TM</div>
                <div className="w-5 h-5 rounded-full bg-[#60a5fa] flex items-center justify-center text-[9px] text-white font-bold">GT</div>
              </div>
            </div>

            <button
              onClick={() => alert(`Opening meeting link for: ${m.title}`)}
              className="bg-[#4573d2] hover:bg-[#3862b5] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join</span>
            </button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

// 6. Comments Mentioning Me Widget
export function CommentsMentioningMeWidget({ onRemove }: { onRemove: () => void }) {
  const { openTaskDrawer, tasks } = useApp();
  const [mentions] = useState([
    {
      id: 'cm1',
      author: 'Teammate',
      time: '1h ago',
      taskName: 'Task 1',
      taskId: tasks[0]?.id || 'task-1',
      text: '@Kevin Safrisal please review the latest layout updates when you get a chance!',
    },
    {
      id: 'cm2',
      author: 'Workspace Bot',
      time: '3h ago',
      taskName: 'Task 2',
      taskId: tasks[1]?.id || 'task-2',
      text: '@Kevin Safrisal Cloudflare R2 bucket connection verified successfully.',
    },
  ]);

  return (
    <WidgetContainer
      title="Comments mentioning me"
      subtitle="Mentions from your team across tasks"
      onRemove={onRemove}
    >
      <div className="space-y-2.5">
        {mentions.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-[#1e1f21] border border-[#333538] rounded-xl space-y-1.5 hover:border-[#45474c] transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-[#8a8886]">
              <span className="font-semibold text-white">{item.author}</span>
              <span>{item.time}</span>
            </div>
            <p className="text-[12.5px] text-[#c5c3c0] leading-snug">{item.text}</p>
            <button
              onClick={() => openTaskDrawer(item.taskId)}
              className="text-[11.5px] text-[#4573d2] hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <span>View in {item.taskName}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

// 7. Draft Comments Widget
export function DraftCommentsWidget({ onRemove }: { onRemove: () => void }) {
  const drafts = [
    { id: 'dc1', taskName: 'Task 1', text: 'I checked the UI on mobile, and the sidebar...', date: 'Edited 2h ago' },
    { id: 'dc2', taskName: 'Task 2', text: 'Ready for production deployment once credentials are saved.', date: 'Edited yesterday' },
  ];

  return (
    <WidgetContainer
      title="Draft comments"
      subtitle="Unsent comment drafts on tasks"
      onRemove={onRemove}
    >
      <div className="space-y-2.5">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="p-3 bg-[#1e1f21] border border-[#333538] rounded-xl flex items-center justify-between gap-3"
          >
            <div className="truncate">
              <div className="text-[12.5px] font-semibold text-white truncate">{d.taskName}</div>
              <div className="text-[12px] text-[#9c9a99] truncate italic">&quot;{d.text}&quot;</div>
              <div className="text-[10.5px] text-[#6b6967] mt-0.5">{d.date}</div>
            </div>
            <button
              onClick={() => alert(`Resuming draft comment for ${d.taskName}`)}
              className="bg-[#2a2b2e] hover:bg-[#343639] border border-[#3e4044] text-white text-[11.5px] font-medium px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              Resume
            </button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

// 8. Forms Widget
export function FormsWidget({ onRemove }: { onRemove: () => void }) {
  const forms = [
    { id: 'f1', title: 'Work Request Intake Form', submissions: 12, url: '#' },
    { id: 'f2', title: 'Bug & Issue Reporting Form', submissions: 5, url: '#' },
    { id: 'f3', title: 'Feature Suggestion Form', submissions: 8, url: '#' },
  ];

  return (
    <WidgetContainer
      title="Forms"
      subtitle="Collect requests and input from colleagues and clients"
      onRemove={onRemove}
    >
      <div className="space-y-2">
        {forms.map((f) => (
          <div
            key={f.id}
            className="p-3 bg-[#1e1f21] hover:bg-[#252629] border border-[#333538] rounded-xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              <FileText className="w-4 h-4 text-[#4573d2] shrink-0" />
              <div className="truncate">
                <span className="text-[13px] font-semibold text-white truncate block">
                  {f.title}
                </span>
                <span className="text-[11px] text-[#8a8886]">
                  {f.submissions} submissions
                </span>
              </div>
            </div>
            <button
              onClick={() => alert(`Opening form: ${f.title}`)}
              className="bg-[#2a2b2e] hover:bg-[#343639] border border-[#3e4044] text-[#c5c3c0] hover:text-white text-[11.5px] px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              View form
            </button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
