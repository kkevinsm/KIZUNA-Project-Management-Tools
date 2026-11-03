'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Repeat,
} from 'lucide-react';

interface DateRangePickerProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDay, setStartDay] = useState<number | null>(2);
  const [endDay, setEndDay] = useState<number | null>(4);
  const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (!value) {
      setStartDay(null);
      setEndDay(null);
      return;
    }
    const nums = value.match(/\d+/g);
    if (nums && nums.length >= 2) {
      setStartDay(parseInt(nums[0], 10));
      setEndDay(parseInt(nums[nums.length - 1], 10));
    } else if (nums && nums.length === 1) {
      const d = parseInt(nums[0], 10);
      setStartDay(d);
      setEndDay(d);
    } else if (value.toLowerCase().includes('today')) {
      setStartDay(2);
      setEndDay(4);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectDay = (dayNum: number) => {
    if (activeInput === 'start') {
      setStartDay(dayNum);
      if (endDay !== null && dayNum > endDay) {
        setEndDay(dayNum);
      }
      setActiveInput('end');
      const newEnd = endDay && endDay >= dayNum ? endDay : dayNum;
      updateRange(dayNum, newEnd);
    } else {
      if (startDay !== null && dayNum < startDay) {
        setStartDay(dayNum);
        updateRange(dayNum, endDay || dayNum);
      } else {
        setEndDay(dayNum);
        updateRange(startDay || dayNum, dayNum);
      }
    }
  };

  const updateRange = (s: number, e: number) => {
    if (s === e) {
      onChange(`Nov ${s}`);
    } else {
      onChange(`Nov ${s} – ${e}`);
    }
  };

  const handleClear = () => {
    setStartDay(null);
    setEndDay(null);
    onChange('');
  };

  const startStr = startDay ? `11/${String(startDay).padStart(2, '0')}/26` : '';
  const endStr = endDay ? `11/${String(endDay).padStart(2, '0')}/26` : '';

  const displayText = value || (startDay && endDay ? `Nov ${startDay} – ${endDay}` : 'No due date');

  return (
    <div className="relative inline-block select-none" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#2a2b2e] border border-transparent hover:border-[#383a3d] text-[13px] font-medium text-white transition-colors"
      >
        <Calendar className="w-4 h-4 text-[#38b273]" />
        <span>{displayText}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-0.5 rounded hover:bg-[#383a3d] text-[#8a8886] hover:text-white ml-1 transition-colors"
            title="Clear due date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Date Range Picker Popover matching Asana screenshot exactly */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[290px] bg-[#212224] border border-[#343639] rounded-2xl shadow-2xl z-50 p-3.5 text-[#f5f4f3] animate-in fade-in zoom-in-95 duration-100">
          {/* Top Two Date Input Boxes */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Start Date Box */}
            <div
              onClick={() => setActiveInput('start')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1b1c1e] border text-[12.5px] cursor-pointer transition-colors ${
                activeInput === 'start'
                  ? 'border-white ring-1 ring-white/50 text-white font-medium'
                  : 'border-[#383a3d] text-[#c5c3c0]'
              }`}
            >
              <span>{startStr || 'Start date'}</span>
              {startStr && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStartDay(null);
                    if (endDay) onChange(`Nov ${endDay}`);
                  }}
                  className="text-[#8a8886] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* End Date Box */}
            <div
              onClick={() => setActiveInput('end')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1b1c1e] border text-[12.5px] cursor-pointer transition-colors ${
                activeInput === 'end'
                  ? 'border-white ring-1 ring-white/50 text-white font-medium'
                  : 'border-[#383a3d] text-[#c5c3c0]'
              }`}
            >
              <span>{endStr || 'Due date'}</span>
              {endStr && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEndDay(null);
                    if (startDay) onChange(`Nov ${startDay}`);
                  }}
                  className="text-[#8a8886] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Month Header: < November 2026 > */}
          <div className="flex items-center justify-between px-1 mb-2 text-[13px] font-semibold text-white">
            <button
              type="button"
              className="p-1 rounded hover:bg-[#2c2d30] text-[#8a8886] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>November 2026</span>
            <button
              type="button"
              className="p-1 rounded hover:bg-[#2c2d30] text-[#8a8886] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Letters: S M T W T F S */}
          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-[#8a8886] mb-1">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* 35-Day Grid with Seamless Connected Blue Selection */}
          <div className="grid grid-cols-7 text-center text-[12px] gap-y-0.5">
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i + 1;
              const isNov = dayNum <= 30;
              const displayNum = isNov ? dayNum : dayNum - 30;

              if (!isNov) {
                return (
                  <div key={i} className="h-8 flex items-center justify-center text-[#555659] text-[11px]">
                    {displayNum}
                  </div>
                );
              }

              // Range checks
              const isStart = startDay === displayNum;
              const isEnd = endDay === displayNum;
              const inRange =
                startDay !== null &&
                endDay !== null &&
                displayNum >= startDay &&
                displayNum <= endDay;

              // Rounded styling for seamless connected blue bar
              let barStyle = 'text-white hover:bg-[#2c2d30] rounded-full';
              if (inRange) {
                if (isStart && isEnd) {
                  barStyle = 'bg-[#4573d2] text-white font-bold rounded-full shadow-sm';
                } else if (isStart) {
                  barStyle = 'bg-[#4573d2] text-white font-bold rounded-l-full';
                } else if (isEnd) {
                  barStyle = 'bg-[#4573d2] text-white font-bold rounded-r-full';
                } else {
                  barStyle = 'bg-[#4573d2] text-white font-medium rounded-none';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDay(displayNum)}
                  className={`h-8 flex items-center justify-center transition-colors font-medium text-[12px] ${barStyle}`}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Clock, Repeat, Clear */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#313337] text-[12px]">
            <div className="flex items-center gap-2 text-[#8a8886]">
              <button
                type="button"
                className="p-1 rounded hover:bg-[#2c2d30] hover:text-white transition-colors"
                title="Set time"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-[#2c2d30] hover:text-white transition-colors"
                title="Repeat task"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-[#a2a09e] hover:text-white font-medium hover:underline px-1 py-0.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

