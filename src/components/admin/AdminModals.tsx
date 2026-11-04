'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Building2, Shield, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// ============================================================================
// 1. EDIT WORKSPACE NAME MODAL
// ============================================================================
interface EditWorkspaceNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditWorkspaceNameModal({ isOpen, onClose }: EditWorkspaceNameModalProps) {
  const { currentUser, updateWorkspaceName } = useApp();
  const [workspaceName, setWorkspaceName] = useState(currentUser?.workspace || 'My workspace');

  useEffect(() => {
    if (isOpen) {
      setWorkspaceName(currentUser?.workspace || 'My workspace');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      updateWorkspaceName(workspaceName.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-semibold text-white">Workspace name</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4 text-[13px]">
          <p className="text-[#8a8886]">
            Customize Kizuna by changing the workspace&apos;s name. This name is visible to all workspace members.
          </p>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1.5">
              Workspace name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
              placeholder="e.g. Acme Corp"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e2f32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. COMPANY DETAILS MODAL
// ============================================================================
interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyDetailsModal({ isOpen, onClose }: CompanyDetailsModalProps) {
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState('Technology & Software');
  const [size, setSize] = useState('51-200 employees');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-semibold text-white">Company details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-4 flex flex-col gap-4 text-[13px]">
          <p className="text-[#8a8886]">
            Tell us about your company to help us tailor Kizuna&apos;s recommendations to your organization.
          </p>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1.5">
              Company legal name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1.5">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors cursor-pointer"
            >
              <option value="Technology & Software">Technology &amp; Software</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
              <option value="Education">Education</option>
              <option value="E-commerce & Retail">E-commerce &amp; Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1.5">
              Company size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors cursor-pointer"
            >
              <option value="1-10 employees">1-10 employees</option>
              <option value="11-50 employees">11-50 employees</option>
              <option value="51-200 employees">51-200 employees</option>
              <option value="201-1000 employees">201-1000 employees</option>
              <option value="1000+ employees">1000+ employees</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e2f32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CONVERT TO ORGANIZATION MODAL
// ============================================================================
interface ConvertToOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertToOrganizationModal({ isOpen, onClose }: ConvertToOrganizationModalProps) {
  const [domain, setDomain] = useState('mycompany.com');
  const [isConverted, setIsConverted] = useState(false);

  if (!isOpen) return null;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConverted(true);
    setTimeout(() => {
      setIsConverted(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#4573d2]" />
            <h2 className="text-[17px] font-semibold text-white">Convert to Organization</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConvert} className="px-6 py-4 flex flex-col gap-4 text-[13px]">
          <p className="text-[#8a8886]">
            Convert your workspace to an organization to automatically connect everyone using your company&apos;s email domain.
          </p>

          <div className="bg-[#242528] border border-[#343639] rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="font-semibold text-white">Organization benefits:</div>
            <ul className="list-disc pl-4 space-y-1 text-[#8a8886]">
              <li>Centralized administrative governance and audit logs</li>
              <li>SAML 2.0 Single Sign-On (SSO) and SCIM user provisioning</li>
              <li>Multiple teams with dedicated privacy configurations</li>
            </ul>
          </div>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1.5">
              Company email domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. company.com"
              className="w-full bg-[#18191b] border border-[#343639] focus:border-[#4573d2] rounded-lg px-3 py-2 text-white text-[13px] outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e2f32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              {isConverted ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Domain verified!</span>
                </>
              ) : (
                <span>Convert to organization</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 4. TIME PERIODS MODAL
// ============================================================================
interface TimePeriodsModalProps {
  isOpen: boolean;
  value: string;
  onClose: () => void;
  onSave: (val: string) => void;
}

export function TimePeriodsModal({ isOpen, value, onClose, onSave }: TimePeriodsModalProps) {
  const [selected, setSelected] = useState(value || 'Jan 1');

  useEffect(() => {
    setSelected(value || 'Jan 1');
  }, [value, isOpen]);

  if (!isOpen) return null;

  const options = [
    { label: 'Start on Jan 1 (Standard calendar year)', value: 'Jan 1' },
    { label: 'Start on Feb 1', value: 'Feb 1' },
    { label: 'Start on Apr 1 (Q2 / UK / Japan fiscal year)', value: 'Apr 1' },
    { label: 'Start on Jul 1 (Mid-year fiscal year)', value: 'Jul 1' },
    { label: 'Start on Oct 1 (US Federal fiscal year)', value: 'Oct 1' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#f06a6a]" />
            <h2 className="text-[17px] font-semibold text-white">Time periods</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4 text-[13px]">
          <p className="text-[#8a8886]">
            Match your workspace&apos;s annual operating rhythm (i.e. fiscal year) in Kizuna.
          </p>

          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                  selected === opt.value
                    ? 'border-[#4573d2] bg-[#4573d2]/10 text-white'
                    : 'border-[#333538] hover:bg-[#252628] text-[#9c9a99]'
                }`}
              >
                <span>{opt.label}</span>
                {selected === opt.value && <Check className="w-4 h-4 text-[#4573d2]" />}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e2f32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(selected);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. CONTACT SALES MODAL
// ============================================================================
interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSalesModal({ isOpen, onClose }: ContactSalesModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1f21] border border-[#333538] rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden text-[#f5f4f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-semibold text-white">Contact Sales</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#2c2d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4 text-[13px]">
          <p className="text-[#8a8886]">
            Get a tailored walkthrough of Kizuna Enterprise features, volume discounts, and custom agentic AI deployment.
          </p>

          <div>
            <label className="block text-[#a2a09e] font-medium mb-1">Estimated team size</label>
            <select className="w-full bg-[#18191b] border border-[#343639] rounded-lg px-3 py-2 text-white outline-none">
              <option>10 - 50 seats</option>
              <option>51 - 250 seats</option>
              <option>251 - 1,000 seats</option>
              <option>1,000+ seats</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e2f32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#9c9a99] hover:text-white hover:bg-[#252628] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4573d2] hover:bg-[#3b63b8] text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              {submitted ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Request Sent!</span>
                </>
              ) : (
                <span>Request consultation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
