'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  Project,
  Attachment,
  Comment,
  Subtask,
  PriorityLevel,
  StatusLevel,
  UserAccount,
  Assignee,
} from '@/lib/types';
import { INITIAL_TASKS, INITIAL_PROJECTS, INITIAL_USERS } from '@/lib/initialData';

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  users: UserAccount[];
  currentUser: UserAccount;
  isAuthenticated: boolean;
  activeTaskId: string | null;
  activeTask: Task | null;
  searchQuery: string;
  isCreateModalOpen: boolean;
  createModalType: 'task' | 'project';
  isSidebarCollapsed: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  inviteUser: (name: string, email: string) => UserAccount;
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
    assignee?: Assignee;
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

const AVATAR_COLORS = [
  '#d84b7f', // Asana magenta
  '#4573d2', // Royal blue
  '#2ecc71', // Emerald
  '#e67e22', // Amber
  '#9b59b6', // Amethyst
  '#1abc9c', // Turquoise
  '#e74c3c', // Red
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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
      const savedUsers = localStorage.getItem('kizuna_users');
      const savedCurrentUserId = localStorage.getItem('kizuna_current_user_id');
      const savedAuth = localStorage.getItem('kizuna_is_auth');
      const savedTasks = localStorage.getItem('kizuna_tasks');
      const savedProjects = localStorage.getItem('kizuna_projects');

      let parsedUsers = INITIAL_USERS;
      if (savedUsers) {
        parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
      }

      if (savedCurrentUserId) {
        const found = parsedUsers.find((u) => u.id === savedCurrentUserId);
        if (found) setCurrentUser(found);
      }

      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }

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
      localStorage.setItem('kizuna_users', JSON.stringify(users));
      localStorage.setItem('kizuna_current_user_id', currentUser.id);
      localStorage.setItem('kizuna_is_auth', String(isAuthenticated));
      localStorage.setItem('kizuna_tasks', JSON.stringify(tasks));
      localStorage.setItem('kizuna_projects', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [users, currentUser, isAuthenticated, tasks, projects, isHydrated]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      return { success: false, error: 'User not found. Please sign up first.' };
    }

    if (password && existing.password && existing.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    setCurrentUser(existing);
    setIsAuthenticated(true);
    return { success: true };
  };

  const signup = (name: string, email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, error: 'Email already registered. Please log in instead.' };
    }

    const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password || 'password123',
      initials: getInitials(name),
      avatarColor: color,
      workspace: 'My workspace',
      role: 'Member',
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    // Also add as member to projects
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        members: [...p.members, { name: newUser.name, initials: newUser.initials, avatarColor: newUser.avatarColor }],
      }))
    );

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
    }
  };

  const inviteUser = (name: string, email: string): UserAccount => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) return existing;

    const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: 'password123',
      initials: getInitials(name),
      avatarColor: color,
      workspace: 'My workspace',
      role: 'Member',
    };

    setUsers((prev) => [...prev, newUser]);

    // Also add to projects
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        members: [...p.members, { name: newUser.name, initials: newUser.initials, avatarColor: newUser.avatarColor }],
      }))
    );

    return newUser;
  };

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
    assignee,
    dueDate = 'Today – Nov 4',
    priority = 'Low',
    status = 'On track',
    description = '',
  }: {
    name: string;
    section?: string;
    projectId?: string;
    assignee?: Assignee;
    dueDate?: string;
    priority?: PriorityLevel;
    status?: StatusLevel;
    description?: string;
  }) => {
    const project = projects.find((p) => p.id === projectId);
    const taskAssignee = assignee || {
      name: currentUser.name,
      initials: currentUser.initials,
      avatarColor: currentUser.avatarColor,
    };

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: name.trim() || 'New task',
      completed: false,
      section,
      projectId,
      projectName: project ? project.name : "Kevin's first project",
      assignee: taskAssignee,
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
      members: users.map((u) => ({
        name: u.name,
        initials: u.initials,
        avatarColor: u.avatarColor,
      })),
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
      author: currentUser.name,
      initials: currentUser.initials,
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
        users,
        currentUser,
        isAuthenticated,
        activeTaskId,
        activeTask,
        searchQuery,
        isCreateModalOpen,
        createModalType,
        isSidebarCollapsed,
        login,
        signup,
        logout,
        switchUser,
        inviteUser,
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
