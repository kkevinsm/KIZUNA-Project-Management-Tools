'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Project, Attachment, Comment, Subtask, PriorityLevel, StatusLevel } from '@/lib/types';
import { INITIAL_TASKS, INITIAL_PROJECTS, INITIAL_USER } from '@/lib/initialData';

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  currentUser: typeof INITIAL_USER;
  activeTaskId: string | null;
  activeTask: Task | null;
  searchQuery: string;
  isCreateModalOpen: boolean;
  createModalType: 'task' | 'project';
  isSidebarCollapsed: boolean;
  setSearchQuery: (query: string) => void;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  toggleSidebar: () => void;
  openCreateModal: (type?: 'task' | 'project') => void;
  closeCreateModal: () => void;
  createTask: (data: {
    name: string;
    section?: string;
    projectId?: string;
    dueDate?: string;
    priority?: PriorityLevel;
    status?: StatusLevel;
    description?: string;
  }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  createProject: (name: string, description?: string) => Project;
  addComment: (taskId: string, text: string) => void;
  addSubtask: (taskId: string, name: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addAttachment: (taskId: string, attachment: Attachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<'task' | 'project'>('task');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('kizuna_tasks');
      const savedProjects = localStorage.getItem('kizuna_projects');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedProjects) setProjects(JSON.parse(savedProjects));
    } catch {
      // Fallback to default
    }
    setIsHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('kizuna_tasks', JSON.stringify(tasks));
      localStorage.setItem('kizuna_projects', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [tasks, projects, isHydrated]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const openTaskDrawer = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  const closeTaskDrawer = () => {
    setActiveTaskId(null);
  };

  const openCreateModal = (type: 'task' | 'project' = 'task') => {
    setCreateModalType(type);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const createTask = ({
    name,
    section = 'To do',
    projectId = 'kevins-first-project',
    dueDate = 'Today – Nov 4',
    priority = 'Low',
    status = 'On track',
    description = '',
  }: {
    name: string;
    section?: string;
    projectId?: string;
    dueDate?: string;
    priority?: PriorityLevel;
    status?: StatusLevel;
    description?: string;
  }) => {
    const project = projects.find((p) => p.id === projectId);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: name.trim() || 'New task',
      completed: false,
      section,
      projectId,
      projectName: project ? project.name : "Kevin's first project",
      assignee: {
        name: INITIAL_USER.name,
        initials: INITIAL_USER.initials,
        avatarColor: INITIAL_USER.avatarColor,
      },
      dueDate,
      priority,
      status,
      visibility: 'My workspace',
      description,
      subtasks: [],
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const createProject = (name: string, description = '') => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now()}`;
    const newProject: Project = {
      id,
      name,
      joined: true,
      status: 'On track',
      members: [
        {
          name: INITIAL_USER.name,
          initials: INITIAL_USER.initials,
          avatarColor: INITIAL_USER.avatarColor,
        },
      ],
      portfolios: [],
      lastModified: 'Just now',
      description,
      sections: ['To do', 'Doing', 'Done'],
    };

    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: INITIAL_USER.name,
      initials: INITIAL_USER.initials,
      text: text.trim(),
      createdAt: 'Just now',
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, newComment] }
          : t
      )
    );
  };

  const addSubtask = (taskId: string, name: string) => {
    if (!name.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      completed: false,
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t
      )
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : t
      )
    );
  };

  const addAttachment = (taskId: string, attachment: Attachment) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [...t.attachments, attachment] }
          : t
      )
    );
  };

  const removeAttachment = (taskId: string, attachmentId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              attachments: t.attachments.filter((a) => a.id !== attachmentId),
            }
          : t
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        currentUser: INITIAL_USER,
        activeTaskId,
        activeTask,
        searchQuery,
        isCreateModalOpen,
        createModalType,
        isSidebarCollapsed,
        setSearchQuery,
        openTaskDrawer,
        closeTaskDrawer,
        toggleSidebar,
        openCreateModal,
        closeCreateModal,
        createTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        createProject,
        addComment,
        addSubtask,
        toggleSubtask,
        addAttachment,
        removeAttachment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
