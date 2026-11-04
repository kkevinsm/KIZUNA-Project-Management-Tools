'use client';

import React, { useState } from 'react';
import {
  X,
  Users,
  ChevronDown,
  CheckCircle2,
  Check,
  Plus,
  Type,
  Hash,
  Calendar as CalendarIcon,
  CheckSquare,
  Sparkles,
  Library,
} from 'lucide-react';
import { ASANA_PALETTE, FieldOption } from './EditFieldModal';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateField: (field: {
    title: string;
    type: 'single_select' | 'text' | 'number' | 'date' | 'multi_select';
    description?: string;
    options?: FieldOption[];
    addToLibrary?: boolean;
    notifyCollaborators?: boolean;
  }) => void;
  workspaceName?: string;
}

export default function AddFieldModal({
  isOpen,
  onClose,
  onCreateField,
  workspaceName = 'My workspace',
}: AddFieldModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'ai'>('create');
  const [fieldTitle, setFieldTitle] = useState('');
  const [fieldType, setFieldType] = useState<
    'single_select' | 'text' | 'number' | 'date' | 'multi_select'
  >('single_select');
  const [isFieldTypePickerOpen, setIsFieldTypePickerOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('');

  // Default options matching Asana frame f_038.jpg (mint green and coral red)
  const [options, setOptions] = useState<FieldOption[]>([
    { id: 'opt-1', name: '', color: '#79e2c6', textColor: '#0c392b' },
    { id: 'opt-2', name: '', color: '#fd8374', textColor: '#4a1813' },
  ]);

  const [activeColorPickerOptionId, setActiveColorPickerOptionId] = useState<string | null>(null);
  const [addToLibrary, setAddToLibrary] = useState(false);
  const [notifyCollaborators, setNotifyCollaborators] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    // Pick next available color from palette
    const nextColor = ASANA_PALETTE[(options.length + 2) % ASANA_PALETTE.length];
    const newOption: FieldOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      color: nextColor.bg,
      textColor: nextColor.text,
    };
    setOptions([...options, newOption]);
  };

  const handleUpdateOption = (id: string, name: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, name } : opt)));
  };

  const handleSelectColor = (optionId: string, colorBg: string, textColor: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId ? { ...opt, color: colorBg, textColor } : opt
      )
    );
    setActiveColorPickerOptionId(null);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 1) return;
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fieldTitle.trim()) return;

    onCreateField({
      title: fieldTitle.trim(),
      type: fieldType,
      description: showDescription ? description.trim() : undefined,
      options:
        fieldType === 'single_select' || fieldType === 'multi_select'
          ? options.filter((o) => o.name.trim() !== '')
          : undefined,
      addToLibrary,
      notifyCollaborators,
    });

    // Reset state & close
    setFieldTitle('');
    setDescription('');
    setShowDescription(false);
    onClose();
  };

  const FIELD_TYPES = [
    { id: 'single_select', label: 'Single-select', icon: CheckCircle2 },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'number', label: 'Number', icon: Hash },
    { id: 'date', label: 'Date', icon: CalendarIcon },
    { id: 'multi_select', label: 'Multi-select', icon: CheckSquare },
  ];

  const currentTypeObj = FIELD_TYPES.find((t) => t.id === fieldType) || FIELD_TYPES[0];
  const CurrentIcon = currentTypeObj.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[620px] bg-[#1e1f21] border border-[#333538] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f5f4f3] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#2b2c2e]">
          <h2 className="text-[17px] font-bold text-white tracking-tight">Add field</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Manage access settings')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#44464a] hover:border-[#666] hover:bg-[#28292c] text-[12px] font-medium text-white transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#8a8886]" />
              <span>Manage access</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8a8886] hover:text-white hover:bg-[#28292c] transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar (matching f_038.jpg) */}
        <div className="flex items-center px-6 border-b border-[#2b2c2e] text-[13px] font-medium text-[#8a8886]">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-3 border-b-2 transition-colors relative ${
              activeTab === 'create'
                ? 'text-[#4573d2] border-[#4573d2] font-semibold'
                : 'border-transparent hover:text-white'
            }`}
          >
            Create new
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'text-[#4573d2] border-[#4573d2] font-semibold'
                : 'border-transparent hover:text-white'
            }`}
          >
            Choose from library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'text-[#4573d2] border-[#4573d2] font-semibold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ab7ffb]" />
            <span>Fields with AI Studio</span>
          </button>
        </div>

        {/* Tab 1: Create New Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Title & Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field title */}
              <div>
                <label className="block text-[12px] font-semibold text-[#a2a0a2] mb-1.5">
                  Field title <span className="text-[#f06a6a]">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={fieldTitle}
                  onChange={(e) => setFieldTitle(e.target.value)}
                  placeholder="e.g. Stage, Status, Priority"
                  className="w-full bg-[#18191b] border border-[#3b3d42] focus:border-[#4573d2] text-white rounded-lg px-3 py-2 text-[13px] outline-none transition-all placeholder-[#5e6065]"
                />
              </div>

              {/* Field type */}
              <div className="relative">
                <label className="block text-[12px] font-semibold text-[#a2a0a2] mb-1.5">
                  Field type
                </label>
                <button
                  type="button"
                  onClick={() => setIsFieldTypePickerOpen(!isFieldTypePickerOpen)}
                  className="w-full bg-[#18191b] border border-[#3b3d42] hover:border-[#525357] text-white rounded-lg px-3 py-2 text-[13px] flex items-center justify-between outline-none transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CurrentIcon className="w-4 h-4 text-[#8a8886]" />
                    <span>{currentTypeObj.label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                </button>

                {isFieldTypePickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl py-1 z-50 text-[13px] animate-in fade-in duration-100">
                    {FIELD_TYPES.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setFieldType(t.id as any);
                            setIsFieldTypePickerOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#2f3135] text-white text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-[#8a8886]" />
                            <span>{t.label}</span>
                          </div>
                          {fieldType === t.id && (
                            <Check className="w-3.5 h-3.5 text-[#4573d2]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Description toggle */}
            <div>
              {!showDescription ? (
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className="text-[12.5px] text-[#8a8886] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add description</span>
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-semibold text-[#a2a0a2]">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDescription(false)}
                      className="text-[11px] text-[#8a8886] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of this field..."
                    className="w-full bg-[#18191b] border border-[#3b3d42] focus:border-[#4573d2] text-white rounded-lg p-2.5 text-[13px] outline-none placeholder-[#5e6065] resize-none"
                  />
                </div>
              )}
            </div>

            {/* Options List (for Single-select and Multi-select) */}
            {(fieldType === 'single_select' || fieldType === 'multi_select') && (
              <div className="space-y-2 pt-1">
                <label className="block text-[12px] font-semibold text-[#a2a0a2]">
                  Options <span className="text-[#f06a6a]">*</span>
                </label>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2.5 relative">
                      {/* Color circle button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveColorPickerOptionId(
                            activeColorPickerOptionId === opt.id ? null : opt.id
                          )
                        }
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                        style={{ backgroundColor: opt.color }}
                        title="Change option color"
                      >
                        <ChevronDown className="w-2.5 h-2.5 text-black/60" />
                      </button>

                      {/* Color Picker Popover */}
                      {activeColorPickerOptionId === opt.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 top-7 z-50 bg-[#252628] border border-[#383a3d] rounded-xl shadow-2xl p-2.5 animate-in fade-in duration-100"
                        >
                          <div className="text-[11px] font-semibold text-[#8a8886] mb-1.5 px-0.5">
                            Color
                          </div>
                          <div className="grid grid-cols-8 gap-1.5">
                            {ASANA_PALETTE.map((pal) => (
                              <button
                                key={pal.id}
                                type="button"
                                onClick={() => handleSelectColor(opt.id, pal.bg, pal.text)}
                                className="w-5 h-5 rounded-md flex items-center justify-center hover:scale-110 transition-transform relative"
                                style={{ backgroundColor: pal.bg }}
                              >
                                {opt.color.toLowerCase() === pal.bg.toLowerCase() && (
                                  <Check
                                    className="w-3 h-3 stroke-[3]"
                                    style={{ color: pal.text }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Option Name Input */}
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                        placeholder="Type an option name"
                        className="flex-1 bg-transparent border-b border-[#3b3d42] focus:border-[#4573d2] text-white py-1 px-1 text-[13px] outline-none placeholder-[#5e6065] transition-colors"
                      />

                      {/* Remove Option Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={options.length <= 1}
                        className="p-1 rounded text-[#8a8886] hover:text-[#ff6b72] disabled:opacity-30 disabled:hover:text-[#8a8886] transition-colors"
                        title="Remove option"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add an option button */}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2 text-[12.5px] text-[#8a8886] hover:text-white flex items-center gap-1.5 transition-colors pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add an option</span>
                </button>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-[#2b2c2e]">
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#bdbbb9] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addToLibrary}
                  onChange={(e) => setAddToLibrary(e.target.checked)}
                  className="rounded border-[#44464a] bg-[#18191b] text-[#4573d2] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span>Add to {workspaceName}&apos;s field library</span>
              </label>

              <label className="flex items-center gap-2.5 text-[12.5px] text-[#bdbbb9] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyCollaborators}
                  onChange={(e) => setNotifyCollaborators(e.target.checked)}
                  className="rounded border-[#44464a] bg-[#18191b] text-[#4573d2] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span>Notify collaborators when this field&apos;s value is changed</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#2b2c2e]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-[13px] text-white hover:bg-[#28292c] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fieldTitle.trim()}
                className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#4573d2] hover:bg-[#5282e4] disabled:opacity-40 text-white transition-colors shadow-xs"
              >
                Create field
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Choose from library */}
        {activeTab === 'library' && (
          <div className="p-6 space-y-4">
            <div className="text-[13px] text-[#8a8886]">
              Choose from existing fields in your workspace field library:
            </div>
            <div className="space-y-2">
              {[
                { name: 'Estimated hours', type: 'number', icon: Hash },
                { name: 'Actual hours', type: 'number', icon: Hash },
                { name: 'Cost', type: 'number', icon: Hash },
                { name: 'Stage', type: 'single_select', icon: CheckCircle2 },
                { name: 'Department', type: 'single_select', icon: CheckCircle2 },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => {
                      onCreateField({
                        title: f.name,
                        type: f.type as any,
                      });
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#333538] hover:border-[#4573d2] bg-[#18191b] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#252628] flex items-center justify-center text-[#8a8886] group-hover:text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white">{f.name}</div>
                        <div className="text-[11px] text-[#8a8886] capitalize">{f.type}</div>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#4573d2] font-medium group-hover:underline">
                      Add to project
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Fields with AI Studio */}
        {activeTab === 'ai' && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#34244b] text-[#ab7ffb] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white mb-1">
                Generate custom fields with AI Studio
              </h3>
              <p className="text-[12.5px] text-[#8a8886] max-w-md mx-auto">
                Antigravity AI can analyze your task descriptions and automatically predict or
                populate field values like Priority, Complexity, or Sentiment.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onCreateField({
                    title: 'AI Priority Score',
                    type: 'single_select',
                    options: [
                      { id: '1', name: 'Critical', color: '#fd8374', textColor: '#4a1813' },
                      { id: '2', name: 'Standard', color: '#79e2c6', textColor: '#0c392b' },
                    ],
                  });
                  onClose();
                }}
                className="px-4 py-2 bg-[#ab7ffb] hover:bg-[#b890fc] text-black font-semibold rounded-lg text-[13px] transition-colors"
              >
                Add AI Suggested Field
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

