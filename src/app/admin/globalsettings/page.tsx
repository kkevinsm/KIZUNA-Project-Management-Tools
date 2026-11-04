'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  EditWorkspaceNameModal,
  CompanyDetailsModal,
  ConvertToOrganizationModal,
  TimePeriodsModal,
} from '@/components/admin/AdminModals';

export default function GlobalSettingsPage() {
  const { currentUser } = useApp();

  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const [isCompanyDetailsOpen, setIsCompanyDetailsOpen] = useState(false);
  const [isConvertOrgOpen, setIsConvertOrgOpen] = useState(false);
  const [isTimePeriodsOpen, setIsTimePeriodsOpen] = useState(false);

  const [fiscalYearStart, setFiscalYearStart] = useState('Jan 1');
  const [mlEnabled, setMlEnabled] = useState(true);

  // Restore saved global settings
  useEffect(() => {
    try {
      const savedFiscal = localStorage.getItem('kizuna_fiscal_start');
      if (savedFiscal) setFiscalYearStart(savedFiscal);

      const savedMl = localStorage.getItem('kizuna_ml_recommendations');
      if (savedMl !== null) setMlEnabled(savedMl === 'true');
    } catch {}
  }, []);

  const handleSaveFiscalYear = (val: string) => {
    setFiscalYearStart(val);
    try {
      localStorage.setItem('kizuna_fiscal_start', val);
    } catch {}
  };

  const handleToggleMl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !mlEnabled;
    setMlEnabled(nextVal);
    try {
      localStorage.setItem('kizuna_ml_recommendations', String(nextVal));
    } catch {}
  };

  const workspaceName = currentUser?.workspace || 'My workspace';

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">
      {/* Top Page Title */}
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* Main Settings Card (Exact match to admin_14.jpg) */}
      <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#2d2f32]">
          <h2 className="text-[16px] font-semibold text-white">Settings</h2>
        </div>

        <div className="divide-y divide-[#262729] text-[13.5px]">
          {/* 1. Workspace name */}
          <div
            onClick={() => setIsEditWorkspaceOpen(true)}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                Workspace name
              </div>
              <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                Customize Kizuna by changing the workspace&apos;s name.
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#cfcecd] group-hover:text-white transition-colors">
              <span className="font-medium text-[13px]">{workspaceName}</span>
              <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 2. Company details */}
          <div
            onClick={() => setIsCompanyDetailsOpen(true)}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                Company details
              </div>
              <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                Tell us about your company to help us tailor Kizuna&apos;s recommendations to your organization
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#cfcecd] group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 3. Convert to organization */}
          <div
            onClick={() => setIsConvertOrgOpen(true)}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                Convert to organization
              </div>
              <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                Convert your workspace to an organization
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#cfcecd] group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 4. Time periods */}
          <div
            onClick={() => setIsTimePeriodsOpen(true)}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                Time periods
              </div>
              <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                Match your workspace&apos;s annual operating rhythm (i.e. fiscal year) in Kizuna.
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#cfcecd] group-hover:text-white transition-colors">
              <span className="font-medium text-[13px]">Start on {fiscalYearStart}</span>
              <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 5. Machine learning for recommendations */}
          <div
            onClick={handleToggleMl}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#202124] transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors">
                Machine learning for recommendations
              </div>
              <div className="text-[12.5px] text-[#8a8886] mt-0.5">
                Allow recommendations and insights using Kizuna&apos;s own machine learning models.
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#cfcecd] group-hover:text-white transition-colors">
              <span className="font-medium text-[13px]">{mlEnabled ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditWorkspaceNameModal
        isOpen={isEditWorkspaceOpen}
        onClose={() => setIsEditWorkspaceOpen(false)}
      />
      <CompanyDetailsModal
        isOpen={isCompanyDetailsOpen}
        onClose={() => setIsCompanyDetailsOpen(false)}
      />
      <ConvertToOrganizationModal
        isOpen={isConvertOrgOpen}
        onClose={() => setIsConvertOrgOpen(false)}
      />
      <TimePeriodsModal
        isOpen={isTimePeriodsOpen}
        value={fiscalYearStart}
        onSave={handleSaveFiscalYear}
        onClose={() => setIsTimePeriodsOpen(false)}
      />
    </div>
  );
}
