'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Hash,
  BarChart2,
  BarChart3,
  BarChart,
  TrendingUp,
  TrendingDown,
  PieChart,
  CircleDot,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Task, Project } from '@/lib/types';

export interface ChartFilter {
  id: string;
  field: string;
  label: string;
  value: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'number' | 'bar' | 'stacked_bar' | 'grouped_bar' | 'line' | 'burnup' | 'burndown' | 'donut' | 'lollipop' | 'text';
  color: string;
  filterCountText: string;
  filters: ChartFilter[];
  valueType: string;
  aggregation: string;
  unitOfTime?: 'Default' | 'Minutes' | 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years';
  size: 'kpi' | 'large';
  colSpan?: 1 | 2 | 3 | 4;
  textContent?: string;
  xAxis?: string;
  groupBy?: string;
  showAsPercentage?: boolean;
  dataLabels?: boolean;
  benchmarkLine?: boolean;
  timeGranularity?: 'Day' | 'Week' | 'Month';
  timeDurationValue?: number;
  timeDurationUnit?: 'Days' | 'Weeks' | 'Months';
}

const CHART_STYLES = [
  { id: 'bar', label: 'Bar', icon: BarChart2 },
  { id: 'stacked_bar', label: 'Stacked bar', icon: BarChart3 },
  { id: 'grouped_bar', label: 'Grouped bar', icon: BarChart },
  { id: 'line', label: 'Line', icon: TrendingUp },
  { id: 'burnup', label: 'Burnup', icon: TrendingUp },
  { id: 'burndown', label: 'Burndown', icon: TrendingDown },
  { id: 'donut', label: 'Donut', icon: PieChart },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'lollipop', label: 'Lollipop', icon: CircleDot },
] as const;

const PALETTE_COLORS = [
  { id: 'multi', label: 'Multi-color', value: '#a8a5f8', isMulti: true },
  { id: 'coral', label: 'Coral', value: '#f06a6a' },
  { id: 'orange', label: 'Orange', value: '#ec8c38' },
  { id: 'amber', label: 'Amber', value: '#f1bd3e' },
  { id: 'yellow', label: 'Yellow', value: '#f6d953' },
  { id: 'lime', label: 'Lime', value: '#bfe764' },
  { id: 'green', label: 'Green', value: '#70db8a' },
  { id: 'teal', label: 'Teal', value: '#4edab8' },
  { id: 'mint', label: 'Mint', value: '#75ebd6' },
  { id: 'blue', label: 'Light Blue', value: '#7fc2f5' },
  { id: 'lavender', label: 'Lavender', value: '#9d9af7' },
  { id: 'purple', label: 'Purple', value: '#c78bf5' },
  { id: 'pink', label: 'Pink', value: '#f397d6' },
  { id: 'rose', label: 'Rose', value: '#f79bb7' },
  { id: 'gray', label: 'Gray', value: '#9e9e9e' },
  { id: 'lightgray', label: 'Light Gray', value: '#d0d0d0' },
];

const X_AXIS_OPTIONS = [
  'Assignee',
  'Creator',
  'Section',
  'Task type',
  'Completion status',
  'Due date status',
  'Project',
  'Custom field',
];

const GROUP_BY_OPTIONS = [
  'Due date status',
  'Completion status',
  'Priority',
  'Task type',
  'Section',
  'Assignee',
];

// Helper to compute Asana dynamic title based on configuration
export const computeChartTitle = (chart: ChartConfig): string => {
  let metric = 'tasks';
  if (chart.valueType === 'Estimated time') {
    metric = 'estimated time';
  } else if (chart.valueType === 'Actual time') {
    metric = 'actual time';
  } else {
    const completionFilter = chart.filters.find((f) => f.field === 'completion');
    if (completionFilter?.value === 'completed') {
      metric = 'completed tasks';
    } else if (completionFilter?.value === 'incomplete') {
      metric = 'incomplete tasks';
    } else {
      const overdueFilter = chart.filters.find((f) => f.field === 'dueDate' && f.value === 'overdue');
      if (overdueFilter) {
        metric = 'overdue tasks';
      }
    }
  }

  if (chart.type === 'number') {
    return `Total ${metric}`;
  }
  if (chart.type === 'burndown') {
    return 'Tasks remaining over time';
  }
  if (chart.type === 'burnup') {
    return 'Task completion over time';
  }
  if (chart.type === 'line' && chart.xAxis === 'Time') {
    return 'Task completion over time';
  }

  const dim = (chart.type === 'donut' ? chart.xAxis : chart.xAxis) || 'Section';
  const dimLabel = dim === 'Due date status' ? 'task due date status' : dim.toLowerCase();

  let title = `Total ${metric} by ${dimLabel}`;

  if ((chart.type === 'stacked_bar' || chart.type === 'grouped_bar') && chart.groupBy) {
    const groupLabel = chart.groupBy === 'Due date status' ? 'task due date status' : chart.groupBy.toLowerCase();
    title += ` and ${groupLabel}`;
  }

  return title;
};

