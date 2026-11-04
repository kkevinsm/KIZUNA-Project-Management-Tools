'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Tag,
  Boxes,
  FileText,
  Layers,
  ChevronRight,
  Search,
  Check,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Video,
  FileBox,
  ChevronDown,
  Info,
  Clock,
  Percent,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle?: string;
}

// App directory items matching Video 3 frames 024-049
const APPS_LIST = [
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Communication',
    iconColor: '#2d8cff',
    developer: 'Asana',
    summary: 'Lead more actionable and focused meetings with Zoom + Asana before, during, and after.',
    featured: true,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Productivity',
    iconColor: '#4285f4',
    developer: 'Asana',
    summary: 'Turn meetings into tasks, schedule calendar events, and manage deadlines seamlessly.',
    featured: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    iconColor: '#e01e5a',
    developer: 'Slack',
    summary: 'Turn conversations into actionable work without leaving your Slack channels.',
    featured: true,
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Marketing & Design',
    iconColor: '#f24e1e',
    developer: 'Figma',
    summary: 'Embed interactive design files and collaborate on UI mockups right inside tasks.',
    featured: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    iconColor: '#000000',
    developer: 'Notion',
    summary: 'Sync documentation, knowledge bases, and tasks across team workspaces.',
    featured: false,
  },
  {
    id: 'lucidchart',
    name: 'Lucidchart',
    category: 'Productivity',
    iconColor: '#f36d24',
    developer: 'Lucid Software',
    summary: 'Embed flowcharts, diagrams, and process workflows directly inside tasks.',
    featured: false,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'Productivity',
    iconColor: '#0061ff',
    developer: 'Dropbox',
    summary: 'Attach shared files and keep shared assets organized in real-time.',
    featured: false,
  },
  {
    id: 'jira',
    name: 'Jira Cloud',
    category: 'Product Management',
    iconColor: '#0052cc',
    developer: 'Atlassian',
    summary: 'Link engineering Jira issues to strategic Asana initiatives seamlessly.',
    featured: false,
  },
];

const APP_CATEGORIES = [
  'Featured apps',
  'New & noteworthy',
  'Communication',
  'Reporting',
  'Marketing & Design',
  'Product Management',
  'Sales',
  'Productivity',
  'Made by Developers',
  'View all apps',
];

