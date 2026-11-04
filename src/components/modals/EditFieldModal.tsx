'use client';

import React, { useState } from 'react';
import {
  X,
  Users,
  MoreHorizontal,
  Plus,
  Check,
  ChevronDown,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export interface FieldOption {
  id: string;
  name: string;
  color: string;
  textColor?: string;
}

// 16 Asana Field Colors matching screenshot media_1793780993951_a425a590.png
export const ASANA_PALETTE = [
  // Row 1
  { id: 'gray', bg: '#8a8d91', text: '#141517' },
  { id: 'coral', bg: '#fd8374', text: '#4a1813' },
  { id: 'orange', bg: '#ff9a51', text: '#4a2400' },
  { id: 'warm-yellow', bg: '#fec156', text: '#472d00' },
  { id: 'bright-yellow', bg: '#fed648', text: '#473b00' },
  { id: 'lime', bg: '#a2e276', text: '#193f00' },
  { id: 'mint', bg: '#79e2c6', text: '#0c392b' },
  { id: 'teal', bg: '#3ec5a8', text: '#043b30' },
  // Row 2
  { id: 'aqua', bg: '#64d2ff', text: '#003a52' },
  { id: 'sky-blue', bg: '#5ac8fa', text: '#023854' },
  { id: 'indigo', bg: '#5856d6', text: '#ffffff' },
  { id: 'purple', bg: '#af52de', text: '#ffffff' },
  { id: 'lilac', bg: '#de9bf6', text: '#3e134f' },
  { id: 'pink', bg: '#ff6482', text: '#ffffff' },
  { id: 'peach', bg: '#ffb3a7', text: '#4a1d17' },
  { id: 'dark-gray', bg: '#505459', text: '#ffffff' },
];

interface EditFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldType?: 'Status' | 'Priority';
  initialTitle?: string;
  initialOptions?: FieldOption[];
  onSave: (title: string, options: FieldOption[]) => void;
}

