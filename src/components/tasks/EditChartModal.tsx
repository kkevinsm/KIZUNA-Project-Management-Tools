'use client';

import React, { useState, useEffect } from 'react';
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
  Radio,
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
  type: 'number' | 'bar' | 'donut' | 'lollipop' | 'line' | 'stacked_bar' | 'grouped_bar' | 'burnup' | 'burndown';
  filterCountText: string;
  filters: ChartFilter[];
  valueType: string;
  aggregation: string;
  size: 'kpi' | 'large';
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

interface EditChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: ChartConfig | null;
  onSave: (chart: ChartConfig) => void;
  tasks: Task[];
  sections: string[];
  projects: Project[];
}

export default function EditChartModal({
  isOpen,
  onClose,
  chart,
  onSave,
  tasks,
  sections,
  projects,
}: EditChartModalProps) {
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(chart);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isValueDropdownOpen, setIsValueDropdownOpen] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentChart(chart ? { ...chart, filters: [...chart.filters] } : null);
  }, [chart]);

  if (!isOpen || !currentChart) return null;

  const activeStyle = CHART_STYLES.find((s) => s.id === currentChart.type) || CHART_STYLES[7];
  const ActiveIcon = activeStyle.icon;

  // Evaluate task count based on filters
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
        if (f.field === 'section' && t.section !== f.value) {
          return false;
        }
        if (f.field === 'project' && t.projectId !== f.value) {
          return false;
        }
      }
      return true;
    }).length;
  };

  const handleSelectStyle = (type: ChartConfig['type']) => {
    setCurrentChart((prev) => (prev ? { ...prev, type, size: type === 'number' ? 'kpi' : 'large' } : null));
    setIsStyleDropdownOpen(false);
  };

  const handleRemoveFilter = (filterId: string) => {
    setCurrentChart((prev) => {
      if (!prev) return null;
      const updated = prev.filters.filter((f) => f.id !== filterId);
      const text = updated.length === 0 ? 'No Filters' : `${updated.length} Filter${updated.length > 1 ? 's' : ''}`;
      return { ...prev, filters: updated, filterCountText: text };
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
      const updated = [...prev.filters, newFilter];
      const text = `${updated.length} Filter${updated.length > 1 ? 's' : ''}`;
      return { ...prev, filters: updated, filterCountText: text };
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e1f21] border border-[#37383b] rounded-2xl w-full max-w-5xl h-[620px] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="h-12 px-5 border-b border-[#2b2c2e] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">Edit chart</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Live Chart Preview */}
          <div className="flex-1 bg-[#17181a] p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Chart Title in Preview */}
            <div className="self-start">
              <input
                type="text"
                value={currentChart.title}
                onChange={(e) => setCurrentChart((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="text-[18px] font-semibold text-white bg-transparent border-b border-transparent hover:border-[#37383b] focus:border-[#4573d2] outline-none px-1 py-0.5 rounded transition-colors w-full"
                title="Click to edit title"
              />
            </div>

            {/* Live Chart Center Visual */}
            <div className="flex-1 flex items-center justify-center my-6">
              {currentChart.type === 'number' && (
                <div className="flex flex-col items-center">
                  <span className="text-[80px] font-light text-white tracking-tight leading-none">
                    {calculatedNumber}
                  </span>
                </div>
              )}

              {currentChart.type === 'bar' && (
                <div className="w-full max-w-md h-[240px] flex flex-col justify-end">
                  <div className="flex items-end justify-around h-[180px] border-b border-[#37383b] px-4 gap-6">
                    {sections.map((sec, idx) => {
                      const count = tasks.filter((t) => t.section === sec).length;
                      const height = count > 0 ? `${Math.min(100, (count / 4) * 100)}%` : '4px';
                      return (
                        <div key={sec} className="flex flex-col items-center flex-1 h-full justify-end">
                          <span className="text-[12px] font-bold text-white mb-1.5">{count}</span>
                          <div
                            className="w-10 bg-[#a8a5f8] rounded-t-md transition-all duration-300"
                            style={{ height }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-around pt-3 text-[11px] text-[#8a8886]">
                    {sections.map((sec) => (
                      <span key={sec} className="truncate max-w-[80px] text-center">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentChart.type === 'donut' && (
                <div className="flex items-center gap-10">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#2a2b2f"
                        strokeWidth="16"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#a8a5f8"
                        strokeWidth="16"
                        strokeDasharray="238.76"
                        strokeDashoffset="60"
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[32px] font-bold text-white leading-none">
                        {calculatedNumber || 2}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#a8a5f8]" />
                    <span className="text-[13px] text-white">Incomplete</span>
                  </div>
                </div>
              )}

              {currentChart.type === 'lollipop' && (
                <div className="w-full max-w-sm h-[200px] flex items-end justify-center border-b border-[#37383b] pb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-bold text-white mb-1">2</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#a8a5f8]" />
                    <div className="w-1 h-32 bg-[#a8a5f8]" />
                    <span className="text-[11px] text-[#8a8886] mt-2">Kevin&apos;s first project</span>
                  </div>
                </div>
              )}

              {['line', 'stacked_bar', 'grouped_bar', 'burnup', 'burndown'].includes(currentChart.type) && (
                <div className="w-full max-w-md h-[200px] flex flex-col justify-end">
                  <svg className="w-full h-40" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="editGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a8a5f8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a8a5f8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 110 L 80 110 L 150 110 L 220 80 L 290 30 L 290 120 L 10 120 Z"
                      fill="url(#editGrad)"
                    />
                    <path
                      d="M 10 110 L 80 110 L 150 110 L 220 80 L 290 30"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <circle cx="220" cy="80" r="3" fill="#ffffff" />
                    <circle cx="290" cy="30" r="3" fill="#ffffff" />
                  </svg>
                  <div className="flex justify-between text-[10px] text-[#8a8886] pt-2 border-t border-[#37383b]">
                    <span>10/25</span>
                    <span>10/28</span>
                    <span>10/31</span>
                    <span>11/03</span>
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
            <div className="space-y-6">
              {/* Section 1: Chart details */}
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

                    {/* Chart Style Dropdown Menu matching Screenshot 4 */}
                    {isStyleDropdownOpen && (
                      <div className="absolute top-11 left-0 right-0 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
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

              {/* Section 2: Chart data matching Screenshot 5 */}
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-3">Chart data</h3>

                {/* Value Dropdowns */}
                <div>
                  <label className="text-[11px] text-[#8a8886] font-medium block mb-1.5">
                    Value
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Task dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsValueDropdownOpen((prev) => !prev)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] focus:border-[#4573d2] rounded-lg flex items-center justify-between text-white text-[13px] transition-colors cursor-pointer"
                      >
                        <span>{currentChart.valueType || 'Task'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </button>

                      {isValueDropdownOpen && (
                        <div className="absolute top-11 left-0 w-44 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 overflow-hidden text-[13px]">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentChart((prev) => (prev ? { ...prev, valueType: 'Task' } : null));
                              setIsValueDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-white hover:bg-[#2f3135] cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>Task</span>
                          </button>
                          <div className="px-3 py-2 flex items-center justify-between text-[#8a8886] hover:text-white hover:bg-[#2f3135] cursor-pointer">
                            <span>Time</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between text-[#8a8886] hover:text-white hover:bg-[#2f3135] cursor-pointer">
                            <span>Time entry</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between text-[#8a8886] hover:text-white hover:bg-[#2f3135] cursor-pointer">
                            <span>Custom field</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Count dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountDropdownOpen((prev) => !prev)}
                        className="w-full h-10 px-3 bg-[#252628] hover:bg-[#2c2d30] border border-[#37383b] focus:border-[#4573d2] rounded-lg flex items-center justify-between text-white text-[13px] transition-colors cursor-pointer"
                      >
                        <span>{currentChart.aggregation || 'Count'}</span>
                        <ChevronDown className="w-4 h-4 text-[#8a8886]" />
                      </button>

                      {isCountDropdownOpen && (
                        <div className="absolute top-11 left-0 w-32 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 overflow-hidden text-[13px]">
                          {['Count', 'Sum', 'Average'].map((agg) => (
                            <button
                              key={agg}
                              type="button"
                              onClick={() => {
                                setCurrentChart((prev) => (prev ? { ...prev, aggregation: agg } : null));
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
                </div>

                {/* Filters Stack List */}
                <div className="mt-4 space-y-2">
                  <label className="text-[11px] text-[#8a8886] font-medium block">
                    Filters
                  </label>

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
                        title="Remove filter"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* + Add Filter Dropdown */}
                  <div className="relative pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddFilterOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 text-[12.5px] text-[#4573d2] hover:text-[#6a98f0] font-medium cursor-pointer"
                    >
                      <span>+ Add filter</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isAddFilterOpen && (
                      <div className="absolute top-8 left-0 w-52 z-50 bg-[#252628] border border-[#3b3d42] rounded-xl shadow-2xl py-1.5 overflow-hidden text-[13px]">
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
              </div>
            </div>

            {/* Bottom Actions: Cancel & Save chart */}
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
                Save chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