export default function CustomizeDrawer({
  isOpen,
  onClose,
  contextTitle = 'This project',
}: CustomizeDrawerProps) {
  const { currentUser } = useApp();

  // Sub-modal triggers matching Video 3
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState<typeof APPS_LIST[0] | null>(null);
  const [installedApps, setInstalledApps] = useState<string[]>(['zoom']);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAIStudioModalOpen, setIsAIStudioModalOpen] = useState(false);

  // Field modal state
  const [fieldTab, setFieldTab] = useState<'new' | 'library'>('new');
  const [fieldTitle, setFieldTitle] = useState('');
  const [fieldType, setFieldType] = useState('Single-select');
  const [fieldOptions, setFieldOptions] = useState([
    { id: '1', name: 'High', color: '#e54b4b' },
    { id: '2', name: 'Medium', color: '#f5b324' },
    { id: '3', name: 'Low', color: '#4573d2' },
  ]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Directory filters
  const [selectedAppCategory, setSelectedAppCategory] = useState('Featured apps');
  const [appSearchQuery, setAppSearchQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleInstallApp = (appId: string) => {
    if (!installedApps.includes(appId)) {
      setInstalledApps((prev) => [...prev, appId]);
      showToast('App added to project');
    } else {
      showToast('App is already installed');
    }
  };

  const handleCreateField = () => {
    if (!fieldTitle.trim()) return;
    showToast(`Custom field "${fieldTitle.trim()}" created`);
    setIsFieldModalOpen(false);
    setFieldTitle('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Right-Side Drawer Panel (matching Video 3 frame 050/055) */}
      <div className="fixed inset-y-0 right-0 z-40 w-[360px] bg-[#1e1f21] border-l border-[#2e2f32] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-[#2e2f32] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-white tracking-tight">Customize</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Split button: + Add ⌄ */}
            <div className="relative group">
              <button
                onClick={() => setIsFieldModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252628] hover:bg-[#2e3034] border border-[#37383b] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
              title="Close customize"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: This project / This view */}
          <div className="space-y-1.5">
            <div className="px-2">
              <h3 className="text-[13px] font-semibold text-white">{contextTitle}</h3>
              <p className="text-[11.5px] text-[#8a8886]">
                View and edit features on this project
              </p>
            </div>

            <div className="space-y-1 pt-1.5">
              {/* AI Studio */}
              <button
                onClick={() => setIsAIStudioModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#9b6ade] group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">AI Studio</div>
                    <div className="text-[11px] text-[#8a8886]">Smart status, summaries & Q&A</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>

              {/* Automations */}
              <button
                onClick={() => setIsRulesModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#f5b324] group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Automations</div>
                    <div className="text-[11px] text-[#8a8886]">2 active rules</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          <div className="border-t border-[#2e2f32]" />

          {/* Section 2: Workflow features */}
          <div className="space-y-1.5">
            <div className="px-2">
              <h3 className="text-[13px] font-semibold text-white">Workflow features</h3>
            </div>

            <div className="space-y-1 pt-1.5">
              {/* Fields */}
              <button
                onClick={() => setIsFieldModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#4573d2] group-hover:scale-105 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Fields</div>
                    <div className="text-[11px] text-[#8a8886]">Priority, Status, Due date</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>

              {/* Apps */}
              <button
                onClick={() => setIsAppsModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#4cd195] group-hover:scale-105 transition-transform">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Apps</div>
                    <div className="text-[11px] text-[#8a8886]">
                      {installedApps.length} connected (Zoom, etc.)
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>

              {/* Forms */}
              <button
                onClick={() => showToast("Form intake builder opened")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#f27238] group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Forms</div>
                    <div className="text-[11px] text-[#8a8886]">Create work intake forms</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>

              {/* Bundles */}
              <button
                onClick={() => showToast("Workflow bundles manager opened")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#252628] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#28292b] border border-[#37383b] flex items-center justify-center text-[#3bb2b8] group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Bundles</div>
                    <div className="text-[11px] text-[#8a8886]">Standardize across projects</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. Add Apps Directory Modal (Matching Video 3 frames 024-049)  */}
      {/* ============================================================== */}
      {isAppsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[960px] h-[640px] flex flex-col shadow-2xl overflow-hidden">
            {/* If app detail is selected (matching frame 045: Zoom detail view) */}
            {selectedAppDetail ? (
              <div className="flex flex-col h-full">
                {/* Header with back */}
                <div className="h-14 px-6 border-b border-[#2e2f32] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAppDetail(null)}
                    className="flex items-center gap-2 text-[13px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Browse apps</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAppDetail(null);
                      setIsAppsModalOpen(false);
                    }}
                    className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#28292c]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Detail Body */}
                <div className="flex-1 p-8 overflow-y-auto space-y-6 max-w-[720px] mx-auto w-full">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[24px] font-bold shadow-md"
                      style={{ backgroundColor: selectedAppDetail.iconColor }}
                    >
                      {selectedAppDetail.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-[22px] font-bold text-white">{selectedAppDetail.name}</h2>
                      <p className="text-[12.5px] text-[#8a8886]">By {selectedAppDetail.developer}</p>
                    </div>
                    <div className="ml-auto">
                      <button
                        onClick={() => handleInstallApp(selectedAppDetail.id)}
                        className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                          installedApps.includes(selectedAppDetail.id)
                            ? 'bg-[#4cd195]/20 text-[#4cd195] border border-[#4cd195]/40'
                            : 'bg-[#4573d2] hover:bg-[#3b66be] text-white'
                        }`}
                      >
                        {installedApps.includes(selectedAppDetail.id) ? 'Installed' : '+ Add to project'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#2e2f32]">
                    <h3 className="text-[15px] font-bold text-white">About the app</h3>
                    <p className="text-[13.5px] text-[#cfcecd] leading-relaxed">
                      {selectedAppDetail.summary}
                    </p>
                    <ul className="space-y-2 text-[13px] text-[#bdbbb9] list-disc list-inside pt-2">
                      <li>
                        <strong className="text-white">Prepare purposeful meetings:</strong> Create or link meetings directly from Asana tasks.
                      </li>
                      <li>
                        <strong className="text-white">Make meetings actionable:</strong> Reduce app switching by opening tasks directly inside calls.
                      </li>
                      <li>
                        <strong className="text-white">Keep work moving forward:</strong> Automatically attach recordings and summaries to tasks.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Main Apps Browser */
              <div className="flex flex-col h-full">
                {/* Search & Header */}
                <div className="h-16 px-6 border-b border-[#2e2f32] flex items-center justify-between gap-4">
                  <h2 className="text-[18px] font-bold text-white">Add apps</h2>

                  <div className="flex-1 max-w-[400px] relative">
                    <Search className="w-4 h-4 text-[#8a8886] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      placeholder="Search all apps..."
                      className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl pl-9 pr-3.5 py-1.5 text-[13px] text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => setIsAppsModalOpen(false)}
                    className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body: Sidebar Categories + Grid */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Categories */}
                  <div className="w-[200px] border-r border-[#2e2f32] p-3 space-y-1 overflow-y-auto">
                    {APP_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedAppCategory(cat)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                          selectedAppCategory === cat
                            ? 'bg-[#2a2b2e] text-white'
                            : 'text-[#8a8886] hover:bg-[#242528] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Right App Cards Grid */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {APPS_LIST.filter((app) => {
                        if (appSearchQuery.trim()) {
                          return app.name.toLowerCase().includes(appSearchQuery.toLowerCase());
                        }
                        if (selectedAppCategory === 'Featured apps') return app.featured;
                        if (selectedAppCategory === 'View all apps') return true;
                        return app.category === selectedAppCategory;
                      }).map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedAppDetail(app)}
                          className="p-4 rounded-xl border border-[#2e3034] hover:border-[#4573d2] bg-[#141517] hover:bg-[#1a1b1d] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[16px] shadow-sm shrink-0"
                              style={{ backgroundColor: app.iconColor }}
                            >
                              {app.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[13.5px] font-semibold text-white group-hover:text-[#4573d2] truncate">
                                {app.name}
                              </h3>
                              <p className="text-[11px] text-[#8a8886] truncate">By {app.developer}</p>
                            </div>
                          </div>

                          <p className="text-[11.5px] text-[#8a8886] line-clamp-2 leading-relaxed">
                            {app.summary}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="text-[#8a8886]">{app.category}</span>
                            {installedApps.includes(app.id) && (
                              <span className="text-[#4cd195] flex items-center gap-1 font-medium">
                                <Check className="w-3 h-3" />
                                Installed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. Add Field Modal (Matching Video 3 frames 060-068)          */}
      {/* ============================================================== */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[560px] p-6 space-y-5 shadow-2xl">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-[18px] font-bold text-white tracking-tight">Add field</h3>
                <p className="text-[12px] text-[#8a8886]">This field will be added to {contextTitle}</p>
              </div>

              <button
                onClick={() => setIsFieldModalOpen(false)}
                className="p-1 rounded text-[#8a8886] hover:text-white hover:bg-[#28292c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs: Create new / Choose from library */}
            <div className="flex items-center gap-4 border-b border-[#2e2f32] text-[13px] font-medium">
              <button
                onClick={() => setFieldTab('new')}
                className={`pb-2.5 transition-colors cursor-pointer relative ${
                  fieldTab === 'new'
                    ? 'text-white font-semibold'
                    : 'text-[#8a8886] hover:text-white'
                }`}
              >
                Create new
                {fieldTab === 'new' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2]" />
                )}
              </button>

              <button
                onClick={() => setFieldTab('library')}
                className={`pb-2.5 transition-colors cursor-pointer relative ${
                  fieldTab === 'library'
                    ? 'text-white font-semibold'
                    : 'text-[#8a8886] hover:text-white'
                }`}
              >
                Choose from library
                {fieldTab === 'library' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2]" />
                )}
              </button>
            </div>

            {fieldTab === 'new' ? (
              /* Create New Field Form */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-white mb-1.5">
                      Field title *
                    </label>
                    <input
                      type="text"
                      value={fieldTitle}
                      onChange={(e) => setFieldTitle(e.target.value)}
                      placeholder="Priority, Stage, Status..."
                      autoFocus
                      className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-[13.5px] text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-white mb-1.5">
                      Field type *
                    </label>
                    <select
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value)}
                      className="w-full bg-[#141517] border border-[#37383b] focus:border-[#4573d2] rounded-xl px-3.5 py-2 text-[13.5px] text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Single-select">Single-select</option>
                      <option value="Multi-select">Multi-select</option>
                      <option value="Number">Number</option>
                      <option value="Date">Date</option>
                      <option value="People">People</option>
                      <option value="Text">Text</option>
                    </select>
                  </div>
                </div>

                {/* Options (for single/multi select) */}
                {(fieldType === 'Single-select' || fieldType === 'Multi-select') && (
                  <div className="space-y-2">
                    <label className="block text-[12px] font-semibold text-white">Options *</label>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {fieldOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const newOpts = [...fieldOptions];
                              newOpts[idx].name = e.target.value;
                              setFieldOptions(newOpts);
                            }}
                            className="flex-1 bg-[#141517] border border-[#37383b] rounded-lg px-2.5 py-1 text-[13px] text-white focus:outline-none"
                          />
                          <button
                            onClick={() =>
                              setFieldOptions(fieldOptions.filter((_, i) => i !== idx))
                            }
                            className="text-[#8a8886] hover:text-white p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        placeholder="Type an option name..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newOptionInput.trim()) {
                            e.preventDefault();
                            setFieldOptions([
                              ...fieldOptions,
                              {
                                id: String(Date.now()),
                                name: newOptionInput.trim(),
                                color: '#4573d2',
                              },
                            ]);
                            setNewOptionInput('');
                          }
                        }}
                        className="flex-1 bg-[#141517] border border-[#37383b] rounded-lg px-2.5 py-1 text-[13px] text-white placeholder-[#717377] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newOptionInput.trim()) {
                            setFieldOptions([
                              ...fieldOptions,
                              {
                                id: String(Date.now()),
                                name: newOptionInput.trim(),
                                color: '#4573d2',
                              },
                            ]);
                            setNewOptionInput('');
                          }
                        }}
                        className="px-3 py-1 bg-[#252628] hover:bg-[#2e3034] text-white text-[12px] font-medium rounded-lg border border-[#37383b]"
                      >
                        + Add option
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkboxes matching Asana */}
                <div className="space-y-2 pt-2 border-t border-[#2e2f32]">
                  <label className="flex items-center gap-2.5 text-[12.5px] text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0"
                    />
                    <span>Add to My workspace's field library</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-[12.5px] text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0"
                    />
                    <span>Notify collaborators when this field's value is changed</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setIsFieldModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#37383b] text-[#cfcecd] hover:bg-[#28292c] text-[13px] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateField}
                    disabled={!fieldTitle.trim()}
                    className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                      fieldTitle.trim()
                        ? 'bg-[#4573d2] hover:bg-[#3b66be] text-white cursor-pointer'
                        : 'bg-[#252628] text-[#5d5f63] cursor-not-allowed border border-[#303236]'
                    }`}
                  >
                    Create field
                  </button>
                </div>
              </div>
            ) : (
              /* Choose from library tab */
              <div className="space-y-3">
                <div className="p-3 bg-[#141517] border border-[#2e3034] rounded-xl flex items-center justify-between">
                  <span className="text-[13px] text-white font-medium">Find a field in My workspace</span>
                  <SlidersHorizontal className="w-4 h-4 text-[#8a8886]" />
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {[
                    { name: 'Priority', desc: 'High, Medium, Low indicators', icon: Tag },
                    { name: 'Percent allocation', desc: 'Percentage of a person\'s capacity spent', icon: Percent },
                    { name: 'Estimated time', desc: 'Measure workload duration on tasks', icon: Clock },
                  ].map((field) => (
                    <div
                      key={field.name}
                      onClick={() => {
                        showToast(`Field "${field.name}" added to project`);
                        setIsFieldModalOpen(false);
                      }}
                      className="p-3 rounded-xl border border-[#2e3034] hover:border-[#4573d2] bg-[#141517] hover:bg-[#1a1b1d] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <field.icon className="w-4 h-4 text-[#4573d2]" />
                        <div>
                          <div className="text-[13px] font-medium text-white">{field.name}</div>
                          <div className="text-[11.5px] text-[#8a8886]">{field.desc}</div>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#4573d2] font-medium">+ Add</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. Automations Modal                                           */}
      {/* ============================================================== */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[560px] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#f5b324]" />
                <h3 className="text-[18px] font-bold text-white tracking-tight">Automations & Rules</h3>
              </div>
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="p-1 rounded text-[#8a8886] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { trigger: 'When task is marked complete', action: 'Move task to Completed section', active: true },
                { trigger: 'When due date is approaching in 24 hours', action: 'Set priority to High and notify assignee', active: true },
                { trigger: 'When new task is created', action: 'Assign to Kevin Safrisal', active: false },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#141517] border border-[#2e3034] rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-[13px] font-semibold text-white">{rule.trigger}</div>
                    <div className="text-[12px] text-[#8a8886]">→ {rule.action}</div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      rule.active ? 'bg-[#4cd195]/20 text-[#4cd195]' : 'bg-[#252628] text-[#8a8886]'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  showToast("New automation rule created");
                  setIsRulesModalOpen(false);
                }}
                className="px-4 py-2 bg-[#4573d2] hover:bg-[#3b66be] text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                + Create new rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. AI Studio Modal                                             */}
      {/* ============================================================== */}
      {isAIStudioModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1e1f21] border border-[#38393c] rounded-2xl w-full max-w-[560px] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9b6ade]" />
                <h3 className="text-[18px] font-bold text-white tracking-tight">Asana AI Studio</h3>
              </div>
              <button
                onClick={() => setIsAIStudioModalOpen(false)}
                className="p-1 rounded text-[#8a8886] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-[#cfcecd] leading-relaxed">
              Supercharge your workflow with intelligent automations, task summaries, and automated status reports.
            </p>

            <div className="space-y-2.5">
              {[
                { title: 'Smart Status Updates', desc: 'Draft executive portfolio and project progress in seconds based on completed tasks.' },
                { title: 'Smart Summaries', desc: 'Summarize task action items, comment threads, and attachment highlights.' },
                { title: 'Smart Answers & Q&A', desc: 'Ask questions about project blockers, next steps, and teammate assignments.' },
              ].map((feat, idx) => (
                <div key={idx} className="p-3 bg-[#141517] border border-[#2e3034] rounded-xl">
                  <div className="text-[13.5px] font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#9b6ade]" />
                    <span>{feat.title}</span>
                  </div>
                  <div className="text-[12px] text-[#8a8886] mt-0.5">{feat.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  showToast("AI Studio features enabled for this project");
                  setIsAIStudioModalOpen(false);
                }}
                className="px-4 py-2 bg-[#9b6ade] hover:bg-[#8554c9] text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Enable AI Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141517] border border-[#37383b] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#4cd195]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

