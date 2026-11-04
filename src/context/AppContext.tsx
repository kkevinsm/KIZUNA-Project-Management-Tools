'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  Portfolio,
  Goal,
  TeamMessage,
} from '@/lib/types';
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_USERS,
  INITIAL_PORTFOLIOS,
  INITIAL_GOALS,
  INITIAL_TEAM_MESSAGES,
} from '@/lib/initialData';

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
  isInviteModalOpen: boolean;
  openInviteModal: () => void;
  closeInviteModal: () => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginWithGoogle: (customGoogleAccount?: { name: string; email: string; picture?: string }) => { success: boolean };
  signup: (name: string, email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  inviteUser: (name: string, email: string) => UserAccount;
  inviteTeammates: (emails: string[], projectIds?: string[]) => { addedCount: number; existingCount: number };
  setSearchQuery: (query: string) => void;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  toggleSidebar: () => void;
  openCreateModal: (type?: 'task' | 'project') => void;
  closeCreateModal: () => void;
  createTask: (data: {
    name: string;
    section?: string;
    myTasksSection?: string;
    taskType?: 'task' | 'milestone' | 'approval';
    projectId?: string;
    assignee?: Assignee;
    dueDate?: string;
    priority?: PriorityLevel;
    status?: StatusLevel;
    description?: string;
  }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  reorderTasks: (newTasks: Task[]) => void;
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  createProject: (name: string, description?: string) => Project;
  portfolios: Portfolio[];
  createPortfolio: (name: string, defaultView?: 'List' | 'Timeline' | 'Workload') => Portfolio;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  addComment: (taskId: string, text: string) => void;
  addSubtask: (taskId: string, name: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addAttachment: (taskId: string, attachment: Attachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  viewConfigs: Record<string, { name: string; icon?: string }>;
  updateViewConfig: (viewKey: string, updates: Partial<{ name: string; icon?: string }>) => void;
  goals: Goal[];
  createGoal: (goalData: { title: string; timePeriod?: string; privacy?: string }) => Goal;
  updateUserProfile: (data: Partial<UserAccount>) => void;
  teamMessages: TeamMessage[];
  addTeamMessage: (title: string, content: string) => void;
  teamDescription: string;
  setTeamDescription: (desc: string) => void;
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
  const [portfolios, setPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>(INITIAL_TEAM_MESSAGES);
  const [teamDescription, setTeamDescription] = useState<string>('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<'task' | 'project'>('task');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewConfigs, setViewConfigs] = useState<Record<string, { name: string; icon?: string }>>({
    List: { name: 'List', icon: '' },
    Board: { name: 'Board', icon: '' },
    Calendar: { name: 'Calendar', icon: '' },
    Dashboard: { name: 'Dashboard', icon: '' },
    Files: { name: 'Files', icon: '' },
    Overview: { name: 'Overview', icon: '' },
    Timeline: { name: 'Timeline', icon: '' },
  });

  const updateViewConfig = useCallback((viewKey: string, updates: Partial<{ name: string; icon?: string }>) => {
    setViewConfigs((prev) => {
      const next = {
        ...prev,
        [viewKey]: {
          ...(prev[viewKey] || { name: viewKey, icon: '' }),
          ...updates,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kizuna_view_configs', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Sync snapshot to Cloudflare R2
  const syncToCloudflareR2 = useCallback(async (type: 'users' | 'tasks' | 'projects', data: unknown) => {
    try {
      await fetch('/api/storage?action=save_db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });
    } catch {
      // offline or silent
    }
  }, []);

  // Restore state from localStorage on mount & clean up mock Alex account
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('kizuna_users');
      const savedCurrentUserId = localStorage.getItem('kizuna_current_user_id');
      const savedAuth = localStorage.getItem('kizuna_is_auth');
      const savedTasks = localStorage.getItem('kizuna_tasks');
      const savedProjects = localStorage.getItem('kizuna_projects');
      const savedPortfolios = localStorage.getItem('kizuna_portfolios');
      const savedViewConfigs = localStorage.getItem('kizuna_view_configs');

      if (savedPortfolios) {
        try {
          setPortfolios(JSON.parse(savedPortfolios));
        } catch {}
      }

      if (savedViewConfigs) {
        try {
          const parsed = JSON.parse(savedViewConfigs);
          setViewConfigs((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      let parsedUsers = INITIAL_USERS;
      if (savedUsers) {
        parsedUsers = JSON.parse(savedUsers);
        // Clean out any legacy mock Alex Teammate accounts
        parsedUsers = parsedUsers.filter(
          (u: UserAccount) => u.id !== 'user-friend' && !u.name.toLowerCase().includes('alex teammate')
        );
        if (parsedUsers.length === 0) parsedUsers = INITIAL_USERS;
        setUsers(parsedUsers);
      }

      if (savedCurrentUserId) {
        const found = parsedUsers.find((u) => u.id === savedCurrentUserId);
        if (found) setCurrentUser(found);
        else setCurrentUser(parsedUsers[0]);
      }

      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }

      if (savedTasks) {
        let parsedTasks: Task[] = JSON.parse(savedTasks);
        // Clean out Alex assignments
        parsedTasks = parsedTasks.map((t) => {
          if (t.assignee?.name?.toLowerCase().includes('alex teammate')) {
            return { ...t, assignee: { name: 'Unassigned', initials: '', isPlaceholder: true } };
          }
          return t;
        });

        // Ensure initial sample tasks (like completed task, milestone, approval) are available for filter testing
        const existingIds = new Set(parsedTasks.map((t) => t.id));
        const missingInitial = INITIAL_TASKS.filter((it) => !existingIds.has(it.id));
        if (missingInitial.length > 0) {
          parsedTasks = [...parsedTasks, ...missingInitial];
        }

        setTasks(parsedTasks);
      }

      if (savedProjects) {
        let parsedProjects: Project[] = JSON.parse(savedProjects);
        parsedProjects = parsedProjects.map((p) => ({
          ...p,
          members: p.members.filter((m) => !m.name.toLowerCase().includes('alex teammate')),
        }));
        setProjects(parsedProjects);
      }

      const savedGoals = localStorage.getItem('kizuna_goals');
      if (savedGoals) {
        try { setGoals(JSON.parse(savedGoals)); } catch {}
      }
      const savedTeamDesc = localStorage.getItem('kizuna_team_desc');
      if (savedTeamDesc) {
        setTeamDescription(savedTeamDesc);
      }
      const savedMessages = localStorage.getItem('kizuna_team_messages');
      if (savedMessages) {
        try { setTeamMessages(JSON.parse(savedMessages)); } catch {}
      }
    } catch {
      // Fallback
    }
    setIsHydrated(true);
  }, []);

  // Save changes to localStorage and sync to Cloudflare R2
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('kizuna_users', JSON.stringify(users));
      localStorage.setItem('kizuna_current_user_id', currentUser.id);
      localStorage.setItem('kizuna_is_auth', String(isAuthenticated));
      localStorage.setItem('kizuna_tasks', JSON.stringify(tasks));
      localStorage.setItem('kizuna_projects', JSON.stringify(projects));
      localStorage.setItem('kizuna_portfolios', JSON.stringify(portfolios));
      localStorage.setItem('kizuna_goals', JSON.stringify(goals));
      localStorage.setItem('kizuna_team_desc', teamDescription);
      localStorage.setItem('kizuna_team_messages', JSON.stringify(teamMessages));

      // Cloudflare R2 Database Sync
      syncToCloudflareR2('users', users);
      syncToCloudflareR2('tasks', tasks);
      syncToCloudflareR2('projects', projects);
    } catch {
      // ignore
    }
  }, [users, currentUser, isAuthenticated, tasks, projects, isHydrated, syncToCloudflareR2]);

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

  const loginWithGoogle = (customGoogleAccount?: { name: string; email: string; picture?: string }) => {
    // If specific account provided, use or register it; otherwise default to Kevin's Google account
    const email = customGoogleAccount?.email?.trim().toLowerCase() || 'karashii866@gmail.com';
    const name = customGoogleAccount?.name?.trim() || 'Kevin Safrisal';
    const picture = customGoogleAccount?.picture;

    let user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
      user = {
        id: `user-google-${Date.now()}`,
        name,
        email,
        initials: getInitials(name),
        avatarColor: color,
        avatarUrl: picture,
        workspace: 'My workspace',
        role: 'Member',
      };
      setUsers((prev) => [...prev, user!]);
    } else if (picture && !user.avatarUrl) {
      user = { ...user, avatarUrl: picture };
      setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }

    setCurrentUser(user);
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

  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const inviteTeammates = (emails: string[], projectIds?: string[]) => {
    let addedCount = 0;
    let existingCount = 0;
    const newUsersList = [...users];
    const newlyAddedUsers: UserAccount[] = [];

    emails.forEach((rawEmail) => {
      const cleanEmail = rawEmail.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) return;

      const existing = newUsersList.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        existingCount++;
        return;
      }

      const emailPrefix = cleanEmail.split('@')[0];
      const displayName = emailPrefix
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const color = AVATAR_COLORS[newUsersList.length % AVATAR_COLORS.length];
      const newUser: UserAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName || 'Teammate',
        email: cleanEmail,
        password: 'password123',
        initials: getInitials(displayName || 'TM'),
        avatarColor: color,
        workspace: 'My workspace',
        role: 'Member',
      };

      newUsersList.push(newUser);
      newlyAddedUsers.push(newUser);
      addedCount++;
    });

    if (addedCount > 0) {
      setUsers(newUsersList);

      // Add to selected projects (or all projects if not specified)
      setProjects((prev) =>
        prev.map((p) => {
          if (!projectIds || projectIds.length === 0 || projectIds.includes(p.id)) {
            const usersToAdd = newlyAddedUsers.map((u) => ({
              name: u.name,
              initials: u.initials,
              avatarColor: u.avatarColor,
            }));
            return {
              ...p,
              members: [...p.members, ...usersToAdd],
            };
          }
          return p;
        })
      );
    }

    return { addedCount, existingCount };
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
    myTasksSection,
    taskType = 'task',
    projectId = 'kevins-first-project',
    assignee,
    dueDate = 'Today – Nov 4',
    priority = 'Low',
    status = 'On track',
    description = '',
  }: {
    name: string;
    section?: string;
    myTasksSection?: string;
    taskType?: 'task' | 'milestone' | 'approval';
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
      myTasksSection: myTasksSection || (section && ['Recently assigned', 'Do today', 'Do next week', 'Do later'].includes(section) ? section : 'Recently assigned'),
      taskType,
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

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

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

  const createPortfolio = (
    name: string,
    defaultView: 'List' | 'Timeline' | 'Workload' = 'List'
  ): Portfolio => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now()}`;
    const newPort: Portfolio = {
      id,
      name,
      status: 'On track',
      owner: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
      },
      members: [
        {
          name: currentUser.name,
          initials: currentUser.initials,
          avatarColor: currentUser.avatarColor,
        },
      ],
      projectIds: ['kevins-first-project'],
      defaultView,
      privacy: 'Public to My workspace',
      dueDateRange: 'Nov 3 – Dec 1',
      isStarred: false,
      statusUpdate: {
        title: `${name} is on track!`,
        summary:
          'This is a sample portfolio status update. Use portfolio status updates to give teammates and leaders visibility into how projects are progressing.',
        updatedAt: 'Just now',
        author: currentUser.name,
      },
    };

    setPortfolios((prev) => [...prev, newPort]);
    return newPort;
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePortfolio = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
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

  const updateUserProfile = (data: Partial<UserAccount>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...data };
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === prev.id ? updated : u))
      );
      return updated;
    });
  };

  const createGoal = (goalData: { title: string; timePeriod?: string; privacy?: string }) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: goalData.title.trim() || 'New Goal',
      owner: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
      },
      timePeriod: goalData.timePeriod || 'Q4 FY26 Oct 1 - Dec 31',
      privacy: goalData.privacy || 'Public to My workspace',
      progress: 0,
      status: 'On track',
      dueDate: 'Dec 31',
    };
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  };

  const addTeamMessage = (title: string, content: string) => {
    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      title: title.trim(),
      author: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
      },
      content: content.trim(),
      createdAt: 'Just now',
      likes: 0,
      commentsCount: 0,
    };
    setTeamMessages((prev) => [newMsg, ...prev]);
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
        isInviteModalOpen,
        openInviteModal,
        closeInviteModal,
        inviteTeammates,
        login,
        loginWithGoogle,
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
        reorderTasks,
        toggleTaskComplete,
        deleteTask,
        createProject,
        portfolios,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        addComment,
        addSubtask,
        toggleSubtask,
        addAttachment,
        removeAttachment,
        viewConfigs,
        updateViewConfig,
        goals,
        createGoal,
        updateUserProfile,
        teamMessages,
        addTeamMessage,
        teamDescription,
        setTeamDescription,
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