export default function EditFieldModal({
  isOpen,
  onClose,
  fieldType = 'Status',
  initialTitle,
  initialOptions,
  onSave,
}: EditFieldModalProps) {
  const { currentUser } = useApp();

  const [fieldTitle, setFieldTitle] = useState(initialTitle || fieldType);
  const [options, setOptions] = useState<FieldOption[]>(
    initialOptions && initialOptions.length > 0
      ? initialOptions
      : fieldType === 'Status'
      ? [
          { id: 'on-track', name: 'On track', color: '#79e2c6', textColor: '#0c392b' },
          { id: 'at-risk', name: 'At risk', color: '#fed648', textColor: '#473b00' },
          { id: 'off-track', name: 'Off track', color: '#fd8374', textColor: '#4a1813' },
        ]
      : [
          { id: 'low', name: 'Low', color: '#79e2c6', textColor: '#0c392b' },
          { id: 'medium', name: 'Medium', color: '#fec156', textColor: '#472d00' },
          { id: 'high', name: 'High', color: '#de9bf6', textColor: '#3e134f' },
        ]
  );

  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [activeColorPickerIndex, setActiveColorPickerIndex] = useState<number | null>(null);
  const [addToLibrary, setAddToLibrary] = useState(false);
  const [notifyCollaborators, setNotifyCollaborators] = useState(true);

  if (!isOpen) return null;

  const handleAddOption = () => {
    const paletteIndex = options.length % ASANA_PALETTE.length;
    const colorObj = ASANA_PALETTE[paletteIndex];
    const newOpt: FieldOption = {
      id: `opt-${Date.now()}`,
      name: `Option ${options.length + 1}`,
      color: colorObj.bg,
      textColor: colorObj.text,
    };
    setOptions([...options, newOpt]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
    if (activeColorPickerIndex === index) {
      setActiveColorPickerIndex(null);
    }
  };

  const handleNameChange = (index: number, newName: string) => {
    setOptions(
      options.map((opt, i) => (i === index ? { ...opt, name: newName } : opt))
    );
  };

  const handleColorSelect = (index: number, colorObj: (typeof ASANA_PALETTE)[0]) => {
    setOptions(
      options.map((opt, i) =>
        i === index ? { ...opt, color: colorObj.bg, textColor: colorObj.text } : opt
      )
    );
    setActiveColorPickerIndex(null);
  };

  const handleSave = () => {
    onSave(fieldTitle.trim() || fieldType, options);
    onClose();
  };

  return (
    <div
      data-modal-backdrop
      onClick={(e) => {
        if ((e.target as HTMLElement).getAttribute('data-modal-backdrop')) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1e1f21] border border-[#383a3d] rounded-2xl w-full max-w-[560px] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-[#f5f4f3]"
      >
        {/* Header: Title + Subtitle + Action buttons (Manage access, More, Close) */}
        <div className="flex items-start justify-between pb-1">
          <div>
            <h3 className="text-[18px] font-semibold text-white tracking-tight">Edit field</h3>
            <p className="text-[12px] text-[#8a8886] mt-0.5">
              Created by {currentUser?.name || 'Kevin Safrisal'}, Nov 2
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#37383b] bg-[#252628] hover:bg-[#2f3135] text-[12px] text-white font-medium transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Manage access</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 1: Field title & Field type */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="block text-[12px] font-semibold text-white">
              Field title <span className="text-[#fd8374]">*</span>
            </label>
            <input
              type="text"
              value={fieldTitle}
              onChange={(e) => setFieldTitle(e.target.value)}
              className="w-full bg-[#141517] border border-[#37383b] focus:border-white rounded-xl px-3.5 py-2 text-[13.5px] text-white outline-none transition-colors"
            />
            {!showDescription ? (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="text-[12px] text-[#8a8886] hover:text-white flex items-center gap-1 pt-0.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add description</span>
              </button>
            ) : (
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add instructions or details for this field..."
                rows={2}
                className="w-full bg-[#141517] border border-[#37383b] focus:border-white rounded-xl p-2.5 text-[12.5px] text-white outline-none mt-1 resize-none"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold text-white">Field type</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#141517] border border-[#2e3034] rounded-xl text-[13px] text-[#cfcecd]">
              <CheckCircle2 className="w-4 h-4 text-[#8a8886] shrink-0" />
              <span className="truncate">Single-select</span>
            </div>
          </div>
        </div>

        {/* Section: Options */}
        <div className="space-y-2 pt-1">
          <label className="block text-[12px] font-semibold text-white">
            Options <span className="text-[#fd8374]">*</span>
          </label>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {options.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className="group relative flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#252628] transition-colors"
              >
                {/* Drag handle */}
                <div className="text-[#55575a] group-hover:text-[#8a8886] cursor-grab">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Color picker circle button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColorPickerIndex(activeColorPickerIndex === idx ? null : idx)
                    }
                    className="w-5 h-5 rounded-full flex items-center justify-center text-black/80 hover:opacity-90 shrink-0 cursor-pointer shadow-xs transition-transform hover:scale-105"
                    style={{ backgroundColor: opt.color }}
                    title="Change color"
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-black/80 stroke-[3]" />
                  </button>

                  {/* Asana 16-Color Palette Popover (Matching Image 4) */}
                  {activeColorPickerIndex === idx && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-full mt-2 w-64 bg-[#1e1f21] border border-[#383a3d] rounded-xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="text-[11px] font-semibold text-[#8a8886] mb-2 uppercase tracking-wider">
                        Color
                      </div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {ASANA_PALETTE.map((pal) => {
                          const isSelected =
                            opt.color.toLowerCase() === pal.bg.toLowerCase();
                          return (
                            <button
                              key={pal.id}
                              type="button"
                              onClick={() => handleColorSelect(idx, pal)}
                              className="w-6 h-6 rounded-[5px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xs"
                              style={{ backgroundColor: pal.bg }}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-3.5 h-3.5 ${
                                    pal.id === 'indigo' || pal.id === 'purple' || pal.id === 'pink' || pal.id === 'dark-gray'
                                      ? 'text-white'
                                      : 'text-black'
                                  } stroke-[3]`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Option name input */}
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  className="bg-transparent text-[13px] text-white focus:outline-none flex-1 font-medium px-1 py-0.5 border border-transparent focus:border-[#4573d2] rounded"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="text-[#8a8886] hover:text-white p-1 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  title="Remove option"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-1.5 text-[12.5px] text-[#8a8886] hover:text-white px-2 py-1 rounded transition-colors cursor-pointer pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an option</span>
          </button>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-[#2e3034]">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addToLibrary}
              onChange={(e) => setAddToLibrary(e.target.checked)}
              className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer w-4 h-4 accent-[#4573d2]"
            />
            <span className="text-[12.5px] text-[#cfcecd]">
              Add to {currentUser?.workspace || 'My workspace'}&apos;s field library
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifyCollaborators}
              onChange={(e) => setNotifyCollaborators(e.target.checked)}
              className="rounded border-[#3a3b3e] bg-[#141517] text-[#4573d2] focus:ring-0 cursor-pointer w-4 h-4 accent-[#4573d2]"
            />
            <span className="text-[12.5px] text-[#cfcecd]">
              Notify collaborators when this field&apos;s value is changed
            </span>
          </label>
        </div>

        {/* Footer: Save changes button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#4573d2] hover:bg-[#3562be] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

