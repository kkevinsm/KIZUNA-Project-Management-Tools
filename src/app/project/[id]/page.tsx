'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  SlidersHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  Layers,
  Search,
  ListTodo,
  CheckCircle2,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TaskRow from '@/components/tasks/TaskRow';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import ExploreProjectBar from '@/components/modals/ExploreProjectBar';
import FileManager from '@/components/files/FileManager';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'kevins-first-project';

  const {
    projects,
    tasks,
    currentUser,
    openCreateModal,
    createTask,
  } = useApp();

  const project = projects.find((p) => p.id === projectId) || projects[0];

  const [activeTab, setActiveTab] = useState<'Overview' | 'List' | 'Board' | 'Timeline' | 'Dashboard' | 'Calendar' | 'Files'>('List');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isStarred, setIsStarred] = useState(false);
  const [inlineNewTaskSection, setInlineNewTaskSection] = useState<string | null>(null);
  const [inlineTaskName, setInlineTaskName] = useState('');

  const sections = project?.sections || ['To do', 'Doing', 'Done'];

  const projectTasks = tasks.filter((t) => t.projectId === project?.id);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInlineCreate = (section: string) => {
    if (!inlineTaskName.trim()) {
      setInlineNewTaskSection(null);
      return;
    }

    createTask({
      name: inlineTaskName.trim(),
      section,
      projectId: project.id,
      dueDate: 'Nov 5',
    });

    setInlineTaskName('');
    setInlineNewTaskSection(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f21] select-none">
      {/* Top Header */}
      <div className="px-6 pt-4 pb-2 border-b border-[#2b2c2e]">
        <div className="flex items-center justify-between mb-3">
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#333538] flex items-center justify-center text-white">
              <ListTodo className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white flex items-center gap-1.5 hover:bg-[#28292c] px-2 py-0.5 rounded-lg cursor-pointer transition-colors">
                <span>{project.name}</span>
                <ChevronDown className="w-4 h-4 text-[#8a8886]" />
              </h1>

              {/* Favorite Star */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`p-1 rounded hover:bg-[#28292c] transition-colors ${
                  isStarred ? 'text-[#f5b324]' : 'text-[#8a8886] hover:text-white'
                }`}
                title={isStarred ? 'Remove from favorites' : 'Star project'}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-[#f5b324]' : ''}`} />
              </button>

              {/* Set Status */}
              <button
                onClick={() => alert("Project status: On track")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252628] hover:bg-[#2c2d30] text-[#bdbbb9] text-[12px] font-medium border border-[#37383b]"
              >
                <div className="w-2 h-2 rounded-full bg-[#4cd195]" />
                <span>Set status</span>
                <ChevronDown className="w-3 h-3 text-[#8a8886]" />
              </button>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
              <button className="w-7 h-7 rounded-full bg-[#2a2b2e] flex items-center justify-center text-[#8a8886] hover:text-white">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => alert("Share project modal")}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => alert("Customize project workflows and fields")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252628] hover:bg-[#2f3135] text-[#f5f4f3] border border-[#37383b] text-[12px] font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-6 text-[13px] font-medium overflow-x-auto">
          {(['Overview', 'List', 'Board', 'Timeline', 'Dashboard', 'Calendar', 'Files'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-white font-semibold'
                    : 'text-[#8a8886] hover:text-[#bdbbb9]'
                }`}
              >
                <span>{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4573d2] rounded-full" />
                )}
              </button>
            )
          )}
          <button
            onClick={() => alert("Add view tab")}
            className="text-[#8a8886] hover:text-white pb-2.5 font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      {activeTab === 'List' && (
        <div className="h-[44px] min-h-[44px] px-6 border-b border-[#2b2c2e] flex items-center justify-between text-[13px]">
          {/* Add task button */}
          <div className="flex items-center">
            <button
              onClick={() => openCreateModal('task')}
              className="flex items-center gap-1.5 bg-[#4573d2] hover:bg-[#3562be] text-white px-3 py-1.5 rounded-l-lg font-medium text-[12px] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add task</span>
            </button>
            <button
              onClick={() => openCreateModal('task')}
              className="bg-[#4573d2] hover:bg-[#3562be] text-white px-1.5 py-1.5 rounded-r-lg border-l border-[#3562be] text-[12px] transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right action controls */}
          <div className="flex items-center gap-3 text-[#bdbbb9] text-[12px]">
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <Layers className="w-3.5 h-3.5" />
              <span>Group</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-[#28292c]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
            <button className="p-1 rounded hover:bg-[#28292c] hover:text-white">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'List' && (
          <div className="flex flex-col min-h-full justify-between">
            <div>
              {/* Table Column Headers */}
              <div className="flex items-center h-[32px] px-4 border-b border-[#2b2c2e] text-[#8a8886] font-semibold text-[11px] uppercase tracking-wider select-none">
                <div className="w-[30px]" />
                <div className="flex-1 min-w-[200px] pr-4">Name</div>
                <div className="w-[160px] hidden md:block px-2">Assignee</div>
                <div className="w-[130px] hidden sm:block px-2">Due date</div>
                <div className="w-[110px] hidden sm:block px-2">Priority</div>
                <div className="w-[110px] hidden lg:block px-2">Status</div>
                <div className="w-[30px] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-[#6d6c6e]" />
                </div>
              </div>

              {/* Sections */}
              <div className="pb-8">
                {sections.map((sectionName) => {
                  const isCollapsed = collapsedSections[sectionName];
                  const sectionTasks = projectTasks.filter(
                    (t) => t.section === sectionName
                  );

                  return (
                    <div key={sectionName} className="border-b border-[#252628]">
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSection(sectionName)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#252628] cursor-pointer group text-[13px] font-bold text-white transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8a8886] group-hover:text-white" />
                        )}
                        <span>{sectionName}</span>
                      </div>

                      {/* Section Tasks */}
                      {!isCollapsed && (
                        <div>
                          {sectionTasks.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              showProjectColumn={false}
                            />
                          ))}

                          {/* Inline add task input or button */}
                          {inlineNewTaskSection === sectionName ? (
                            <div className="flex items-center h-[38px] px-8 border-b border-[#2b2c2e] bg-[#252628]">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Write a task name..."
                                value={inlineTaskName}
                                onChange={(e) => setInlineTaskName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleInlineCreate(sectionName);
                                  if (e.key === 'Escape') setInlineNewTaskSection(null);
                                }}
                                className="w-full bg-transparent text-white text-[13px] outline-none"
                              />
                              <button
                                onClick={() => handleInlineCreate(sectionName)}
                                className="text-[12px] bg-[#4573d2] text-white px-2.5 py-0.5 rounded font-medium ml-2"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setInlineNewTaskSection(null)}
                                className="text-[12px] text-[#8a8886] hover:text-white px-2 py-0.5 ml-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setInlineNewTaskSection(sectionName)}
                              className="flex items-center gap-2 h-[34px] px-10 text-[12px] text-[#8a8886] hover:text-white hover:bg-[#252628] w-full text-left transition-colors"
                            >
                              <span>Add task</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Section */}
                <button
                  onClick={() => alert("Add section")}
                  className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#8a8886] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add section</span>
                </button>
              </div>
            </div>

            {/* Bottom Explore Your Project Banner */}
            <div className="p-4">
              <ExploreProjectBar />
            </div>
          </div>
        )}

        {activeTab === 'Board' && (
          <TaskBoard
            sections={sections}
            tasks={projectTasks}
            projectId={project.id}
          />
        )}

        {activeTab === 'Calendar' && <TaskCalendar tasks={projectTasks} />}

        {activeTab === 'Dashboard' && (
          <TaskDashboard tasks={projectTasks} projectName={project.name} />
        )}

        {activeTab === 'Files' && <FileManager />}

        {activeTab === 'Overview' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-[#252628] border border-[#333538] rounded-2xl p-6">
              <h2 className="text-[18px] font-bold text-white mb-2">Project Description</h2>
              <p className="text-[14px] text-[#bdbbb9] leading-relaxed">
                {project.description || 'Welcome to your project! Keep everyone aligned on goals and track milestones.'}
              </p>
            </div>

            <div className="bg-[#252628] border border-[#333538] rounded-2xl p-6">
              <h2 className="text-[18px] font-bold text-white mb-4">Project Roles</h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <div>
                  <div className="font-semibold text-white text-[14px]">{currentUser.name}</div>
                  <div className="text-[12px] text-[#8a8886]">Project Owner • {currentUser.email}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Timeline' && (
          <div className="p-8 text-center text-[#8a8886]">
            <h2 className="text-[18px] font-bold text-white mb-2">Gantt & Timeline View</h2>
            <p className="text-[13px] max-w-md mx-auto">
              Visual roadmap and dependency mapping for &quot;{project.name}&quot; tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
