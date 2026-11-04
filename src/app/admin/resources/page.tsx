'use client';

import React from 'react';
import { BookOpen, HelpCircle, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export default function AdminResourcesPage() {
  const resources = [
    {
      title: 'Kizuna Administration Guide',
      desc: 'Complete overview of permissions, organization structures, and security settings.',
      icon: BookOpen,
      url: '#',
    },
    {
      title: 'Asana Migration & Import Tools',
      desc: 'Seamlessly migrate boards, tasks, custom fields, and team attachments from Asana.',
      icon: FileText,
      url: '#',
    },
    {
      title: 'Security, Compliance & HIPAA',
      desc: 'SOC2 Type II documentation, cloud encryption standards, and data residency agreements.',
      icon: ShieldCheck,
      url: '#',
    },
    {
      title: 'Developer REST & GraphQL API',
      desc: 'Integrate Kizuna with CI/CD pipelines, Slack bots, and internal workflow automations.',
      icon: ExternalLink,
      url: '#',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Resources</h1>
        <p className="text-[#8a8886] text-[13px] mt-1">
          Guides, enterprise policies, API documentation, and migration toolkits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-[#1a1b1d] border border-[#2d2f32] hover:border-[#4573d2]/60 rounded-2xl p-5 shadow-xl flex items-start gap-4 transition-colors cursor-pointer group"
              onClick={() => alert(`Opening ${item.title}...`)}
            >
              <div className="w-10 h-10 rounded-xl bg-[#252628] border border-[#383a3e] flex items-center justify-center text-[#cfcecd] group-hover:text-white shrink-0">
                <Icon className="w-5 h-5 text-[#f06a6a]" />
              </div>
              <div>
                <div className="font-semibold text-white text-[14px] group-hover:text-[#4573d2] transition-colors flex items-center gap-1.5">
                  <span>{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div className="text-[12.5px] text-[#8a8886] mt-1 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
