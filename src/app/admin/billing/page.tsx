'use client';

import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminBillingPage() {
  const { allUsers } = useApp();

  const userCount = allUsers?.length || 1;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Billing</h1>
        <p className="text-[#8a8886] text-[13px] mt-1">
          Review subscription plan, member seat utilization, and payment methods.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Plan Card */}
        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#ff8bd3] uppercase tracking-wider bg-[#5e2750] px-2 py-0.5 rounded">
                Active Plan
              </span>
              <span className="text-[12px] text-[#8a8886]">Billed annually</span>
            </div>
            <div className="text-[24px] font-bold text-white">Advanced Tier</div>
            <p className="text-[#8a8886] text-[13px]">
              Full access to Dash AI, Agentic Work Management, Portfolio reporting, and unlimited storage.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d2f32] flex items-center justify-between">
            <div className="text-[12.5px] text-[#8a8886]">Renews Nov 4, 2027</div>
            <button
              onClick={() => alert('Billing portal will open in a secure window.')}
              className="text-[#4573d2] hover:underline font-semibold text-[13px]"
            >
              Manage plan
            </button>
          </div>
        </div>

        {/* Seat Utilization */}
        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-bold text-[#48c774] uppercase tracking-wider bg-[#1d3524] px-2 py-0.5 rounded w-max">
              Seats Allocated
            </span>
            <div className="text-[28px] font-bold text-white">
              {userCount} <span className="text-[15px] font-normal text-[#8a8886]">/ 25 seats</span>
            </div>
            <div className="w-full bg-[#252628] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#4573d2] h-full rounded-full transition-all"
                style={{ width: `${Math.max((userCount / 25) * 100, 8)}%` }}
              />
            </div>
            <p className="text-[#8a8886] text-[12.5px]">
              {25 - userCount} available seats remaining on your current subscription.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d2f32]">
            <button
              onClick={() => alert('Add more seats')}
              className="w-full bg-[#252628] hover:bg-[#2c2d30] text-white py-1.5 px-3 rounded-lg border border-[#37383c] font-medium text-[13px] transition-colors"
            >
              Add seats
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-bold text-[#8a8886] uppercase tracking-wider bg-[#252628] px-2 py-0.5 rounded w-max">
              Payment Method
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-7 rounded bg-[#252628] border border-[#37383c] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-[14px]">Mastercard •••• 4242</div>
                <div className="text-[12px] text-[#8a8886]">Expires 12/28</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d2f32] flex items-center justify-between">
            <div className="text-[12.5px] text-[#8a8886]">Default card</div>
            <button
              onClick={() => alert('Update payment details')}
              className="text-[#4573d2] hover:underline font-semibold text-[13px]"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
