'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  ListFilter,
  ArrowUpDown,
  AlignJustify,
  MoreHorizontal,
  Bookmark,
  Archive,
  CheckCircle2,
  Bell,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw,
  Settings,
  Mail,
  User,
  AtSign,
  FolderClosed,
  Check,
  Moon,
  Target,
  SlidersHorizontal,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export interface InboxItem {
  id: string;
  title: string;
  sender: string;
  isAsanaSystem: boolean;
  timeAgo: string;
  dateGroup: 'Today' | 'Earlier';
  body: string;
  isRead: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
  isMentioned: boolean;
  assignedToMe?: boolean;
  assignedByMe?: boolean;
  projectId?: string;
  projectName?: string;
}

const INITIAL_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'inbox-1',
    title: 'Teamwork makes work happen!',
    sender: 'Asana',
    isAsanaSystem: true,
    timeAgo: '1 hour ago',
    dateGroup: 'Today',
    body: 'Inbox is where you get updates, notifications, and messages from your teammates. Send an invite to start collaborating.',
    isRead: false,
    isBookmarked: true,
    isArchived: false,
    isMentioned: false,
    assignedToMe: true,
    projectName: "Dzakwan's first project",
  },
  {
    id: 'inbox-2',
    title: 'Sarah mentioned you in Q4 Roadmap Discussion',
    sender: 'Sarah Connor',
    isAsanaSystem: false,
    timeAgo: '15 minutes ago',
    dateGroup: 'Today',
    body: '@Dzakwan Rafi could you please review the task priorities and deliverables for this sprint?',
    isRead: false,
    isBookmarked: true,
    isArchived: false,
    isMentioned: true,
    assignedToMe: true,
    projectName: "Dzakwan's first project",
  },
  {
    id: 'inbox-3',
    title: 'Teamwork makes work happen!',
    sender: 'Asana',
    isAsanaSystem: true,
    timeAgo: '1 hour ago',
    dateGroup: 'Today',
    body: 'Inbox is where you get updates, notifications, and messages from your teammates. Send an invite to start collaborating.',
    isRead: true,
    isBookmarked: false,
    isArchived: true,
    isMentioned: false,
  },
];

function toCompactTime(timeAgo: string): string {
  if (timeAgo.includes('1 minute') || timeAgo === '1m') return '1m';
  if (timeAgo.includes('15 minute') || timeAgo === '15m') return '15m';
  if (timeAgo.includes('1 hour') || timeAgo === '1h') return '1h';
  if (timeAgo.includes('2 hour') || timeAgo === '2h') return '2h';
  if (timeAgo.includes('day')) return '1d';
  return timeAgo.replace(' ago', '').replace('minutes', 'm').replace('minute', 'm').replace('hours', 'h').replace('hour', 'h').replace(' ', '');
}

type InboxTab = 'Activity' | 'Bookmarks' | 'Archive' | '@Mentioned';

