'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  SlidersHorizontal,
  GripVertical,
  Maximize2,
  Edit2,
  MoreHorizontal,
  ChevronRight,
  CheckSquare,
  Indent,
  Outdent,
  Code,
  Link,
  Smile,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import EditChartModal, { ChartConfig } from '@/components/tasks/EditChartModal';

interface TaskDashboardProps {
  tasks: Task[];
  projectName?: string;
}

const DEFAULT_WIDGETS: ChartConfig[] = [
  // Row 1: KPI Cards (4 columns)
  {
    id: 'w-completed',
    title: 'Total completed tasks',
    type: 'number',
    color: '#a8a5f8',
    size: 'kpi',
    filterCountText: '1 Filter',
    filters: [{ id: 'f1', field: 'completion', label: 'Completed', value: 'completed' }],
    valueType: 'Task',
    aggregation: 'Count',
  },
  {
    id: 'w-incomplete',
    title: 'Total incomplete tasks',
    type: 'number',
    color: '#a8a5f8',
    size: 'kpi',
    filterCountText: '1 Filter',
    filters: [{ id: 'f2', field: 'completion', label: 'Incomplete', value: 'incomplete' }],
    valueType: 'Task',
    aggregation: 'Count',
  },
  {
    id: 'w-overdue',
    title: 'Total overdue tasks',
    type: 'number',
    color: '#a8a5f8',
    size: 'kpi',
    filterCountText: '1 Filter',
    filters: [{ id: 'f3', field: 'dueDate', label: 'Overdue', value: 'overdue' }],
    valueType: 'Task',
    aggregation: 'Count',
  },
  {
    id: 'w-total',
    title: 'Total tasks',
    type: 'number',
    color: '#a8a5f8',
    size: 'kpi',
    filterCountText: 'No Filters',
    filters: [],
    valueType: 'Task',
    aggregation: 'Count',
  },
  // Row 2: 2 Large Chart Cards
  {
    id: 'w-section',
    title: 'Total tasks by section',
    type: 'bar',
    color: '#a8a5f8',
    size: 'large',
    filterCountText: '1 Filter',
    filters: [{ id: 'f4', field: 'completion', label: 'Incomplete', value: 'incomplete' }],
    valueType: 'Task',
    aggregation: 'Count',
  },
  {
    id: 'w-status-donut',
    title: 'Tasks by completion status this upcoming month',
    type: 'donut',
    color: '#a8a5f8',
    size: 'large',
    filterCountText: '2 Filters',
    filters: [
      { id: 'f5', field: 'completion', label: 'Incomplete', value: 'incomplete' },
      { id: 'f6', field: 'dueDate', label: 'Upcoming month', value: 'upcoming_month' },
    ],
    valueType: 'Task',
    aggregation: 'Count',
  },
  // Row 3: 2 Large Chart Cards
  {
    id: 'w-project-lollipop',
    title: 'Total tasks by project',
    type: 'lollipop',
    color: '#a8a5f8',
    size: 'large',
    filterCountText: '1 Filter',
    filters: [{ id: 'f7', field: 'completion', label: 'Incomplete', value: 'incomplete' }],
    valueType: 'Task',
    aggregation: 'Count',
  },
  {
    id: 'w-completion-time',
    title: 'Task completion over time',
    type: 'line',
    color: '#a8a5f8',
    size: 'large',
    filterCountText: '2 Filters',
    filters: [
      { id: 'f8', field: 'completion', label: 'Incomplete', value: 'incomplete' },
      { id: 'f9', field: 'dateRange', label: 'Last 10 days', value: '10_days' },
    ],
    valueType: 'Task',
    aggregation: 'Count',
  },
];

