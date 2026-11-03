'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  File,
  Download,
  Trash2,
  ExternalLink,
  ArrowRightToLine,
  ArrowLeft,
  Columns2,
  Calendar,
  Clock,
  User,
  Folder,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import EmojiPickerPopover from '@/components/common/EmojiPickerPopover';

export interface DashboardFile {
  id: string;
  name: string;
  size: number;
  fileType: 'image' | 'pdf' | 'spreadsheet' | 'presentation' | 'video' | 'audio' | 'asana_page' | 'other';
  fileSource: 'task' | 'project' | 'external';
  attachedToName: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  lastModified: string;
}

interface TaskFilesProps {
  tasks: Task[];
  projectName?: string;
}

const FILE_TYPE_OPTIONS = [
  { id: 'asana_page', label: 'Asana page' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'gif', label: 'GIF' },
  { id: 'spreadsheet', label: 'Spreadsheet' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'other', label: 'Other' },
];

export default function TaskFiles({ tasks, projectName = 'My Tasks' }: TaskFilesProps) {
  const { viewConfigs, updateViewConfig } = useApp();
  const filesConfig = viewConfigs['Files'] || { name: 'Files', icon: '' };

  const [files, setFiles] = useState<DashboardFile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kizuna_dashboard_files');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  // UI Popovers & Drawers
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'upload' | 'google_drive' | 'onedrive' | 'box' | 'dropbox'>('upload');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);

  // Filter States
  const [quickFilterAsanaPages, setQuickFilterAsanaPages] = useState(false);
  const [quickFilterImages, setQuickFilterImages] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedFileSource, setSelectedFileSource] = useState<'all' | 'task' | 'project'>('all');
  const [isTypeFilterDropdownOpen, setIsTypeFilterDropdownOpen] = useState(false);
  const [activeRuleType, setActiveRuleType] = useState<boolean>(false);
  const [activeRuleSource, setActiveRuleSource] = useState<boolean>(false);

  // Sort & Group States
  const [sortField, setSortField] = useState<'none' | 'file_type' | 'alphabetical' | 'last_modified'>('none');
  const [groupField, setGroupField] = useState<'none' | 'file_type' | 'file_source'>('none');

  // View Mode: Grid or List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Options Drawer sub-state
  const [optionsSubView, setOptionsSubView] = useState<'main' | 'columns'>('main');
  const [visibleColumns, setVisibleColumns] = useState({
    attachedTo: true,
    fileType: true,
    lastModified: true,
  });

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [viewTitle, setViewTitle] = useState(filesConfig.name || 'Files');
  const [viewIcon, setViewIcon] = useState(filesConfig.icon || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  // Sync title & icon from context
  useEffect(() => {
    if (filesConfig.name) setViewTitle(filesConfig.name);
    if (filesConfig.icon !== undefined) setViewIcon(filesConfig.icon);
  }, [filesConfig.name, filesConfig.icon]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addFileMenuRef.current && !addFileMenuRef.current.contains(e.target as Node)) {
        setIsAddFileOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setIsGroupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistFiles = (next: DashboardFile[]) => {
    setFiles(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kizuna_dashboard_files', JSON.stringify(next));
    }
  };

  // Helper to infer file type from extension/mime
  const getFileTypeCategory = (fileName: string): DashboardFile['fileType'] => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'ico'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx', 'key'].includes(ext)) return 'presentation';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'aac', 'm4a'].includes(ext)) return 'audio';
    if (ext === 'gif') return 'image';
    return 'other';
  };

  // Handle uploading real files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newEntries: DashboardFile[] = [];

    Array.from(uploadedFiles).forEach((file) => {
      const type = getFileTypeCategory(file.name);
      let thumbUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        thumbUrl = URL.createObjectURL(file);
      }

      newEntries.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        fileType: type,
        fileSource: 'project',
        attachedToName: projectName,
        url: thumbUrl || '#',
        thumbnailUrl: thumbUrl,
        uploadedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastModified: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    persistFiles([...newEntries, ...files]);
    setIsAddFileOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Google Drive / External attach
  const handleAttachGoogleDrive = () => {
    if (!googleDriveUrl.trim()) return;
    const name = googleDriveUrl.split('/').pop()?.split('?')[0] || 'Google Drive Document';
    const newFile: DashboardFile = {
      id: `file-${Date.now()}`,
      name: decodeURIComponent(name),
      size: 0,
      fileType: 'asana_page',
      fileSource: 'external',
      attachedToName: projectName,
      url: googleDriveUrl,
      uploadedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastModified: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    persistFiles([newFile, ...files]);
    setGoogleDriveUrl('');
    setIsAddFileOpen(false);
  };

  const handleDeleteFile = (id: string) => {
    persistFiles(files.filter((f) => f.id !== id));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setQuickFilterAsanaPages(false);
    setQuickFilterImages(false);
    setSelectedFileTypes([]);
    setSelectedFileSource('all');
    setActiveRuleType(false);
    setActiveRuleSource(false);
  };

  const isFilterActive =
    quickFilterAsanaPages ||
    quickFilterImages ||
    selectedFileTypes.length > 0 ||
    selectedFileSource !== 'all';

  // Filter & Search Evaluation
  const filteredFiles = files.filter((f) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.attachedToName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (quickFilterAsanaPages && f.fileType !== 'asana_page') return false;
    if (quickFilterImages && f.fileType !== 'image') return false;
    if (selectedFileTypes.length > 0 && !selectedFileTypes.includes(f.fileType)) return false;
    if (selectedFileSource !== 'all' && f.fileSource !== selectedFileSource) return false;
    return true;
  });

  // Sort Evaluation
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortField === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    if (sortField === 'file_type') {
      return a.fileType.localeCompare(b.fileType);
    }
    if (sortField === 'last_modified') {
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  // Grouping Evaluation
  const groupedFiles: Record<string, DashboardFile[]> = {};
  if (groupField === 'file_type') {
    sortedFiles.forEach((f) => {
      const groupName = f.fileType.toUpperCase();
      if (!groupedFiles[groupName]) groupedFiles[groupName] = [];
      groupedFiles[groupName].push(f);
    });
  } else if (groupField === 'file_source') {
    sortedFiles.forEach((f) => {
      const groupName = f.fileSource === 'task' ? 'Attached to Task' : f.fileSource === 'project' ? 'Attached to Project' : 'External Link';
      if (!groupedFiles[groupName]) groupedFiles[groupName] = [];
      groupedFiles[groupName].push(f);
    });
  } else {
    groupedFiles['ALL'] = sortedFiles;
  }

  // File icon generator
  const renderFileIcon = (type: DashboardFile['fileType']) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-5 h-5 text-[#f79bb7]" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-[#f06a6a]" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-[#70db8a]" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-[#7fc2f5]" />;
      case 'audio':
        return <FileAudio className="w-5 h-5 text-[#f1bd3e]" />;
      case 'asana_page':
        return <FileText className="w-5 h-5 text-[#9d9af7]" />;
      default:
        return <File className="w-5 h-5 text-[#8a8886]" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 bg-[#1e1f21] flex flex-col overflow-hidden text-white select-none">
      {/* Hidden File Input for Native Pickers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Top Toolbar (Matching Asana Video Frame 00:00 & 00:17 - 00:52) */}
      <div className="h-12 px-8 border-b border-[#2b2c2e] flex items-center justify-between shrink-0">
        {/* Left: + Add file button & Dropdown */}
        <div className="relative" ref={addFileMenuRef}>
          <button
            type="button"
            onClick={() => setIsAddFileOpen(!isAddFileOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2d2e32] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add file</span>
          </button>

          {/* Add file Dropdown matching Video 00:01 - 00:10 */}
          {isAddFileOpen && (
            <div className="absolute left-0 mt-1.5 w-[320px] bg-[#252628] border border-[#37383b] rounded-xl shadow-2xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-100">
              {/* Tab options bar */}
              <div className="flex items-center border-b border-[#323438] px-2 pt-2 gap-1 text-[12px] overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveAddTab('upload')}
                  className={`px-2.5 py-1.5 rounded-t-lg transition-colors cursor-pointer ${
                    activeAddTab === 'upload'
                      ? 'bg-[#1e1f21] text-white font-medium border-t-2 border-[#4573d2]'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('google_drive')}
                  className={`px-2.5 py-1.5 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeAddTab === 'google_drive'
                      ? 'bg-[#1e1f21] text-white font-medium border-t-2 border-[#4573d2]'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  Google Drive
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('onedrive')}
                  className={`px-2.5 py-1.5 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeAddTab === 'onedrive'
                      ? 'bg-[#1e1f21] text-white font-medium border-t-2 border-[#4573d2]'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  OneDrive/SharePoint
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('box')}
                  className={`px-2.5 py-1.5 rounded-t-lg transition-colors cursor-pointer ${
                    activeAddTab === 'box'
                      ? 'bg-[#1e1f21] text-white font-medium border-t-2 border-[#4573d2]'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  Box
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('dropbox')}
                  className={`px-2.5 py-1.5 rounded-t-lg transition-colors cursor-pointer ${
                    activeAddTab === 'dropbox'
                      ? 'bg-[#1e1f21] text-white font-medium border-t-2 border-[#4573d2]'
                      : 'text-[#8a8886] hover:text-white'
                  }`}
                >
                  Dropbox
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 bg-[#1e1f21]">
                {activeAddTab === 'upload' && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <p className="text-[12px] text-[#8a8886] mb-3">
                      Select a file from your computer
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3562be] text-white text-[12.5px] font-medium transition-colors cursor-pointer shadow-sm"
                    >
                      Choose a file
                    </button>
                  </div>
                )}

                {activeAddTab === 'google_drive' && (
                  <div className="space-y-3">
                    <label className="text-[11.5px] text-[#8a8886] block">
                      Paste a Google Drive or folder URL
                    </label>
                    <input
                      type="url"
                      value={googleDriveUrl}
                      onChange={(e) => setGoogleDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full h-9 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-white text-[12.5px] outline-none focus:border-[#4573d2]"
                    />
                    <button
                      type="button"
                      onClick={handleAttachGoogleDrive}
                      className="w-full py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3562be] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                )}

                {['onedrive', 'box', 'dropbox'].includes(activeAddTab) && (
                  <div className="py-4 text-center text-[12.5px] text-[#8a8886]">
                    <p>Connect your {activeAddTab.toUpperCase()} account to select files.</p>
                    <button
                      type="button"
                      onClick={() => alert(`Connect ${activeAddTab.toUpperCase()}`)}
                      className="mt-3 px-3.5 py-1 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2d2e32] text-white text-[12px] cursor-pointer"
                    >
                      Connect account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Toolbar: Filter, Sort, Group, View mode, Options, Search */}
        <div className="flex items-center gap-2">
          {/* 1. Filter Button & Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                isFilterActive
                  ? 'bg-[#0c326f] text-[#7fc2f5] border border-[#1b4e9b]'
                  : 'text-[#8a8886] hover:text-white hover:bg-[#252628]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isFilterActive ? 'Filter: Active' : 'Filter'}</span>
              {isFilterActive && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilters();
                  }}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>

            {/* Filter Popover matching Video 00:17 - 00:38 */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-1.5 w-[300px] bg-[#1e1f21] border border-[#323438] rounded-xl shadow-2xl p-4 z-40 text-white animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-[#2d2f33]">
                  <span className="text-[13px] font-semibold">Filters</span>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11.5px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {/* Quick filters */}
                <div className="py-3 border-b border-[#2d2f33]">
                  <span className="text-[11px] text-[#8a8886] font-medium block mb-2">
                    Quick filters
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setQuickFilterAsanaPages(!quickFilterAsanaPages)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                        quickFilterAsanaPages
                          ? 'border-[#4573d2] bg-[#172b4d] text-[#7fc2f5]'
                          : 'border-[#37383b] bg-[#252628] text-[#8a8886] hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Asana Pages</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickFilterImages(!quickFilterImages)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-colors cursor-pointer ${
                        quickFilterImages
                          ? 'border-[#4573d2] bg-[#172b4d] text-[#7fc2f5]'
                          : 'border-[#37383b] bg-[#252628] text-[#8a8886] hover:text-white'
                      }`}
                    >
                      <FileImage className="w-3 h-3" />
                      <span>Images</span>
                    </button>
                  </div>
                </div>

                {/* Active Rules */}
                <div className="py-2 space-y-2">
                  {activeRuleType && (
                    <div className="flex items-center justify-between bg-[#252628] border border-[#37383b] rounded-lg px-2.5 py-1.5 text-[12.5px]">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#8a8886]" />
                        <span>File type</span>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsTypeFilterDropdownOpen(!isTypeFilterDropdownOpen)}
                          className="text-[11.5px] text-[#4573d2] flex items-center gap-1 cursor-pointer"
                        >
                          <span>{selectedFileTypes.length ? `${selectedFileTypes.length} selected` : 'Select'}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {isTypeFilterDropdownOpen && (
                          <div className="absolute right-0 top-6 w-44 bg-[#252628] border border-[#37383b] rounded-lg shadow-2xl py-1 z-50 text-[12px]">
                            {FILE_TYPE_OPTIONS.map((opt) => {
                              const isChecked = selectedFileTypes.includes(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedFileTypes(selectedFileTypes.filter((t) => t !== opt.id));
                                    } else {
                                      setSelectedFileTypes([...selectedFileTypes, opt.id]);
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-[#2f3135] text-white cursor-pointer"
                                >
                                  <span>{opt.label}</span>
                                  {isChecked && <Check className="w-3 h-3 text-[#4573d2]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRuleType(false);
                          setSelectedFileTypes([]);
                        }}
                        className="text-[#8a8886] hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {activeRuleSource && (
                    <div className="flex items-center justify-between bg-[#252628] border border-[#37383b] rounded-lg px-2.5 py-1.5 text-[12.5px]">
                      <div className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-[#8a8886]" />
                        <span>File source</span>
                      </div>
                      <select
                        value={selectedFileSource}
                        onChange={(e) => setSelectedFileSource(e.target.value as any)}
                        className="bg-transparent text-[11.5px] text-[#4573d2] outline-none cursor-pointer"
                      >
                        <option value="all">All</option>
                        <option value="project">Attached to project</option>
                        <option value="task">Attached to task</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRuleSource(false);
                          setSelectedFileSource('all');
                        }}
                        className="text-[#8a8886] hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* + Add filter dropdown */}
                <div className="pt-2">
                  <div className="relative group/addfilter">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-[12px] text-[#4573d2] hover:text-[#6a98f0] font-medium cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add filter</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="hidden group-hover/addfilter:block absolute left-0 top-6 w-40 bg-[#252628] border border-[#37383b] rounded-lg shadow-2xl py-1 z-50 text-[12px]">
                      <button
                        type="button"
                        onClick={() => setActiveRuleType(true)}
                        className="w-full px-3 py-1.5 text-left text-white hover:bg-[#2f3135] cursor-pointer flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#8a8886]" />
                        <span>File type</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRuleSource(true)}
                        className="w-full px-3 py-1.5 text-left text-white hover:bg-[#2f3135] cursor-pointer flex items-center gap-2"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#8a8886]" />
                        <span>File source</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Sort Button & Popover */}
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                sortField !== 'none'
                  ? 'bg-[#0c326f] text-[#7fc2f5] border border-[#1b4e9b]'
                  : 'text-[#8a8886] hover:text-white hover:bg-[#252628]'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortField === 'file_type'
                  ? 'Sort: File type'
                  : sortField === 'alphabetical'
                  ? 'Sort: Alphabetical'
                  : sortField === 'last_modified'
                  ? 'Sort: Last modified'
                  : 'Sort'}
              </span>
              {sortField !== 'none' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortField('none');
                  }}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-xl shadow-2xl py-1.5 z-40 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setSortField('file_type');
                    setIsSortOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#28292b] text-white cursor-pointer"
                >
                  <span>File type</span>
                  {sortField === 'file_type' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortField('alphabetical');
                    setIsSortOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#28292b] text-white cursor-pointer"
                >
                  <span>Alphabetical</span>
                  {sortField === 'alphabetical' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortField('last_modified');
                    setIsSortOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#28292b] text-white cursor-pointer"
                >
                  <span>Last modified</span>
                  {sortField === 'last_modified' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
              </div>
            )}
          </div>

          {/* 3. Group Button & Popover */}
          <div className="relative" ref={groupMenuRef}>
            <button
              type="button"
              onClick={() => setIsGroupOpen(!isGroupOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                groupField !== 'none'
                  ? 'bg-[#0c326f] text-[#7fc2f5] border border-[#1b4e9b]'
                  : 'text-[#8a8886] hover:text-white hover:bg-[#252628]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {groupField === 'file_type'
                  ? 'Group: File type'
                  : groupField === 'file_source'
                  ? 'Group: File source'
                  : 'Group'}
              </span>
              {groupField !== 'none' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupField('none');
                  }}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>

            {isGroupOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-xl shadow-2xl py-1.5 z-40 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setGroupField('file_type');
                    setIsGroupOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#28292b] text-white cursor-pointer"
                >
                  <span>File type</span>
                  {groupField === 'file_type' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroupField('file_source');
                    setIsGroupOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#28292b] text-white cursor-pointer"
                >
                  <span>File source</span>
                  {groupField === 'file_source' && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                </button>
              </div>
            )}
          </div>

          {/* 4. View Mode Toggle (Grid vs List) */}
          <div className="flex items-center bg-[#252628] border border-[#37383b] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#37393d] text-white'
                  : 'text-[#8a8886] hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#37393d] text-white'
                  : 'text-[#8a8886] hover:text-white'
              }`}
              title="List view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. Options Drawer Button */}
          <button
            type="button"
            onClick={() => setIsOptionsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>

          {/* 6. Search Bar / Icon */}
          <div className="relative flex items-center">
            {isSearchActive ? (
              <div className="flex items-center bg-[#252628] border border-[#37383b] rounded-lg px-2 py-1">
                <Search className="w-3.5 h-3.5 text-[#8a8886] mr-1.5" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter files..."
                  className="bg-transparent text-[12px] text-white outline-none w-28"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchActive(false);
                  }}
                  className="text-[#8a8886] hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchActive(true)}
                className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
                title="Search files"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Files View Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* EMPTY STATE: Matches Video Frame 00:00 & 00:15 */}
        {sortedFiles.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200">
            {/* Exact Asana Fanned Cards Illustration */}
            <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
                {/* Back card 1 */}
                <rect
                  x="20"
                  y="25"
                  width="50"
                  height="65"
                  rx="6"
                  transform="rotate(-15 45 55)"
                  fill="#ffffff"
                  stroke="#e2e4e8"
                  strokeWidth="1.5"
                />
                {/* Back card 2 */}
                <rect
                  x="50"
                  y="20"
                  width="50"
                  height="65"
                  rx="6"
                  transform="rotate(18 75 52)"
                  fill="#ffffff"
                  stroke="#e2e4e8"
                  strokeWidth="1.5"
                />
                {/* Front card with red/pink circular details matching video */}
                <rect
                  x="35"
                  y="28"
                  width="52"
                  height="68"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e2e4e8"
                  strokeWidth="1.5"
                />
                {/* Document contents on front card */}
                <circle cx="48" cy="42" r="5" fill="#f06a6a" />
                <rect x="58" y="39" width="20" height="3" rx="1.5" fill="#cfd2d8" />
                <rect x="58" y="45" width="14" height="2.5" rx="1" fill="#e2e4e8" />
                <circle cx="48" cy="58" r="4" fill="#f06a6a" />
                <circle cx="58" cy="58" r="4" fill="#f06a6a" />
                <circle cx="68" cy="58" r="4" fill="#f06a6a" />
                <rect x="44" y="72" width="34" height="3" rx="1.5" fill="#f06a6a" />
                <rect x="44" y="78" width="26" height="3" rx="1.5" fill="#e2e4e8" />
              </svg>
            </div>

            {/* Caption Text */}
            <p className="text-[13.5px] text-[#8a8886] font-normal max-w-md leading-relaxed">
              All attachments to tasks & messages in this project will appear here
            </p>
          </div>
        ) : (
          /* POPULATED FILES VIEW */
          <div className="space-y-6">
            {Object.entries(groupedFiles).map(([groupTitle, groupItems]) => (
              <div key={groupTitle} className="space-y-3">
                {groupField !== 'none' && (
                  <div className="flex items-center gap-2 pb-1 border-b border-[#2b2c2e]">
                    <span className="text-[12px] font-semibold text-[#8a8886] uppercase tracking-wider">
                      {groupTitle}
                    </span>
                    <span className="text-[11px] text-[#6d6e72]">({groupItems.length})</span>
                  </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupItems.map((file) => (
                      <div
                        key={file.id}
                        className="bg-[#252628] border border-[#323438] hover:border-[#45474c] rounded-xl p-3 flex flex-col justify-between transition-all group shadow-sm relative overflow-hidden"
                      >
                        {/* Preview Top Area */}
                        <div className="w-full h-32 bg-[#1a1b1d] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                          {file.thumbnailUrl ? (
                            <img
                              src={file.thumbnailUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              {renderFileIcon(file.fileType)}
                              <span className="text-[10px] font-mono text-[#8a8886] uppercase">
                                {file.name.split('.').pop() || 'FILE'}
                              </span>
                            </div>
                          )}

                          {/* Top-Right Action Buttons on Hover */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-md p-0.5">
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-1 hover:text-white text-[#cfcecd] transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1 hover:text-[#f06a6a] text-[#cfcecd] transition-colors cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* File Details */}
                        <div>
                          <h4 className="text-[13px] font-medium text-white truncate mb-1" title={file.name}>
                            {file.name}
                          </h4>
                          {visibleColumns.attachedTo && (
                            <p className="text-[11px] text-[#8a8886] truncate">
                              Attached to: {file.attachedToName}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10.5px] text-[#6d6e72] mt-2 pt-2 border-t border-[#303235]">
                            {visibleColumns.lastModified && <span>{file.lastModified}</span>}
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="bg-[#252628] border border-[#323438] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-[12.5px]">
                      <thead className="bg-[#1e1f21] border-b border-[#303235] text-[#8a8886] text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">Name</th>
                          {visibleColumns.attachedTo && <th className="py-2.5 px-4 font-medium">Attached to</th>}
                          {visibleColumns.fileType && <th className="py-2.5 px-4 font-medium">File type</th>}
                          {visibleColumns.lastModified && <th className="py-2.5 px-4 font-medium">Last modified</th>}
                          <th className="py-2.5 px-4 font-medium">Size</th>
                          <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#303235]">
                        {groupItems.map((file) => (
                          <tr key={file.id} className="hover:bg-[#2c2d30] transition-colors group">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2.5 truncate max-w-xs">
                                {renderFileIcon(file.fileType)}
                                <span className="font-medium text-white truncate">{file.name}</span>
                              </div>
                            </td>
                            {visibleColumns.attachedTo && (
                              <td className="py-2.5 px-4 text-[#8a8886]">{file.attachedToName}</td>
                            )}
                            {visibleColumns.fileType && (
                              <td className="py-2.5 px-4 text-[#8a8886] capitalize">{file.fileType.replace('_', ' ')}</td>
                            )}
                            {visibleColumns.lastModified && (
                              <td className="py-2.5 px-4 text-[#8a8886]">{file.lastModified}</td>
                            )}
                            <td className="py-2.5 px-4 text-[#8a8886]">{formatFileSize(file.size)}</td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="p-1 hover:text-white text-[#8a8886] transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1 hover:text-[#f06a6a] text-[#8a8886] transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Options Slide-over Drawer (Matching Video 00:58 - 01:11) */}
      {isOptionsDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-[360px] bg-[#1e1f21] border-l border-[#2b2c2e] shadow-2xl z-50 flex flex-col text-white animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="h-[48px] px-4 border-b border-[#2b2c2e] flex items-center justify-between">
            {optionsSubView === 'main' ? (
              <h2 className="text-[16px] font-semibold text-white flex items-center gap-1.5">
                {viewIcon && <span className="text-[18px]">{viewIcon}</span>}
                <span>{viewTitle || 'Files'}</span>
              </h2>
            ) : (
              <button
                type="button"
                onClick={() => setOptionsSubView('main')}
                className="flex items-center gap-2 text-[14px] text-[#bdbbb9] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Show/hide columns</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOptionsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#252628] transition-colors cursor-pointer"
              title="Close drawer"
            >
              <ArrowRightToLine className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {optionsSubView === 'main' ? (
              <>
                {/* Icon & View Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] text-[#8a8886]">
                    <span>Icon</span>
                    <span>View name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Emoji Picker Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className="w-10 h-10 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2e2f33] flex items-center justify-center text-[18px] cursor-pointer transition-colors"
                        title="Choose icon emoji"
                      >
                        {viewIcon || '📁'}
                      </button>

                      {isEmojiPickerOpen && (
                        <EmojiPickerPopover
                          isOpen={isEmojiPickerOpen}
                          onClose={() => setIsEmojiPickerOpen(false)}
                          onSelectEmoji={(emoji) => {
                            setViewIcon(emoji);
                            updateViewConfig('Files', { icon: emoji });
                            setIsEmojiPickerOpen(false);
                          }}
                          onClear={() => {
                            setViewIcon('');
                            updateViewConfig('Files', { icon: '' });
                            setIsEmojiPickerOpen(false);
                          }}
                        />
                      )}
                    </div>

                    {/* View name input */}
                    <input
                      type="text"
                      value={viewTitle}
                      onChange={(e) => {
                        setViewTitle(e.target.value);
                        updateViewConfig('Files', { name: e.target.value });
                      }}
                      className="flex-1 h-10 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-[13.5px] text-white outline-none focus:border-[#4573d2]"
                    />
                  </div>
                </div>

                <div className="h-px bg-[#2b2c2e]" />

                {/* Navigation Rows */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setOptionsSubView('columns')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#252628] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Columns2 className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      <span className="text-[13.5px]">Show/hide columns</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsDrawerOpen(false);
                      setIsFilterOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#252628] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Filter className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      <span className="text-[13.5px]">Filters</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsDrawerOpen(false);
                      setIsSortOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#252628] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpDown className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      <span className="text-[13.5px]">Sorts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsDrawerOpen(false);
                      setIsGroupOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#252628] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                      <span className="text-[13.5px]">Groups</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                  </button>
                </div>

                <div className="h-px bg-[#2b2c2e]" />

                <button
                  type="button"
                  onClick={() => alert('Feedback submitted! Thank you.')}
                  className="text-[12.5px] text-[#4573d2] hover:underline cursor-pointer"
                >
                  Send feedback
                </button>
              </>
            ) : (
              /* Subview: Show/hide columns (Video 01:03) */
              <div className="space-y-4">
                <p className="text-[12px] text-[#8a8886]">
                  Show, hide, and reorder columns in this view
                </p>

                <div className="space-y-2">
                  {/* Attached to toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-[#252628] border border-[#323438] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[#8a8886]" />
                      <span className="text-[13px]">Attached to</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visibleColumns.attachedTo}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, attachedTo: e.target.checked })}
                      className="rounded border-[#37383b] bg-[#1e1f21] text-[#4573d2] focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {/* File type toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-[#252628] border border-[#323438] rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8a8886]" />
                      <span className="text-[13px]">File type</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visibleColumns.fileType}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, fileType: e.target.checked })}
                      className="rounded border-[#37383b] bg-[#1e1f21] text-[#4573d2] focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {/* Last modified toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-[#252628] border border-[#323438] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8a8886]" />
                      <span className="text-[13px]">Last modified</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visibleColumns.lastModified}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, lastModified: e.target.checked })}
                      className="rounded border-[#37383b] bg-[#1e1f21] text-[#4573d2] focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}