interface EditChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: ChartConfig | null;
  onSave: (chart: ChartConfig) => void;
  tasks: Task[];
  sections: string[];
  projects: Project[];
  isNew?: boolean;
}

export default function EditChartModal({
  isOpen,
  onClose,
  chart,
  onSave,
  tasks,
  sections,
  projects,
  isNew = false,
}: EditChartModalProps) {
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isXAxisOpen, setIsXAxisOpen] = useState(false);
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);
  const [isValueDropdownOpen, setIsValueDropdownOpen] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);
  const [isUnitOfTimeOpen, setIsUnitOfTimeOpen] = useState(false);
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserEditedTitle, setIsUserEditedTitle] = useState(false);

  useEffect(() => {
    if (chart) {
      setCurrentChart({
        ...chart,
        color: chart.color || '#a8a5f8',
        xAxis: chart.xAxis || 'Section',
        groupBy: chart.groupBy || 'Due date status',
        valueType: chart.valueType || 'Task',
        aggregation: chart.aggregation || 'Count',
        unitOfTime: chart.unitOfTime || 'Default',
        dataLabels: chart.dataLabels !== false,
        benchmarkLine: !!chart.benchmarkLine,
        showAsPercentage: !!chart.showAsPercentage,
        timeGranularity: chart.timeGranularity || 'Day',
        timeDurationValue: chart.timeDurationValue || 2,
        timeDurationUnit: chart.timeDurationUnit || 'Weeks',
        filters: [...chart.filters],
      });
      setIsUserEditedTitle(false);
    }
  }, [chart]);

  if (!isOpen || !currentChart) return null;

  const activeStyle = CHART_STYLES.find((s) => s.id === currentChart.type) || CHART_STYLES[0];
  const ActiveIcon = activeStyle.icon;
  const chartColor = currentChart.color || '#a8a5f8';

  // Helper to update setting and auto-update title if not manually customized
  const updateChartConfig = (patch: Partial<ChartConfig>) => {
    setCurrentChart((prev) => {
      if (!prev) return null;
      const updated: ChartConfig = { ...prev, ...patch };
      if (!isUserEditedTitle) {
        updated.title = computeChartTitle(updated);
      }
      return updated;
    });
  };

  // Compute metric for preview
  const computeValue = () => {
    return tasks.filter((t) => {
      for (const f of currentChart.filters) {
        if (f.field === 'completion') {
          if (f.value === 'completed' && !t.completed) return false;
          if (f.value === 'incomplete' && t.completed) return false;
        }
        if (f.field === 'dueDate' && f.value === 'overdue') {
          if (t.completed || !t.dueDate) return false;
          const due = new Date(t.dueDate);
          if (isNaN(due.getTime()) || due >= new Date()) return false;
        }
        if (f.field === 'section' && t.section !== f.value) return false;
        if (f.field === 'project' && t.projectId !== f.value) return false;
      }
      return true;
    }).length;
  };

  const handleSelectStyle = (type: ChartConfig['type']) => {
    updateChartConfig({
      type,
      size: type === 'number' ? 'kpi' : 'large',
    });
    setIsStyleDropdownOpen(false);
  };

  const handleRemoveFilter = (filterId: string) => {
    setCurrentChart((prev) => {
      if (!prev) return null;
      const updatedFilters = prev.filters.filter((f) => f.id !== filterId);
      const text = updatedFilters.length === 0 ? 'No Filters' : `${updatedFilters.length} Filter${updatedFilters.length > 1 ? 's' : ''}`;
      const nextChart: ChartConfig = { ...prev, filters: updatedFilters, filterCountText: text };
      if (!isUserEditedTitle) {
        nextChart.title = computeChartTitle(nextChart);
      }
      return nextChart;
    });
  };

  const handleAddFilter = (field: string, label: string, value: string) => {
    setCurrentChart((prev) => {
      if (!prev) return null;
      const newFilter: ChartFilter = {
        id: `f-${Date.now()}`,
        field,
        label,
        value,
      };
      const updatedFilters = [...prev.filters, newFilter];
      const text = `${updatedFilters.length} Filter${updatedFilters.length > 1 ? 's' : ''}`;
      const nextChart: ChartConfig = { ...prev, filters: updatedFilters, filterCountText: text };
      if (!isUserEditedTitle) {
        nextChart.title = computeChartTitle(nextChart);
      }
      return nextChart;
    });
    setIsAddFilterOpen(false);
  };

  const handleSave = () => {
    if (currentChart) {
      onSave(currentChart);
      onClose();
    }
  };

  const calculatedNumber = computeValue();
  const yAxisLabel = currentChart.valueType === 'Estimated time' || currentChart.valueType === 'Actual time'
    ? 'Estimated time (in minutes)'
    : 'Task count';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-full max-w-5xl h-[640px] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="h-12 px-5 border-b border-[#2b2c2e] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            {isNew ? 'Add chart' : 'Edit chart'}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Live Chart Preview */}
          <div className="flex-1 bg-[#17181a] p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Chart Title */}
            <div className="self-start w-full">
              <input
                type="text"
                value={currentChart.title}
                onChange={(e) => {
                  setIsUserEditedTitle(true);
                  setCurrentChart((prev) => (prev ? { ...prev, title: e.target.value } : null));
                }}
                className="text-[18px] font-semibold text-white bg-transparent border-b border-transparent hover:border-[#37383b] focus:border-[#4573d2] outline-none px-1 py-0.5 rounded transition-colors w-full"
                title="Click to edit title"
              />
            </div>

            {/* Live Chart Center Visual */}
            <div className="flex-1 flex items-center justify-center my-4 w-full">
              {/* 1. NUMBER */}
              {currentChart.type === 'number' && (
                <div className="flex flex-col items-center">
                  <span className="text-[88px] font-light text-white tracking-tight leading-none">
                    {calculatedNumber}
                  </span>
                </div>
              )}

              {/* 2. BAR */}
              {currentChart.type === 'bar' && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      {currentChart.benchmarkLine && (
                        <div className="absolute top-[35%] left-0 right-0 border-t-2 border-dashed border-[#f1bd3e] z-10">
                          <span className="absolute right-2 -top-4 text-[9px] text-[#f1bd3e]">Benchmark: 3</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-end justify-around px-4">
                        {sections.map((sec, idx) => {
                          const count = idx === 0 ? 3 : 0;
                          const heightPct = count > 0 ? (count / 5) * 100 : 2;
                          return (
                            <div key={sec} className="flex flex-col items-center justify-end h-full w-12">
                              {currentChart.dataLabels && (
                                <span className="text-[11px] font-bold text-white mb-1">{count}</span>
                              )}
                              <div
                                className="w-9 rounded-t-xs transition-all duration-300"
                                style={{ height: `${heightPct}%`, backgroundColor: chartColor }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                      {sections.map((sec) => (
                        <span key={sec} className="truncate max-w-[70px] -rotate-35 origin-top-left transform translate-y-1">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STACKED BAR */}
              {currentChart.type === 'stacked_bar' && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-end justify-around px-4">
                        <div className="flex flex-col items-center justify-end h-full w-12">
                          {currentChart.dataLabels && (
                            <span className="text-[11px] font-bold text-white mb-1">3</span>
                          )}
                          <div className="w-9 rounded-t-xs overflow-hidden flex flex-col justify-end" style={{ height: '60%' }}>
                            <div className="bg-[#bfe764] h-[33%] w-full flex items-center justify-center text-[10px] font-bold text-black">
                              {currentChart.dataLabels && '1'}
                            </div>
                            <div className="bg-[#a8a5f8] h-[67%] w-full flex items-center justify-center text-[10px] font-bold text-black">
                              {currentChart.dataLabels && '2'}
                            </div>
                          </div>
                        </div>

                        {sections.slice(1).map((sec) => (
                          <div key={sec} className="flex flex-col items-center justify-end h-full w-12">
                            {currentChart.dataLabels && (
                              <span className="text-[11px] font-bold text-white mb-1">0</span>
                            )}
                            <div className="w-9 h-0.5 bg-[#3e4044]" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                      {sections.map((sec) => (
                        <span key={sec} className="truncate max-w-[70px] -rotate-35 origin-top-left transform translate-y-1">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-6 space-y-2 text-[11px] text-[#cfcecd]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#75ebd6]" />
                      <span>Unscheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#f79bb7]" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#bfe764]" />
                      <span>Overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#a8a5f8]" />
                      <span>Upcoming</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. GROUPED BAR */}
              {currentChart.type === 'grouped_bar' && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-end justify-around px-4">
                        <div className="flex items-end gap-1 h-full">
                          <div className="flex flex-col items-center justify-end h-full">
                            {currentChart.dataLabels && <span className="text-[10px] font-bold text-white mb-0.5">2</span>}
                            <div className="w-7 h-[40%] bg-[#a8a5f8] rounded-t-xs" />
                          </div>
                          <div className="flex flex-col items-center justify-end h-full">
                            {currentChart.dataLabels && <span className="text-[10px] font-bold text-white mb-0.5">1</span>}
                            <div className="w-7 h-[20%] bg-[#bfe764] rounded-t-xs" />
                          </div>
                        </div>

                        {sections.slice(1, 2).map((sec) => (
                          <div key={sec} className="flex items-end gap-1 h-full">
                            <div className="flex flex-col items-center justify-end h-full">
                              {currentChart.dataLabels && <span className="text-[10px] font-bold text-white mb-0.5">0</span>}
                              <div className="w-7 h-0.5 bg-[#3e4044]" />
                            </div>
                            <div className="flex flex-col items-center justify-end h-full">
                              {currentChart.dataLabels && <span className="text-[10px] font-bold text-white mb-0.5">0</span>}
                              <div className="w-7 h-0.5 bg-[#3e4044]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                      {currentChart.xAxis === 'Completion status' ? (
                        <>
                          <span className="truncate max-w-[80px] -rotate-35 origin-top-left transform translate-y-1">
                            Incomplete
                          </span>
                          <span className="truncate max-w-[80px] -rotate-35 origin-top-left transform translate-y-1">
                            Completed
                          </span>
                        </>
                      ) : (
                        sections.slice(0, 2).map((sec) => (
                          <span key={sec} className="truncate max-w-[80px] -rotate-35 origin-top-left transform translate-y-1">
                            {sec}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="ml-6 space-y-2 text-[11px] text-[#cfcecd]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#a8a5f8]" />
                      <span>Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#bfe764]" />
                      <span>Overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#f79bb7]" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-[#75ebd6]" />
                      <span>Unscheduled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. LINE */}
              {currentChart.type === 'line' && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                          <path
                            d="M 37 48 L 112 120 L 187 120 L 262 120"
                            fill="none"
                            stroke={chartColor}
                            strokeWidth="2"
                          />
                          <circle cx="37" cy="48" r="3.5" fill={chartColor} />
                          <circle cx="112" cy="120" r="3.5" fill={chartColor} />
                          <circle cx="187" cy="120" r="3.5" fill={chartColor} />
                          <circle cx="262" cy="120" r="3.5" fill={chartColor} />
                          {currentChart.dataLabels && (
                            <>
                              <text x="37" y="38" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
                              <text x="112" y="112" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">0</text>
                              <text x="187" y="112" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">0</text>
                              <text x="262" y="112" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">0</text>
                            </>
                          )}
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                      {sections.map((sec) => (
                        <span key={sec} className="truncate max-w-[70px] -rotate-35 origin-top-left transform translate-y-1">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BURNUP & BURNDOWN */}
              {(currentChart.type === 'burnup' || currentChart.type === 'burndown') && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chartColor} stopOpacity="0.8" />
                              <stop offset="100%" stopColor={chartColor} stopOpacity="0.2" />
                            </linearGradient>
                          </defs>
                          {currentChart.type === 'burndown' ? (
                            // Burndown area curve sloping down
                            <>
                              <path
                                d="M 10 30 L 45 40 L 80 50 L 115 55 L 150 70 L 185 85 L 220 95 L 255 105 L 290 120 L 310 120 L 310 120 L 10 120 Z"
                                fill="url(#burnGrad)"
                              />
                              <path
                                d="M 10 30 L 45 40 L 80 50 L 115 55 L 150 70 L 185 85 L 220 95 L 255 105 L 290 120 L 310 120"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              {currentChart.dataLabels && (
                                <>
                                  <text x="10" y="22" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">5</text>
                                  <text x="80" y="42" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
                                  <text x="150" y="62" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                                  <text x="220" y="87" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
                                  <text x="290" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                </>
                              )}
                            </>
                          ) : (
                            // Burnup curve
                            <>
                              <path
                                d="M 10 120 L 45 120 L 80 120 L 115 120 L 150 120 L 185 120 L 220 120 L 255 120 L 275 80 L 295 48 L 295 120 Z"
                                fill="url(#burnGrad)"
                              />
                              <path
                                d="M 10 120 L 45 120 L 80 120 L 115 120 L 150 120 L 185 120 L 220 120 L 255 120 L 275 80 L 295 48"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              {currentChart.dataLabels && (
                                <>
                                  <text x="10" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="45" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="80" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="115" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="150" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="185" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="220" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="255" y="112" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                                  <text x="275" y="70" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                                  <text x="295" y="40" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                                </>
                              )}
                            </>
                          )}
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
                        <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: chartColor }} />
                        <span>{currentChart.type === 'burndown' ? 'Remaining' : 'Completed'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. DONUT */}
              {currentChart.type === 'donut' && (
                <div className="flex items-center justify-around w-full max-w-md">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="36" stroke="#252628" strokeWidth="16" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        stroke={chartColor}
                        strokeWidth="16"
                        strokeDasharray="226"
                        strokeDashoffset="0"
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[34px] font-bold text-white leading-none">
                        {currentChart.valueType === 'Estimated time'
                          ? currentChart.unitOfTime === 'Years'
                            ? '0 yr'
                            : currentChart.unitOfTime === 'Weeks'
                            ? '0 wk'
                            : currentChart.unitOfTime === 'Days'
                            ? '0 d'
                            : currentChart.unitOfTime === 'Hours'
                            ? '0 hr'
                            : '0 min'
                          : calculatedNumber}
                      </span>
                      {currentChart.dataLabels && (
                        <span className="text-[11px] text-white/80 mt-10">
                          {currentChart.valueType === 'Estimated time' ? '0' : calculatedNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: chartColor }} />
                    <span className="text-[13px] text-[#cfcecd]">
                      {currentChart.xAxis === 'Assignee' ? 'Kevin' : 'Recently assigned'}
                    </span>
                  </div>
                </div>
              )}

              {/* 8. LOLLIPOP */}
              {currentChart.type === 'lollipop' && (
                <div className="w-full max-w-lg h-[240px] flex items-center">
                  <div className="h-full flex items-center justify-center pr-3">
                    <span className="text-[10px] text-[#8a8886] -rotate-90 whitespace-nowrap">
                      {yAxisLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="relative flex-1 flex flex-col justify-between border-l border-b border-[#3e4044]">
                      {[5, 4, 3, 2, 1, 0].map((val) => (
                        <div key={val} className="w-full border-b border-[#2d2f33] relative flex items-center">
                          <span className="absolute -left-4 text-[9px] text-[#8a8886]">{val}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-end justify-around px-4">
                        {sections.map((sec, idx) => {
                          const count = idx === 0 ? 3 : 0;
                          const heightPct = count > 0 ? (count / 5) * 100 : 0;
                          return (
                            <div key={sec} className="flex flex-col items-center justify-end h-full w-12">
                              {currentChart.dataLabels && (
                                <span className="text-[11px] font-bold text-white mb-1">{count}</span>
                              )}
                              <div
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: chartColor }}
                              />
                              {count > 0 ? (
                                <div
                                  className="w-1 transition-all duration-300"
                                  style={{ height: `${heightPct}%`, backgroundColor: chartColor }}
                                />
                              ) : (
                                <div className="w-1 h-0.5 bg-transparent" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-around pt-3 text-[10px] text-[#8a8886]">
                      {currentChart.xAxis === 'Assignee' ? (
                        <span className="truncate max-w-[70px] -rotate-35 origin-top-left transform translate-y-1">
                          Kevin
                        </span>
                      ) : (
                        sections.map((sec) => (
                          <span key={sec} className="truncate max-w-[70px] -rotate-35 origin-top-left transform translate-y-1">
                            {sec}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#8a8886]">
              Real-time preview updates dynamically as you configure settings
            </div>
          </div>

          {/* Right Pane: Chart details & Chart data */}
          <div className="w-[360px] border-l border-[#2b2c2e] bg-[#1e1f21] flex flex-col justify-between p-5 overflow-y-auto">
            <div className="space-y-5">
              {/* Chart details */}
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-3">Chart details</h3>
                <div>
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                    Chart style
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStyleDropdownOpen((prev) => !prev)}
                      className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] focus:border-[#4573d2] rounded-lg flex items-center justify-between text-white text-[13px] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <ActiveIcon className="w-4 h-4 text-[#8a8886]" />
                        <span>{activeStyle.label}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                    </button>

                    {/* Chart Style Dropdown Menu */}
                    {isStyleDropdownOpen && (
                      <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 overflow-visible animate-in fade-in zoom-in-95 duration-100">
                        {/* 1. Set color > with Palette Submenu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsColorPickerOpen((prev) => !prev)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#2f3135] text-[13px] text-white transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-3.5 h-3.5 rounded-xs border border-[#45474c]"
                                style={{ backgroundColor: chartColor }}
                              />
                              <span>Set color</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#8a8886]" />
                          </button>

                          {/* Color Palette Popover */}
                          {isColorPickerOpen && (
                            <div className="absolute left-full top-0 ml-1.5 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl p-2.5 w-56 animate-in fade-in duration-100">
                              <div className="grid grid-cols-8 gap-1.5">
                                {PALETTE_COLORS.map((col) => {
                                  const isCurrent = currentChart.color === col.value;
                                  return (
                                    <button
                                      key={col.id}
                                      type="button"
                                      onClick={() => {
                                        updateChartConfig({ color: col.value });
                                        setIsColorPickerOpen(false);
                                        setIsStyleDropdownOpen(false);
                                      }}
                                      className="w-5 h-5 rounded-xs flex items-center justify-center hover:scale-115 transition-transform cursor-pointer relative"
                                      style={{ backgroundColor: col.value }}
                                      title={col.label}
                                    >
                                      {isCurrent && <Check className="w-3 h-3 text-white drop-shadow stroke-[3]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-[#323438] my-1" />

                        {/* List of Chart Styles */}
                        {CHART_STYLES.map((style) => {
                          const IconComponent = style.icon;
                          const isSelected = currentChart.type === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleSelectStyle(style.id)}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#2f3135] text-[13px] text-white transition-colors cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2.5">
                                <IconComponent className="w-4 h-4 text-[#8a8886]" />
                                <span>{style.label}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#2b2c2e]" />

              {/* Chart data */}
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-3">Chart data</h3>

                {/* STACKED BAR / GROUPED BAR: X-axis & Group by */}
                {(currentChart.type === 'stacked_bar' || currentChart.type === 'grouped_bar') && (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                        X-axis
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsXAxisOpen((v) => !v)}
                          className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                        >
                          <span>{currentChart.xAxis || 'Section'}</span>
                          <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                        </button>
                        {isXAxisOpen && (
                          <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px]">
                            {X_AXIS_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ xAxis: opt });
                                  setIsXAxisOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white flex items-center justify-between cursor-pointer"
                              >
                                <span>{opt}</span>
                                {currentChart.xAxis === opt && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                        Group by
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsGroupByOpen((v) => !v)}
                          className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                        >
                          <span>{currentChart.groupBy || 'Due date status'}</span>
                          <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                        </button>
                        {isGroupByOpen && (
                          <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px]">
                            {GROUP_BY_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ groupBy: opt });
                                  setIsGroupByOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white flex items-center justify-between cursor-pointer"
                              >
                                <span>{opt}</span>
                                {currentChart.groupBy === opt && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* BAR / LINE / LOLLIPOP: X-axis */}
                {(currentChart.type === 'bar' || currentChart.type === 'line' || currentChart.type === 'lollipop') && (
                  <div className="mb-3">
                    <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                      X-axis
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsXAxisOpen((v) => !v)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                      >
                        <span>{currentChart.xAxis || 'Section'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </button>
                      {isXAxisOpen && (
                        <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px]">
                          {X_AXIS_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                updateChartConfig({ xAxis: opt });
                                setIsXAxisOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white flex items-center justify-between cursor-pointer"
                            >
                              <span>{opt}</span>
                              {currentChart.xAxis === opt && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* DONUT: Group */}
                {currentChart.type === 'donut' && (
                  <div className="mb-3">
                    <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                      Group
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsXAxisOpen((v) => !v)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                      >
                        <span>{currentChart.xAxis || 'Section'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </button>
                      {isXAxisOpen && (
                        <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px]">
                          {X_AXIS_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                updateChartConfig({ xAxis: opt });
                                setIsXAxisOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white flex items-center justify-between cursor-pointer"
                            >
                              <span>{opt}</span>
                              {currentChart.xAxis === opt && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BURNUP / BURNDOWN: Day, Within the last, 2 Weeks */}
                {(currentChart.type === 'burnup' || currentChart.type === 'burndown') && (
                  <div className="space-y-2 mb-3">
                    <label className="text-[11px] text-[#8a8886] font-medium block">
                      X-axis
                    </label>
                    <select
                      value={currentChart.timeGranularity || 'Day'}
                      onChange={(e) => updateChartConfig({ timeGranularity: e.target.value as any })}
                      className="w-full h-10 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-white text-[13px] outline-none cursor-pointer"
                    >
                      <option value="Day">Day</option>
                      <option value="Week">Week</option>
                      <option value="Month">Month</option>
                    </select>
                    <select
                      value="Within the last"
                      disabled
                      className="w-full h-10 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-white text-[13px] outline-none"
                    >
                      <option value="Within the last">Within the last</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={currentChart.timeDurationValue || 2}
                        onChange={(e) => updateChartConfig({ timeDurationValue: parseInt(e.target.value) || 2 })}
                        className="h-10 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-white text-[13px] outline-none"
                      />
                      <select
                        value={currentChart.timeDurationUnit || 'Weeks'}
                        onChange={(e) => updateChartConfig({ timeDurationUnit: e.target.value as any })}
                        className="h-10 px-3 bg-[#252628] border border-[#37383b] rounded-lg text-white text-[13px] outline-none cursor-pointer"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Y-axis / Value / Measure */}
                <div className="mb-3">
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                    {currentChart.type === 'donut' ? 'Measure' : currentChart.type === 'number' ? 'Value' : 'Y-axis'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Value Type with interactive Submenu matching video */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsValueDropdownOpen((v) => !v)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                      >
                        <span className="truncate">{currentChart.valueType || 'Task'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886] shrink-0" />
                      </button>

                      {isValueDropdownOpen && (
                        <div className="absolute top-11 left-0 w-48 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                          {/* Task */}
                          <button
                            type="button"
                            onClick={() => {
                              updateChartConfig({ valueType: 'Task', aggregation: 'Count' });
                              setIsValueDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 flex items-center justify-between text-white hover:bg-[#2f3135] cursor-pointer"
                          >
                            <span>Task</span>
                            {currentChart.valueType === 'Task' && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>

                          {/* Time > */}
                          <div className="relative group/time">
                            <div className="px-3 py-2 flex items-center justify-between text-white hover:bg-[#2f3135] cursor-pointer">
                              <span>Time</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                            </div>
                            <div className="hidden group-hover/time:block absolute left-full top-0 ml-1 w-44 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 z-50">
                              <button
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ valueType: 'Time to complete', aggregation: 'Average' });
                                  setIsValueDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left text-white hover:bg-[#2f3135] cursor-pointer"
                              >
                                Time to complete
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ valueType: 'Time in section', aggregation: 'Average' });
                                  setIsValueDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left text-white hover:bg-[#2f3135] cursor-pointer"
                              >
                                Time in section
                              </button>
                            </div>
                          </div>

                          {/* Time entry > */}
                          <div className="relative group/timeentry">
                            <div className="px-3 py-2 flex items-center justify-between text-white hover:bg-[#2f3135] cursor-pointer">
                              <span>Time entry</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8886]" />
                            </div>
                            <div className="hidden group-hover/timeentry:block absolute left-full top-0 ml-1 w-44 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 z-50">
                              <button
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ valueType: 'Estimated time', aggregation: 'Sum', unitOfTime: 'Default' });
                                  setIsValueDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left text-white hover:bg-[#2f3135] cursor-pointer flex items-center justify-between"
                              >
                                <span>Estimated time</span>
                                {currentChart.valueType === 'Estimated time' && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ valueType: 'Actual time', aggregation: 'Sum', unitOfTime: 'Default' });
                                  setIsValueDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left text-white hover:bg-[#2f3135] cursor-pointer flex items-center justify-between"
                              >
                                <span>Actual time</span>
                                {currentChart.valueType === 'Actual time' && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            </div>
                          </div>

                          {/* Custom field */}
                          <div className="px-3 py-2 flex items-center justify-between text-[#8a8886] hover:text-white hover:bg-[#2f3135] cursor-pointer">
                            <span>Custom field</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aggregation */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountDropdownOpen((v) => !v)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                      >
                        <span>{currentChart.aggregation || 'Count'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </button>

                      {isCountDropdownOpen && (
                        <div className="absolute top-11 left-0 w-32 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                          {['Count', 'Sum', 'Average'].map((agg) => (
                            <button
                              key={agg}
                              type="button"
                              onClick={() => {
                                updateChartConfig({ aggregation: agg });
                                setIsCountDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between text-white hover:bg-[#2f3135] cursor-pointer"
                            >
                              <span>{agg}</span>
                              {currentChart.aggregation === agg && <Check className="w-4 h-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unit of time selector (when Time entry is selected) */}
                  {(currentChart.valueType === 'Estimated time' || currentChart.valueType === 'Actual time') && (
                    <div className="mt-3">
                      <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                        Unit of time
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsUnitOfTimeOpen((v) => !v)}
                          className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] rounded-lg flex items-center justify-between text-white text-[13px] cursor-pointer"
                        >
                          <span>{currentChart.unitOfTime || 'Default'}</span>
                          <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                        </button>
                        {isUnitOfTimeOpen && (
                          <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                            {['Default', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'].map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => {
                                  updateChartConfig({ unitOfTime: unit as any });
                                  setIsUnitOfTimeOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white flex items-center justify-between cursor-pointer"
                              >
                                <span>{unit}</span>
                                {(currentChart.unitOfTime || 'Default') === unit && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Show as percentage toggle */}
                {(currentChart.type === 'stacked_bar' || currentChart.type === 'donut') && (
                  <label className="flex items-center gap-2 text-[12.5px] text-[#cfcecd] cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={!!currentChart.showAsPercentage}
                      onChange={(e) => updateChartConfig({ showAsPercentage: e.target.checked })}
                      className="rounded border-[#37383b] bg-[#252628] text-[#4573d2] focus:ring-0"
                    />
                    <span>Show as percentage</span>
                  </label>
                )}

                {/* Filters */}
                <div className="mt-4 pt-3 border-t border-[#2b2c2e]">
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-2">
                    Filters
                  </label>

                  <div className="space-y-1.5">
                    {currentChart.filters.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between px-3 py-2 bg-[#252628] border border-[#37383b] rounded-lg text-[13px] text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-[#8a8886] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4573d2]" />
                          </span>
                          <span>{f.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(f.id)}
                          className="p-1 text-[#8a8886] hover:text-white rounded transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* + Add filter button */}
                  <div className="relative pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddFilterOpen((v) => !v)}
                      className="flex items-center gap-1.5 text-[12.5px] text-[#4573d2] hover:text-[#6a98f0] font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add filter</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isAddFilterOpen && (
                      <div className="absolute top-9 left-0 w-52 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => handleAddFilter('completion', 'Incomplete', 'incomplete')}
                          className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white cursor-pointer"
                        >
                          Incomplete tasks
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddFilter('completion', 'Completed', 'completed')}
                          className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white cursor-pointer"
                        >
                          Completed tasks
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddFilter('dueDate', 'Overdue', 'overdue')}
                          className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white cursor-pointer"
                        >
                          Overdue tasks
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddFilter('dueDate', 'Upcoming month', 'upcoming_month')}
                          className="w-full px-3 py-2 text-left hover:bg-[#2f3135] text-white cursor-pointer"
                        >
                          Upcoming month
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data annotations */}
                {currentChart.type !== 'number' && (
                  <div className="mt-4 pt-3 border-t border-[#2b2c2e] space-y-2">
                    <label className="text-[11px] text-[#8a8886] font-medium block mb-1">
                      Data annotations
                    </label>
                    <label className="flex items-center gap-2 text-[12.5px] text-[#cfcecd] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentChart.dataLabels !== false}
                        onChange={(e) => updateChartConfig({ dataLabels: e.target.checked })}
                        className="rounded border-[#37383b] bg-[#252628] text-[#4573d2] focus:ring-0"
                      />
                      <span>Data labels</span>
                    </label>
                    {currentChart.type !== 'donut' && (
                      <label className="flex items-center gap-2 text-[12.5px] text-[#cfcecd] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!currentChart.benchmarkLine}
                          onChange={(e) => updateChartConfig({ benchmarkLine: e.target.checked })}
                          className="rounded border-[#37383b] bg-[#252628] text-[#4573d2] focus:ring-0"
                        />
                        <span>Benchmark line</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#2b2c2e] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2d2e32] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-[#4573d2] hover:bg-[#3562be] text-white text-[13px] font-medium transition-colors cursor-pointer shadow-sm"
              >
                {isNew ? 'Add chart' : 'Save chart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}