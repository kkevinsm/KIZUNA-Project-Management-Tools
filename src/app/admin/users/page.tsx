'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Columns,
  User,
  Shield,
  Info,
  ChevronDown,
  Sparkles,
  Plus,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserAccount } from '@/lib/types';
import UserSettingsModal from '@/components/admin/UserSettingsModal';

export default function AdminUsersPage() {
  const { allUsers, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | 'Members' | 'Guests' | 'Invited'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'role' | 'status' | 'lastActivity'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Normalize user list: ensure currentUser is always in the list
  const userList: UserAccount[] = useMemo(() => {
    const list = [...(allUsers || [])];
    if (currentUser && !list.some((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase())) {
      list.unshift(currentUser);
    }
    return list;
  }, [allUsers, currentUser]);

  // Filter users based on tab and search query
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      // Tab filter
      if (activeTab === 'Members') {
        if (user.userType === 'Guest' || user.userType === 'Invited' || user.role === 'Guest' || user.role === 'Invited') return false;
      } else if (activeTab === 'Guests') {
        if (user.userType !== 'Guest' && user.role !== 'Guest') return false;
      } else if (activeTab === 'Invited') {
        if (user.userType !== 'Invited' && user.role !== 'Invited' && user.userStatus !== 'Invited') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(query);
        const matchesEmail = user.email?.toLowerCase().includes(query);
        return matchesName || matchesEmail;
      }

      return true;
    }).sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'role') {
        valA = (a.role || 'Member').toLowerCase();
        valB = (b.role || 'Member').toLowerCase();
      } else if (sortField === 'status') {
        valA = (a.userStatus || 'Active').toLowerCase();
        valB = (b.userStatus || 'Active').toLowerCase();
      } else {
        valA = (a.lastActivity || 'Today').toLowerCase();
        valB = (b.lastActivity || 'Today').toLowerCase();
      }
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [userList, activeTab, searchQuery, sortField, sortAsc]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (user: UserAccount) => {
    setEditingUser(user);
    setIsSettingsModalOpen(true);
  };

  const handleSort = (field: 'name' | 'role' | 'status' | 'lastActivity') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const allSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">Users</h1>
      </div>

      {/* Filter Tabs (All, Members, Guests, Invited, +) */}
      <div className="flex items-center gap-2 text-[13px]">
        {(['All', 'Members', 'Guests', 'Invited'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[#2a2b2e] text-white shadow-xs'
                : 'text-[#9c9a99] hover:text-white hover:bg-[#202123]'
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={() => alert('Custom filter saved.')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9c9a99] hover:text-white hover:bg-[#202123] transition-colors"
          title="Add tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar & Toolbar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="relative w-full max-w-[340px]">
          <Search className="w-4 h-4 text-[#8a8886] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18191b] hover:bg-[#202123] focus:bg-[#18191b] border border-[#313336] focus:border-[#4573d2] rounded-lg pl-9 pr-3 py-1.5 text-white text-[13px] outline-none transition-colors placeholder-[#8a8886]"
          />
        </div>

        {/* Right Controls: Showing counter, Columns, Filter, Sort */}
        <div className="flex items-center gap-3 text-[13px] text-[#9c9a99]">
          <span>
            {filteredUsers.length} of {userList.length} showing
          </span>

          <div className="h-4 w-px bg-[#313336]" />

          <button
            onClick={() => alert('Displaying 7 columns')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#252628] hover:text-white transition-colors cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Columns: 7</span>
          </button>

          <button
            onClick={() => alert('Filter applied: Active members')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#252628] hover:text-white transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#252628] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1b1d] border border-[#2d2f32] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            {/* Header */}
            <thead>
              <tr className="border-b border-[#2d2f32] text-[#8a8886] font-medium text-[12px] bg-[#161718]/60">
                <th className="w-10 px-3.5 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded bg-[#252628] border-[#383a3e] accent-[#4573d2] cursor-pointer"
                  />
                </th>
                <th className="w-8 px-2 py-3 text-center">#</th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-3.5 py-3 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="px-3.5 py-3 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Role</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-3.5 py-3 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="px-3.5 py-3">
                  <div className="flex items-center gap-1">
                    <span>Licenses</span>
                    <Info className="w-3 h-3 opacity-70" />
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lastActivity')}
                  className="px-3.5 py-3 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Last activity</span>
                    <Info className="w-3 h-3 opacity-70" />
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="px-3.5 py-3">Invited by</th>
                <th className="px-3.5 py-3">Invited date</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#262729]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8a8886]">
                    No users found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const isOwner = user.role === 'Owner' || user.role === 'Admin';
                  const userRole = user.role || 'Member';
                  const userStatus = user.userStatus || 'Active';
                  const licenseTier = user.licenseTier || 'Advanced';
                  const lastActivity = user.lastActivity || 'Today';
                  const invitedBy = user.invitedBy || 'Joined independently';
                  const invitedDate = user.invitedDate || '-';

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className={`hover:bg-[#252628] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#252628]/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-3.5 py-3.5"
                        onClick={(e) => handleSelectUser(user.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded bg-[#252628] border-[#383a3e] accent-[#4573d2] cursor-pointer"
                        />
                      </td>

                      {/* Number # */}
                      <td className="px-2 py-3.5 text-center text-[#8a8886] font-mono text-[12px]">
                        {idx + 1}
                      </td>

                      {/* Name & Email */}
                      <td className="px-3.5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-xs"
                            style={{ backgroundColor: user.avatarColor || '#d84b7f' }}
                          >
                            {user.initials}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-white group-hover:text-[#4573d2] transition-colors truncate">
                              {user.name}
                            </div>
                            <div className="text-[12px] text-[#8a8886] truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-3.5 py-3.5 text-[#cfcecd]">
                        <div className="flex items-center gap-1.5">
                          {isOwner ? (
                            <Shield className="w-3.5 h-3.5 text-[#f06a6a]" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-[#8a8886]" />
                          )}
                          <span>{userRole}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3.5 text-[#cfcecd]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium bg-[#1d3524] text-[#48c774]">
                          {userStatus}
                        </span>
                      </td>

                      {/* Licenses */}
                      <td className="px-3.5 py-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-[#252628] border border-[#383a3e] px-2.5 py-1 rounded-lg text-white text-[12px] font-medium">
                          <div className="grid grid-cols-2 gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#f4a1dc]"></span>
                            <span className="w-1 h-1 rounded-full bg-[#f4a1dc]"></span>
                            <span className="w-1 h-1 rounded-full bg-[#f4a1dc]"></span>
                            <span className="w-1 h-1 rounded-full bg-[#f4a1dc]"></span>
                          </div>
                          <span>{licenseTier}</span>
                          <User className="w-3 h-3 text-[#8a8886] ml-0.5" />
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="px-3.5 py-3.5 text-[#cfcecd]">
                        {lastActivity}
                      </td>

                      {/* Invited By */}
                      <td className="px-3.5 py-3.5 text-[#cfcecd]">
                        {invitedBy}
                      </td>

                      {/* Invited Date */}
                      <td className="px-3.5 py-3.5 text-[#8a8886]">
                        {invitedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Settings Modal */}
      <UserSettingsModal
        user={editingUser}
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
}
