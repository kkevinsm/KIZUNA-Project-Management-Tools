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
  Check,
  X,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import EditChartModal, { ChartConfig } from '@/components/tasks/EditChartModal';

interface TaskDashboardProps {
  tasks: Task[];
  projectName?: string;
}

const DEFAULT_WIDGETS: ChartConfig[] = [
  // Row 1: KPI Cards (4 columns, colSpan: 1)
  {
    id: 'w-completed',
    title: 'Total completed tasks',
    type: 'number',
    color: '#a8a5f8',
    size: 'kpi',
    colSpan: 1,
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
    colSpan: 1,
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
    colSpan: 1,
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
    colSpan: 1,
    filterCountText: 'No Filters',
    filters: [],
    valueType: 'Task',
    aggregation: 'Count',
  },
  // Row 2: Large Chart Cards (colSpan: 2)
  {
    id: 'w-section',
    title: 'Total tasks by section',
    type: 'bar',
    color: '#a8a5f8',
    size: 'large',
    colSpan: 2,
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
    colSpan: 2,
    filterCountText: '2 Filters',
    filters: [
      { id: 'f5', field: 'completion', label: 'Incomplete', value: 'incomplete' },
      { id: 'f6', field: 'dueDate', label: 'Upcoming month', value: 'upcoming_month' },
    ],
    valueType: 'Task',
    aggregation: 'Count',
  },
  // Row 3: Large Chart Cards (colSpan: 2)
  {
    id: 'w-project-lollipop',
    title: 'Total tasks by project',
    type: 'lollipop',
    color: '#a8a5f8',
    size: 'large',
    colSpan: 2,
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
    colSpan: 2,
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

  // Drag and drop state
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  // Resize state
  const [isResizingWidgetId, setIsResizingWidgetId] = useState<string | null>(null);

  // View chart modal
  const [viewChartWidget, setViewChartWidget] = useState<ChartConfig | null>(null);

  // Edit chart modal
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
      colSpan: 2,
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
      colSpan: 2,
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

  const handleSetColSpan = (id: string, colSpan: 1 | 2 | 3 | 4) => {
    const next = widgets.map((w) => (w.id === id ? { ...w, colSpan } : w));
    persistWidgets(next);
    setActiveMenuWidgetId(null);
  };

  const handleCycleResize = (id: string) => {
    const target = widgets.find((w) => w.id === id);
    if (!target) return;
    const currentSpan = target.colSpan || (target.type === 'number' ? 1 : 2);
    let nextSpan: 1 | 2 | 3 | 4 = 2;
    if (currentSpan === 1) nextSpan = 2;
    else if (currentSpan === 2) nextSpan = 4;
    else if (currentSpan === 4) nextSpan = 1;
    else nextSpan = 2;

    handleSetColSpan(id, nextSpan);
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

  // Drag and Drop handlers
  const handleDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedWidgetId(id);
  };

  const handleDragOver = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    if (dragOverWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const fromIdx = widgets.findIndex((w) => w.id === draggedWidgetId);
    const toIdx = widgets.findIndex((w) => w.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const next = [...widgets];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      persistWidgets(next);
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  // Interactive Drag-to-Resize on card right border
  const startResizing = (widgetId: string, startEvent: React.MouseEvent) => {
    startEvent.preventDefault();
    startEvent.stopPropagation();
    setIsResizingWidgetId(widgetId);

    const startX = startEvent.clientX;
    const widget = widgets.find((w) => w.id === widgetId);
    const initialSpan = widget?.colSpan || (widget?.type === 'number' ? 1 : 2);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Grid column threshold ~240px
      const colDelta = Math.round(deltaX / 240);
      const newSpan = Math.max(1, Math.min(4, initialSpan + colDelta)) as 1 | 2 | 3 | 4;
      setWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, colSpan: newSpan } : w))
      );
    };

    const onMouseUp = () => {
      setIsResizingWidgetId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setWidgets((prev) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kizuna_dashboard_widgets', JSON.stringify(prev));
        }
        return prev;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
      }).length || 1;
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

  // Helper for grid column span classes
  const getColSpanClass = (span: number = 2) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 md:col-span-2 lg:col-span-2';
      case 3:
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 4:
        return 'col-span-1 md:col-span-2 lg:col-span-4';
      default:
        return 'col-span-1 md:col-span-2 lg:col-span-2';
    }
  };

  return (
    <div className="flex-1 bg-[#1e1f21] overflow-y-auto px-8 py-5 select-none text-white relative">
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

      {/* Background Faint Column Grid Guides (Asana Video 00:37 while resizing or dragging) */}
      {(isResizingWidgetId || draggedWidgetId) && (
        <div className="absolute inset-x-8 top-16 bottom-0 grid grid-cols-4 gap-4 pointer-events-none z-0">
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className="h-full border-x border-dashed border-[#4573d2]/25 bg-[#4573d2]/[0.02] rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Unified Flexible Grid for All Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {widgets.map((w) => {
          const isHovered = hoveredWidgetId === w.id;
          const isMenuOpen = activeMenuWidgetId === w.id;
          const isNumber = w.type === 'number';
          const isText = w.type === 'text';
          const isTextFocused = focusedTextWidgetId === w.id;
          const isDragging = draggedWidgetId === w.id;
          const isDragOver = dragOverWidgetId === w.id && !isDragging;
          const span = w.colSpan || (isNumber ? 1 : 2);
          const colSpanClass = getColSpanClass(span);

          // 1. NUMBER / KPI CARD
          if (isNumber) {
            const val = computeKpiValue(w);
            const subtitleTag = getKpiFilterSubtitle(w);

            return (
              <div
                key={w.id}
                draggable
                onDragStart={(e) => handleDragStart(w.id, e)}
                onDragOver={(e) => handleDragOver(w.id, e)}
                onDrop={(e) => handleDrop(w.id, e)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredWidgetId(w.id)}
                onMouseLeave={() => setHoveredWidgetId(null)}
                className={`bg-[#252628] border rounded-xl p-4 flex flex-col justify-between transition-all relative group shadow-sm min-h-[145px] ${colSpanClass} ${
                  isDragging
                    ? 'opacity-40 ring-2 ring-[#4573d2] border-[#4573d2]'
                    : isDragOver
                    ? 'ring-2 ring-[#4573d2] border-[#4573d2] shadow-lg shadow-[#4573d2]/25 scale-[1.01]'
                    : 'border-[#323438] hover:border-[#45474c]'
                }`}
              >
                {/* Header Title & Drag / Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <GripVertical className="w-3.5 h-3.5 text-[#6d6e72] hover:text-white cursor-grab active:cursor-grabbing shrink-0" />
                    <h4 className="text-[13px] text-white font-medium truncate">{w.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {(isHovered || isMenuOpen) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewChartWidget(w)}
                          className="p-1 text-[#8a8886] hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                          title="View chart (Expand)"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(w)}
                          className="p-1 text-[#8a8886] hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                          title="Edit chart"
                        >
                          <Edit2 className="w-3 h-3" />
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
                            isMenuOpen ? 'bg-[#343538] text-white' : 'text-[#8a8886] hover:text-white hover:bg-[#343538]'
                          }`}
                          title="More options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                          {/* Move Submenu */}
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
                                Move left / up
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveWidget(w.id, 'down');
                                }}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                              >
                                Move right / down
                              </button>
                            </div>
                          </div>

                          {/* Resize Submenu */}
                          <div className="relative group/resize-menu">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                            >
                              <span>Resize</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                            </button>
                            <div className="hidden group-hover/resize-menu:block absolute right-full top-0 mr-1 w-36 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-40">
                              <button
                                type="button"
                                onClick={() => handleSetColSpan(w.id, 1)}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                              >
                                <span>1 Col (25%)</span>
                                {span === 1 && <Check className="w-3 h-3 text-[#4573d2]" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetColSpan(w.id, 2)}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                              >
                                <span>2 Cols (50%)</span>
                                {span === 2 && <Check className="w-3 h-3 text-[#4573d2]" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetColSpan(w.id, 4)}
                                className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                              >
                                <span>Full Width</span>
                                {span === 4 && <Check className="w-3 h-3 text-[#4573d2]" />}
                              </button>
                            </div>
                          </div>

                          <div className="h-px bg-[#323438] my-1" />

                          <button
                            type="button"
                            onClick={() => handleDuplicateWidget(w.id)}
                            className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            Duplicate chart
                          </button>

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

                {/* Big Number in Center */}
                <div className="my-1.5 text-center cursor-pointer" onClick={() => setViewChartWidget(w)}>
                  <span className="text-[44px] font-normal text-white leading-none tracking-tight">
                    {val}
                  </span>
                </div>

                {/* Footer: Filter Subtitle & Button */}
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

                {/* Drag-to-Resize Handle on Right Edge */}
                <div
                  onMouseDown={(e) => startResizing(w.id, e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-[#4573d2]/30 active:bg-[#4573d2] transition-colors rounded-r-xl flex items-center justify-center group/resize"
                  title="Drag to resize card width"
                >
                  <div className="w-0.5 h-6 rounded-full bg-transparent group-hover/resize:bg-[#4573d2] transition-colors" />
                </div>
              </div>
            );
          }

          // 2. TEXT WIDGET
          if (isText) {
            return (
              <div
                key={w.id}
                draggable
                onDragStart={(e) => handleDragStart(w.id, e)}
                onDragOver={(e) => handleDragOver(w.id, e)}
                onDrop={(e) => handleDrop(w.id, e)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredWidgetId(w.id)}
                onMouseLeave={() => setHoveredWidgetId(null)}
                onClick={() => setFocusedTextWidgetId(w.id)}
                className={`bg-[#252628] border rounded-xl p-5 flex flex-col justify-between transition-all relative group shadow-sm min-h-[290px] ${colSpanClass} ${
                  isDragging
                    ? 'opacity-40 ring-2 ring-[#4573d2] border-[#4573d2]'
                    : isDragOver
                    ? 'ring-2 ring-[#4573d2] border-[#4573d2] shadow-lg shadow-[#4573d2]/25 scale-[1.01]'
                    : 'border-[#323438] hover:border-[#45474c]'
                }`}
              >
                <div className="flex items-start justify-between flex-1">
                  {/* Top Left: 6 dots drag icon & textarea */}
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

                  {/* Top Right: ••• More menu */}
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
                        <div className="relative group/resize-menu">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            <span>Resize</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                          </button>
                          <div className="hidden group-hover/resize-menu:block absolute right-full top-0 mr-1 w-36 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-40">
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 1)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>1 Col (25%)</span>
                              {span === 1 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 2)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>2 Cols (50%)</span>
                              {span === 2 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 4)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>Full Width</span>
                              {span === 4 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-[#323438] my-1" />

                        <button
                          type="button"
                          onClick={() => handleDuplicateWidget(w.id)}
                          className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                        >
                          Duplicate chart
                        </button>

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

                {/* Rich Text Toolbar */}
                {isTextFocused && (
                  <div
                    className="flex items-center flex-wrap gap-1 pt-2.5 mt-2 border-t border-[#303235] text-[#8a8886] animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '**', '**')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded font-bold text-[12px] transition-colors cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '*', '*')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded italic text-[12px] transition-colors cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '<u>', '</u>')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded underline text-[12px] transition-colors cursor-pointer"
                      title="Underline"
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
                      title="Checklist"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-px bg-[#383a3d] mx-1" />

                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '  ')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                      title="Outdent"
                    >
                      <Outdent className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '    ')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                      title="Indent"
                    >
                      <Indent className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-px bg-[#383a3d] mx-1" />

                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '`', '`')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                      title="Code"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '[link](', ')')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                      title="Link"
                    >
                      <Link className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting(w.id, '😊 ')}
                      className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-[#343538] rounded transition-colors cursor-pointer"
                      title="Emoji"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Drag-to-Resize Handle on Right Edge */}
                <div
                  onMouseDown={(e) => startResizing(w.id, e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-[#4573d2]/30 active:bg-[#4573d2] transition-colors rounded-r-xl flex items-center justify-center group/resize"
                  title="Drag to resize card width"
                >
                  <div className="w-0.5 h-8 rounded-full bg-transparent group-hover/resize:bg-[#4573d2] transition-colors" />
                </div>
              </div>
            );
          }

          // 3. STANDARD CHART WIDGET (Bar, Donut, Line, Lollipop, Burndown, etc.)
          return (
            <div
              key={w.id}
              draggable
              onDragStart={(e) => handleDragStart(w.id, e)}
              onDragOver={(e) => handleDragOver(w.id, e)}
              onDrop={(e) => handleDrop(w.id, e)}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setHoveredWidgetId(w.id)}
              onMouseLeave={() => setHoveredWidgetId(null)}
              className={`bg-[#252628] border rounded-xl p-5 flex flex-col justify-between transition-all relative group shadow-sm min-h-[290px] ${colSpanClass} ${
                isDragging
                  ? 'opacity-40 ring-2 ring-[#4573d2] border-[#4573d2]'
                  : isDragOver
                  ? 'ring-2 ring-[#4573d2] border-[#4573d2] shadow-lg shadow-[#4573d2]/25 scale-[1.01]'
                  : 'border-[#323438] hover:border-[#45474c]'
              }`}
            >
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 truncate">
                  <GripVertical className="w-3.5 h-3.5 text-[#6d6e72] hover:text-white cursor-grab active:cursor-grabbing shrink-0" />
                  <h3 className="text-[13.5px] font-semibold text-white truncate">{w.title}</h3>
                </div>

                {/* Top-Right Action Icons */}
                <div className="flex items-center gap-1 text-[#8a8886]">
                  {(isHovered || isMenuOpen) && (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewChartWidget(w)}
                        className="p-1 hover:text-white rounded hover:bg-[#343538] transition-colors cursor-pointer"
                        title="View chart (Expand)"
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

                    {/* Dropdown Menu */}
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
                              Move left / up
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveWidget(w.id, 'down');
                              }}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left cursor-pointer"
                            >
                              Move right / down
                            </button>
                          </div>
                        </div>

                        {/* Resize */}
                        <div className="relative group/resize-menu">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                          >
                            <span>Resize</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                          </button>
                          <div className="hidden group-hover/resize-menu:block absolute right-full top-0 mr-1 w-36 bg-[#1e1f21] border border-[#323438] rounded-lg shadow-2xl py-1 z-40">
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 1)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>1 Col (25%)</span>
                              {span === 1 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 2)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>2 Cols (50%)</span>
                              {span === 2 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 3)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>3 Cols (75%)</span>
                              {span === 3 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetColSpan(w.id, 4)}
                              className="w-full px-3 py-1.5 text-[12.5px] text-[#e8e8e9] hover:bg-[#28292b] text-left flex items-center justify-between cursor-pointer"
                            >
                              <span>Full Width</span>
                              {span === 4 && <Check className="w-3 h-3 text-[#4573d2]" />}
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-[#323438] my-1" />

                        <button
                          type="button"
                          onClick={() => handleDuplicateWidget(w.id)}
                          className="w-full px-3.5 py-2 text-[13px] text-[#e8e8e9] hover:bg-[#28292b] text-left transition-colors cursor-pointer"
                        >
                          Duplicate chart
                        </button>

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

              {/* Chart Body Renderings */}
              <div className="flex-1 my-3 flex items-center justify-center">
                {/* 1. Bar Chart */}
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

                {/* 2. Donut Chart */}
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

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#a8a5f8]" />
                      <span className="text-[12.5px] text-[#cfcecd]">Incomplete</span>
                    </div>
                  </div>
                )}

                {/* 3. Lollipop Chart */}
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

                        <div className="absolute inset-0 flex items-end justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-white mb-0.5">2</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#a8a5f8] shadow-sm" />
                            <div className="w-0.5 h-16 bg-[#a8a5f8]" />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center pt-3 text-[10px] text-[#8a8886]">
                        <span className="-rotate-35 origin-top-left transform translate-y-1">
                          Kevin&apos;s first project
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Area / Line Chart */}
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

                        <div className="absolute inset-0 flex items-end">
                          <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="areaGradDash" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a8a5f8" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#a8a5f8" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 10 95 L 45 95 L 80 95 L 115 95 L 150 95 L 185 95 L 220 95 L 255 70 L 290 40 L 310 30 L 310 100 L 10 100 Z"
                              fill="url(#areaGradDash)"
                            />
                            <path
                              d="M 10 95 L 45 95 L 80 95 L 115 95 L 150 95 L 185 95 L 220 95 L 255 70 L 290 40 L 310 30"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
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

              {/* Drag-to-Resize Handle on Right Edge (Asana Video 00:37) */}
              <div
                onMouseDown={(e) => startResizing(w.id, e)}
                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-[#4573d2]/30 active:bg-[#4573d2] transition-colors rounded-r-xl flex items-center justify-center group/resize"
                title="Drag to resize card width"
              >
                <div className="w-0.5 h-8 rounded-full bg-transparent group-hover/resize:bg-[#4573d2] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* View Chart Modal (Matching Asana Video Frame 00:29 - 00:32) */}
      {viewChartWidget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 select-none animate-in fade-in duration-150">
          <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-full max-w-4xl h-[560px] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="h-12 px-6 border-b border-[#2b2c2e] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">View chart</h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewChartWidget;
                    setViewChartWidget(null);
                    handleOpenEdit(target);
                  }}
                  className="p-1.5 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Edit chart"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewChartWidget(null)}
                  className="p-1.5 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-[#17181a] p-8 flex flex-col justify-between overflow-hidden">
              <h3 className="text-[20px] font-semibold text-white mb-6">
                {viewChartWidget.title}
              </h3>

              <div className="flex-1 flex items-center justify-center">
                {viewChartWidget.type === 'number' ? (
                  <span className="text-[120px] font-light text-white tracking-tight leading-none">
                    {computeKpiValue(viewChartWidget)}
                  </span>
                ) : (
                  <div className="text-[14px] text-[#8a8886] flex flex-col items-center gap-2">
                    <span className="text-white text-[16px]">Detailed chart view: {viewChartWidget.title}</span>
                    <span>Values dynamically evaluated from project tasks</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#8a8886] pt-4 border-t border-[#28292c]">
                <span>{viewChartWidget.filterCountText || 'No Filters'}</span>
                <button
                  type="button"
                  onClick={() => setViewChartWidget(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2d2e32] text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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