// Reusable toggle switch matching Image 5
function BlueToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
        checked ? 'bg-[#2563eb] justify-end' : 'bg-[#3e4044] justify-start'
      }`}
    >
      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
        {checked && <Check className="w-2.5 h-2.5 text-[#2563eb] stroke-[3]" />}
      </div>
    </button>
  );
}

// Reusable checkbox matching Images 1, 3, 4
function AsanaCheckbox({
  checked,
  onChange,
  label,
  isParent,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  isParent?: boolean;
}) {
  return (
    <div
      onClick={onChange}
      className="flex items-start gap-2.5 cursor-pointer group select-none py-0.5"
    >
      <div
        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
          checked
            ? 'bg-[#2563eb] border border-[#2563eb]'
            : 'border border-[#55575a] bg-transparent group-hover:border-[#7e8187]'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </div>
      <span
        className={`text-[13px] ${
          isParent ? 'font-semibold text-white' : 'text-[#cfcecd] group-hover:text-white'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// Project Notification Clipboard Icon matching uploaded image
function ProjectNotificationIcon({ className = 'w-5 h-5 text-[#60a5fa]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="4" width="14" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="9.5" r="1" fill="currentColor" />
      <line x1="11.5" y1="9.5" x2="15.5" y2="9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="14" r="1" fill="currentColor" />
      <line x1="11.5" y1="14" x2="15.5" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function InboxView() {
  const { projects, portfolios, currentUser, openInviteModal, openSettingsModal } = useApp();

  const [activeTab, setActiveTab] = useState<InboxTab>('Activity');
  const [items, setItems] = useState<InboxItem[]>(INITIAL_INBOX_ITEMS);
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);
  const [timeframe, setTimeframe] = useState<'Past week' | 'Past month' | 'Today'>('Past week');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isManageNotifOpen, setIsManageNotifOpen] = useState(false);

  // Sub-dialogs for individual overrides
  const [isManageIndividualProjectsOpen, setIsManageIndividualProjectsOpen] = useState(false);
  const [isManageIndividualPortfoliosOpen, setIsManageIndividualPortfoliosOpen] = useState(false);
  const [isManageIndividualGoalsOpen, setIsManageIndividualGoalsOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toolbar Dropdown states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddFilterMenuOpen, setIsAddFilterMenuOpen] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [selectedCustomFilter, setSelectedCustomFilter] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<'Newest' | 'Relevance'>('Newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [density, setDensity] = useState<'Detailed' | 'Compact'>('Detailed');
  const [isDensityOpen, setIsDensityOpen] = useState(false);

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isExpandedContext, setIsExpandedContext] = useState(true);

  // Save view state for @Mentioned tab (Images 1, 2, 3)
  const [isSaveViewMenuOpen, setIsSaveViewMenuOpen] = useState(false);
  const saveViewRef = useRef<HTMLDivElement>(null);

  // Extra tabs
  const [extraTabs, setExtraTabs] = useState<string[]>([]);
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // ================= MANAGE NOTIFICATIONS STATE =================
  const [openAccordions, setOpenAccordions] = useState({
    email: true,
    dnd: true,
    project: true,
    portfolio: true,
    goal: true,
  });

  const toggleAccordion = (section: 'email' | 'dnd' | 'project' | 'portfolio' | 'goal') => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Email Notifications Settings
  const [emailSettings, setEmailSettings] = useState({
    workUpdatesParent: true,
    sharedWithYou: true,
    assignedToYou: true,
    dueDateChanges: true,
    workCompleted: true,
    blockedUnblocked: true,
    likesReactions: true,
    accessRequests: true,

    communicationParent: true,
    mentions: true,
    commentsAttachments: true,
    appreciationStickers: true,
    statusUpdates: true,
    messages: true,

    collaborateParent: true,
    addedCollaborator: true,
    detailsChange: true,
    collabCompleted: true,
    addedToPortfolio: true,
    tasksAddedProject: true,
    workDeleted: true,

    summariesParent: true,
    dailyAssigned: true,
    weeklyOverdue: true,
    weeklyPortfolio: true,
    smartSummaries: true,

    otherParent: true,
    remindDraftedComments: true,
    remindFollowupComments: true,
    adminAnnouncement: true,
    invitedUserUpdates: true,
  });

  const preferredEmail = currentUser?.email || 'jekiturkish@gmail.com';

  // 2. Do Not Disturb Settings
  const [isPausedDnd, setIsPausedDnd] = useState(false);
  const [dndScheduleEnabled, setDndScheduleEnabled] = useState(false);
  const [dndFromTime, setDndFromTime] = useState('5:00pm');
  const [dndToTime, setDndToTime] = useState('9:00am');
  const [dndDaysOff, setDndDaysOff] = useState<string[]>(['Sun', 'Sat']);

  // 3. Project Notifications Settings (New Card)
  const [projectToggles, setProjectToggles] = useState({
    statusUpdates: true,
    messages: true,
    tasksAdded: true,
    attachments: true,
  });

  const [individualProjectOverrides, setIndividualProjectOverrides] = useState<
    Record<string, { statusUpdates: boolean; messages: boolean; tasksAdded: boolean; attachments: boolean }>
  >({});

  // 4. Portfolio Notifications Settings
  const [portfolioToggles, setPortfolioToggles] = useState({
    statusUpdates: true,
    messages: true,
    workAdded: true,
    attachments: true,
  });

  const [individualPortfolioOverrides, setIndividualPortfolioOverrides] = useState<
    Record<string, { statusUpdates: boolean; messages: boolean; workAdded: boolean; attachments: boolean }>
  >({});

  // 5. Goal Notifications Settings
  const [goalToggles, setGoalToggles] = useState({
    statusUpdates: true,
    comments: true,
  });

  const [individualGoalOverrides, setIndividualGoalOverrides] = useState<
    Record<string, { statusUpdates: boolean; comments: boolean }>
  >({});

  // Load persistent settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kizuna_notification_preferences');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.emailSettings) setEmailSettings(p.emailSettings);
        if (p.isPausedDnd !== undefined) setIsPausedDnd(p.isPausedDnd);
        if (p.dndScheduleEnabled !== undefined) setDndScheduleEnabled(p.dndScheduleEnabled);
        if (p.dndFromTime) setDndFromTime(p.dndFromTime);
        if (p.dndToTime) setDndToTime(p.dndToTime);
        if (p.dndDaysOff) setDndDaysOff(p.dndDaysOff);
        if (p.projectToggles) setProjectToggles(p.projectToggles);
        if (p.portfolioToggles) setPortfolioToggles(p.portfolioToggles);
        if (p.goalToggles) setGoalToggles(p.goalToggles);
        if (p.individualProjectOverrides) setIndividualProjectOverrides(p.individualProjectOverrides);
        if (p.individualPortfolioOverrides) setIndividualPortfolioOverrides(p.individualPortfolioOverrides);
        if (p.individualGoalOverrides) setIndividualGoalOverrides(p.individualGoalOverrides);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save Preferences Handler with Toast Notification
  const handleSavePreferences = () => {
    try {
      const dataToSave = {
        emailSettings,
        isPausedDnd,
        dndScheduleEnabled,
        dndFromTime,
        dndToTime,
        dndDaysOff,
        projectToggles,
        portfolioToggles,
        goalToggles,
        individualProjectOverrides,
        individualPortfolioOverrides,
        individualGoalOverrides,
      };
      localStorage.setItem('kizuna_notification_preferences', JSON.stringify(dataToSave));
      setIsManageNotifOpen(false);
      setToastMessage('Notification preferences saved successfully!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      setIsManageNotifOpen(false);
    }
  };

  const toggleEmailGroup = (
    parentKey: 'workUpdatesParent' | 'communicationParent' | 'collaborateParent' | 'summariesParent' | 'otherParent',
    childrenKeys: (keyof typeof emailSettings)[]
  ) => {
    const nextVal = !emailSettings[parentKey];
    setEmailSettings((prev) => {
      const updated = { ...prev, [parentKey]: nextVal };
      childrenKeys.forEach((key) => {
        (updated as any)[key] = nextVal;
      });
      return updated;
    });
  };

  const toggleEmailChild = (childKey: keyof typeof emailSettings) => {
    setEmailSettings((prev) => ({ ...prev, [childKey]: !prev[childKey] }));
  };

  const toggleDayOff = (day: string) => {
    setDndDaysOff((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getProjectOverride = (projectId: string) => {
    return (
      individualProjectOverrides[projectId] || {
        statusUpdates: projectToggles.statusUpdates,
        messages: projectToggles.messages,
        tasksAdded: projectToggles.tasksAdded,
        attachments: projectToggles.attachments,
      }
    );
  };

  const updateProjectOverride = (
    projectId: string,
    key: 'statusUpdates' | 'messages' | 'tasksAdded' | 'attachments'
  ) => {
    const current = getProjectOverride(projectId);
    setIndividualProjectOverrides((prev) => ({
      ...prev,
      [projectId]: {
        ...current,
        [key]: !current[key],
      },
    }));
  };

  const getPortfolioOverride = (portfolioId: string) => {
    return (
      individualPortfolioOverrides[portfolioId] || {
        statusUpdates: portfolioToggles.statusUpdates,
        messages: portfolioToggles.messages,
        workAdded: portfolioToggles.workAdded,
        attachments: portfolioToggles.attachments,
      }
    );
  };

  const updatePortfolioOverride = (
    portfolioId: string,
    key: 'statusUpdates' | 'messages' | 'workAdded' | 'attachments'
  ) => {
    const current = getPortfolioOverride(portfolioId);
    setIndividualPortfolioOverrides((prev) => ({
      ...prev,
      [portfolioId]: {
        ...current,
        [key]: !current[key],
      },
    }));
  };

  // Refs for clicking outside toolbar menus
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const densityRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const handleSelectNotification = (item: InboxItem) => {
    setSelectedItemId(item.id);
    if (!item.isRead) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i))
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setIsFilterOpen(false);
        setIsAddFilterMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(target)) {
        setIsSortOpen(false);
      }
      if (densityRef.current && !densityRef.current.contains(target)) {
        setIsDensityOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
      if (saveViewRef.current && !saveViewRef.current.contains(target)) {
        setIsSaveViewMenuOpen(false);
      }
      if (cardMenuRef.current && !cardMenuRef.current.contains(target)) {
        setCardMenuOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on activeTab and active filters
  const visibleItems = useMemo(() => {
    let result = [...items];

    if (activeTab === 'Bookmarks') {
      result = result.filter((item) => item.isBookmarked && !item.isArchived);
    } else if (activeTab === 'Archive') {
      result = result.filter((item) => item.isArchived);
    } else if (activeTab === '@Mentioned') {
      result = result.filter((item) => item.isMentioned && !item.isArchived);
    } else {
      // Activity tab
      result = result.filter((item) => !item.isArchived);

      // Apply quick filters if any
      if (activeQuickFilters.includes('Mentioned') || selectedCustomFilter === 'Mentioned me') {
        result = result.filter((item) => item.isMentioned);
      }
      if (activeQuickFilters.includes('Unread only') || selectedCustomFilter === 'Read status') {
        result = result.filter((item) => !item.isRead);
      }
      if (activeQuickFilters.includes('Assigned to me') || selectedCustomFilter === 'Assigned to me') {
        result = result.filter((item) => item.assignedToMe);
      }
      if (activeQuickFilters.includes('Assigned by me') || selectedCustomFilter === 'Assigned by me') {
        result = result.filter((item) => item.assignedByMe);
      }
      if (activeQuickFilters.includes('For me') || selectedCustomFilter === 'For me') {
        result = result.filter((item) => item.assignedToMe || item.isMentioned);
      }
    }

    if (sortOrder === 'Relevance') {
      result.sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
    }

    return result;
  }, [items, activeTab, activeQuickFilters, selectedCustomFilter, sortOrder]);

  // Actions
  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item))
    );
  };

  const archiveItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isArchived: true } : item))
    );
  };

  const unarchiveItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isArchived: false } : item))
    );
  };

  const archiveAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isArchived: true })));
    setIsMoreMenuOpen(false);
  };

  const toggleQuickFilter = (filterKey: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterKey) ? prev.filter((k) => k !== filterKey) : [...prev, filterKey]
    );
  };

  const clearAllFilters = () => {
    setActiveQuickFilters([]);
    setSelectedCustomFilter(null);
  };

  const handleAddCustomTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTabName.trim() && !extraTabs.includes(newTabName.trim())) {
      setExtraTabs([...extraTabs, newTabName.trim()]);
      setNewTabName('');
      setIsAddTabOpen(false);
    }
  };

  // Reusable notification card renderer that fully respects density across all tabs
  const renderNotificationCard = (item: InboxItem) => {
    const isCompact = density === 'Compact';
    const isSelected = selectedItemId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => handleSelectNotification(item)}
        className={`group relative rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-[#3b82f6] bg-[#252628] shadow-sm'
            : !item.isRead
            ? 'border-transparent hover:border-[#2f3033] hover:bg-[#252628]/70 bg-[#222325]/40'
            : 'border-transparent hover:border-[#2f3033] hover:bg-[#252628]/70 bg-transparent opacity-85'
        } ${isCompact ? 'px-3.5 py-2.5' : 'p-3.5'}`}
      >
        <div className="flex items-start gap-3">
          {/* Left Icon */}
          <div className="mt-0.5 text-[#9c9a99] shrink-0">
            {item.isMentioned ? (
              <AtSign className="w-4 h-4 text-[#38bdf8]" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-16">
            <div className={`flex items-center gap-2 flex-wrap ${isCompact ? 'mb-0.5' : 'mb-1'}`}>
              <span className={`font-semibold text-white ${isCompact ? 'text-[13px]' : 'text-[14px]'}`}>
                {item.title}
              </span>
              {item.projectName && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-[#2a2b2e] text-[#a2a09e] border border-[#37383b]">
                  {item.projectName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-[#9c9a99]">
              {item.isAsanaSystem && (
                <svg className="w-3.5 h-3.5 inline-block mr-0.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="7" r="3.5" fill="#f06a6a" />
                  <circle cx="6.5" cy="16.5" r="3.5" fill="#f06a6a" />
                  <circle cx="17.5" cy="16.5" r="3.5" fill="#f06a6a" />
                </svg>
              )}
              <span className="font-medium text-[#bdbbb9]">{item.sender}</span>
              <span>•</span>
              <span>{item.timeAgo}</span>
            </div>

            {/* Body Preview: Only rendered when density is Detailed */}
            {!isCompact && isExpandedContext && (
              <p className="text-[13px] text-[#a2a09e] leading-relaxed mt-1.5">
                {item.body}
              </p>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 absolute right-4 top-3">
            <div
              className={`${
                cardMenuOpenId === item.id ? 'flex' : 'hidden group-hover:flex'
              } items-center gap-1 bg-[#252628] px-1 py-0.5 rounded-lg border border-[#3b3c3e] shadow-sm`}
            >
              {/* More Actions (...) Dropdown Menu with Mark as unread */}
              <div className="relative" ref={cardMenuOpenId === item.id ? cardMenuRef : undefined}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCardMenuOpenId(cardMenuOpenId === item.id ? null : item.id);
                  }}
                  className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  title="More actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {cardMenuOpenId === item.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 w-44 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1 z-50 text-[13px]"
                  >
                    <button
                      onClick={() => {
                        toggleRead(item.id);
                        setCardMenuOpenId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2c2d30] text-white transition-colors cursor-pointer"
                    >
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3b82f6] flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                      </div>
                      <span>{item.isRead ? 'Mark as unread' : 'Mark as read'}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => toggleBookmark(item.id, e)}
                className={`p-1 rounded hover:bg-[#323336] transition-colors cursor-pointer ${
                  item.isBookmarked ? 'text-[#f59e0b]' : 'text-[#8a8886] hover:text-white'
                }`}
                title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark notification'}
              >
                <Bookmark className="w-3.5 h-3.5" fill={item.isBookmarked ? 'currentColor' : 'none'} />
              </button>
              {item.isArchived ? (
                <button
                  onClick={(e) => unarchiveItem(item.id, e)}
                  className="px-2 py-0.5 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white text-[11px] transition-colors cursor-pointer"
                  title="Unarchive"
                >
                  Unarchive
                </button>
              ) : (
                <button
                  onClick={(e) => archiveItem(item.id, e)}
                  className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  title="Archive notification"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!item.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-xs group-hover:opacity-40 transition-opacity" />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Compact single-row renderer matching Images 1, 2, 4
  const renderCompactRow = (item: InboxItem) => {
    const isMenuOpen = cardMenuOpenId === item.id;
    const isSelected = selectedItemId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => handleSelectNotification(item)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-[#3b82f6] bg-[#252628] shadow-sm'
            : !item.isRead
            ? 'border-transparent hover:border-[#2f3033] hover:bg-[#252628]/70 bg-[#222325]/40'
            : 'border-transparent hover:border-[#2f3033] hover:bg-[#252628]/70 bg-transparent opacity-85'
        }`}
      >
        {/* Left Column: Sender Avatar/Logo + "[Sender] sent a message" */}
        <div className="flex items-center gap-2.5 w-[250px] shrink-0 text-[13px] text-[#cfcecd]">
          {item.isAsanaSystem ? (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="3.5" fill="#f06a6a" />
              <circle cx="6.5" cy="16.5" r="3.5" fill="#f06a6a" />
              <circle cx="17.5" cy="16.5" r="3.5" fill="#f06a6a" />
            </svg>
          ) : (
            <div className="w-4 h-4 rounded-full bg-[#3b82f6] text-[10px] font-bold text-white flex items-center justify-center shrink-0">
              {item.sender.charAt(0)}
            </div>
          )}
          <span className="truncate">{item.sender} sent a message</span>
        </div>

        {/* Center Column: Outline Speech Bubble + Title + Snippet on same line */}
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-16 text-[13px]">
          <MessageSquare className="w-4 h-4 text-[#8a8886] shrink-0" />
          <span className="font-semibold text-white shrink-0">{item.title}</span>
          <span className="text-[#a2a09e] truncate">{item.body}</span>
        </div>

        {/* Right Column: Time Ago */}
        <div className="text-[12px] text-[#8a8886] shrink-0 font-normal pr-2">
          {toCompactTime(item.timeAgo)}
        </div>

        {/* Floating Action Buttons on Hover */}
        <div className="flex items-center gap-1.5 absolute right-4">
          <div
            className={`${
              isMenuOpen ? 'flex' : 'hidden group-hover:flex'
            } items-center gap-1 bg-[#252628] px-1 py-0.5 rounded-lg border border-[#3b3c3e] shadow-sm`}
          >
            {/* More Actions (...) Dropdown Menu */}
            <div className="relative" ref={isMenuOpen ? cardMenuRef : undefined}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCardMenuOpenId(isMenuOpen ? null : item.id);
                }}
                className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                title="More actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-44 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1 z-50 text-[13px]"
                >
                  <button
                    onClick={() => {
                      toggleRead(item.id);
                      setCardMenuOpenId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2c2d30] text-white transition-colors cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3b82f6] flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    </div>
                    <span>{item.isRead ? 'Mark as unread' : 'Mark as read'}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={(e) => toggleBookmark(item.id, e)}
              className={`p-1 rounded hover:bg-[#323336] transition-colors cursor-pointer ${
                item.isBookmarked ? 'text-[#f59e0b]' : 'text-[#8a8886] hover:text-white'
              }`}
              title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark notification'}
            >
              <Bookmark className="w-3.5 h-3.5" fill={item.isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {item.isArchived ? (
              <button
                onClick={(e) => unarchiveItem(item.id, e)}
                className="px-2 py-0.5 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white text-[11px] transition-colors cursor-pointer"
                title="Unarchive"
              >
                Unarchive
              </button>
            ) : (
              <button
                onClick={(e) => archiveItem(item.id, e)}
                className="p-1 rounded hover:bg-[#323336] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                title="Archive notification"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!item.isRead && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-xs group-hover:opacity-40 transition-opacity" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none text-[#f5f4f3] overflow-hidden">
      {/* 1. Header Bar */}
      <div className="px-8 pt-5 pb-0 border-b border-[#2b2c2e]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Inbox</h1>

          <button
            onClick={() => openSettingsModal('notifications')}
            className="px-3 py-1.5 rounded-lg border border-[#3b3c3e] text-[#cfcecd] text-[12px] font-medium hover:bg-[#28292c] hover:text-white transition-colors cursor-pointer"
          >
            Manage notifications
          </button>
        </div>

        {/* Tab List */}
        <div className="flex items-center gap-1.5 text-[13px] font-medium pb-2 relative">
          {(['Activity', 'Bookmarks', 'Archive', '@Mentioned'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  clearAllFilters();
                }}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0c326f] text-white font-medium shadow-xs'
                    : 'text-[#a2a09e] hover:text-white hover:bg-[#252628]'
                }`}
              >
                {tab}
              </button>
            );
          })}

          {extraTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className="px-3 py-1 rounded-lg text-[#a2a09e] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
            >
              {tab}
            </button>
          ))}

          {/* Plus button to add tab */}
          <div className="relative">
            <button
              onClick={() => setIsAddTabOpen(!isAddTabOpen)}
              className="p-1 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
              title="Add view or filter"
            >
              <Plus className="w-4 h-4" />
            </button>

            {isAddTabOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl p-3 z-50">
                <form onSubmit={handleAddCustomTab} className="flex flex-col gap-2">
                  <span className="text-[12px] font-semibold text-[#a2a09e]">Add custom tab</span>
                  <input
                    type="text"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    placeholder="e.g. Assigned to me"
                    className="w-full px-2.5 py-1.5 bg-[#1e1f21] border border-[#3b3c3e] rounded text-[12px] text-white focus:outline-hidden focus:border-[#4573d2]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddTabOpen(false)}
                      className="px-2 py-1 text-[11px] text-[#a2a09e] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#4573d2] hover:bg-[#3862b8] text-white text-[11px] font-medium rounded"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Subheader Toolbar */}
      <div className="px-8 py-2.5 flex items-center justify-between border-b border-[#252628] text-[12px] text-[#a2a09e]">
        <div className="flex items-center gap-2 relative">
          {/* Filter & Sort only shown on Activity and @Mentioned */}
          {activeTab !== 'Bookmarks' && activeTab !== 'Archive' && (
            <>
              {/* ================= FILTER ================= */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    setIsSortOpen(false);
                    setIsDensityOpen(false);
                    setIsMoreMenuOpen(false);
                    setIsSaveViewMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeQuickFilters.length > 0 || selectedCustomFilter
                      ? 'bg-[#2a2b2e] text-white font-medium'
                      : 'text-[#cfcecd] hover:bg-[#28292c] hover:text-white'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>
                    {activeQuickFilters.length > 0 || selectedCustomFilter
                      ? `Filter (${activeQuickFilters.length + (selectedCustomFilter ? 1 : 0)})`
                      : 'Filter'}
                  </span>
                </button>

                {isFilterOpen && (
                  <div className="absolute left-0 mt-1.5 w-[460px] bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl p-4 z-50 text-[13px]">
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="font-semibold text-white text-[14px]">Filters</span>
                      <button
                        onClick={clearAllFilters}
                        className="text-[12px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="text-[11px] font-medium text-[#8a8886] mb-2.5">
                        Quick filters
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleQuickFilter('Mentioned')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                            activeQuickFilters.includes('Mentioned')
                              ? 'bg-[#0c326f] text-white border-[#3b82f6] font-medium'
                              : 'border-[#3e4044] bg-[#222325] text-[#cfcecd] hover:border-[#5a5c60] hover:text-white hover:bg-[#2c2d30]'
                          }`}
                        >
                          <AtSign className="w-3.5 h-3.5" />
                          <span>Mentioned</span>
                        </button>

                        <button
                          onClick={() => toggleQuickFilter('Assigned to me')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                            activeQuickFilters.includes('Assigned to me')
                              ? 'bg-[#0c326f] text-white border-[#3b82f6] font-medium'
                              : 'border-[#3e4044] bg-[#222325] text-[#cfcecd] hover:border-[#5a5c60] hover:text-white hover:bg-[#2c2d30]'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Assigned to me</span>
                        </button>

                        <button
                          onClick={() => toggleQuickFilter('Assigned by me')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                            activeQuickFilters.includes('Assigned by me')
                              ? 'bg-[#0c326f] text-white border-[#3b82f6] font-medium'
                              : 'border-[#3e4044] bg-[#222325] text-[#cfcecd] hover:border-[#5a5c60] hover:text-white hover:bg-[#2c2d30]'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Assigned by me</span>
                        </button>

                        <button
                          onClick={() => toggleQuickFilter('Unread only')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                            activeQuickFilters.includes('Unread only')
                              ? 'bg-[#0c326f] text-white border-[#3b82f6] font-medium'
                              : 'border-[#3e4044] bg-[#222325] text-[#cfcecd] hover:border-[#5a5c60] hover:text-white hover:bg-[#2c2d30]'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Unread only</span>
                        </button>

                        <button
                          onClick={() => toggleQuickFilter('For me')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                            activeQuickFilters.includes('For me')
                              ? 'bg-[#0c326f] text-white border-[#3b82f6] font-medium'
                              : 'border-[#3e4044] bg-[#222325] text-[#cfcecd] hover:border-[#5a5c60] hover:text-white hover:bg-[#2c2d30]'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>For me</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative pt-1 border-t border-[#2e2f33]">
                      <button
                        onClick={() => setIsAddFilterMenuOpen(!isAddFilterMenuOpen)}
                        className="flex items-center gap-1 text-[12px] text-[#cfcecd] hover:text-white cursor-pointer py-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add filter</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {isAddFilterMenuOpen && (
                        <div className="mt-2 w-64 bg-[#1e1f21] border border-[#3b3c3e] rounded-xl shadow-2xl py-1.5 z-60 text-[13px]">
                          {[
                            { label: 'From person', icon: User },
                            { label: 'In project', icon: FolderClosed },
                            { label: 'Messages & status updates', icon: MessageSquare },
                            { label: 'Mentioned me', icon: AtSign },
                            { label: 'Assigned to me', icon: User },
                            { label: 'Assigned by me', icon: User },
                            { label: 'Read status', icon: Mail },
                            { label: 'For me', icon: User },
                          ].map((item, idx) => {
                            const IconComp = item.icon;
                            const isSelected = selectedCustomFilter === item.label;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCustomFilter(isSelected ? null : item.label);
                                  setIsAddFilterMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#2c2d30] transition-colors cursor-pointer ${
                                  isSelected ? 'bg-[#2c2d30] text-white font-medium' : 'text-[#bdbbb9] hover:text-white'
                                }`}
                              >
                                <IconComp className="w-4 h-4 text-[#9c9a99]" />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= SORT ================= */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsFilterOpen(false);
                    setIsDensityOpen(false);
                    setIsMoreMenuOpen(false);
                    setIsSaveViewMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#cfcecd] hover:bg-[#28292c] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort: {sortOrder}</span>
                </button>

                {isSortOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1.5 z-50 text-[13px]">
                    <button
                      onClick={() => {
                        setSortOrder('Newest');
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#2c2d30] transition-colors cursor-pointer ${
                        sortOrder === 'Newest' ? 'bg-[#28292b]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 flex items-center justify-center">
                          {sortOrder === 'Newest' && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="font-medium text-white text-[13px]">Newest</span>
                      </div>
                      <div className="text-[#8a8886] text-[11px] ml-6 mt-0.5">
                        See most recent notifications first
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSortOrder('Relevance');
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#2c2d30] transition-colors cursor-pointer ${
                        sortOrder === 'Relevance' ? 'bg-[#28292b]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 flex items-center justify-center">
                          {sortOrder === 'Relevance' && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="font-medium text-white text-[13px]">Relevance</span>
                      </div>
                      <div className="text-[#8a8886] text-[11px] ml-6 mt-0.5">
                        See timely, actionable notifications first
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= DENSITY (IMAGES 2 & 3 & ALL TABS) ================= */}
          <div className="relative" ref={densityRef}>
            <button
              onClick={() => {
                setIsDensityOpen(!isDensityOpen);
                setIsFilterOpen(false);
                setIsSortOpen(false);
                setIsMoreMenuOpen(false);
                setIsSaveViewMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#cfcecd] hover:bg-[#28292c] hover:text-white transition-colors cursor-pointer"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Density: {density}</span>
            </button>

            {isDensityOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1.5 z-50 text-[13px]">
                <button
                  onClick={() => {
                    setDensity('Detailed');
                    setIsDensityOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2c2d30] transition-colors cursor-pointer ${
                    density === 'Detailed' ? 'bg-[#28292b]' : ''
                  }`}
                >
                  <div className="w-4 flex items-center justify-center">
                    {density === 'Detailed' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-white font-medium text-[13px]">Detailed</span>
                </button>

                <button
                  onClick={() => {
                    setDensity('Compact');
                    setIsDensityOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2c2d30] transition-colors cursor-pointer ${
                    density === 'Compact' ? 'bg-[#28292b]' : ''
                  }`}
                >
                  <div className="w-4 flex items-center justify-center">
                    {density === 'Compact' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-white font-medium text-[13px]">Compact</span>
                </button>
              </div>
            )}
          </div>

          {/* ================= SAVE VIEW ▾ (IMAGES 1, 2, 3 FOR @MENTIONED) ================= */}
          {activeTab === '@Mentioned' && (
            <div className="relative" ref={saveViewRef}>
              <div className="flex items-center rounded-lg border border-[#3b3c3e] bg-[#222325] text-white text-[12px] font-medium overflow-hidden shadow-xs">
                <button
                  onClick={() => {
                    setToastMessage('View saved for @Mentioned');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-2.5 py-1 hover:bg-[#2c2d30] transition-colors cursor-pointer"
                >
                  Save view
                </button>
                <button
                  onClick={() => setIsSaveViewMenuOpen(!isSaveViewMenuOpen)}
                  className="px-1.5 py-1 border-l border-[#3b3c3e] hover:bg-[#2c2d30] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {isSaveViewMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1.5 z-50 text-[12px]">
                  <button
                    onClick={() => {
                      setIsSaveViewMenuOpen(false);
                      setToastMessage('View saved for everyone');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full text-left px-3 py-1.5 text-white hover:bg-[#2c2d30] transition-colors cursor-pointer"
                  >
                    Save for everyone
                  </button>
                  <button
                    onClick={() => {
                      setIsSaveViewMenuOpen(false);
                      setToastMessage('Saved as new view tab');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full text-left px-3 py-1.5 text-white hover:bg-[#2c2d30] transition-colors cursor-pointer"
                  >
                    Save as new view
                  </button>
                  <div className="border-t border-[#37383b] my-1" />
                  <button
                    onClick={() => {
                      setIsSaveViewMenuOpen(false);
                      setSortOrder('Newest');
                      setDensity('Detailed');
                      setToastMessage('Reset to original view');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[#f06a6a] hover:bg-[#2c2d30] transition-colors cursor-pointer"
                  >
                    Reset to original
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Three dots (...) Menu */}
        {/* Three dots (...) Menu and Collapse button */}
        <div className="flex items-center gap-1">
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => {
                setIsMoreMenuOpen(!isMoreMenuOpen);
                setIsFilterOpen(false);
                setIsSortOpen(false);
                setIsDensityOpen(false);
                setIsSaveViewMenuOpen(false);
              }}
              className="p-1.5 rounded-md hover:bg-[#28292c] hover:text-white transition-colors cursor-pointer text-[#8a8886]"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-[#222325] border border-[#3b3c3e] rounded-xl shadow-2xl py-1.5 z-50 text-[13px]">
                <button
                  onClick={() => {
                    setIsSummaryModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#2c2d30] transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-white text-[13px]">Inbox AI summary</div>
                  <div className="text-[#8a8886] text-[11px] mt-0.5">Summarize with Asana AI</div>
                </button>

                <div className="border-t border-[#37383b] my-1" />

                <button
                  onClick={() => setIsExpandedContext(!isExpandedContext)}
                  className="w-full text-left px-3 py-2 hover:bg-[#2c2d30] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 flex items-center justify-center">
                      {isExpandedContext && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="font-medium text-white text-[13px]">Expand notifications</span>
                  </div>
                  <div className="text-[#8a8886] text-[11px] ml-6 mt-0.5">Show more context</div>
                </button>

                <div className="border-t border-[#37383b] my-1" />

                <button
                  onClick={() => {
                    archiveAll();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-white hover:bg-[#2c2d30] transition-colors cursor-pointer"
                >
                  <span className="text-[13px]">Archive all</span>
                </button>
              </div>
            )}
          </div>

          {selectedItem && (
            <button
              onClick={() => setSelectedItemId(null)}
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer ml-1"
              title="Collapse details"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
                <path d="M21 4v16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Split / Full Content Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Column: Notification list */}
        <div
          className={`overflow-y-auto ${
            selectedItem
              ? 'w-1/2 border-r border-[#2b2c2e] px-6 py-5'
              : 'flex-1 px-8 py-5'
          }`}
        >
        {/* ==================== TAB: ACTIVITY ==================== */}
        {activeTab === 'Activity' && (
          <div className="max-w-4xl">
            {/* Live Do Not Disturb Banner */}
            {isPausedDnd && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-[#282535] border border-[#8b5cf6]/40 text-[13px] flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5 text-[#d8b4fe]">
                  <Moon className="w-4 h-4 text-[#a78bfa] shrink-0" />
                  <span>
                    <strong>Do Not Disturb is on.</strong> Notifications are currently paused.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsPausedDnd(false);
                    try {
                      const saved = localStorage.getItem('kizuna_notification_preferences');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        parsed.isPausedDnd = false;
                        localStorage.setItem('kizuna_notification_preferences', JSON.stringify(parsed));
                      }
                    } catch (e) {}
                  }}
                  className="px-3 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Resume notifications
                </button>
              </div>
            )}

            {/* AI Inbox Summary Card */}
            {!isSummaryDismissed && (
              <div className="mb-6 p-4 rounded-xl border border-[#2f3033] bg-[#222325] text-[13px] relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4 text-[#e0dedb]" />
                    <span>Inbox Summary</span>
                  </div>
                  <button
                    onClick={() => setIsSummaryDismissed(true)}
                    className="text-[#8a8886] hover:text-white p-1 rounded-md hover:bg-[#2a2b2e] transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[#a2a09e] mb-4">
                  Summarize your most important and actionable notifications with Asana AI.
                </p>

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <button
                      onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                      className="text-[12px] text-[#a2a09e] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Timeframe: {timeframe}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isTimeframeOpen && (
                      <div className="absolute left-0 mt-1 w-36 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-50 text-[12px]">
                        {(['Past week', 'Past month', 'Today'] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => {
                              setTimeframe(tf);
                              setIsTimeframeOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#2e3034] text-[#bdbbb9] hover:text-white"
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsSummaryModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2a2b2e] hover:bg-[#34353a] border border-[#3e4044] text-white text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    View summary
                  </button>
                </div>
              </div>
            )}

            {visibleItems.length > 0 ? (
              <div>
                <div className="text-[13px] font-semibold text-[#8a8886] mb-3">Today</div>
                <div className="flex flex-col gap-1.5">
                  {visibleItems.map(density === 'Compact' ? renderCompactRow : renderNotificationCard)}
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={archiveAll}
                    className="text-[13px] text-[#4573d2] hover:text-[#5c88e0] hover:underline cursor-pointer"
                  >
                    Archive all notifications
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#252628] flex items-center justify-center text-[#4573d2] mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-white text-[16px] font-semibold mb-1">All caught up!</h3>
                <p className="text-[#a2a09e] text-[13px] mb-4 max-w-sm">
                  {activeQuickFilters.length > 0 || selectedCustomFilter
                    ? 'No notifications match your active filters.'
                    : 'You have no active notifications right now. Work updates and teammate mentions will appear here.'}
                </p>
                {activeQuickFilters.length > 0 || selectedCustomFilter ? (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={() => setItems(INITIAL_INBOX_ITEMS)}
                    className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore sample notification</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: BOOKMARKS ==================== */}
        {activeTab === 'Bookmarks' && (
          <div>
            {visibleItems.length > 0 ? (
              <div className="max-w-4xl flex flex-col gap-2">
                <div className="text-[13px] font-semibold text-[#8a8886] mb-1">Today</div>
                <div className="flex flex-col gap-1">
                  {visibleItems.map(density === 'Compact' ? renderCompactRow : renderNotificationCard)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <div className="mb-5 flex justify-center">
                  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
                    <circle cx="68" cy="30" r="9" fill="#f06a6a" />
                    <path
                      d="M68 30 C56 34, 42 48, 40 64 C38 76, 40 82, 36 86 C45 95, 78 95, 88 84 C85 80, 84 74, 82 62 C80 46, 76 33, 68 30 Z"
                      fill="#fdfbf7"
                      stroke="#1e1f21"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M38 85 C52 95, 74 95, 87 84"
                      fill="#fceee9"
                      stroke="#1e1f21"
                      strokeWidth="2"
                    />
                    <circle cx="40" cy="85" r="9" fill="#ffffff" stroke="#1e1f21" strokeWidth="2.5" />
                    <circle cx="40" cy="85" r="5" fill="#fceee9" />
                    <line x1="28" y1="52" x2="35" y2="56" stroke="#9c9a99" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="26" y1="64" x2="33" y2="64" stroke="#9c9a99" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="94" y1="88" x2="102" y2="88" stroke="#9c9a99" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="92" y1="96" x2="98" y2="101" stroke="#9c9a99" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>

                <h3 className="text-white text-[16px] font-semibold mb-1">
                  Bookmark important notifications
                </h3>
                <p className="text-[#a2a09e] text-[13px] mb-6">
                  Bookmark a notification to see it here.
                </p>

                <button
                  onClick={() => {
                    if (items.length > 0) {
                      toggleBookmark(items[0].id);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Try it
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: ARCHIVE ==================== */}
        {activeTab === 'Archive' && (
          <div>
            {visibleItems.length > 0 ? (
              <div className="max-w-4xl flex flex-col gap-2">
                <div className="text-[13px] font-semibold text-[#8a8886] mb-1 flex items-center justify-between">
                  <span>Today</span>
                  <button
                    onClick={() => setItems((prev) => prev.map((item) => ({ ...item, isArchived: false })))}
                    className="text-[12px] text-[#4573d2] hover:underline cursor-pointer"
                  >
                    Unarchive all
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {visibleItems.map(density === 'Compact' ? renderCompactRow : renderNotificationCard)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <div className="mb-5 flex justify-center">
                  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
                    <rect x="36" y="52" width="56" height="48" rx="6" fill="#f06a6a" />
                    <g transform="translate(42, 28)">
                      <rect x="0" y="0" width="36" height="44" rx="4" fill="#ffffff" stroke="#1e1f21" strokeWidth="2" />
                      <circle cx="18" cy="12" r="5" fill="#fdfbf7" stroke="#f06a6a" strokeWidth="1.5" />
                      <path d="M16 12L17.5 13.5L20.5 10.5" stroke="#f06a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="8" y1="22" x2="28" y2="22" stroke="#d5d3ce" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="28" x2="24" y2="28" stroke="#d5d3ce" strokeWidth="2" strokeLinecap="round" />
                    </g>
                    <rect x="28" y="56" width="36" height="44" rx="5" fill="#ffffff" stroke="#1e1f21" strokeWidth="2.5" />
                    <rect x="34" y="72" width="24" height="3" rx="1.5" fill="#1e1f21" />
                    <rect x="64" y="56" width="28" height="44" rx="5" fill="#fcedea" stroke="#1e1f21" strokeWidth="2.5" />
                    <line x1="36" y1="36" x2="31" y2="31" stroke="#9c9a99" strokeWidth="2" strokeLinecap="round" />
                    <line x1="84" y1="36" x2="89" y2="31" stroke="#9c9a99" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <h3 className="text-white text-[16px] font-semibold mb-1">
                  You haven&apos;t archived any notifications yet.
                </h3>
                <p className="text-[#a2a09e] text-[13px] mb-6">
                  Click the archive icon in the top right of a notification to archive it.
                </p>

                <button
                  onClick={() => setActiveTab('Activity')}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Back to Activity
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: @MENTIONED (MATCHING IMAGES 1, 2, 3) ==================== */}
        {activeTab === '@Mentioned' && (
          <div className="max-w-4xl">
            {/* AI Inbox Summary Card also present on @Mentioned as in Images 1, 2, 3 */}
            {!isSummaryDismissed && (
              <div className="mb-6 p-4 rounded-xl border border-[#2f3033] bg-[#222325] text-[13px] relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4 text-[#e0dedb]" />
                    <span>Inbox Summary</span>
                  </div>
                  <button
                    onClick={() => setIsSummaryDismissed(true)}
                    className="text-[#8a8886] hover:text-white p-1 rounded-md hover:bg-[#2a2b2e] transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[#a2a09e] mb-4">
                  Summarize your most important and actionable notifications with Asana AI.
                </p>

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <button
                      onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                      className="text-[12px] text-[#a2a09e] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Timeframe: {timeframe}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isTimeframeOpen && (
                      <div className="absolute left-0 mt-1 w-36 bg-[#252628] border border-[#37383b] rounded-lg shadow-xl py-1 z-50 text-[12px]">
                        {(['Past week', 'Past month', 'Today'] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => {
                              setTimeframe(tf);
                              setIsTimeframeOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#2e3034] text-[#bdbbb9] hover:text-white"
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsSummaryModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2a2b2e] hover:bg-[#34353a] border border-[#3e4044] text-white text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    View summary
                  </button>
                </div>
              </div>
            )}

            {visibleItems.length > 0 ? (
              <div>
                <div className="text-[13px] font-semibold text-[#8a8886] mb-3">Today</div>
                <div className="flex flex-col gap-1.5">
                  {visibleItems.map(density === 'Compact' ? renderCompactRow : renderNotificationCard)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <div className="mb-5 flex justify-center">
                  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
                    <circle cx="52" cy="50" r="26" stroke="#f06a6a" strokeWidth="6.5" fill="none" />
                    <circle cx="52" cy="50" r="22" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                    <line x1="71" y1="69" x2="94" y2="92" stroke="#fceee9" strokeWidth="9" strokeLinecap="round" />
                    <line x1="71" y1="69" x2="94" y2="92" stroke="#1e1f21" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>

                <h3 className="text-white text-[16px] font-semibold mb-1">
                  No activity was found
                </h3>
                <p className="text-[#a2a09e] text-[13px] mb-6">
                  Try removing filters
                </p>

                <button
                  onClick={() => {
                    clearAllFilters();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Right Column: Half-page Message Details Pane (matching Screenshot 2) */}
        {selectedItem && (
          <div className="w-1/2 flex flex-col bg-[#1e1f21] overflow-y-auto min-h-0 border-l border-[#2b2c2e]">
            {/* Centered Message View */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 select-text">
              {selectedItem.isAsanaSystem ? (
                /* Matching Screenshot 2 exactly for Asana welcome message */
                <div className="flex flex-col items-center text-center max-w-md">
                  {/* Bell SVG Illustration matching Screenshot 2 */}
                  <div className="mb-6">
                    <svg className="w-32 h-32" viewBox="0 0 120 120" fill="none">
                      <circle cx="74" cy="24" r="9" fill="#f06a6a" />
                      <path
                        d="M74 24 C60 28, 44 44, 42 62 C40 76, 42 82, 38 86 C48 95, 84 95, 96 82 C93 78, 91 72, 88 58 C86 42, 82 28, 74 24 Z"
                        fill="#ffffff"
                        stroke="#1e1f21"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M39 86 C54 96, 78 96, 95 82"
                        fill="#fcedea"
                        stroke="#1e1f21"
                        strokeWidth="2"
                      />
                      <circle cx="42" cy="85" r="9" fill="#ffffff" stroke="#1e1f21" strokeWidth="2.5" />
                      <circle cx="42" cy="85" r="5" fill="#fcedea" />
                      <line x1="26" y1="50" x2="33" y2="54" stroke="#8a8886" strokeWidth="2" strokeLinecap="round" />
                      <line x1="24" y1="62" x2="31" y2="62" stroke="#8a8886" strokeWidth="2" strokeLinecap="round" />
                      <line x1="102" y1="84" x2="110" y2="84" stroke="#8a8886" strokeWidth="2" strokeLinecap="round" />
                      <line x1="100" y1="92" x2="106" y2="97" stroke="#8a8886" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  <h3 className="text-white text-[16px] font-semibold leading-relaxed mb-6">
                    Inbox is where you get updates, notifications, and messages from your teammates. Send an invite to start collaborating.
                  </h3>

                  <button
                    onClick={() => {
                      setToastMessage('Teammate invite link copied to clipboard!');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Invite teammates
                  </button>
                </div>
              ) : (
                /* Rich Message Detail View for other teammates */
                <div className="w-full max-w-xl flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#2b2c2e] mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#3b82f6] text-[14px] font-bold text-white flex items-center justify-center">
                          {selectedItem.sender.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-[14px]">{selectedItem.sender}</div>
                          <div className="text-[12px] text-[#8a8886]">{selectedItem.timeAgo}</div>
                        </div>
                      </div>
                      {selectedItem.projectName && (
                        <span className="px-2.5 py-1 rounded text-[12px] bg-[#2a2b2e] text-[#cfcecd] border border-[#3b3c3e]">
                          {selectedItem.projectName}
                        </span>
                      )}
                    </div>

                    <h2 className="text-[18px] font-bold text-white mb-3">{selectedItem.title}</h2>
                    <p className="text-[14px] text-[#cfcecd] leading-relaxed mb-6 whitespace-pre-wrap">
                      {selectedItem.body}
                    </p>
                  </div>

                  {/* Comment / Reply Box */}
                  <div className="pt-4 border-t border-[#2b2c2e] mt-auto">
                    <div className="text-[12px] text-[#8a8886] mb-1.5 font-medium">Leave a reply</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Reply to ${selectedItem.sender}...`}
                        className="flex-1 px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-[13px] text-white focus:outline-hidden focus:border-[#2563eb]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setToastMessage('Reply sent to ' + selectedItem.sender);
                            e.currentTarget.value = '';
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input && input.value.trim()) {
                            setToastMessage('Reply sent to ' + selectedItem.sender);
                            input.value = '';
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                        className="px-3 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== EXACT ASANA MANAGE NOTIFICATIONS MODAL ==================== */}
      {isManageNotifOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsManageNotifOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
        >
          <div className="bg-[#1e1f21] border border-[#3b3c3e] rounded-2xl w-[720px] max-w-[95vw] h-[88vh] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden select-none">
            {/* Top Close Header */}
            <div className="px-6 py-4 border-b border-[#2e2f33] flex items-center justify-between shrink-0 bg-[#1e1f21]">
              <span className="text-[16px] font-semibold text-white">Manage notifications</span>
              <button
                onClick={() => setIsManageNotifOpen(false)}
                className="text-[#8a8886] hover:text-white p-1 rounded-lg hover:bg-[#2c2d30] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Accordions Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4 text-[13px] overscroll-contain">
              
              {/* ================= ACCORDION 1: EMAIL NOTIFICATIONS ================= */}
              <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden shrink-0 transition-all">
                <div
                  onClick={() => toggleAccordion('email')}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#2ecc71]" />
                    <span className="text-white font-semibold text-[15px]">Email notifications</span>
                  </div>
                  <button className="text-[#8a8886] hover:text-white p-1">
                    {openAccordions.email ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {openAccordions.email && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#2e2f33] flex flex-col gap-5">
                    <div>
                      <AsanaCheckbox
                        checked={emailSettings.workUpdatesParent}
                        onChange={() =>
                          toggleEmailGroup('workUpdatesParent', [
                            'sharedWithYou',
                            'assignedToYou',
                            'dueDateChanges',
                            'workCompleted',
                            'blockedUnblocked',
                            'likesReactions',
                            'accessRequests',
                          ])
                        }
                        label="Updates on your work"
                        isParent
                      />
                      <div className="ml-6 mt-2 flex flex-col gap-1.5">
                        <AsanaCheckbox
                          checked={emailSettings.sharedWithYou}
                          onChange={() => toggleEmailChild('sharedWithYou')}
                          label="When work is shared with you"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.assignedToYou}
                          onChange={() => toggleEmailChild('assignedToYou')}
                          label="When work is assigned to you"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.dueDateChanges}
                          onChange={() => toggleEmailChild('dueDateChanges')}
                          label="When due date changes on work assigned to you"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.workCompleted}
                          onChange={() => toggleEmailChild('workCompleted')}
                          label="When work assigned to you is completed"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.blockedUnblocked}
                          onChange={() => toggleEmailChild('blockedUnblocked')}
                          label="When your work is blocked or unblocked"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.likesReactions}
                          onChange={() => toggleEmailChild('likesReactions')}
                          label="When someone likes or reacts to your work"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.accessRequests}
                          onChange={() => toggleEmailChild('accessRequests')}
                          label="When someone requests access to your work"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#2e2f33] pt-4">
                      <AsanaCheckbox
                        checked={emailSettings.communicationParent}
                        onChange={() =>
                          toggleEmailGroup('communicationParent', [
                            'mentions',
                            'commentsAttachments',
                            'appreciationStickers',
                            'statusUpdates',
                            'messages',
                          ])
                        }
                        label="Communication"
                        isParent
                      />
                      <div className="ml-6 mt-2 flex flex-col gap-1.5">
                        <AsanaCheckbox
                          checked={emailSettings.mentions}
                          onChange={() => toggleEmailChild('mentions')}
                          label={`Someone mentions @${currentUser?.name || 'Dzakwan Rafi'}`}
                        />
                        <AsanaCheckbox
                          checked={emailSettings.commentsAttachments}
                          onChange={() => toggleEmailChild('commentsAttachments')}
                          label="When comments or attachments are sent"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.appreciationStickers}
                          onChange={() => toggleEmailChild('appreciationStickers')}
                          label="When appreciation stickers are sent"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.statusUpdates}
                          onChange={() => toggleEmailChild('statusUpdates')}
                          label="When status updates are posted"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.messages}
                          onChange={() => toggleEmailChild('messages')}
                          label="When messages are sent"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#2e2f33] pt-4">
                      <AsanaCheckbox
                        checked={emailSettings.collaborateParent}
                        onChange={() =>
                          toggleEmailGroup('collaborateParent', [
                            'addedCollaborator',
                            'detailsChange',
                            'collabCompleted',
                            'addedToPortfolio',
                            'tasksAddedProject',
                            'workDeleted',
                          ])
                        }
                        label="Updates to work you collaborate on"
                        isParent
                      />
                      <div className="ml-6 mt-2 flex flex-col gap-1.5">
                        <AsanaCheckbox
                          checked={emailSettings.addedCollaborator}
                          onChange={() => toggleEmailChild('addedCollaborator')}
                          label="When you're added as a collaborator"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.detailsChange}
                          onChange={() => toggleEmailChild('detailsChange')}
                          label="When work details (such as custom fields) change"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.collabCompleted}
                          onChange={() => toggleEmailChild('collabCompleted')}
                          label="When work is completed"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.addedToPortfolio}
                          onChange={() => toggleEmailChild('addedToPortfolio')}
                          label="When work is added to a portfolio"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.tasksAddedProject}
                          onChange={() => toggleEmailChild('tasksAddedProject')}
                          label="When tasks are added to a project"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.workDeleted}
                          onChange={() => toggleEmailChild('workDeleted')}
                          label="When work is deleted"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#2e2f33] pt-4">
                      <AsanaCheckbox
                        checked={emailSettings.summariesParent}
                        onChange={() =>
                          toggleEmailGroup('summariesParent', [
                            'dailyAssigned',
                            'weeklyOverdue',
                            'weeklyPortfolio',
                            'smartSummaries',
                          ])
                        }
                        label="Summaries"
                        isParent
                      />
                      <div className="ml-6 mt-2 flex flex-col gap-1.5">
                        <AsanaCheckbox
                          checked={emailSettings.dailyAssigned}
                          onChange={() => toggleEmailChild('dailyAssigned')}
                          label="Daily tasks assigned to you"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.weeklyOverdue}
                          onChange={() => toggleEmailChild('weeklyOverdue')}
                          label="Weekly overdue tasks"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.weeklyPortfolio}
                          onChange={() => toggleEmailChild('weeklyPortfolio')}
                          label="Weekly portfolio updates"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.smartSummaries}
                          onChange={() => toggleEmailChild('smartSummaries')}
                          label="Recommended project and portfolio smart summaries from Asana AI"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#2e2f33] pt-4">
                      <AsanaCheckbox
                        checked={emailSettings.otherParent}
                        onChange={() =>
                          toggleEmailGroup('otherParent', [
                            'remindDraftedComments',
                            'remindFollowupComments',
                            'adminAnnouncement',
                            'invitedUserUpdates',
                          ])
                        }
                        label="Other"
                        isParent
                      />
                      <div className="ml-6 mt-2 flex flex-col gap-1.5">
                        <AsanaCheckbox
                          checked={emailSettings.remindDraftedComments}
                          onChange={() => toggleEmailChild('remindDraftedComments')}
                          label="Reminders to finish drafted comments"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.remindFollowupComments}
                          onChange={() => toggleEmailChild('remindFollowupComments')}
                          label="Reminders to follow up on comments to you"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.adminAnnouncement}
                          onChange={() => toggleEmailChild('adminAnnouncement')}
                          label="When an admin announcement you scheduled is about to be published"
                        />
                        <AsanaCheckbox
                          checked={emailSettings.invitedUserUpdates}
                          onChange={() => toggleEmailChild('invitedUserUpdates')}
                          label="Updates about users you've invited"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#2e2f33] pt-4 flex flex-col gap-2">
                      <label className="text-[12px] text-[#8a8886]">
                        Preferred notification email
                      </label>
                      <div className="w-64 px-3 py-1.5 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-[13px] text-white flex items-center justify-between cursor-pointer">
                        <span>{preferredEmail}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </div>
                      <p className="text-[12px] text-[#8a8886]">
                        Add or remove emails from the{' '}
                        <span className="text-[#4573d2] hover:underline cursor-pointer">Account</span> tab.
                      </p>
                      <div className="mt-1">
                        <span className="text-[12px] text-[#4573d2] hover:underline cursor-pointer">
                          About email notifications
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ACCORDION 2: DO NOT DISTURB ================= */}
              <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden shrink-0 transition-all">
                <div
                  onClick={() => toggleAccordion('dnd')}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell className="w-5 h-5 text-[#a78bfa]" />
                      <span className="absolute -top-1 -right-1 text-[9px] font-bold text-[#a78bfa]">zZ</span>
                    </div>
                    <span className="text-white font-semibold text-[15px]">Do not disturb</span>
                  </div>
                  <button className="text-[#8a8886] hover:text-white p-1">
                    {openAccordions.dnd ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {openAccordions.dnd && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#2e2f33] flex flex-col gap-5">
                    <div>
                      <button
                        onClick={() => setIsPausedDnd(!isPausedDnd)}
                        className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                          isPausedDnd
                            ? 'bg-[#a78bfa]/20 border-[#a78bfa] text-white font-semibold'
                            : 'bg-[#1e1f21] border-[#3b3c3e] hover:bg-[#2c2d30] text-[#cfcecd] hover:text-white'
                        }`}
                      >
                        <Bell className="w-4 h-4 text-[#a78bfa]" />
                        <span>{isPausedDnd ? 'Notifications paused (Active)' : 'Pause notifications'}</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-white font-semibold text-[13px]">Schedule</span>
                      <div className="flex items-center gap-3">
                        <AsanaCheckbox
                          checked={dndScheduleEnabled}
                          onChange={() => setDndScheduleEnabled(!dndScheduleEnabled)}
                          label="Do not notify me from:"
                        />
                        <input
                          type="text"
                          value={dndFromTime}
                          onChange={(e) => setDndFromTime(e.target.value)}
                          className="w-20 px-2.5 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded text-white text-[12px] text-center focus:outline-hidden focus:border-[#4573d2]"
                        />
                        <span className="text-[#8a8886] text-[12px]">To:</span>
                        <input
                          type="text"
                          value={dndToTime}
                          onChange={(e) => setDndToTime(e.target.value)}
                          className="w-20 px-2.5 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded text-white text-[12px] text-center focus:outline-hidden focus:border-[#4573d2]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <span className="text-[#cfcecd] text-[13px]">Do not disturb me on my days off</span>
                      <div className="flex rounded-lg overflow-hidden border border-[#3b3c3e] w-fit">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                          const isSelected = dndDaysOff.includes(day);
                          return (
                            <button
                              key={day}
                              onClick={() => toggleDayOff(day)}
                              className={`px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer border-r border-[#3b3c3e] last:border-r-0 ${
                                isSelected
                                  ? 'bg-[#2a2b2e] text-white font-semibold'
                                  : 'bg-[#1e1f21] text-[#8a8886] hover:text-white'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ACCORDION: PROJECT NOTIFICATIONS ================= */}
              <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden shrink-0 transition-all">
                <div
                  onClick={() => toggleAccordion('project')}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ProjectNotificationIcon className="w-5 h-5 text-[#60a5fa]" />
                    <span className="text-white font-semibold text-[15px]">Project notifications</span>
                  </div>
                  <button className="text-[#8a8886] hover:text-white p-1">
                    {openAccordions.project ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {openAccordions.project && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#2e2f33] flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={projectToggles.statusUpdates}
                        onChange={() =>
                          setProjectToggles((p) => ({ ...p, statusUpdates: !p.statusUpdates }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Status updates</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={projectToggles.messages}
                        onChange={() =>
                          setProjectToggles((p) => ({ ...p, messages: !p.messages }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Messages</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={projectToggles.tasksAdded}
                        onChange={() =>
                          setProjectToggles((p) => ({ ...p, tasksAdded: !p.tasksAdded }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Tasks added</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={projectToggles.attachments}
                        onChange={() =>
                          setProjectToggles((p) => ({ ...p, attachments: !p.attachments }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Attachments</span>
                    </div>

                    <div className="mt-1">
                      <button
                        onClick={() => setIsManageIndividualProjectsOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#1e1f21] hover:bg-[#2c2d30] text-[#cfcecd] hover:text-white text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Manage individual projects</span>
                      </button>
                      <p className="text-[12px] text-[#8a8886] mt-2">
                        Individual project settings will override default settings
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ACCORDION: PORTFOLIO NOTIFICATIONS ================= */}
              <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden shrink-0 transition-all">
                <div
                  onClick={() => toggleAccordion('portfolio')}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderClosed className="w-5 h-5 text-[#a78bfa]" />
                    <span className="text-white font-semibold text-[15px]">Portfolio notifications</span>
                  </div>
                  <button className="text-[#8a8886] hover:text-white p-1">
                    {openAccordions.portfolio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {openAccordions.portfolio && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#2e2f33] flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={portfolioToggles.statusUpdates}
                        onChange={() =>
                          setPortfolioToggles((p) => ({ ...p, statusUpdates: !p.statusUpdates }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Status updates</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={portfolioToggles.messages}
                        onChange={() =>
                          setPortfolioToggles((p) => ({ ...p, messages: !p.messages }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Messages</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={portfolioToggles.workAdded}
                        onChange={() =>
                          setPortfolioToggles((p) => ({ ...p, workAdded: !p.workAdded }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Work added</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={portfolioToggles.attachments}
                        onChange={() =>
                          setPortfolioToggles((p) => ({ ...p, attachments: !p.attachments }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Attachments</span>
                    </div>

                    <div className="mt-1">
                      <button
                        onClick={() => setIsManageIndividualPortfoliosOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#1e1f21] hover:bg-[#2c2d30] text-[#cfcecd] hover:text-white text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Manage individual portfolios</span>
                      </button>
                      <p className="text-[12px] text-[#8a8886] mt-2">
                        Individual portfolio settings will override default settings
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ACCORDION: GOAL NOTIFICATIONS ================= */}
              <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden shrink-0 transition-all">
                <div
                  onClick={() => toggleAccordion('goal')}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#a78bfa]" />
                    <span className="text-white font-semibold text-[15px]">Goal notifications</span>
                  </div>
                  <button className="text-[#8a8886] hover:text-white p-1">
                    {openAccordions.goal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {openAccordions.goal && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#2e2f33] flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={goalToggles.statusUpdates}
                        onChange={() =>
                          setGoalToggles((g) => ({ ...g, statusUpdates: !g.statusUpdates }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Status updates</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BlueToggleSwitch
                        checked={goalToggles.comments}
                        onChange={() =>
                          setGoalToggles((g) => ({ ...g, comments: !g.comments }))
                        }
                      />
                      <span className="text-white text-[13px] font-medium">Comments</span>
                    </div>

                    <div className="mt-1">
                      <button
                        onClick={() => setIsManageIndividualGoalsOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#1e1f21] hover:bg-[#2c2d30] text-[#cfcecd] hover:text-white text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Manage individual goals</span>
                      </button>
                      <p className="text-[12px] text-[#8a8886] mt-2">
                        Individual goal settings will override default settings
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Modal Footer */}
            <div className="px-6 py-3.5 bg-[#1e1f21] border-t border-[#2e2f33] flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setIsManageNotifOpen(false)}
                className="px-4 py-1.5 rounded-lg text-[#bdbbb9] hover:text-white hover:bg-[#2c2d30] text-[12px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: MANAGE INDIVIDUAL PROJECTS ================= */}
      {isManageIndividualProjectsOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#1e1f21] border border-[#3b3c3e] rounded-2xl w-[680px] max-w-[95vw] h-[75vh] flex flex-col shadow-2xl overflow-hidden select-none">
            <div className="px-6 py-4 border-b border-[#2e2f33] flex items-center justify-between shrink-0 bg-[#1e1f21]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsManageIndividualProjectsOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[16px] font-semibold text-white">Manage individual projects</span>
              </div>
              <button
                onClick={() => setIsManageIndividualProjectsOpen(false)}
                className="text-[#8a8886] hover:text-white p-1 rounded-lg hover:bg-[#2c2d30] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4 text-[13px]">
              <p className="text-[#a2a09e] text-[12px]">
                Customize notification settings for specific projects. Overrides default project settings.
              </p>

              <div className="flex flex-col gap-3">
                {projects.map((proj) => {
                  const override = getProjectOverride(proj.id);
                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-[#2f3033] bg-[#242528] flex flex-col gap-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ProjectNotificationIcon className="w-4 h-4 text-[#60a5fa]" />
                          <span className="font-semibold text-white text-[14px]">{proj.name}</span>
                        </div>
                        <span className="text-[11px] text-[#8a8886] px-2 py-0.5 rounded bg-[#1e1f21] border border-[#37383b]">
                          {individualProjectOverrides[proj.id] ? 'Custom' : 'Default'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2e2f33]">
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.statusUpdates}
                            onChange={() => updateProjectOverride(proj.id, 'statusUpdates')}
                          />
                          <span className="text-[#cfcecd] text-[12px]">Status updates</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.messages}
                            onChange={() => updateProjectOverride(proj.id, 'messages')}
                          />
                          <span className="text-[#cfcecd] text-[12px]">Messages</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.tasksAdded}
                            onChange={() => updateProjectOverride(proj.id, 'tasksAdded')}
                          />
                          <span className="text-[#cfcecd] text-[12px]">Tasks added</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.attachments}
                            onChange={() => updateProjectOverride(proj.id, 'attachments')}
                          />
                          <span className="text-[#cfcecd] text-[12px]">Attachments</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#1e1f21] border-t border-[#2e2f33] flex justify-end shrink-0">
              <button
                onClick={() => setIsManageIndividualProjectsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Apply & Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: MANAGE INDIVIDUAL PORTFOLIOS ================= */}
      {isManageIndividualPortfoliosOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#1e1f21] border border-[#3b3c3e] rounded-2xl w-[680px] max-w-[95vw] h-[75vh] flex flex-col shadow-2xl overflow-hidden select-none">
            <div className="px-6 py-4 border-b border-[#2e2f33] flex items-center justify-between shrink-0 bg-[#1e1f21]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsManageIndividualPortfoliosOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[16px] font-semibold text-white">Manage individual portfolios</span>
              </div>
              <button
                onClick={() => setIsManageIndividualPortfoliosOpen(false)}
                className="text-[#8a8886] hover:text-white p-1 rounded-lg hover:bg-[#2c2d30] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4 text-[13px]">
              <p className="text-[#a2a09e] text-[12px]">
                Customize notification settings for specific portfolios. Overrides default portfolio settings.
              </p>

              <div className="flex flex-col gap-3">
                {portfolios.length > 0 ? (
                  portfolios.map((port) => {
                    const override = getPortfolioOverride(port.id);
                    return (
                      <div
                        key={port.id}
                        className="p-4 rounded-xl border border-[#2f3033] bg-[#242528] flex flex-col gap-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderClosed className="w-4 h-4 text-[#a78bfa]" />
                            <span className="font-semibold text-white text-[14px]">{port.name}</span>
                          </div>
                          <span className="text-[11px] text-[#8a8886] px-2 py-0.5 rounded bg-[#1e1f21] border border-[#37383b]">
                            {individualPortfolioOverrides[port.id] ? 'Custom' : 'Default'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2e2f33]">
                          <div className="flex items-center gap-2.5">
                            <BlueToggleSwitch
                              checked={override.statusUpdates}
                              onChange={() => updatePortfolioOverride(port.id, 'statusUpdates')}
                            />
                            <span className="text-[#cfcecd] text-[12px]">Status updates</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <BlueToggleSwitch
                              checked={override.messages}
                              onChange={() => updatePortfolioOverride(port.id, 'messages')}
                            />
                            <span className="text-[#cfcecd] text-[12px]">Messages</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <BlueToggleSwitch
                              checked={override.workAdded}
                              onChange={() => updatePortfolioOverride(port.id, 'workAdded')}
                            />
                            <span className="text-[#cfcecd] text-[12px]">Work added</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <BlueToggleSwitch
                              checked={override.attachments}
                              onChange={() => updatePortfolioOverride(port.id, 'attachments')}
                            />
                            <span className="text-[#cfcecd] text-[12px]">Attachments</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-[#8a8886]">
                    No portfolios created yet. Settings will apply automatically once created.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#1e1f21] border-t border-[#2e2f33] flex justify-end shrink-0">
              <button
                onClick={() => setIsManageIndividualPortfoliosOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Apply & Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: MANAGE INDIVIDUAL GOALS ================= */}
      {isManageIndividualGoalsOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#1e1f21] border border-[#3b3c3e] rounded-2xl w-[680px] max-w-[95vw] h-[70vh] flex flex-col shadow-2xl overflow-hidden select-none">
            <div className="px-6 py-4 border-b border-[#2e2f33] flex items-center justify-between shrink-0 bg-[#1e1f21]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsManageIndividualGoalsOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#2a2b2e] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[16px] font-semibold text-white">Manage individual goals</span>
              </div>
              <button
                onClick={() => setIsManageIndividualGoalsOpen(false)}
                className="text-[#8a8886] hover:text-white p-1 rounded-lg hover:bg-[#2c2d30] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4 text-[13px]">
              <p className="text-[#a2a09e] text-[12px]">
                Customize notification settings for specific company and team goals.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'goal-1', title: 'Q4 Product Roadmap Delivery' },
                  { id: 'goal-2', title: 'Achieve 99.9% Uptime & SLA' },
                ].map((g) => {
                  const override = individualGoalOverrides[g.id] || {
                    statusUpdates: goalToggles.statusUpdates,
                    comments: goalToggles.comments,
                  };
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-xl border border-[#2f3033] bg-[#242528] flex flex-col gap-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#a78bfa]" />
                          <span className="font-semibold text-white text-[14px]">{g.title}</span>
                        </div>
                        <span className="text-[11px] text-[#8a8886] px-2 py-0.5 rounded bg-[#1e1f21] border border-[#37383b]">
                          {individualGoalOverrides[g.id] ? 'Custom' : 'Default'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2e2f33]">
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.statusUpdates}
                            onChange={() =>
                              setIndividualGoalOverrides((prev) => ({
                                ...prev,
                                [g.id]: {
                                  ...override,
                                  statusUpdates: !override.statusUpdates,
                                },
                              }))
                            }
                          />
                          <span className="text-[#cfcecd] text-[12px]">Status updates</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <BlueToggleSwitch
                            checked={override.comments}
                            onChange={() =>
                              setIndividualGoalOverrides((prev) => ({
                                ...prev,
                                [g.id]: {
                                  ...override,
                                  comments: !override.comments,
                                },
                              }))
                            }
                          />
                          <span className="text-[#cfcecd] text-[12px]">Comments</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#1e1f21] border-t border-[#2e2f33] flex justify-end shrink-0">
              <button
                onClick={() => setIsManageIndividualGoalsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Apply & Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AI SUMMARY MODAL ================= */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-[#222325] border border-[#3b3c3e] rounded-xl w-[560px] max-w-[90vw] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2f33]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f06a6a]" />
                <h3 className="text-white font-semibold text-[16px]">Asana AI - Inbox Summary</h3>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-[#8a8886] hover:text-white p-1 rounded-md hover:bg-[#2c2d30] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-[13px]">
              <div className="text-[12px] text-[#9c9a99]">
                Showing automated synthesis for: <span className="text-white font-medium">{timeframe}</span>
              </div>

              <div className="p-4 rounded-lg bg-[#1e1f21] border border-[#2f3033] flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#f06a6a] mt-1.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Workspace Onboarding:</span>
                    <p className="text-[#a2a09e] mt-0.5">
                      Your team inbox is active. 1 system notice was received inviting collaboration.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#2ecc71] mt-1.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Action Items:</span>
                    <p className="text-[#a2a09e] mt-0.5">
                      No overdue tasks or pending approvals require your immediate attention today.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Suggested Next Step:</span>
                    <p className="text-[#a2a09e] mt-0.5">
                      Invite teammates to your project to start assigning tasks and tracking progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#1e1f21] border-t border-[#2e2f33] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  openInviteModal();
                }}
                className="text-[12px] text-[#4573d2] hover:underline cursor-pointer"
              >
                Invite teammates now →
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 bg-[#1e293b] border border-[#3b82f6] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px]">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
