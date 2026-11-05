'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Disc,
  Calendar,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
  Mail,
  Moon,
  FolderClosed,
  Target,
  SlidersHorizontal,
  ExternalLink,
  Laptop,
  Sun,
  Palette,
  Sparkles,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  Lock,
  Compass,
  MoreHorizontal,
  GripVertical,
  Info,
  ChevronRight,
  QrCode,
  Smartphone,
  Plus,
  Briefcase,
  Bot,
  BookOpen,
  Users,
  Triangle,
} from 'lucide-react';
import { useApp, SettingsTab } from '@/context/AppContext';

// Reusable blue toggle switch matching Asana
function ToggleSwitch({
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

// Reusable checkbox
function SettingsCheckbox({
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
    <label className="flex items-center gap-2.5 cursor-pointer select-none group py-0.5">
      <div
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
          checked
            ? 'bg-[#2563eb] border-[#2563eb] text-white'
            : 'border-[#4a4c50] bg-transparent group-hover:border-[#6a6c70]'
        }`}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
      <span
        className={`${
          isParent ? 'font-semibold text-white text-[13px]' : 'text-[#cfcecd] text-[13px]'
        }`}
      >
        {label}
      </span>
    </label>
  );
}


// Integration & Navigation icons matching Asana
function SlackAppIcon() {
  return (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M5.5 10.5C6.32843 10.5 7 9.82843 7 9V5.5C7 4.67157 6.32843 4 5.5 4C4.67157 4 4 4.67157 4 5.5C4 6.32843 4.67157 7 5.5 7H7" fill="#E01E5A"/>
      <path d="M4 10.5C4 11.3284 4.67157 12 5.5 12H9C9.82843 12 10.5 11.3284 10.5 10.5C10.5 9.67157 9.82843 9 9 9H5.5C4.67157 9 4 9.67157 4 10.5Z" fill="#E01E5A"/>
      <path d="M10.5 5.5C10.5 4.67157 11.1716 4 12 4C12.8284 4 13.5 4.67157 13.5 5.5V9C13.5 9.82843 12.8284 10.5 12 10.5C11.1716 10.5 10.5 9.82843 10.5 9V5.5Z" fill="#36C5F0"/>
      <path d="M10.5 4C9.67157 4 9 4.67157 9 5.5C9 6.32843 9.67157 7 10.5 7H14C14.8284 7 15.5 6.32843 15.5 5.5C15.5 4.67157 14.8284 4 14 4H10.5Z" fill="#36C5F0"/>
      <path d="M18.5 13.5C17.6716 13.5 17 14.1716 17 15V18.5C17 19.3284 17.6716 20 18.5 20C19.3284 20 20 19.3284 20 18.5C20 17.6716 19.3284 17 18.5 17H17" fill="#2EB67D"/>
      <path d="M20 13.5C20 12.6716 19.3284 12 18.5 12H15C14.1716 12 13.5 12.6716 13.5 13.5C13.5 14.3284 14.1716 15 15 15H18.5C19.3284 15 20 14.3284 20 13.5Z" fill="#2EB67D"/>
      <path d="M13.5 18.5C13.5 19.3284 12.8284 20 12 20C11.1716 20 10.5 19.3284 10.5 18.5V15C10.5 14.1716 11.1716 13.5 12 13.5C12.8284 13.5 13.5 14.1716 13.5 15V18.5Z" fill="#ECB22E"/>
      <path d="M13.5 20C14.3284 20 15 19.3284 15 18.5C15 17.6716 14.3284 17 13.5 17H10C9.17157 17 8.5 17.6716 8.5 18.5C8.5 19.3284 9.17157 20 10 20H13.5Z" fill="#ECB22E"/>
    </svg>
  );
}

function GmailAppIcon() {
  return (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M3 18V6C3 4.89543 3.89543 4 5 4H6.5L12 9.5L17.5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H17.5V10.5L12 15.5L6.5 10.5V20H5C3.89543 20 3 19.1046 3 18Z" fill="#EA4335" opacity="0.15"/>
      <path d="M5 4H6.5V11L12 16L17.5 11V4H19C20.1 4 21 4.9 21 6V18C21 19.1 20.1 20 19 20H17.5V10L12 15L6.5 10V20H5C3.9 20 3 19.1 3 18V6C3 4.9 3.9 4 5 4Z" fill="#EA4335"/>
      <path d="M3 6L12 14L21 6" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 4H19C20.1 4 21 4.9 21 6V9" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M3 9V6C3 4.9 3.9 4 5 4H6.5" stroke="#FBBC04" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function TeamsAppIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#5059C9] flex items-center justify-center text-white font-bold text-[14px] shrink-0 shadow-xs">
      T
    </div>
  );
}

function AsanaFlowerIcon({ className = "w-4 h-4 text-[#8a8886]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="7" r="3.2"/>
      <circle cx="7" cy="15" r="3.2"/>
      <circle cx="17" cy="15" r="3.2"/>
    </svg>
  );
}

export default function SettingsModal() {
  const {
    currentUser,
    updateCurrentUser,
    isSettingsOpen,
    settingsTab,
    closeSettingsModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tab when opened
  useEffect(() => {
    if (isSettingsOpen && settingsTab) {
      setActiveTab(settingsTab);
    }
  }, [isSettingsOpen, settingsTab]);

  // Profile Form State (Images 3 & 4)
  const [fullName, setFullName] = useState(currentUser?.name || 'Dzakwan Rafi');
  const [pronouns, setPronouns] = useState('Third-person pronouns (e.g. she/her/hers)');
  const [jobTitle, setJobTitle] = useState('Product Specialist');
  const [department, setDepartment] = useState('Product & Engineering');
  const [email, setEmail] = useState(currentUser?.email || 'jekiturkish@gmail.com');
  const [aboutMe, setAboutMe] = useState(
    'I usually work from 9am-5pm PST. Feel free to assign me a task with a due date anytime. Also, I love dogs!'
  );
  const [showCertifications, setShowCertifications] = useState(true);
  const [hovercardSetting, setHovercardSetting] = useState('Show: Certifications');
  const [profileCertificationSetting, setProfileCertificationSetting] = useState('Show: All');

  // Personalization Form State (Image 5)
  const [isRoleDetailsOpen, setIsRoleDetailsOpen] = useState(true);
  const [jobDetails, setJobDetails] = useState('');
  const [role, setRole] = useState('Individual Contributor');
  const [functionCategory, setFunctionCategory] = useState('Engineering');
  const [specialties, setSpecialties] = useState('Fullstack');
  const [useCases, setUseCases] = useState('Sprint Planning');
  const [intendedUse, setIntendedUse] = useState('Work');

  // Notifications Form State
  const [openAccordions, setOpenAccordions] = useState({
    email: true,
    dnd: false,
    project: false,
    portfolio: false,
    goal: false,
  });

  const toggleAccordion = (section: keyof typeof openAccordions) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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

  const [isPausedDnd, setIsPausedDnd] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [dndFromTime, setDndFromTime] = useState('5:00pm');
  const [dndToTime, setDndToTime] = useState('9:00am');
  const [daysOff, setDaysOff] = useState<string[]>(['Sat', 'Sun']);

  const [projectToggles, setProjectToggles] = useState({
    statusUpdates: true,
    messages: true,
    tasksAdded: true,
    attachments: true,
  });

  const [portfolioToggles, setPortfolioToggles] = useState({
    statusUpdates: true,
    messages: true,
    workAdded: true,
    attachments: true,
  });

  const [goalToggles, setGoalToggles] = useState({
    statusUpdates: true,
    messages: true,
  });

  // Display Settings
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [colorContrast, setColorContrast] = useState(false);

  // Display Settings (Image 5)
  const [displayTheme, setDisplayTheme] = useState('Sync with system settings');
  const [displayLanguage, setDisplayLanguage] = useState('English');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Automatic');
  const [popupDuration, setPopupDuration] = useState('10 seconds (default)');
  const [openAsanaAs, setOpenAsanaAs] = useState('Asana.com homepage');
  const [confirmMentioning, setConfirmMentioning] = useState(true);
  const [confirmAssigning, setConfirmAssigning] = useState(true);
  const [showRowNumbers, setShowRowNumbers] = useState(false);
  const [enableCompactMode, setEnableCompactMode] = useState(false);
  const [colorBlindFriendly, setColorBlindFriendly] = useState(false);
  const [occasionalCelebrations, setOccasionalCelebrations] = useState(true);

  // Email Forwarding Settings (Image 4)
  const [forwardWorkspace, setForwardWorkspace] = useState('My workspace');

  // Account State (Image 5)
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');

  // Navigation State (Image 1)
  const [navStyle, setNavStyle] = useState<'icon-and-text' | 'icon-only'>('icon-and-text');
  const [navVisibility, setNavVisibility] = useState({
    work: false,
    agents: false,
    strategy: true,
    knowledge: false,
    people: true,
  });

  // Integrations State (Images 3 & 4)
  const [connectedApps, setConnectedApps] = useState<string[]>([]);

  // Hacks State (Image 2)
  const [hackExtraDelight, setHackExtraDelight] = useState(false);
  const [hackRecurringLastSection, setHackRecurringLastSection] = useState(false);
  const [hackDisableStartingDueToday, setHackDisableStartingDueToday] = useState(false);

  // Legacy Hacks Settings
  const [delightCelebrations, setDelightCelebrations] = useState(true);
  const [extraShortcuts, setExtraShortcuts] = useState(true);

  const toggleGroup = (
    parentKey: keyof typeof emailSettings,
    childKeys: (keyof typeof emailSettings)[]
  ) => {
    setEmailSettings((prev) => {
      const nextVal = !prev[parentKey];
      const updated = { ...prev, [parentKey]: nextVal };
      childKeys.forEach((k) => {
        (updated as any)[k] = nextVal;
      });
      return updated;
    });
  };

  const toggleChild = (
    parentKey: keyof typeof emailSettings,
    childKey: keyof typeof emailSettings,
    siblingKeys: (keyof typeof emailSettings)[]
  ) => {
    setEmailSettings((prev) => {
      const nextChildVal = !prev[childKey];
      const updated = { ...prev, [childKey]: nextChildVal };
      const anyChecked = siblingKeys.some((k) =>
        k === childKey ? nextChildVal : prev[k]
      );
      (updated as any)[parentKey] = anyChecked;
      return updated;
    });
  };

  if (!isSettingsOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: fullName,
      email: email,
    });
    showToast('Profile settings saved successfully');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved successfully');
  };

  const tabList: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'personalization', label: 'Personalization' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'emailForwarding', label: 'Email forwarding' },
    { id: 'account', label: 'Account' },
    { id: 'display', label: 'Display' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'hacks', label: 'Hacks' },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettingsModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
    >
      <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-[860px] max-w-[95vw] h-[86vh] max-h-[86vh] flex flex-col shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#2e2f33] flex items-center justify-between shrink-0 bg-[#1e1f21]">
          <h2 className="text-[17px] font-semibold text-white">Settings</h2>
          <button
            onClick={closeSettingsModal}
            className="text-[#8a8886] hover:text-white p-1 rounded-lg hover:bg-[#2c2d30] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Main Body: Left Tabs Sidebar + Right Scrollable Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Navigation Tabs */}
          <div className="w-48 shrink-0 border-r border-[#2e2f33] py-4 px-3 space-y-0.5 overflow-y-auto text-[13px]">
            {tabList.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold bg-[#2a2b2e]'
                      : 'text-[#9c9a99] hover:text-white hover:bg-[#252628]/60 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 text-[13px]">
            {/* ================= TAB 1: PROFILE (IMAGES 3 & 4) ================= */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl select-text">
                {/* Your photo */}
                <div>
                  <label className="text-[12px] font-medium text-[#9c9a99] block mb-2">Your photo</label>
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#4a4c50] flex items-center justify-center bg-[#252628] text-[#8a8886] overflow-hidden shrink-0">
                      <User className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => showToast('Photo upload dialog opened')}
                        className="text-[#4573d2] hover:underline font-medium text-[13px] cursor-pointer block mb-1"
                      >
                        Upload your photo
                      </button>
                      <p className="text-[12px] text-[#8a8886] leading-relaxed">
                        Photos help your teammates recognize you in Asana
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name & Pronouns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Your full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="Third-person pronouns (e.g. she/her/hers)"
                      className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                    />
                  </div>
                </div>

                {/* Pronunciation & Job title */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Name pronunciation
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Audio recording started')}
                      className="w-full px-3 py-2 bg-[#252628] hover:bg-[#2c2d30] border border-[#3b3c3e] rounded-lg text-white text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Disc className="w-4 h-4 text-[#8a8886]" />
                      <span>Record audio clip</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Job title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                    />
                  </div>
                </div>

                {/* Department & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Department or team
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-[#bdbbb9] text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                    />
                  </div>
                </div>

                {/* About me */}
                <div>
                  <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">
                    About me
                  </label>
                  <textarea
                    rows={3}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    className="w-full px-3 py-2 bg-[#252628] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2] leading-relaxed resize-none"
                  />
                </div>

                {/* Collaborative work management certifications (Image 4) */}
                <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white text-[14px]">
                      Collaborative work management certifications
                    </span>
                    <div className="flex items-center gap-2 text-[12px] text-[#cfcecd]">
                      <ToggleSwitch
                        checked={showCertifications}
                        onChange={() => setShowCertifications(!showCertifications)}
                      />
                      <span>Show publicly</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#8a8886] mb-3">
                    Adjust how you would like your certifications and skills to show up for others to see
                  </p>

                  <div className="border-t border-[#2e2f33] pt-3 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#cfcecd] flex items-center gap-1.5">
                        <span>Hovercard</span>
                        <span className="text-[#8a8886] text-[11px]">🛈</span>
                      </span>
                      <select
                        value={hovercardSetting}
                        onChange={(e) => setHovercardSetting(e.target.value)}
                        className="px-2.5 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[12px] focus:outline-hidden"
                      >
                        <option>Show: Certifications</option>
                        <option>Show: None</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#cfcecd]">Profile</span>
                      <select
                        value={profileCertificationSetting}
                        onChange={(e) => setProfileCertificationSetting(e.target.value)}
                        className="px-2.5 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[12px] focus:outline-hidden"
                      >
                        <option>Show: All</option>
                        <option>Show: Selected only</option>
                        <option>Show: None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Out of office (Image 4) */}
                <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-[14px] mb-0.5">Out of office</div>
                    <div className="text-[12px] text-[#8a8886]">
                      Indicate when you are away to your teammates
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Out of office schedule dialog opened')}
                    className="px-3 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#252628] hover:bg-[#2c2d30] text-white text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#8a8886]" />
                    <span>Set out of office</span>
                  </button>
                </div>

                {/* Invite type info */}
                <div className="pt-2 text-[12px]">
                  <div className="text-[#8a8886] mb-0.5">Invite type</div>
                  <div className="font-semibold text-white">Signed up on Nov 4, 2026</div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAB 2: PERSONALIZATION (IMAGE 5) ================= */}
            {activeTab === 'personalization' && (
              <div className="space-y-6 max-w-2xl select-text">
                <div className="p-5 rounded-xl border border-[#2f3033] bg-[#222325]">
                  <div
                    onClick={() => setIsRoleDetailsOpen(!isRoleDetailsOpen)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1e293b] text-[#38bdf8] flex items-center justify-center shrink-0 border border-[#38bdf8]/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[15px] block">Role details</span>
                        <span className="text-[12px] text-[#8a8886]">
                          Only you can see these fields. We use them to tailor Asana to you and to share relevant product recommendations.
                        </span>
                      </div>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {isRoleDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isRoleDetailsOpen && (
                    <div className="mt-5 pt-4 border-t border-[#2e2f33] space-y-4">
                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Job details</label>
                        <input
                          type="text"
                          value={jobDetails}
                          onChange={(e) => setJobDetails(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden focus:border-[#4573d2]"
                        />
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Role</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden"
                        >
                          <option>Individual Contributor</option>
                          <option>Team Lead</option>
                          <option>Manager</option>
                          <option>Director</option>
                          <option>Executive</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Functions</label>
                        <select
                          value={functionCategory}
                          onChange={(e) => setFunctionCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden"
                        >
                          <option>Engineering</option>
                          <option>Product Management</option>
                          <option>Design & UX</option>
                          <option>Operations</option>
                          <option>Marketing</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Specialties</label>
                        <select
                          value={specialties}
                          onChange={(e) => setSpecialties(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden"
                        >
                          <option>Fullstack</option>
                          <option>Frontend</option>
                          <option>Backend</option>
                          <option>DevOps / Cloud</option>
                          <option>Mobile</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Use cases</label>
                        <select
                          value={useCases}
                          onChange={(e) => setUseCases(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden"
                        >
                          <option>Sprint Planning</option>
                          <option>Roadmap Planning</option>
                          <option>Bug Tracking</option>
                          <option>Resource Management</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-[#cfcecd] mb-1.5 block">Intended use</label>
                        <select
                          value={intendedUse}
                          onChange={(e) => setIntendedUse(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1f21] border border-[#3b3c3e] rounded-lg text-white text-[13px] focus:outline-hidden"
                        >
                          <option>Work</option>
                          <option>Personal</option>
                          <option>Education</option>
                        </select>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => showToast('Role details updated')}
                          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Save Role Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 3: NOTIFICATIONS (ACCORDIONS) ================= */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 max-w-2xl select-text">
                {/* 1. Email notifications */}
                <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleAccordion('email')}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#2ecc71]" />
                      <span className="text-white font-semibold text-[15px]">Email notifications</span>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {openAccordions.email ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAccordions.email && (
                    <div className="px-5 pb-5 pt-3 space-y-6 border-t border-[#2e2f33]">
                      {/* Group 1: Updates on your work */}
                      <div className="space-y-1.5">
                        <SettingsCheckbox
                          isParent
                          label="Updates on your work"
                          checked={emailSettings.workUpdatesParent}
                          onChange={() =>
                            toggleGroup('workUpdatesParent', [
                              'sharedWithYou',
                              'assignedToYou',
                              'dueDateChanges',
                              'workCompleted',
                              'blockedUnblocked',
                              'likesReactions',
                              'accessRequests',
                            ])
                          }
                        />
                        <div className="pl-6 space-y-1.5">
                          <SettingsCheckbox
                            label="When work is shared with you"
                            checked={emailSettings.sharedWithYou}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'sharedWithYou', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work is assigned to you"
                            checked={emailSettings.assignedToYou}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'assignedToYou', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When due date changes on work assigned to you"
                            checked={emailSettings.dueDateChanges}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'dueDateChanges', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work assigned to you is completed"
                            checked={emailSettings.workCompleted}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'workCompleted', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When your work is blocked or unblocked"
                            checked={emailSettings.blockedUnblocked}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'blockedUnblocked', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When someone likes or reacts to your work"
                            checked={emailSettings.likesReactions}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'likesReactions', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When someone requests access to your work"
                            checked={emailSettings.accessRequests}
                            onChange={() =>
                              toggleChild('workUpdatesParent', 'accessRequests', [
                                'sharedWithYou',
                                'assignedToYou',
                                'dueDateChanges',
                                'workCompleted',
                                'blockedUnblocked',
                                'likesReactions',
                                'accessRequests',
                              ])
                            }
                          />
                        </div>
                      </div>

                      {/* Group 2: Communication */}
                      <div className="space-y-1.5">
                        <SettingsCheckbox
                          isParent
                          label="Communication"
                          checked={emailSettings.communicationParent}
                          onChange={() =>
                            toggleGroup('communicationParent', [
                              'mentions',
                              'commentsAttachments',
                              'appreciationStickers',
                              'statusUpdates',
                              'messages',
                            ])
                          }
                        />
                        <div className="pl-6 space-y-1.5">
                          <SettingsCheckbox
                            label={`Someone mentions @${currentUser?.name || fullName || 'Dzakwan Rafi'}`}
                            checked={emailSettings.mentions}
                            onChange={() =>
                              toggleChild('communicationParent', 'mentions', [
                                'mentions',
                                'commentsAttachments',
                                'appreciationStickers',
                                'statusUpdates',
                                'messages',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When comments or attachments are sent"
                            checked={emailSettings.commentsAttachments}
                            onChange={() =>
                              toggleChild('communicationParent', 'commentsAttachments', [
                                'mentions',
                                'commentsAttachments',
                                'appreciationStickers',
                                'statusUpdates',
                                'messages',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When appreciation stickers are sent"
                            checked={emailSettings.appreciationStickers}
                            onChange={() =>
                              toggleChild('communicationParent', 'appreciationStickers', [
                                'mentions',
                                'commentsAttachments',
                                'appreciationStickers',
                                'statusUpdates',
                                'messages',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When status updates are posted"
                            checked={emailSettings.statusUpdates}
                            onChange={() =>
                              toggleChild('communicationParent', 'statusUpdates', [
                                'mentions',
                                'commentsAttachments',
                                'appreciationStickers',
                                'statusUpdates',
                                'messages',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When messages are sent"
                            checked={emailSettings.messages}
                            onChange={() =>
                              toggleChild('communicationParent', 'messages', [
                                'mentions',
                                'commentsAttachments',
                                'appreciationStickers',
                                'statusUpdates',
                                'messages',
                              ])
                            }
                          />
                        </div>
                      </div>

                      {/* Group 3: Updates to work you collaborate on */}
                      <div className="space-y-1.5">
                        <SettingsCheckbox
                          isParent
                          label="Updates to work you collaborate on"
                          checked={emailSettings.collaborateParent}
                          onChange={() =>
                            toggleGroup('collaborateParent', [
                              'addedCollaborator',
                              'detailsChange',
                              'collabCompleted',
                              'addedToPortfolio',
                              'tasksAddedProject',
                              'workDeleted',
                            ])
                          }
                        />
                        <div className="pl-6 space-y-1.5">
                          <SettingsCheckbox
                            label="When you're added as a collaborator"
                            checked={emailSettings.addedCollaborator}
                            onChange={() =>
                              toggleChild('collaborateParent', 'addedCollaborator', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work details (such as custom fields) change"
                            checked={emailSettings.detailsChange}
                            onChange={() =>
                              toggleChild('collaborateParent', 'detailsChange', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work is completed"
                            checked={emailSettings.collabCompleted}
                            onChange={() =>
                              toggleChild('collaborateParent', 'collabCompleted', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work is added to a portfolio"
                            checked={emailSettings.addedToPortfolio}
                            onChange={() =>
                              toggleChild('collaborateParent', 'addedToPortfolio', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When tasks are added to a project"
                            checked={emailSettings.tasksAddedProject}
                            onChange={() =>
                              toggleChild('collaborateParent', 'tasksAddedProject', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When work is deleted"
                            checked={emailSettings.workDeleted}
                            onChange={() =>
                              toggleChild('collaborateParent', 'workDeleted', [
                                'addedCollaborator',
                                'detailsChange',
                                'collabCompleted',
                                'addedToPortfolio',
                                'tasksAddedProject',
                                'workDeleted',
                              ])
                            }
                          />
                        </div>
                      </div>

                      {/* Group 4: Summaries */}
                      <div className="space-y-1.5">
                        <SettingsCheckbox
                          isParent
                          label="Summaries"
                          checked={emailSettings.summariesParent}
                          onChange={() =>
                            toggleGroup('summariesParent', [
                              'dailyAssigned',
                              'weeklyOverdue',
                              'weeklyPortfolio',
                              'smartSummaries',
                            ])
                          }
                        />
                        <div className="pl-6 space-y-1.5">
                          <SettingsCheckbox
                            label="Daily tasks assigned to you"
                            checked={emailSettings.dailyAssigned}
                            onChange={() =>
                              toggleChild('summariesParent', 'dailyAssigned', [
                                'dailyAssigned',
                                'weeklyOverdue',
                                'weeklyPortfolio',
                                'smartSummaries',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="Weekly overdue tasks"
                            checked={emailSettings.weeklyOverdue}
                            onChange={() =>
                              toggleChild('summariesParent', 'weeklyOverdue', [
                                'dailyAssigned',
                                'weeklyOverdue',
                                'weeklyPortfolio',
                                'smartSummaries',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="Weekly portfolio updates"
                            checked={emailSettings.weeklyPortfolio}
                            onChange={() =>
                              toggleChild('summariesParent', 'weeklyPortfolio', [
                                'dailyAssigned',
                                'weeklyOverdue',
                                'weeklyPortfolio',
                                'smartSummaries',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="Recommended project and portfolio smart summaries from Asana AI"
                            checked={emailSettings.smartSummaries}
                            onChange={() =>
                              toggleChild('summariesParent', 'smartSummaries', [
                                'dailyAssigned',
                                'weeklyOverdue',
                                'weeklyPortfolio',
                                'smartSummaries',
                              ])
                            }
                          />
                        </div>
                      </div>

                      {/* Group 5: Other */}
                      <div className="space-y-1.5">
                        <SettingsCheckbox
                          isParent
                          label="Other"
                          checked={emailSettings.otherParent}
                          onChange={() =>
                            toggleGroup('otherParent', [
                              'remindDraftedComments',
                              'remindFollowupComments',
                              'adminAnnouncement',
                              'invitedUserUpdates',
                            ])
                          }
                        />
                        <div className="pl-6 space-y-1.5">
                          <SettingsCheckbox
                            label="Reminders to finish drafted comments"
                            checked={emailSettings.remindDraftedComments}
                            onChange={() =>
                              toggleChild('otherParent', 'remindDraftedComments', [
                                'remindDraftedComments',
                                'remindFollowupComments',
                                'adminAnnouncement',
                                'invitedUserUpdates',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="Reminders to follow up on comments to you"
                            checked={emailSettings.remindFollowupComments}
                            onChange={() =>
                              toggleChild('otherParent', 'remindFollowupComments', [
                                'remindDraftedComments',
                                'remindFollowupComments',
                                'adminAnnouncement',
                                'invitedUserUpdates',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="When an admin announcement you scheduled is about to be published"
                            checked={emailSettings.adminAnnouncement}
                            onChange={() =>
                              toggleChild('otherParent', 'adminAnnouncement', [
                                'remindDraftedComments',
                                'remindFollowupComments',
                                'adminAnnouncement',
                                'invitedUserUpdates',
                              ])
                            }
                          />
                          <SettingsCheckbox
                            label="Updates about users you've invited"
                            checked={emailSettings.invitedUserUpdates}
                            onChange={() =>
                              toggleChild('otherParent', 'invitedUserUpdates', [
                                'remindDraftedComments',
                                'remindFollowupComments',
                                'adminAnnouncement',
                                'invitedUserUpdates',
                              ])
                            }
                          />
                        </div>
                      </div>

                      {/* Bottom section of Email Notifications */}
                      <div className="pt-4 border-t border-[#2e2f33] space-y-3">
                        <div>
                          <label className="text-[13px] text-[#cfcecd] block mb-1.5">
                            Preferred notification email
                          </label>
                          <select
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#1e1f21] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                          >
                            <option>{email}</option>
                          </select>
                          <div className="text-[12px] text-[#8a8886] mt-1.5">
                            Add or remove emails from the{' '}
                            <button
                              type="button"
                              onClick={() => setActiveTab('account')}
                              className="text-[#3b82f6] hover:underline cursor-pointer"
                            >
                              Account
                            </button>{' '}
                            tab.
                          </div>
                        </div>

                        <div>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              showToast('Email notification docs');
                            }}
                            className="text-[#3b82f6] hover:underline text-[13px] inline-block pt-1"
                          >
                            About email notifications
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Do not disturb */}
                <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleAccordion('dnd')}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-[#8b5cf6]" />
                      <span className="text-white font-semibold text-[15px]">Do not disturb</span>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {openAccordions.dnd ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAccordions.dnd && (
                    <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[#2e2f33]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPausedDnd(!isPausedDnd);
                          showToast(!isPausedDnd ? 'Notifications paused' : 'Notifications resumed');
                        }}
                        className={`px-4 py-2 rounded-lg border text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                          isPausedDnd
                            ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                            : 'bg-[#252628] border-[#3b3c3e] text-white hover:bg-[#2f3135]'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>{isPausedDnd ? 'Resume notifications' : 'Pause notifications'}</span>
                      </button>

                      <div className="space-y-2">
                        <div className="font-semibold text-white text-[13px]">Schedule</div>
                        <div className="flex items-center gap-3">
                          <SettingsCheckbox
                            label="Do not notify me from:"
                            checked={scheduleEnabled}
                            onChange={() => setScheduleEnabled(!scheduleEnabled)}
                          />
                          <input
                            type="text"
                            value={dndFromTime}
                            onChange={(e) => setDndFromTime(e.target.value)}
                            className="w-20 px-2 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded text-[12px] text-white text-center"
                          />
                          <span className="text-[#8a8886] text-[12px]">To:</span>
                          <input
                            type="text"
                            value={dndToTime}
                            onChange={(e) => setDndToTime(e.target.value)}
                            className="w-20 px-2 py-1 bg-[#1e1f21] border border-[#3b3c3e] rounded text-[12px] text-white text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[12px] text-[#a2a09e]">Do not disturb me on my days off</div>
                        <div className="flex items-center gap-1.5">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
                            const isOff = daysOff.includes(d);
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() =>
                                  setDaysOff((prev) =>
                                    prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                                  )
                                }
                                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                                  isOff
                                    ? 'bg-[#0c326f] text-white border border-[#2563eb]'
                                    : 'bg-[#1e1f21] text-[#cfcecd] hover:bg-[#2b2c2f] border border-[#37383b]'
                                }`}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Project notifications */}
                <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleAccordion('project')}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderClosed className="w-5 h-5 text-[#3b82f6]" />
                      <span className="text-white font-semibold text-[15px]">Project notifications</span>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {openAccordions.project ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAccordions.project && (
                    <div className="px-5 pb-5 pt-3 space-y-3 border-t border-[#2e2f33]">
                      {(
                        [
                          { key: 'statusUpdates', label: 'Status updates' },
                          { key: 'messages', label: 'Messages' },
                          { key: 'tasksAdded', label: 'Tasks added' },
                          { key: 'attachments', label: 'Attachments' },
                        ] as const
                      ).map((item) => (
                        <div key={item.key} className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={projectToggles[item.key]}
                            onChange={() =>
                              setProjectToggles((p) => ({ ...p, [item.key]: !p[item.key] }))
                            }
                          />
                          <span className="text-white text-[13px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Portfolio notifications */}
                <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleAccordion('portfolio')}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderClosed className="w-5 h-5 text-[#a855f7]" />
                      <span className="text-white font-semibold text-[15px]">Portfolio notifications</span>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {openAccordions.portfolio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAccordions.portfolio && (
                    <div className="px-5 pb-5 pt-3 space-y-3 border-t border-[#2e2f33]">
                      {(
                        [
                          { key: 'statusUpdates', label: 'Status updates' },
                          { key: 'messages', label: 'Messages' },
                          { key: 'workAdded', label: 'Work added' },
                          { key: 'attachments', label: 'Attachments' },
                        ] as const
                      ).map((item) => (
                        <div key={item.key} className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={portfolioToggles[item.key]}
                            onChange={() =>
                              setPortfolioToggles((p) => ({ ...p, [item.key]: !p[item.key] }))
                            }
                          />
                          <span className="text-white text-[13px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Goal notifications */}
                <div className="bg-[#242528] border border-[#2f3033] rounded-xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleAccordion('goal')}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#28292d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-[#f97316]" />
                      <span className="text-white font-semibold text-[15px]">Goal notifications</span>
                    </div>
                    <button type="button" className="text-[#8a8886] hover:text-white p-1">
                      {openAccordions.goal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAccordions.goal && (
                    <div className="px-5 pb-5 pt-3 space-y-3 border-t border-[#2e2f33]">
                      {(
                        [
                          { key: 'statusUpdates', label: 'Status updates' },
                          { key: 'messages', label: 'Messages' },
                        ] as const
                      ).map((item) => (
                        <div key={item.key} className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={goalToggles[item.key]}
                            onChange={() =>
                              setGoalToggles((p) => ({ ...p, [item.key]: !p[item.key] }))
                            }
                          />
                          <span className="text-white text-[13px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSaveNotifications}
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ================= TAB 4: EMAIL FORWARDING (IMAGE 4) ================= */}
            {activeTab === 'emailForwarding' && (
              <div className="space-y-6 max-w-2xl select-text text-[13px]">
                <p className="text-[#cfcecd] leading-relaxed">
                  You can create tasks &amp; messages from email addresses associated with Asana.
                </p>

                <div className="space-y-2">
                  <p className="text-[#cfcecd] leading-relaxed">
                    <span className="font-semibold text-white">Create tasks</span> by emailing{' '}
                    <a
                      href="mailto:x@mail.asana.com"
                      className="text-[#3b82f6] hover:underline"
                    >
                      x@mail.asana.com
                    </a>
                    . Tasks emailed will appear in your My tasks list.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#a2a09e]">
                    <li>The subject line will be the task name</li>
                    <li>The body will be the task description</li>
                    <li>All email attachments will be attached to the task</li>
                    <li>You can cc teammates to add them as task collaborators</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[#cfcecd] leading-relaxed">
                    <span className="font-semibold text-white">Create messages</span> by emailing [team-id]@mail.asana.com. You can find this team ID in the &quot;Messages&quot; tab of the team page.
                  </p>
                </div>

                {/* 2-Column form layout */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <div className="text-[13px] font-medium text-[#cfcecd] mb-2">
                      Emails sent from
                    </div>
                    <div className="text-white text-[13px] py-1">
                      {email}
                    </div>
                  </div>

                  <div>
                    <div className="text-[13px] font-medium text-[#cfcecd] mb-2">
                      Create tasks and messages in
                    </div>
                    <select
                      value={forwardWorkspace}
                      onChange={(e) => {
                        setForwardWorkspace(e.target.value);
                        showToast('Email destination workspace updated');
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                    >
                      <option>My workspace</option>
                      <option>Dzakwan&apos;s workspace</option>
                    </select>
                  </div>
                </div>

                <div className="text-[12px] text-[#8a8886] pt-2">
                  Add or remove emails from the{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="text-[#3b82f6] hover:underline cursor-pointer"
                  >
                    Account
                  </button>{' '}
                  tab.
                </div>
              </div>
            )}

            {/* ================= TAB 5: ACCOUNT (IMAGE 5) ================= */}
            {activeTab === 'account' && (
              <div className="space-y-6 max-w-2xl select-text text-[13px]">
                {/* Organizations and workspaces */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-4">Organizations and workspaces</h3>
                  <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-[13px] items-start">
                    <span className="text-[#8a8886]">Organizations</span>
                    <div></div>

                    <span className="text-[#8a8886]">Workspaces</span>
                    <div>
                      <div className="font-semibold text-white">My workspace</div>
                      <button
                        type="button"
                        onClick={() => showToast('Create workspace modal opened')}
                        className="text-[13px] text-[#8a8886] hover:text-white mt-1 cursor-pointer block transition-colors"
                      >
                        Create new workspace
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2e2f33]" />

                {/* Manage emails */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-1">Manage emails</h3>
                  <p className="text-[12px] text-[#8a8886] mb-3">
                    Add additional emails, merge your accounts, or switch from personal to work accounts.
                  </p>

                  <div className="flex items-center justify-between py-2 text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-white">{currentUser?.email || email}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#2a2b2e] border border-[#3b3c3e] text-[#cfcecd]">
                        Preferred notification email
                      </span>
                    </div>
                    <span className="text-[#686765] text-[13px]">Remove</span>
                  </div>

                  {additionalEmails.map((em) => (
                    <div key={em} className="flex items-center justify-between py-2 text-[13px]">
                      <span className="text-white">{em}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalEmails(additionalEmails.filter((x) => x !== em));
                          showToast(`Removed ${em}`);
                        }}
                        className="text-[#ef4444] hover:underline cursor-pointer text-[12px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {isAddEmailOpen ? (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="Enter email address"
                        className="px-3 py-1.5 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newEmailInput.trim()) {
                            setAdditionalEmails([...additionalEmails, newEmailInput.trim()]);
                            setNewEmailInput('');
                            setIsAddEmailOpen(false);
                            showToast('Email added successfully');
                          }
                        }}
                        className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-[12px] font-medium cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddEmailOpen(false)}
                        className="px-3 py-1.5 bg-[#2a2b2e] hover:bg-[#343539] text-[#cfcecd] rounded-lg text-[12px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddEmailOpen(true)}
                      className="text-[13px] text-[#cfcecd] hover:text-white cursor-pointer flex items-center gap-1.5 pt-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add new email</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-[#2e2f33]" />

                {/* Two-factor authentication */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-2">Two-factor authentication</h3>
                  <div className="p-3.5 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center gap-3 text-[13px] text-[#cfcecd]">
                    <Info className="w-4 h-4 text-[#8a8886] shrink-0" />
                    <span>
                      Two-factor authentication is not available for your account because you login with Single sign-on (SSO).
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#2e2f33]" />

                {/* Security */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-2">Security</h3>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#cfcecd]">Log out of all sessions except this current browser</span>
                    <button
                      type="button"
                      onClick={() => showToast('Logged out of other sessions')}
                      className="text-[#cfcecd] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Log out other sessions</span>
                      <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#2e2f33]" />

                {/* Deactivation */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-3">Deactivation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#cfcecd]">Remove access to all organizations and workspaces in Asana</span>
                      <button
                        type="button"
                        onClick={() => showToast('Account deactivation requested')}
                        className="text-[#cfcecd] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Deactivate account</span>
                        <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#cfcecd]">Remove me from My workspace</span>
                      <button
                        type="button"
                        onClick={() => showToast('Removed from workspace')}
                        className="text-[#cfcecd] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Remove me from this workspace</span>
                        <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2e2f33]" />

                {/* Deletion */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-2">Deletion</h3>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#cfcecd]">Deleting your account is a permanent action and cannot be undone</span>
                    <button
                      type="button"
                      onClick={() => showToast('Account deletion requested')}
                      className="text-[#cfcecd] hover:text-[#ef4444] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Delete my account</span>
                      <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: DISPLAY (IMAGE 5) ================= */}
            {activeTab === 'display' && (
              <div className="space-y-5 max-w-2xl select-text text-[13px]">
                {/* Dropdown 1: Theme */}
                <div>
                  <label className="text-[13px] font-medium text-[#cfcecd] block mb-1.5">
                    Theme
                  </label>
                  <select
                    value={displayTheme}
                    onChange={(e) => {
                      setDisplayTheme(e.target.value);
                      showToast(`Theme changed to ${e.target.value}`);
                    }}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                  >
                    <option>Sync with system settings</option>
                    <option>Dark</option>
                    <option>Light</option>
                  </select>
                </div>

                {/* Dropdown 2: Language */}
                <div>
                  <label className="text-[13px] font-medium text-[#cfcecd] block mb-1.5">
                    Language
                  </label>
                  <select
                    value={displayLanguage}
                    onChange={(e) => {
                      setDisplayLanguage(e.target.value);
                      showToast(`Language set to ${e.target.value}`);
                    }}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                  >
                    <option>English</option>
                    <option>Bahasa Indonesia</option>
                    <option>Español</option>
                    <option>Deutsch</option>
                    <option>Français</option>
                    <option>日本語</option>
                    <option>Português</option>
                    <option>繁體中文</option>
                  </select>
                </div>

                {/* Dropdown 3: First day of the week */}
                <div>
                  <label className="text-[13px] font-medium text-[#cfcecd] block mb-1.5">
                    First day of the week
                  </label>
                  <select
                    value={firstDayOfWeek}
                    onChange={(e) => {
                      setFirstDayOfWeek(e.target.value);
                      showToast(`First day of the week set to ${e.target.value}`);
                    }}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                  >
                    <option>Automatic</option>
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Saturday</option>
                  </select>
                </div>

                {/* Dropdown 4: Pop-up notification duration */}
                <div>
                  <label className="text-[13px] font-medium text-[#cfcecd] block mb-1.5">
                    Pop-up notification duration
                  </label>
                  <select
                    value={popupDuration}
                    onChange={(e) => {
                      setPopupDuration(e.target.value);
                      showToast(`Notification duration set to ${e.target.value}`);
                    }}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                  >
                    <option>5 seconds</option>
                    <option>10 seconds (default)</option>
                    <option>15 seconds</option>
                    <option>30 seconds</option>
                    <option>Never</option>
                  </select>
                </div>

                {/* Dropdown 5: Open asana.com as */}
                <div>
                  <label className="text-[13px] font-medium text-[#cfcecd] block mb-1.5">
                    Open asana.com as
                  </label>
                  <select
                    value={openAsanaAs}
                    onChange={(e) => {
                      setOpenAsanaAs(e.target.value);
                      showToast(`Open asana.com set to ${e.target.value}`);
                    }}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[#222325] border border-[#3b3c3e] text-white text-[13px] focus:outline-hidden"
                  >
                    <option>Asana.com homepage</option>
                    <option>Asana web app</option>
                  </select>
                </div>

                {/* Section: Confirmation prompts */}
                <div className="pt-4 border-t border-[#2e2f33] space-y-3">
                  <h4 className="text-white font-semibold text-[14px]">Confirmation prompts</h4>

                  <div>
                    <SettingsCheckbox
                      label="Mentioning people in tasks"
                      checked={confirmMentioning}
                      onChange={() => setConfirmMentioning(!confirmMentioning)}
                    />
                    <p className="text-[12px] text-[#8a8886] pl-6 mt-0.5">
                      Ask for confirmation before adding a mentioned person who does not already have access to the task.
                    </p>
                  </div>

                  <div>
                    <SettingsCheckbox
                      label="Assigning tasks"
                      checked={confirmAssigning}
                      onChange={() => setConfirmAssigning(!confirmAssigning)}
                    />
                    <p className="text-[12px] text-[#8a8886] pl-6 mt-0.5">
                      Ask for confirmation before assigning a task to someone who does not already have access to it.
                    </p>
                  </div>
                </div>

                {/* Section: Advanced options */}
                <div className="pt-4 border-t border-[#2e2f33] space-y-2.5">
                  <h4 className="text-white font-semibold text-[14px]">Advanced options</h4>

                  <SettingsCheckbox
                    label="Show row numbers"
                    checked={showRowNumbers}
                    onChange={() => setShowRowNumbers(!showRowNumbers)}
                  />

                  <SettingsCheckbox
                    label="Enable compact mode"
                    checked={enableCompactMode}
                    onChange={() => setEnableCompactMode(!enableCompactMode)}
                  />

                  <SettingsCheckbox
                    label="Enable color blind friendly mode (protanopia and deuteranopia)"
                    checked={colorBlindFriendly}
                    onChange={() => setColorBlindFriendly(!colorBlindFriendly)}
                  />

                  <SettingsCheckbox
                    label="Show occasional celebrations"
                    checked={occasionalCelebrations}
                    onChange={() => setOccasionalCelebrations(!occasionalCelebrations)}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB 7: NAVIGATION (IMAGE 1) ================= */}
            {activeTab === 'navigation' && (
              <div className="space-y-6 max-w-2xl select-text text-[13px]">
                {/* Navigation labels and icons */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-3">Navigation labels and icons</h3>
                  <div className="space-y-2.5">
                    <label
                      onClick={() => {
                        setNavStyle('icon-and-text');
                        showToast('Navigation style set to Icon and text');
                      }}
                      className="flex items-center gap-3 cursor-pointer select-none group"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          navStyle === 'icon-and-text'
                            ? 'border-[#3b82f6]'
                            : 'border-[#4a4c50] group-hover:border-[#6a6c70]'
                        }`}
                      >
                        {navStyle === 'icon-and-text' && (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                        )}
                      </div>
                      <span className="text-white text-[13px]">Icon and text</span>
                    </label>

                    <label
                      onClick={() => {
                        setNavStyle('icon-only');
                        showToast('Navigation style set to Icon only');
                      }}
                      className="flex items-center gap-3 cursor-pointer select-none group"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          navStyle === 'icon-only'
                            ? 'border-[#3b82f6]'
                            : 'border-[#4a4c50] group-hover:border-[#6a6c70]'
                        }`}
                      >
                        {navStyle === 'icon-only' && (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                        )}
                      </div>
                      <span className="text-white text-[13px]">Icon only</span>
                    </label>
                  </div>
                </div>

                {/* Navigation visibility and ordering */}
                <div className="pt-2">
                  <h3 className="text-white font-semibold text-[14px] mb-0.5">Navigation visibility and ordering</h3>
                  <p className="text-[12px] text-[#8a8886] mb-4">Hidden items are accessible in &apos;More&apos;</p>

                  <div className="space-y-3">
                    {/* 1. Work */}
                    <div className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={navVisibility.work}
                          onChange={() =>
                            setNavVisibility((p) => ({ ...p, work: !p.work }))
                          }
                        />
                        <AsanaFlowerIcon className="w-4 h-4 text-[#cfcecd]" />
                        <span className="text-white text-[14px] font-medium">Work</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a8886]">
                        <button
                          type="button"
                          onClick={() => showToast('Work menu options')}
                          className="p-1 hover:text-white rounded hover:bg-[#2a2b2e] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="cursor-grab p-1 hover:text-white">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* 2. Agents */}
                    <div className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={navVisibility.agents}
                          onChange={() =>
                            setNavVisibility((p) => ({ ...p, agents: !p.agents }))
                          }
                        />
                        <Bot className="w-4 h-4 text-[#cfcecd]" />
                        <span className="text-white text-[14px] font-medium">Agents</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a8886]">
                        <button
                          type="button"
                          onClick={() => showToast('Agents menu options')}
                          className="p-1 hover:text-white rounded hover:bg-[#2a2b2e] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="cursor-grab p-1 hover:text-white">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* 3. Strategy */}
                    <div className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={navVisibility.strategy}
                          onChange={() =>
                            setNavVisibility((p) => ({ ...p, strategy: !p.strategy }))
                          }
                        />
                        <Triangle className="w-4 h-4 text-[#cfcecd] fill-current" />
                        <span className="text-white text-[14px] font-medium">Strategy</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a8886]">
                        <button
                          type="button"
                          onClick={() => showToast('Strategy menu options')}
                          className="p-1 hover:text-white rounded hover:bg-[#2a2b2e] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="cursor-grab p-1 hover:text-white">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* 4. Knowledge */}
                    <div className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={navVisibility.knowledge}
                          onChange={() =>
                            setNavVisibility((p) => ({ ...p, knowledge: !p.knowledge }))
                          }
                        />
                        <BookOpen className="w-4 h-4 text-[#cfcecd]" />
                        <span className="text-white text-[14px] font-medium">Knowledge</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a8886]">
                        <button
                          type="button"
                          onClick={() => showToast('Knowledge menu options')}
                          className="p-1 hover:text-white rounded hover:bg-[#2a2b2e] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="cursor-grab p-1 hover:text-white">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* 5. People */}
                    <div className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={navVisibility.people}
                          onChange={() =>
                            setNavVisibility((p) => ({ ...p, people: !p.people }))
                          }
                        />
                        <User className="w-4 h-4 text-[#cfcecd]" />
                        <span className="text-white text-[14px] font-medium">People</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a8886]">
                        <button
                          type="button"
                          onClick={() => showToast('People menu options')}
                          className="p-1 hover:text-white rounded hover:bg-[#2a2b2e] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="cursor-grab p-1 hover:text-white">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 8: INTEGRATIONS (IMAGES 3 & 4) ================= */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 max-w-2xl select-text text-[13px]">
                {/* Asana for mobile & desktop */}
                <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#2a2b2e] flex items-center justify-center text-[#8a8886] shrink-0">
                      <Smartphone className="w-5 h-5 text-[#cfcecd]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-[14px]">Asana for mobile &amp; desktop</div>
                      <div className="text-[12px] text-[#8a8886]">Open to scan QR code and install app</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Scan QR code modal opened')}
                    className="px-3.5 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#252628] hover:bg-[#2c2d30] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#8a8886]" />
                    <span>Scan QR</span>
                  </button>
                </div>

                {/* Authorized integrations */}
                <div>
                  <h3 className="text-white font-semibold text-[14px] mb-1">Authorized integrations</h3>
                  {connectedApps.length === 0 ? (
                    <p className="text-[12px] text-[#8a8886]">
                      No integrations installed yet. Once you authorize integrations, they will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {connectedApps.map((name) => (
                        <div key={name} className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                          <span className="font-semibold text-white text-[14px]">{name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setConnectedApps(connectedApps.filter((a) => a !== name));
                              showToast(`${name} disconnected`);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#3b3c3e] bg-[#2a2b2e] hover:bg-[#343539] text-[#ef4444] text-[12px] cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Discover new integrations */}
                <div className="pt-2">
                  <h3 className="text-white font-semibold text-[14px] mb-0.5">Discover new integrations</h3>
                  <p className="text-[12px] text-[#8a8886] mb-3">
                    Connect Asana to the apps you use every day to streamline your work.
                  </p>

                  <div className="space-y-3">
                    {/* Slack */}
                    <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <SlackAppIcon />
                        <div>
                          <div className="font-semibold text-white text-[14px]">Slack</div>
                          <div className="text-[12px] text-[#8a8886]">
                            Get notified in Slack when tasks and projects are updated in Asana.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isConn = connectedApps.includes('Slack');
                          if (isConn) {
                            setConnectedApps(connectedApps.filter((a) => a !== 'Slack'));
                            showToast('Slack disconnected');
                          } else {
                            setConnectedApps([...connectedApps, 'Slack']);
                            showToast('Slack connected successfully');
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border ${
                          connectedApps.includes('Slack')
                            ? 'bg-[#2a2b2e] border-[#3b3c3e] text-[#cfcecd]'
                            : 'bg-[#2a2b2e] hover:bg-[#343539] border-[#3b3c3e] text-white'
                        }`}
                      >
                        {connectedApps.includes('Slack') ? 'Connected' : 'Connect'}
                      </button>
                    </div>

                    {/* Gmail Add-on */}
                    <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <GmailAppIcon />
                        <div>
                          <div className="font-semibold text-white text-[14px]">Gmail Add-on</div>
                          <div className="text-[12px] text-[#8a8886]">
                            Turn emails into tasks in Asana, without leaving your Gmail inbox.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isConn = connectedApps.includes('Gmail Add-on');
                          if (isConn) {
                            setConnectedApps(connectedApps.filter((a) => a !== 'Gmail Add-on'));
                            showToast('Gmail Add-on disconnected');
                          } else {
                            setConnectedApps([...connectedApps, 'Gmail Add-on']);
                            showToast('Gmail Add-on connected successfully');
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border ${
                          connectedApps.includes('Gmail Add-on')
                            ? 'bg-[#2a2b2e] border-[#3b3c3e] text-[#cfcecd]'
                            : 'bg-[#2a2b2e] hover:bg-[#343539] border-[#3b3c3e] text-white'
                        }`}
                      >
                        {connectedApps.includes('Gmail Add-on') ? 'Connected' : 'Connect'}
                      </button>
                    </div>

                    {/* Microsoft Teams */}
                    <div className="p-4 rounded-xl border border-[#2f3033] bg-[#222325] flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <TeamsAppIcon />
                        <div>
                          <div className="font-semibold text-white text-[14px]">Microsoft Teams</div>
                          <div className="text-[12px] text-[#8a8886]">
                            Connect your team&apos;s conversations to actionable items in Asana.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isConn = connectedApps.includes('Microsoft Teams');
                          if (isConn) {
                            setConnectedApps(connectedApps.filter((a) => a !== 'Microsoft Teams'));
                            showToast('Microsoft Teams disconnected');
                          } else {
                            setConnectedApps([...connectedApps, 'Microsoft Teams']);
                            showToast('Microsoft Teams connected successfully');
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border ${
                          connectedApps.includes('Microsoft Teams')
                            ? 'bg-[#2a2b2e] border-[#3b3c3e] text-[#cfcecd]'
                            : 'bg-[#2a2b2e] hover:bg-[#343539] border-[#3b3c3e] text-white'
                        }`}
                      >
                        {connectedApps.includes('Microsoft Teams') ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast('Opening Asana App Directory');
                      }}
                      className="text-[#3b82f6] hover:underline text-[13px] inline-flex items-center gap-1"
                    >
                      <span>View all integrations</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Build new integrations */}
                <div className="pt-2">
                  <h3 className="text-white font-semibold text-[14px] mb-2">Build new integrations</h3>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Opening Developer Console');
                    }}
                    className="text-[#3b82f6] hover:underline text-[13px] inline-flex items-center gap-1"
                  >
                    <span>View developer console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* ================= TAB 9: HACKS (IMAGE 2) ================= */}
            {activeTab === 'hacks' && (
              <div className="space-y-6 max-w-2xl select-text text-[13px]">
                <p className="text-[#cfcecd] leading-relaxed">
                  Hacks are experimental features that we&apos;ve been tinkering with. They are not supported features and may change, break, or disappear at any time.
                </p>

                <div className="space-y-4 pt-1">
                  {/* Hack 1: Extra delight */}
                  <div className="flex items-start gap-4">
                    <ToggleSwitch
                      checked={hackExtraDelight}
                      onChange={() => setHackExtraDelight(!hackExtraDelight)}
                    />
                    <div>
                      <div className="text-white font-semibold text-[14px] leading-tight mb-1">
                        Extra delight
                      </div>
                      <div className="text-[12px] text-[#8a8886]">
                        Adds additional celebrations and delightful surprises to the product experience.{' '}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast('Feedback form opened');
                          }}
                          className="text-[#3b82f6] hover:underline"
                        >
                          Share feedback
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#2e2f33]" />

                  {/* Hack 2: Recurring tasks in the last section of My tasks */}
                  <div className="flex items-start gap-4">
                    <ToggleSwitch
                      checked={hackRecurringLastSection}
                      onChange={() => setHackRecurringLastSection(!hackRecurringLastSection)}
                    />
                    <div>
                      <div className="text-white font-semibold text-[14px] leading-tight mb-1">
                        Recurring tasks in the last section of My tasks
                      </div>
                      <div className="text-[12px] text-[#8a8886]">
                        Makes recurring tasks always reappear in the last section of My tasks when you complete them instead of the default column.
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#2e2f33]" />

                  {/* Hack 3: Disable notifications for tasks starting & due today */}
                  <div className="flex items-start gap-4">
                    <ToggleSwitch
                      checked={hackDisableStartingDueToday}
                      onChange={() => setHackDisableStartingDueToday(!hackDisableStartingDueToday)}
                    />
                    <div>
                      <div className="text-white font-semibold text-[14px] leading-tight mb-1">
                        Disable notifications for tasks starting &amp; due today
                      </div>
                      <div className="text-[12px] text-[#8a8886]">
                        Stop receiving notifications in your inbox for tasks starting or due today.{' '}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast('Feedback form opened');
                          }}
                          className="text-[#3b82f6] hover:underline"
                        >
                          Share feedback
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Reload to Apply Changes */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Hacks updated! Reloading workspace changes...');
                      setTimeout(() => {
                        closeSettingsModal();
                      }, 1000);
                    }}
                    className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Reload to Apply Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 bg-[#1e293b] border border-[#3b82f6] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