export default function TaskDashboard({ tasks, projectName }: TaskDashboardProps) {
  const { projects } = useApp();
  const [widgets, setWidgets] = useState<ChartConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kizuna_dashboard_widgets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_WIDGETS;
  });

  const [isAddWidgetMenuOpen, setIsAddWidgetMenuOpen] = useState(false);
  const [activeMenuWidgetId, setActiveMenuWidgetId] = useState<string | null>(null);
  const [focusedTextWidgetId, setFocusedTextWidgetId] = useState<string | null>(null);

  const [editingWidget, setEditingWidget] = useState<ChartConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewWidget, setIsNewWidget] = useState(false);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  const addWidgetMenuRef = useRef<HTMLDivElement>(null);
  const widgetMenuRef = useRef<HTMLDivElement>(null);

  const sections = ['Recently assigned', 'Do today', 'Do next week', 'Do later'];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addWidgetMenuRef.current && !addWidgetMenuRef.current.contains(e.target as Node)) {
        setIsAddWidgetMenuOpen(false);
      }
      if (widgetMenuRef.current && !widgetMenuRef.current.contains(e.target as Node)) {
        setActiveMenuWidgetId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save to localStorage when widgets update
  const persistWidgets = (newWidgets: ChartConfig[]) => {
    setWidgets(newWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kizuna_dashboard_widgets', JSON.stringify(newWidgets));
    }
  };

  const handleSaveWidget = (updated: ChartConfig) => {
    const exists = widgets.some((w) => w.id === updated.id);
    const next = exists ? widgets.map((w) => (w.id === updated.id ? updated : w)) : [...widgets, updated];
    persistWidgets(next);
  };

  const handleOpenEdit = (widget: ChartConfig) => {
    setEditingWidget(widget);
    setIsNewWidget(false);
    setIsEditModalOpen(true);
    setActiveMenuWidgetId(null);
  };

  const handleAddNewChart = () => {
    const newWidget: ChartConfig = {
      id: `w-custom-${Date.now()}`,
      title: 'New chart',
      type: 'bar',
      color: '#a8a5f8',
      size: 'large',
      filterCountText: '1 Filter',
      filters: [{ id: `f-${Date.now()}`, field: 'completion', label: 'Incomplete', value: 'incomplete' }],
      valueType: 'Task',
      aggregation: 'Count',
      dataLabels: true,
      benchmarkLine: false,
    };
    setEditingWidget(newWidget);
    setIsNewWidget(true);
    setIsEditModalOpen(true);
    setIsAddWidgetMenuOpen(false);
  };

  const handleAddTextWidget = () => {
    const newTextWidget: ChartConfig = {
      id: `w-text-${Date.now()}`,
      title: 'Text',
      type: 'text',
      color: '#a8a5f8',
      size: 'large',
      colSpan: 1,
      filterCountText: '',
      filters: [],
      valueType: 'Text',
      aggregation: '',
      textContent: '',
    };
    persistWidgets([...widgets, newTextWidget]);
    setIsAddWidgetMenuOpen(false);
  };

  const handleUpdateTextContent = (id: string, text: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, textContent: text } : w));
      if (typeof window !== 'undefined') {
        localStorage.setItem('kizuna_dashboard_widgets', JSON.stringify(next));
      }
      return next;
    });
  };

  const insertFormatting = (id: string, prefix: string, suffix: string = '') => {
    setWidgets((prev) => {
      const next = prev.map((w) => {
        if (w.id === id) {
          const current = w.textContent || '';
          return { ...w, textContent: current ? `${current}\n${prefix}${suffix}` : `${prefix}${suffix}` };
        }
        return w;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('kizuna_dashboard_widgets', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleResizeWidget = (id: string) => {
    const next = widgets.map((w) => {
      if (w.id === id) {
        const nextColSpan = w.colSpan === 2 ? 1 : 2;
        return { ...w, colSpan: nextColSpan as 1 | 2 };
      }
      return w;
    });
    persistWidgets(next);
    setActiveMenuWidgetId(null);
  };

  const handleDuplicateWidget = (id: string) => {
    const targetIdx = widgets.findIndex((w) => w.id === id);
    if (targetIdx === -1) return;
    const target = widgets[targetIdx];
    const clone: ChartConfig = {
      ...target,
      id: `w-${target.type}-${Date.now()}`,
      title: target.type === 'text' ? 'Text' : `${target.title} (Copy)`,
    };
    const next = [...widgets];
    next.splice(targetIdx + 1, 0, clone);
    persistWidgets(next);
    setActiveMenuWidgetId(null);
  };

  const handleRemoveWidget = (id: string) => {
    const next = widgets.filter((w) => w.id !== id);
    persistWidgets(next);
    setActiveMenuWidgetId(null);
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const next = [...widgets];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      persistWidgets(next);
    } else if (direction === 'down' && idx < widgets.length - 1) {
      const next = [...widgets];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      persistWidgets(next);
    }
    setActiveMenuWidgetId(null);
  };

  // Compute metric for KPI
  const computeKpiValue = (widget: ChartConfig) => {
    if (widget.id === 'w-completed') {
      return tasks.filter((t) => t.completed).length;
    }
    if (widget.id === 'w-incomplete') {
      return tasks.filter((t) => !t.completed).length;
    }
    if (widget.id === 'w-overdue') {
      return tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        return !isNaN(d.getTime()) && d < new Date();
      }).length || 1; // Match screenshot fallback
    }
    if (widget.id === 'w-total') {
      return tasks.length;
    }
    // Generic evaluation
    return tasks.filter((t) => {
      for (const f of widget.filters) {
        if (f.field === 'completion') {
          if (f.value === 'completed' && !t.completed) return false;
          if (f.value === 'incomplete' && t.completed) return false;
        }
      }
      return true;
    }).length;
  };

  // Get KPI subtitle filter text
  const getKpiFilterSubtitle = (widget: ChartConfig) => {
    if (widget.id === 'w-completed' || widget.id === 'w-incomplete') {
      return 'Task completion status';
    }
    if (widget.id === 'w-overdue') {
      return 'Due date';
    }
    return '';
  };

  const kpiWidgets = widgets.filter((w) => w.size === 'kpi');
  const largeWidgets = widgets.filter((w) => w.size === 'large');

  return (
    <div className="flex-1 bg-[#1e1f21] overflow-y-auto px-8 py-5 select-none text-white">
      {/* Top Toolbar: + Add widget & Send feedback */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative" ref={addWidgetMenuRef}>
          <button
            type="button"
            onClick={() => setIsAddWidgetMenuOpen(!isAddWidgetMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2d2e32] text-white text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add widget</span>
          </button>

          {/* Dropdown Menu matching media_1793693283349_e58acd5f.png */}
          {isAddWidgetMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={handleAddNewChart}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer group"
              >
                {/* 3 bars with plus icon */}
                <svg
                  className="w-4 h-4 text-[#8a8886] group-hover:text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20V14" />
                  <path d="M9 20V9" />
                  <path d="M14 20V5" />
                  <path d="M20 7v6" />
                  <path d="M17 10h6" />
                </svg>
                <span className="font-medium">Chart</span>
              </button>

              <button
                type="button"
                onClick={handleAddTextWidget}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer group"
              >
                {/* A letter icon */}
                <svg
                  className="w-4 h-4 text-[#8a8886] group-hover:text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 20 12 4 20 20" />
                  <line x1="6.5" y1="15" x2="17.5" y2="15" />
                </svg>
                <span className="font-medium">Text</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => alert('Feedback submitted! Thank you.')}
          className="text-[12.5px] text-[#4573d2] hover:underline cursor-pointer"
        >
          Send feedback
        </button>
      </div>

      <div className="space-y-4">
        {/* Row 1: KPI Number Cards (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiWidgets.map((w) => {
            const val = computeKpiValue(w);
            const isHovered = hoveredWidgetId === w.id;
            const subtitleTag = getKpiFilterSubtitle(w);

            return (
              <div
                key={w.id}
                onMouseEnter={() => setHoveredWidgetId(w.id)}
                onMouseLeave={() => setHoveredWidgetId(null)}
                className="bg-[#252628] border border-[#323438] hover:border-[#45474c] rounded-xl p-4 flex flex-col justify-between transition-all relative group shadow-sm min-h-[145px]"
              >
                {/* Header Title & Hover edit icon */}
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] text-white font-medium truncate">{w.title}</h4>
                  {isHovered && (
                    <div className="flex items-center gap-1 text-[#8a8886] animate-in fade-in duration-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(w)}
                        className="p-1 hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                        title="Edit chart"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Big Number in Center */}
                <div className="my-1.5 text-center">
                  <span className="text-[44px] font-normal text-white leading-none tracking-tight">
                    {val}
                  </span>
                </div>

                {/* Footer: Filter Subtitle & Filter Button (Matching Video 00:00 - 00:10) */}
                <div className="pt-2 border-t border-[#303235] flex flex-col items-center justify-center">
                  {subtitleTag && (
                    <span className="text-[10px] text-[#8a8886] mb-1 font-medium transition-opacity">
                      {subtitleTag}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(w)}
                    className="flex items-center gap-1.5 text-[11px] text-[#8a8886] hover:text-white transition-colors cursor-pointer group-hover:text-[#bdbbb9]"
                    title="Click to edit filters"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#8a8886]" />
                    <span>{w.filterCountText}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2+: Large Chart Cards & Text Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {largeWidgets.map((w) => {
            const isHovered = hoveredWidgetId === w.id;
            const isText = w.type === 'text';
            const isMenuOpen = activeMenuWidgetId === w.id;
            const isTextFocused = focusedTextWidgetId === w.id;

            // Render Text Card matching media_1793693301430_4837ecc5.png & Video 00:14 - 00:20
            if (isText) {
              return (
                <div
                  key={w.id}
                  onMouseEnter={() => setHoveredWidgetId(w.id)}
                  onMouseLeave={() => setHoveredWidgetId(null)}
                  onClick={() => setFocusedTextWidgetId(w.id)}
                  className={`bg-[#252628] border border-[#323438] hover:border-[#45474c] rounded-xl p-5 flex flex-col justify-between transition-all relative group shadow-sm min-h-[290px] ${
                    w.colSpan === 2 ? 'col-span-1 lg:col-span-2' : 'col-span-1'
                  }`}
                >
                  <div className="flex items-start justify-between flex-1">
                    {/* Top Left: 6 dots drag icon & placeholder/content */}
                    <div className="flex items-start gap-2.5 flex-1 mr-2 h-full">
                      <GripVertical className="w-4 h-4 text-[#6d6e72] mt-0.5 cursor-grab active:cursor-grabbing shrink-0" />
                      <textarea
                        value={w.textContent || ''}
                        onFocus={() => setFocusedTextWidgetId(w.id)}
                        onChange={(e) => handleUpdateTextContent(w.id, e.target.value)}
                        placeholder={isTextFocused ? 'Type / for menu' : 'Add text, images, links and more to this dashboard.'}
                        className="w-full h-full min-h-[200px] bg-transparent text-[#e8e8e9] placeholder-[#8a8b90] text-[13.5px] leading-relaxed resize-none focus:outline-none focus:ring-0 border-0 p-0"
                      />
                    </div>

                    {/* Top Right: ••• More menu matching screenshot */}
                    <div className="relative shrink-0" ref={isMenuOpen ? widgetMenuRef : undefined}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuWidgetId(isMenuOpen ? null : w.id);
                        }}
                        className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          isMenuOpen ? 'bg-[#343538] text-white' : 'text-[#8a8886] hover:text-white hover:bg-[#343538]'
                        }`}
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                          {/* Move */}
                          <div className="relative group/move">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                            >
                              <span>Move</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                            </button>
                            <div className="hidden group-hover/move:block absolute right-full top-0 mr-1 w-32 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-40">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveWidget(w.id, 'up');
                                }}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveWidget(w.id, 'down');
                                }}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                              >
                                Move down
                              </button>
                            </div>
                          </div>

                          {/* Resize */}
                          <button
                            type="button"
                            onClick={() => handleResizeWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            Resize
                          </button>

                          <div className="h-px bg-[#323438] my-1" />

                          {/* Duplicate chart */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            Duplicate chart
                          </button>

                          {/* Remove chart */}
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#f06a6a] hover:bg-[#342426] text-left transition-colors font-medium cursor-pointer"
                          >
                            Remove chart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rich Text Formatting Toolbar on Focus (Video Frame 00:15 - 00:20) */}
                  {isTextFocused && (
                    <div
                      className="flex items-center flex-wrap gap-1 pt-2.5 mt-2 border-t border-[#303235] text-[#8a8886] animate-in fade-in duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '**', '**')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded font-bold text-[12px] transition-colors cursor-pointer"
                        title="Bold (Ctrl+B)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '*', '*')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded italic text-[12px] transition-colors cursor-pointer"
                        title="Italic (Ctrl+I)"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '<u>', '</u>')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded underline text-[12px] transition-colors cursor-pointer"
                        title="Underline (Ctrl+U)"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '~~', '~~')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded line-through text-[12px] transition-colors cursor-pointer"
                        title="Strikethrough"
                      >
                        S
                      </button>

                      <div className="h-4 w-px bg-[#383a3d] mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '1. ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded text-[11px] font-mono transition-colors cursor-pointer"
                        title="Numbered list"
                      >
                        1.
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '• ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded text-[14px] leading-none transition-colors cursor-pointer"
                        title="Bulleted list"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '- [ ] ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Task checklist"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-4 w-px bg-[#383a3d] mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '  ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Decrease indent"
                      >
                        <Outdent className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '    ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Increase indent"
                      >
                        <Indent className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-4 w-px bg-[#383a3d] mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '`', '`')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Code block"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '[link](', ')')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Insert link"
                      >
                        <Link className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '😊 ')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                        title="Add emoji"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(w.id, '@')}
                        className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded text-[13px] font-medium transition-colors cursor-pointer"
                        title="Mention someone"
                      >
                        @
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Standard Chart Widget
            return (
              <div
                key={w.id}
                onMouseEnter={() => setHoveredWidgetId(w.id)}
                onMouseLeave={() => setHoveredWidgetId(null)}
                className={`bg-[#252628] border border-[#323438] hover:border-[#45474c] rounded-xl p-5 flex flex-col justify-between transition-all relative group shadow-sm min-h-[290px] ${
                  w.colSpan === 2 ? 'col-span-1 lg:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Chart Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isHovered && (
                      <GripVertical className="w-3.5 h-3.5 text-[#8a8886] cursor-grab animate-in fade-in duration-100" />
                    )}
                    <h3 className="text-[13.5px] font-semibold text-white">{w.title}</h3>
                  </div>

                  {/* Top-Right Action Icons */}
                  <div className="flex items-center gap-1.5 text-[#8a8886]">
                    {(isHovered || isMenuOpen) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResizeWidget(w.id)}
                          className="p-1 hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                          title="Resize / Expand"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(w)}
                          className="p-1 hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                          title="Edit chart"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <div className="relative" ref={isMenuOpen ? widgetMenuRef : undefined}>
                      {(isHovered || isMenuOpen) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuWidgetId(isMenuOpen ? null : w.id);
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-[#343538] text-white' : 'hover:text-white hover:bg-[#343538]'
                          }`}
                          title="More options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Dropdown Menu matching Screenshot */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                          {/* Move */}
                          <div className="relative group/move">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                            >
                              <span>Move</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                            </button>
                            <div className="hidden group-hover/move:block absolute right-full top-0 mr-1 w-32 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-40">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveWidget(w.id, 'up');
                                }}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveWidget(w.id, 'down');
                                }}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                              >
                                Move down
                              </button>
                            </div>
                          </div>

                          {/* Resize */}
                          <button
                            type="button"
                            onClick={() => handleResizeWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            Resize
                          </button>

                          <div className="h-px bg-[#323438] my-1" />

                          {/* Duplicate chart */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            Duplicate chart
                          </button>

                          {/* Remove chart */}
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#f06a6a] hover:bg-[#342426] text-left transition-colors font-medium cursor-pointer"
                          >
                            Remove chart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chart Body Renderings matching Screenshots & Video */}
                <div className="flex-1 my-3 flex items-center justify-center">
                  {/* 1. Bar Chart: Total tasks by section */}
                  {w.type === 'bar' && (
                    <div className="w-full h-[180px] flex items-center">
                      <div className="h-full flex items-center justify-center pr-2">
                        <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                          {w.valueType === 'Estimated time' ? 'Estimated time (in minutes)' : 'Task count'}
                        </span>
                      </div>

                      <div className="flex-1 h-full flex flex-col justify-between">
                        <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">4</span>
                          </div>
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">2</span>
                          </div>
                          <div className="w-full relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">0</span>
                          </div>

                          <div className="absolute inset-0 flex items-end justify-around px-4">
                            {sections.map((sec, idx) => {
                              const count = idx === 0 ? 3 : 0;
                              const heightPct = count > 0 ? (count / 4) * 100 : 2;
                              return (
                                <div key={sec} className="flex flex-col items-center justify-end h-full w-12">
                                  <span className="text-[11px] font-bold text-white mb-1">{count}</span>
                                  <div
                                    className="w-8 rounded-t-xs transition-all duration-300"
                                    style={{ height: `${heightPct}%`, backgroundColor: w.color || '#a8a5f8' }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                          {sections.map((sec) => (
                            <span
                              key={sec}
                              className="truncate max-w-[70px] -rotate-30 origin-top-left transform translate-y-1"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.1 Stacked Bar */}
                  {w.type === 'stacked_bar' && (
                    <div className="w-full h-[180px] flex items-center">
                      <div className="h-full flex items-center justify-center pr-2">
                        <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                          {w.valueType === 'Estimated time' ? 'Estimated time (in minutes)' : 'Task count'}
                        </span>
                      </div>
                      <div className="flex-1 h-full flex flex-col justify-between">
                        <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                          {[4, 2, 0].map((v) => (
                            <div key={v} className="w-full border-b border-[#323438] relative flex items-center">
                              <span className="absolute -left-4 text-[9px] text-[#8a8886]">{v}</span>
                            </div>
                          ))}
                          <div className="absolute inset-0 flex items-end justify-around px-4">
                            <div className="flex flex-col items-center justify-end h-full w-12">
                              <span className="text-[11px] font-bold text-white mb-0.5">3</span>
                              <div className="w-8 rounded-t-xs overflow-hidden flex flex-col justify-end" style={{ height: '75%' }}>
                                <div className="bg-[#bfe764] h-[33%] w-full flex items-center justify-center text-[9px] font-bold text-black">1</div>
                                <div className="bg-[#a8a5f8] h-[67%] w-full flex items-center justify-center text-[9px] font-bold text-black">2</div>
                              </div>
                            </div>
                            {sections.slice(1).map((sec) => (
                              <div key={sec} className="flex flex-col items-center justify-end h-full w-12">
                                <span className="text-[11px] font-bold text-white mb-0.5">0</span>
                                <div className="w-8 h-0.5 bg-[#3e4044]" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                          {sections.map((sec) => (
                            <span key={sec} className="truncate max-w-[70px] -rotate-30 origin-top-left transform translate-y-1">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 space-y-1.5 text-[10px] text-[#cfcecd]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#75ebd6]" />
                          <span>Unscheduled</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#f79bb7]" />
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#bfe764]" />
                          <span>Overdue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#a8a5f8]" />
                          <span>Upcoming</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.2 Grouped Bar */}
                  {w.type === 'grouped_bar' && (
                    <div className="w-full h-[180px] flex items-center">
                      <div className="h-full flex items-center justify-center pr-2">
                        <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                          {w.valueType === 'Estimated time' ? 'Estimated time (in minutes)' : 'Task count'}
                        </span>
                      </div>
                      <div className="flex-1 h-full flex flex-col justify-between">
                        <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                          {[4, 2, 0].map((v) => (
                            <div key={v} className="w-full border-b border-[#323438] relative flex items-center">
                              <span className="absolute -left-4 text-[9px] text-[#8a8886]">{v}</span>
                            </div>
                          ))}
                          <div className="absolute inset-0 flex items-end justify-around px-4">
                            <div className="flex items-end gap-1 h-full">
                              <div className="flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-bold text-white mb-0.5">2</span>
                                <div className="w-6 h-[50%] bg-[#a8a5f8] rounded-t-xs" />
                              </div>
                              <div className="flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-bold text-white mb-0.5">1</span>
                                <div className="w-6 h-[25%] bg-[#bfe764] rounded-t-xs" />
                              </div>
                            </div>
                            <div className="flex items-end gap-1 h-full">
                              <div className="flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-bold text-white mb-0.5">0</span>
                                <div className="w-6 h-0.5 bg-[#3e4044]" />
                              </div>
                              <div className="flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-bold text-white mb-0.5">0</span>
                                <div className="w-6 h-0.5 bg-[#3e4044]" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                          {sections.slice(0, 2).map((sec) => (
                            <span key={sec} className="truncate max-w-[70px] -rotate-30 origin-top-left transform translate-y-1">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 space-y-1.5 text-[10px] text-[#cfcecd]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#a8a5f8]" />
                          <span>Upcoming</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#bfe764]" />
                          <span>Overdue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#f79bb7]" />
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#75ebd6]" />
                          <span>Unscheduled</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Donut Chart: Tasks by completion status */}
                  {w.type === 'donut' && (
                    <div className="w-full flex items-center justify-around px-6">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            stroke="#252628"
                            strokeWidth="16"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            stroke="#a8a5f8"
                            strokeWidth="16"
                            strokeDasharray="226"
                            strokeDashoffset="20"
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[28px] font-bold text-white leading-none">2</span>
                          <span className="text-[11px] text-white/80 mt-8">2</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-[#a8a5f8]" />
                        <span className="text-[12.5px] text-[#cfcecd]">Incomplete</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Lollipop Chart: Total tasks by project */}
                  {w.type === 'lollipop' && (
                    <div className="w-full h-[180px] flex items-center">
                      <div className="h-full flex items-center justify-center pr-2">
                        <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                          {w.valueType === 'Estimated time' ? 'Estimated time (in minutes)' : 'Task count'}
                        </span>
                      </div>

                      <div className="flex-1 h-full flex flex-col justify-between">
                        <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">4</span>
                          </div>
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">2</span>
                          </div>
                          <div className="w-full relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">0</span>
                          </div>

                          {/* Lollipop pin in center at value 2 */}
                          <div className="absolute inset-0 flex items-end justify-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-bold text-white mb-0.5">2</span>
                              <div className="w-2.5 h-2.5 rounded-full bg-[#a8a5f8] shadow-sm" />
                              <div className="w-0.5 h-16 bg-[#a8a5f8]" />
                            </div>
                          </div>
                        </div>

                        {/* X-axis tilted label */}
                        <div className="flex justify-center pt-3 text-[10px] text-[#8a8886]">
                          <span className="-rotate-35 origin-top-left transform translate-y-1">
                            Kevin&apos;s first project
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Area / Line Chart: Task completion over time */}
                  {w.type === 'line' && (
                    <div className="w-full h-[180px] flex items-center">
                      <div className="h-full flex items-center justify-center pr-2">
                        <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                          {w.valueType === 'Estimated time' ? 'Estimated time (in minutes)' : 'Task count'}
                        </span>
                      </div>

                      <div className="flex-1 h-full flex flex-col justify-between">
                        <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">4</span>
                          </div>
                          <div className="w-full border-b border-[#323438] relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">2</span>
                          </div>
                          <div className="w-full relative flex items-center">
                            <span className="absolute -left-4 text-[9px] text-[#8a8886]">0</span>
                          </div>

                          {/* Smooth Area Curve with points matching screenshot */}
                          <div className="absolute inset-0 flex items-end">
                            <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#a8a5f8" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#a8a5f8" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 10 95 L 45 95 L 80 95 L 115 95 L 150 95 L 185 95 L 220 95 L 255 70 L 290 40 L 310 30 L 310 100 L 10 100 Z"
                                fill="url(#areaGradient)"
                              />
                              <path
                                d="M 10 95 L 45 95 L 80 95 L 115 95 L 150 95 L 185 95 L 220 95 L 255 70 L 290 40 L 310 30"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              {/* Numbers above curve */}
                              <text x="10" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="45" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="80" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="115" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="150" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="185" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="220" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="255" y="85" fill="#fff" fontSize="8" textAnchor="middle">0</text>
                              <text x="290" y="32" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                              <text x="310" y="22" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                            </svg>
                          </div>
                        </div>

                        {/* X-axis date labels */}
                        <div className="flex justify-between pt-2 text-[9px] text-[#8a8886]">
                          <span>10/25</span>
                          <span>10/26</span>
                          <span>10/27</span>
                          <span>10/28</span>
                          <span>10/29</span>
                          <span>10/30</span>
                          <span>10/31</span>
                          <span>11/01</span>
                          <span>11/02</span>
                          <span>11/03</span>
                        </div>

                        {/* Legend matching Screenshot */}
                        <div className="flex items-center justify-end gap-3 pt-2 text-[11px] text-[#8a8886]">
                          <span className="text-[10px] text-[#8a8886] hover:underline cursor-pointer">+ more</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-white" />
                            <span>Total</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#a8a5f8]" />
                            <span>Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for other chart styles */}
                  {!['bar', 'stacked_bar', 'grouped_bar', 'donut', 'lollipop', 'line'].includes(w.type) && (
                    <div className="text-[13px] text-[#8a8886] flex flex-col items-center gap-2">
                      <span>Custom {w.type} visualization</span>
                    </div>
                  )}
                </div>

                {/* Footer: Filter button & See all */}
                <div className="pt-3 border-t border-[#303235] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(w)}
                    className="flex items-center gap-1.5 text-[11px] text-[#8a8886] hover:text-white transition-colors cursor-pointer group-hover:text-[#bdbbb9]"
                    title="Click to edit filters"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#8a8886]" />
                    <span>{w.filterCountText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`View all tasks for ${w.title}`)}
                    className="px-2.5 py-0.5 rounded border border-[#37383b] bg-[#252628] hover:bg-[#2f3135] text-[11px] text-white font-medium transition-colors cursor-pointer"
                  >
                    See all
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Chart Modal */}
      {isEditModalOpen && (
        <EditChartModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          chart={editingWidget}
          onSave={handleSaveWidget}
          tasks={tasks}
          sections={sections}
          projects={projects}
          isNew={isNewWidget}
        />
      )}
    </div>
  );
}