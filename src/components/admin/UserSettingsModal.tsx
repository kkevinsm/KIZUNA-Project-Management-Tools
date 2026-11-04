'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  User,
  Shield,
  Layers,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface UserSettingsModalProps {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedUser: Partial<UserAccount>) => void;
}

export default function UserSettingsModal({
  user,
  isOpen,
  onClose,
  onSave,
}: UserSettingsModalProps) {
  const { updateUserAccount } = useApp();

  const [activeTab, setActiveTab] = useState<'Profile' | 'Team access' | 'Security' | 'Licenses'>('Licenses');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Member' | 'Admin' | 'Guest'>('Member');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [licenseTier, setLicenseTier] = useState('Advanced');
  const [isLicenseDropdownOpen, setIsLicenseDropdownOpen] = useState(false);
  const [aiRequestsEnabled, setAiRequestsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole((user.role === 'Admin' || user.role === 'Owner') ? 'Admin' : 'Member');
      setJobTitle(user.jobTitle || '');
      setDepartment(user.department || '');
      setLicenseTier(user.licenseTier || 'Advanced');
      setAiRequestsEnabled(user.aiSpendingEnabled ?? true);
      setActiveTab('Licenses');
      setIsSaved(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = () => {
    const updates: Partial<UserAccount> = {
      name,
      role,
      jobTitle,
      department,
      licenseTier,
      aiSpendingEnabled: aiRequestsEnabled,
    };

    if (updateUserAccount) {
      updateUserAccount(user.id, updates);
    }
    if (onSave) {
      onSave(updates);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const tabs: ('Profile' | 'Team access' | 'Security' | 'Licenses')[] = [
    'Profile',
    'Team access',
    'Security',
    'Licenses',
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[620px] shadow-2xl flex flex-col overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[18px] font-semibold text-white tracking-tight">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-[#2d2f32] text-[13.5px]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium transition-colors relative cursor-pointer ${
                activeTab === tab
                  ? 'text-white border-b-2 border-[#4573d2]'
                  : 'text-[#9c9a99] hover:text-[#d0cfcd]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6 text-[13px]">
          {/* TAB 1: LICENSES (Matches admin_06.jpg) */}
          {activeTab === 'Licenses' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Product License Section */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <h3 className="text-[14.5px] font-semibold text-white">Licenses</h3>
                  <p className="text-[#8a8886] text-[12.5px] mt-0.5">
                    Grant access to a product. Features will differ based on license type assigned.{' '}
                    <span className="text-[#4573d2] hover:underline cursor-pointer">Learn more</span>
                  </p>
                </div>

                <div className="bg-[#242528] border border-[#343639] rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Purple Agentic Icon */}
                    <div className="w-9 h-9 rounded-lg bg-[#5e2750] border border-[#893875]/40 flex items-center justify-center text-[#ff8bd3] shrink-0">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4a1dc]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4a1dc]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4a1dc]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4a1dc]"></span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-[13.5px]">
                        Agentic Work Management
                      </div>
                      <div className="text-[12px] text-[#8a8886]">
                        Work smarter with AI across every team
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Tier Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setIsLicenseDropdownOpen(!isLicenseDropdownOpen)}
                      className="flex items-center gap-2 bg-[#1a1b1d] hover:bg-[#202124] border border-[#383a3e] px-3 py-1.5 rounded-lg text-white font-medium text-[12.5px] cursor-pointer transition-colors"
                    >
                      <span>{licenseTier}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8a8886]" />
                    </button>

                    {isLicenseDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1b1d] border border-[#383a3e] rounded-xl shadow-xl p-1 z-30">
                        {['Advanced', 'Enterprise', 'Standard', 'Starter'].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => {
                              setLicenseTier(tier);
                              setIsLicenseDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#252628] text-white text-[12.5px] flex items-center justify-between"
                          >
                            <span>{tier}</span>
                            {licenseTier === tier && <Check className="w-3.5 h-3.5 text-[#4573d2]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Spending Section */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <h3 className="text-[14.5px] font-semibold text-white">AI spending</h3>
                  <p className="text-[#8a8886] text-[12.5px] mt-0.5">
                    Give this user access to AI spending for Kizuna AI features.
                  </p>
                </div>

                <div className="bg-[#242528] border border-[#343639] rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#2a2b2f] border border-[#3d3f44] flex items-center justify-center text-[#a2a09e] shrink-0">
                      <Sparkles className="w-4 h-4 text-[#ff7043]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-[13.5px]">AI requests</div>
                      <div className="text-[12px] text-[#8a8886]">
                        Used for agentic collaboration with AI Teammates, Dash, and Meetings.
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setAiRequestsEnabled(!aiRequestsEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiRequestsEnabled ? 'bg-[#4573d2]' : 'bg-[#3e4044]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        aiRequestsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'Profile' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3.5 pb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-bold"
                  style={{ backgroundColor: user.avatarColor || '#d84b7f' }}
                >
                  {user.initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-[15px]">{name}</div>
                  <div className="text-[#8a8886] text-[12.5px]">{email}</div>
                </div>
              </div>

              <div>
                <label className="block text-[#a2a09e] font-medium text-[12.5px] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#a2a09e] font-medium text-[12.5px] mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Member' | 'Admin' | 'Guest')}
                  className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors cursor-pointer"
                >
                  <option value="Admin">Admin (Full administrative privileges)</option>
                  <option value="Member">Member (Standard member access)</option>
                  <option value="Guest">Guest (Limited access to specific projects)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#a2a09e] font-medium text-[12.5px] mb-1.5">
                  Job title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Product Designer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#a2a09e] font-medium text-[12.5px] mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Product, Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TEAM ACCESS */}
          {activeTab === 'Team access' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-[14.5px] font-semibold text-white">Workspace teams & projects</h3>
                <p className="text-[#8a8886] text-[12.5px] mt-0.5">
                  Manage which workspaces and team projects this user can view or edit.
                </p>
              </div>

              <div className="bg-[#242528] border border-[#343639] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#343639]">
                  <div className="font-semibold text-white">Default Workspace Team</div>
                  <span className="text-[12px] bg-[#1a1b1d] border border-[#383a3e] px-2 py-0.5 rounded text-[#4573d2]">
                    Joined
                  </span>
                </div>
                <div className="text-[12.5px] text-[#8a8886]">
                  User has access to all public projects created within the workspace.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'Security' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-[14.5px] font-semibold text-white">Security & Authentication</h3>
                <p className="text-[#8a8886] text-[12.5px] mt-0.5">
                  Configure authentication rules, password resets, and session tokens.
                </p>
              </div>

              <div className="bg-[#242528] border border-[#343639] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Two-factor authentication</div>
                  <div className="text-[12px] text-[#8a8886]">Require 2FA via authenticator app</div>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-[#4573d2]' : 'bg-[#3e4044]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#242528] border border-[#343639] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Active Sessions</div>
                  <div className="text-[12px] text-[#8a8886]">1 device currently authenticated</div>
                </div>
                <button
                  onClick={() => alert('All other sessions terminated successfully.')}
                  className="bg-[#1a1b1d] hover:bg-[#202124] border border-[#383a3e] px-2.5 py-1.5 rounded-lg text-white text-[12px] font-medium"
                >
                  Log out all devices
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#1a1b1d] border-t border-[#2e2f32]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors cursor-pointer text-[13px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors shadow-sm cursor-pointer text-[13px] flex items-center gap-1.5"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
