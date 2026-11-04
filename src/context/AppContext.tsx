'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  isHydrated: boolean;
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
  shareProject: (projectId: string, email: string, role?: string) => { success: boolean; user?: UserAccount; error?: string };
  sharePortfolio: (portfolioId: string, email: string, role?: string, includeProjects?: boolean) => { success: boolean; user?: UserAccount; error?: string };
  shareMyTasks: (email: string, role?: string) => { success: boolean; user?: UserAccount; error?: string };
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
  allUsers: UserAccount[];
  updateUserAccount: (userId: string, data: Partial<UserAccount>) => void;
  updateWorkspaceName: (name: string) => void;
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

function formatNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] || 'User';
  return prefix
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Teammate';
}

function mergeById<T extends { id: string }>(localArr: T[], remoteArr: T[]): T[] {
  const map = new Map<string, T>();
  remoteArr.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  localArr.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

function mergeProjects(localList: Project[], remoteList: Project[]): Project[] {
  const map = new Map<string, Project>();
  localList.forEach((p) => {
    if (p && p.id) map.set(p.id, p);
  });
  remoteList.forEach((remoteP) => {
    if (!remoteP || !remoteP.id) return;
    const localP = map.get(remoteP.id);
    if (!localP) {
      map.set(remoteP.id, remoteP);
    } else {
      const mergedMemberEmails = Array.from(
        new Set([...(localP.memberEmails || []), ...(remoteP.memberEmails || [])])
      );
      const emailMap = new Map<string, Assignee>();
      (localP.members || []).forEach((m) => {
        const k = (m.email || m.name).toLowerCase();
        emailMap.set(k, m);
      });
      (remoteP.members || []).forEach((m) => {
        const k = (m.email || m.name).toLowerCase();
        if (!emailMap.has(k)) emailMap.set(k, m);
      });
      map.set(remoteP.id, {
        ...localP,
        ...remoteP,
        memberEmails: mergedMemberEmails,
        members: Array.from(emailMap.values()),
      });
    }
  });
  return Array.from(map.values());
}

function mergePortfolios(localList: Portfolio[], remoteList: Portfolio[]): Portfolio[] {
  const map = new Map<string, Portfolio>();
  localList.forEach((pf) => {
    if (pf && pf.id) map.set(pf.id, pf);
  });
  remoteList.forEach((remotePf) => {
    if (!remotePf || !remotePf.id) return;
    const localPf = map.get(remotePf.id);
    if (!localPf) {
      map.set(remotePf.id, remotePf);
    } else {
      const mergedMemberEmails = Array.from(
        new Set([...(localPf.memberEmails || []), ...(remotePf.memberEmails || [])])
      );
      const emailMap = new Map<string, Assignee>();
      (localPf.members || []).forEach((m) => {
        const k = (m.email || m.name).toLowerCase();
        emailMap.set(k, m);
      });
      (remotePf.members || []).forEach((m) => {
        const k = (m.email || m.name).toLowerCase();
        if (!emailMap.has(k)) emailMap.set(k, m);
      });
      map.set(remotePf.id, {
        ...localPf,
        ...remotePf,
        memberEmails: mergedMemberEmails,
        members: Array.from(emailMap.values()),
      });
    }
  });
  return Array.from(map.values());
}

function mergeTasks(localList: Task[], remoteList: Task[]): Task[] {
  const map = new Map<string, Task>();
  remoteList.forEach((t) => {
    if (t && t.id) map.set(t.id, t);
  });
  localList.forEach((localT) => {
    if (!localT || !localT.id) return;
    const remoteT = map.get(localT.id);
    if (!remoteT) {
      map.set(localT.id, localT);
    } else {
      const commentMap = new Map<string, Comment>();
      (remoteT.comments || []).forEach((c) => commentMap.set(c.id, c));
      (localT.comments || []).forEach((c) => commentMap.set(c.id, c));

      const subtaskMap = new Map<string, Subtask>();
      (remoteT.subtasks || []).forEach((st) => subtaskMap.set(st.id, st));
      (localT.subtasks || []).forEach((st) => subtaskMap.set(st.id, st));

      map.set(localT.id, {
        ...localT,
        ...remoteT,
        comments: Array.from(commentMap.values()),
        subtasks: Array.from(subtaskMap.values()),
      });
    }
  });
  return Array.from(map.values());
}

function mergeUsersByEmail(localUsers: UserAccount[], remoteUsers: UserAccount[]): UserAccount[] {
  const map = new Map<string, UserAccount>();
  remoteUsers.forEach((u) => {
    if (u && u.email) map.set(u.email.toLowerCase(), u);
  });
  localUsers.forEach((u) => {
    if (u && u.email) {
      const key = u.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        const mergedCollabs = Array.from(
          new Set([...(existing.collaboratorEmails || []), ...(u.collaboratorEmails || [])])
        );
        const mergedSharedTasks = Array.from(
          new Set([...(existing.sharedTaskAccessEmails || []), ...(u.sharedTaskAccessEmails || [])])
        );
        map.set(key, {
          ...existing,
          ...u,
          collaboratorEmails: mergedCollabs,
          sharedTaskAccessEmails: mergedSharedTasks,
        });
      } else {
        map.set(key, u);
      }
    }
  });
  return Array.from(map.values());
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<Task[]>(INITIAL_TASKS);
  const [allProjects, setAllProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [allPortfolios, setAllPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [allGoals, setAllGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [allTeamMessages, setAllTeamMessages] = useState<TeamMessage[]>(INITIAL_TEAM_MESSAGES);
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
  const syncToCloudflareR2 = useCallback(
    async (type: 'users' | 'tasks' | 'projects' | 'portfolios' | 'goals', data: unknown) => {
      try {
        await fetch('/api/storage?action=save_db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, data }),
        });
      } catch {
        // offline or silent
      }
    },
    []
  );

  // Normalize legacy records so every item has an explicit ownerEmail/memberEmails
  const normalizeProjects = (list: Project[]): Project[] =>
    list.map((p) => {
      const owner = (p.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      const memberEmails = Array.from(
        new Set([
          owner,
          ...(p.memberEmails || []).map((e) => e.toLowerCase()),
          ...(p.members || []).map((m) => m.email?.toLowerCase()).filter(Boolean) as string[],
        ])
      );
      return {
        ...p,
        ownerEmail: owner,
        memberEmails,
        members: p.members.filter((m) => !m.name.toLowerCase().includes('alex teammate')),
      };
    });

  const normalizePortfolios = (list: Portfolio[]): Portfolio[] =>
    list.map((pf) => {
      const owner = (pf.ownerEmail || pf.owner?.email || 'karashii866@gmail.com').toLowerCase();
      const memberEmails = Array.from(
        new Set([
          owner,
          ...(pf.memberEmails || []).map((e) => e.toLowerCase()),
          ...(pf.members || []).map((m) => m.email?.toLowerCase()).filter(Boolean) as string[],
        ])
      );
      return {
        ...pf,
        ownerEmail: owner,
        memberEmails,
      };
    });

  const normalizeTasks = (list: Task[]): Task[] =>
    list.map((t) => {
      const owner = (t.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      return {
        ...t,
        ownerEmail: owner,
        assigneeEmail: t.assigneeEmail || t.assignee?.email || (t.assignee?.name === 'Kevin Safrisal' ? 'karashii866@gmail.com' : undefined),
      };
    });

  // Restore state from localStorage AND Cloudflare R2 on mount
  useEffect(() => {
    let isMounted = true;

    async function hydrateState() {
      let localUsers = INITIAL_USERS;
      let localTasks = INITIAL_TASKS;
      let localProjects = INITIAL_PROJECTS;
      let localPortfolios = INITIAL_PORTFOLIOS;
      let localGoals = INITIAL_GOALS;
      let savedCurrentUserId: string | null = null;
      let savedAuth = false;

      try {
        const rawUsers = localStorage.getItem('kizuna_users');
        savedCurrentUserId = localStorage.getItem('kizuna_current_user_id');
        const rawAuth = localStorage.getItem('kizuna_auth_v2');
        const rawTasks = localStorage.getItem('kizuna_tasks');
        const rawProjects = localStorage.getItem('kizuna_projects');
        const rawPortfolios = localStorage.getItem('kizuna_portfolios');
        const rawGoals = localStorage.getItem('kizuna_goals');
        const rawViewConfigs = localStorage.getItem('kizuna_view_configs');
        const rawTeamDesc = localStorage.getItem('kizuna_team_desc');
        const rawMessages = localStorage.getItem('kizuna_team_messages');

        if (rawViewConfigs) {
          try {
            setViewConfigs((prev) => ({ ...prev, ...JSON.parse(rawViewConfigs) }));
          } catch {}
        }
        if (rawTeamDesc) setTeamDescription(rawTeamDesc);
        if (rawMessages) {
          try {
            setAllTeamMessages(JSON.parse(rawMessages));
          } catch {}
        }

        if (rawUsers) {
          const parsed = JSON.parse(rawUsers).filter(
            (u: UserAccount) => u.id !== 'user-friend' && !u.name.toLowerCase().includes('alex teammate')
          );
          if (parsed.length > 0) localUsers = mergeUsersByEmail(parsed, INITIAL_USERS);
        }

        if (rawTasks) {
          localTasks = normalizeTasks(JSON.parse(rawTasks));
        }
        if (rawProjects) {
          localProjects = normalizeProjects(JSON.parse(rawProjects));
        }
        if (rawPortfolios) {
          localPortfolios = normalizePortfolios(JSON.parse(rawPortfolios));
        }
        if (rawGoals) {
          localGoals = JSON.parse(rawGoals);
        }

        savedAuth = rawAuth === 'true';
      } catch {
        // fallback to defaults
      }

      // Apply local state immediately
      if (isMounted) {
        setAllUsers(localUsers);
        setAllTasks(localTasks);
        setAllProjects(localProjects);
        setAllPortfolios(localPortfolios);
        setAllGoals(localGoals);

        if (savedCurrentUserId && savedAuth) {
          const found = localUsers.find((u) => u.id === savedCurrentUserId);
          if (found) {
            setCurrentUser(found);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
        setIsHydrated(true);
      }

      // Fetch latest multi-tenant DB snapshot from Cloudflare R2
      try {
        const res = await fetch('/api/storage?action=load_all_db', { cache: 'no-store' });
        if (res.ok) {
          const payload = await res.json();
          const db = payload?.db;
          if (db && isMounted) {
            if (Array.isArray(db.users) && db.users.length > 0) {
              localUsers = mergeUsersByEmail(localUsers, db.users);
              setAllUsers(localUsers);
              if (savedCurrentUserId) {
                const updatedCurrent = localUsers.find((u) => u.id === savedCurrentUserId);
                if (updatedCurrent) setCurrentUser(updatedCurrent);
              }
            }
            if (Array.isArray(db.projects) && db.projects.length > 0) {
              setAllProjects((prev) => normalizeProjects(mergeProjects(prev, db.projects)));
            }
            if (Array.isArray(db.portfolios) && db.portfolios.length > 0) {
              setAllPortfolios((prev) => normalizePortfolios(mergePortfolios(prev, db.portfolios)));
            }
            if (Array.isArray(db.tasks) && db.tasks.length > 0) {
              setAllTasks((prev) => normalizeTasks(mergeTasks(prev, db.tasks)));
            }
            if (Array.isArray(db.goals) && db.goals.length > 0) {
              setAllGoals((prev) => mergeById(prev, db.goals));
            }
          }
        }
      } catch {
        // Offline or R2 unreachable, local state remains active
      }
    }

    hydrateState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time synchronization: Poll Cloudflare R2 and sync on tab focus
  const refreshFromR2 = useCallback(async () => {
    try {
      const res = await fetch('/api/storage?action=load_all_db', { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        const db = payload?.db;
        if (db) {
          if (Array.isArray(db.users) && db.users.length > 0) {
            setAllUsers((prev) => mergeUsersByEmail(prev, db.users));
          }
          if (Array.isArray(db.projects) && db.projects.length > 0) {
            setAllProjects((prev) => normalizeProjects(mergeProjects(prev, db.projects)));
          }
          if (Array.isArray(db.portfolios) && db.portfolios.length > 0) {
            setAllPortfolios((prev) => normalizePortfolios(mergePortfolios(prev, db.portfolios)));
          }
          if (Array.isArray(db.tasks) && db.tasks.length > 0) {
            setAllTasks((prev) => normalizeTasks(mergeTasks(prev, db.tasks)));
          }
          if (Array.isArray(db.goals) && db.goals.length > 0) {
            setAllGoals((prev) => mergeById(prev, db.goals));
          }
        }
      }
    } catch {
      // offline
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleFocus = () => refreshFromR2();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleFocus();
    });
    const interval = setInterval(refreshFromR2, 12000); // sync every 12 seconds
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [isAuthenticated, refreshFromR2]);

  // Save changes to localStorage and sync to Cloudflare R2
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('kizuna_users', JSON.stringify(allUsers));
      localStorage.setItem('kizuna_current_user_id', currentUser.id);
      localStorage.setItem('kizuna_auth_v2', String(isAuthenticated));
      localStorage.setItem('kizuna_tasks', JSON.stringify(allTasks));
      localStorage.setItem('kizuna_projects', JSON.stringify(allProjects));
      localStorage.setItem('kizuna_portfolios', JSON.stringify(allPortfolios));
      localStorage.setItem('kizuna_goals', JSON.stringify(allGoals));
      localStorage.setItem('kizuna_team_desc', teamDescription);
      localStorage.setItem('kizuna_team_messages', JSON.stringify(allTeamMessages));

      // Cloudflare R2 Database Sync
      syncToCloudflareR2('users', allUsers);
      syncToCloudflareR2('tasks', allTasks);
      syncToCloudflareR2('projects', allProjects);
      syncToCloudflareR2('portfolios', allPortfolios);
      syncToCloudflareR2('goals', allGoals);
    } catch {
      // ignore
    }
  }, [
    allUsers,
    currentUser,
    isAuthenticated,
    allTasks,
    allProjects,
    allPortfolios,
    allGoals,
    teamDescription,
    allTeamMessages,
    isHydrated,
    syncToCloudflareR2,
  ]);

  // Provision an isolated starter Kizuna workspace for a newly registered user if they don't own any project yet
  const ensureUserStarterWorkspace = useCallback(
    (user: UserAccount) => {
      const cleanEmail = user.email.trim().toLowerCase();
      if (cleanEmail === 'karashii866@gmail.com') return;

      const firstName = user.name.trim().split(/\s+/)[0] || 'My';
      const defaultProjectId = `proj-${cleanEmail.replace(/[^a-z0-9]/g, '-')}-first`;
      const defaultPortfolioId = `port-${cleanEmail.replace(/[^a-z0-9]/g, '-')}-first`;
      const projectName = `${firstName}'s first project`;

      setAllProjects((prev) => {
        const alreadyOwnsProject = prev.some((p) => p.ownerEmail?.toLowerCase() === cleanEmail);
        if (alreadyOwnsProject) return prev;

        const starterProject: Project = {
          id: defaultProjectId,
          name: projectName,
          joined: true,
          status: 'On track',
          ownerEmail: cleanEmail,
          memberEmails: [cleanEmail],
          members: [
            {
              name: user.name,
              initials: user.initials,
              avatarColor: user.avatarColor,
              email: cleanEmail,
              role: 'Project admin',
            },
          ],
          portfolios: ['My first portfolio'],
          dueDateRange: 'Nov 4 – Dec 15',
          lastModified: 'Just now',
          description: `Welcome to ${user.name}'s private Kizuna project workspace.`,
          sections: ['To do', 'Doing', 'Done'],
        };
        return [...prev, starterProject];
      });

      setAllPortfolios((prev) => {
        const alreadyOwnsPortfolio = prev.some((pf) => pf.ownerEmail?.toLowerCase() === cleanEmail);
        if (alreadyOwnsPortfolio) return prev;

        const starterPortfolio: Portfolio = {
          id: defaultPortfolioId,
          name: 'My first portfolio',
          status: 'On track',
          ownerEmail: cleanEmail,
          memberEmails: [cleanEmail],
          owner: {
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor,
            email: cleanEmail,
            role: 'Portfolio admin',
          },
          members: [
            {
              name: user.name,
              initials: user.initials,
              avatarColor: user.avatarColor,
              email: cleanEmail,
              role: 'Portfolio admin',
            },
          ],
          projectIds: [defaultProjectId],
          defaultView: 'List',
          privacy: 'Private to members',
          dueDateRange: 'Nov 4 – Dec 15',
          isStarred: false,
          color: '#e5e7eb',
          joined: true,
          lastModified: new Date().toISOString(),
        };
        return [...prev, starterPortfolio];
      });

      setAllTasks((prev) => {
        const alreadyOwnsTasks = prev.some((t) => t.ownerEmail?.toLowerCase() === cleanEmail);
        if (alreadyOwnsTasks) return prev;

        const starterTasks: Task[] = [
          {
            id: `task-${cleanEmail.replace(/[^a-z0-9]/g, '-')}-1`,
            name: 'Welcome to your personal Kizuna workspace',
            completed: false,
            taskType: 'task',
            section: 'To do',
            myTasksSection: 'Do today',
            projectId: defaultProjectId,
            projectName,
            ownerEmail: cleanEmail,
            assigneeEmail: cleanEmail,
            assignee: {
              name: user.name,
              initials: user.initials,
              avatarColor: user.avatarColor,
              email: cleanEmail,
            },
            dueDate: 'Today – Nov 4',
            priority: 'Medium',
            status: 'On track',
            visibility: 'Only me',
            description: 'This task belongs exclusively to your account. Invite teammates or share a project to collaborate.',
            subtasks: [],
            attachments: [],
            comments: [],
            createdAt: new Date().toISOString(),
          },
        ];
        return [...prev, ...starterTasks];
      });
    },
    []
  );

  // ============================================================================
  // MULTI-TENANT DATA ISOLATION & PERMISSION FILTERING
  // ============================================================================
  const myEmail = (currentUser?.email || '').trim().toLowerCase();

  const visibleProjects = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allProjects.filter((p) => {
      const owner = (p.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      if (owner === myEmail) return true;
      if (p.memberEmails?.some((e) => e.toLowerCase() === myEmail)) return true;
      if (p.members?.some((m) => m.email?.toLowerCase() === myEmail)) return true;
      return false;
    });
  }, [allProjects, isAuthenticated, myEmail]);

  const visibleProjectIds = useMemo(() => new Set(visibleProjects.map((p) => p.id)), [visibleProjects]);

  const visiblePortfolios = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allPortfolios.filter((pf) => {
      const owner = (pf.ownerEmail || pf.owner?.email || 'karashii866@gmail.com').toLowerCase();
      if (owner === myEmail) return true;
      if (pf.memberEmails?.some((e) => e.toLowerCase() === myEmail)) return true;
      if (pf.members?.some((m) => m.email?.toLowerCase() === myEmail)) return true;
      return false;
    });
  }, [allPortfolios, isAuthenticated, myEmail]);

  // Users whose My Tasks have been explicitly shared with currentUser
  const ownersWhoSharedTasksWithMe = useMemo(() => {
    const set = new Set<string>();
    allUsers.forEach((u) => {
      if (u.sharedTaskAccessEmails?.some((e) => e.toLowerCase() === myEmail)) {
        set.add(u.email.toLowerCase());
      }
    });
    return set;
  }, [allUsers, myEmail]);

  const visibleTasks = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allTasks.filter((t) => {
      const owner = (t.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      if (owner === myEmail) return true;
      if (t.assigneeEmail?.toLowerCase() === myEmail) return true;
      if (t.assignee?.email?.toLowerCase() === myEmail) return true;
      if (t.sharedWithEmails?.some((e) => e.toLowerCase() === myEmail)) return true;
      if (t.projectId && visibleProjectIds.has(t.projectId)) return true;
      if (ownersWhoSharedTasksWithMe.has(owner)) return true;
      return false;
    });
  }, [allTasks, isAuthenticated, myEmail, visibleProjectIds, ownersWhoSharedTasksWithMe]);

  const myCollaboratorEmails = useMemo(() => {
    const set = new Set<string>();
    if (!myEmail) return set;
    set.add(myEmail);

    (currentUser?.collaboratorEmails || []).forEach((e) => set.add(e.toLowerCase()));
    allUsers.forEach((u) => {
      if (u.collaboratorEmails?.some((e) => e.toLowerCase() === myEmail)) {
        set.add(u.email.toLowerCase());
      }
    });
    visibleProjects.forEach((p) => {
      if (p.ownerEmail) set.add(p.ownerEmail.toLowerCase());
      (p.memberEmails || []).forEach((e) => set.add(e.toLowerCase()));
      (p.members || []).forEach((m) => {
        if (m.email) set.add(m.email.toLowerCase());
      });
    });
    visiblePortfolios.forEach((pf) => {
      if (pf.ownerEmail) set.add(pf.ownerEmail.toLowerCase());
      (pf.memberEmails || []).forEach((e) => set.add(e.toLowerCase()));
      (pf.members || []).forEach((m) => {
        if (m.email) set.add(m.email.toLowerCase());
      });
    });
    return set;
  }, [myEmail, currentUser, allUsers, visibleProjects, visiblePortfolios]);

  const visibleUsers = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allUsers.filter((u) => myCollaboratorEmails.has(u.email.toLowerCase()));
  }, [allUsers, isAuthenticated, myEmail, myCollaboratorEmails]);

  const visibleGoals = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allGoals.filter((g) => {
      const owner = (g.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      if (owner === myEmail) return true;
      if (g.sharedWithEmails?.some((e) => e.toLowerCase() === myEmail)) return true;
      return false;
    });
  }, [allGoals, isAuthenticated, myEmail]);

  const visibleTeamMessages = useMemo(() => {
    if (!isAuthenticated || !myEmail) return [];
    return allTeamMessages.filter((m) => {
      const owner = (m.ownerEmail || 'karashii866@gmail.com').toLowerCase();
      if (owner === myEmail) return true;
      if (m.sharedWithEmails?.some((e) => e.toLowerCase() === myEmail)) return true;
      if (myCollaboratorEmails.has(owner)) return true;
      return false;
    });
  }, [allTeamMessages, isAuthenticated, myEmail, myCollaboratorEmails]);

  const activeTask = visibleTasks.find((t) => t.id === activeTaskId) || null;

  // ============================================================================
  // AUTHENTICATION HANDLERS
  // ============================================================================
  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Masukkan alamat email yang valid.' };
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      return { success: false, error: 'Akun tidak ditemukan. Silakan daftar (Sign Up) terlebih dahulu.' };
    }

    if (existing.password && password !== undefined && existing.password !== password) {
      return { success: false, error: 'Password salah. Silakan periksa kembali password Anda.' };
    }

    ensureUserStarterWorkspace(existing);
    setCurrentUser(existing);
    setIsAuthenticated(true);
    setActiveTaskId(null);
    return { success: true };
  };

  const loginWithGoogle = (customGoogleAccount?: { name: string; email: string; picture?: string }) => {
    const email = customGoogleAccount?.email?.trim().toLowerCase() || 'karashii866@gmail.com';
    const name = customGoogleAccount?.name?.trim() || formatNameFromEmail(email);
    const picture = customGoogleAccount?.picture;

    let user = allUsers.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      const color = AVATAR_COLORS[allUsers.length % AVATAR_COLORS.length];
      user = {
        id: `user-google-${Date.now()}`,
        name,
        email,
        initials: getInitials(name),
        avatarColor: color,
        avatarUrl: picture,
        workspace: `${name.split(' ')[0]}'s workspace`,
        role: 'Member',
        collaboratorEmails: [],
        sharedTaskAccessEmails: [],
      };
      setAllUsers((prev) => [...prev, user!]);
    } else if (picture || name) {
      user = {
        ...user,
        name: user.name === formatNameFromEmail(email) && name ? name : user.name,
        initials: getInitials(user.name === formatNameFromEmail(email) && name ? name : user.name),
        avatarUrl: picture || user.avatarUrl,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }

    ensureUserStarterWorkspace(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTaskId(null);
    return { success: true };
  };

  const signup = (name: string, email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Masukkan alamat email yang valid.' };
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    // If user was previously invited via email, allow them to claim & activate their account
    if (existing) {
      if (existing.role === 'Invited') {
        const claimedUser: UserAccount = {
          ...existing,
          name: name.trim() || existing.name,
          initials: getInitials(name.trim() || existing.name),
          password: password || 'password123',
          role: 'Member',
        };
        setAllUsers((prev) => prev.map((u) => (u.id === existing.id ? claimedUser : u)));
        ensureUserStarterWorkspace(claimedUser);
        setCurrentUser(claimedUser);
        setIsAuthenticated(true);
        setActiveTaskId(null);
        return { success: true };
      }
      return { success: false, error: 'Email sudah terdaftar. Silakan masuk melalui halaman Login.' };
    }

    const color = AVATAR_COLORS[allUsers.length % AVATAR_COLORS.length];
    const cleanName = name.trim() || formatNameFromEmail(cleanEmail);
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: password || 'password123',
      initials: getInitials(cleanName),
      avatarColor: color,
      workspace: `${cleanName.split(' ')[0]}'s workspace`,
      role: 'Member',
      collaboratorEmails: [],
      sharedTaskAccessEmails: [],
    };

    setAllUsers((prev) => [...prev, newUser]);
    ensureUserStarterWorkspace(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveTaskId(null);

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTaskId(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kizuna_auth_v2', 'false');
    }
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      ensureUserStarterWorkspace(target);
      setCurrentUser(target);
      setIsAuthenticated(true);
      setActiveTaskId(null);
    }
  };

  // Helper to get or create a user record when invited/shared by email
  const getOrCreateInvitedUser = useCallback(
    (rawEmail: string, customName?: string): UserAccount => {
      const cleanEmail = rawEmail.trim().toLowerCase();
      const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) return existing;

      const displayName = customName?.trim() || formatNameFromEmail(cleanEmail);
      const color = AVATAR_COLORS[allUsers.length % AVATAR_COLORS.length];
      const newUser: UserAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        email: cleanEmail,
        password: 'password123',
        initials: getInitials(displayName),
        avatarColor: color,
        workspace: 'My workspace',
        role: 'Invited',
        collaboratorEmails: [myEmail],
        sharedTaskAccessEmails: [],
      };
      return newUser;
    },
    [allUsers, myEmail]
  );

  // Link two emails as collaborators so they see each other in People / Assignees
  const linkCollaborators = useCallback(
    (targetEmails: string[]) => {
      const cleanTargets = targetEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);
      if (!myEmail || cleanTargets.length === 0) return;

      setAllUsers((prev) =>
        prev.map((u) => {
          const uEmail = u.email.toLowerCase();
          if (uEmail === myEmail) {
            const nextCollabs = Array.from(new Set([...(u.collaboratorEmails || []), ...cleanTargets]));
            const updated = { ...u, collaboratorEmails: nextCollabs };
            setCurrentUser(updated);
            return updated;
          }
          if (cleanTargets.includes(uEmail)) {
            const nextCollabs = Array.from(new Set([...(u.collaboratorEmails || []), myEmail]));
            return { ...u, collaboratorEmails: nextCollabs };
          }
          return u;
        })
      );
    },
    [myEmail]
  );

  const inviteUser = (name: string, email: string): UserAccount => {
    const cleanEmail = email.trim().toLowerCase();
    let targetUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      targetUser = getOrCreateInvitedUser(cleanEmail, name);
      setAllUsers((prev) => [...prev, targetUser!]);
    }
    linkCollaborators([cleanEmail]);
    return targetUser;
  };

  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const inviteTeammates = (emails: string[], projectIds?: string[]) => {
    let addedCount = 0;
    let existingCount = 0;
    const updatedUsers = [...allUsers];
    const invitedAccounts: UserAccount[] = [];

    emails.forEach((rawEmail) => {
      const cleanEmail = rawEmail.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) return;

      let user = updatedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        existingCount++;
      } else {
        const displayName = formatNameFromEmail(cleanEmail);
        const color = AVATAR_COLORS[updatedUsers.length % AVATAR_COLORS.length];
        user = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: displayName,
          email: cleanEmail,
          password: 'password123',
          initials: getInitials(displayName),
          avatarColor: color,
          workspace: currentUser.workspace || 'My workspace',
          role: 'Member',
          userType: 'Invited',
          userStatus: 'Invited',
          licenseTier: 'Advanced',
          aiSpendingEnabled: true,
          invitedBy: currentUser.name || 'Admin',
          invitedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastActivity: '-',
          collaboratorEmails: [myEmail],
          sharedTaskAccessEmails: [],
        };
        updatedUsers.push(user);
        addedCount++;
      }
      invitedAccounts.push(user);
    });

    if (invitedAccounts.length > 0) {
      const invitedEmailList = invitedAccounts.map((u) => u.email.toLowerCase());

      // Link collaborators on updatedUsers
      const finalUsers = updatedUsers.map((u) => {
        const uEmail = u.email.toLowerCase();
        if (uEmail === myEmail) {
          const next = {
            ...u,
            collaboratorEmails: Array.from(new Set([...(u.collaboratorEmails || []), ...invitedEmailList])),
          };
          setCurrentUser(next);
          return next;
        }
        if (invitedEmailList.includes(uEmail)) {
          return {
            ...u,
            collaboratorEmails: Array.from(new Set([...(u.collaboratorEmails || []), myEmail])),
          };
        }
        return u;
      });
      setAllUsers(finalUsers);

      // Share only the specified projects owned/accessible by currentUser
      const targetProjectIds =
        projectIds && projectIds.length > 0
          ? new Set(projectIds)
          : new Set(visibleProjects.map((p) => p.id));

      setAllProjects((prev) =>
        prev.map((p) => {
          if (!targetProjectIds.has(p.id)) return p;
          const existingMemberEmails = new Set((p.memberEmails || []).map((e) => e.toLowerCase()));
          const updatedMembers = [...p.members];

          invitedAccounts.forEach((u) => {
            const uEmail = u.email.toLowerCase();
            existingMemberEmails.add(uEmail);
            if (!updatedMembers.some((m) => m.email?.toLowerCase() === uEmail || m.name.toLowerCase() === u.name.toLowerCase())) {
              updatedMembers.push({
                name: u.name,
                initials: u.initials,
                avatarColor: u.avatarColor,
                email: uEmail,
                role: 'Editor',
              });
            }
          });

          return {
            ...p,
            memberEmails: Array.from(existingMemberEmails),
            members: updatedMembers,
          };
        })
      );
    }

    return { addedCount, existingCount };
  };

  // Share a single project with an email
  const shareProject = (projectId: string, email: string, role = 'Editor') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Masukkan alamat email yang valid.' };
    }

    let targetUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      targetUser = getOrCreateInvitedUser(cleanEmail);
      setAllUsers((prev) => [...prev, targetUser!]);
    }

    linkCollaborators([cleanEmail]);

    setAllProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const memberEmails = Array.from(new Set([...(p.memberEmails || []), cleanEmail]));
        const hasMember = p.members.some(
          (m) => m.email?.toLowerCase() === cleanEmail || m.name.toLowerCase() === targetUser!.name.toLowerCase()
        );
        const members = hasMember
          ? p.members.map((m) =>
              m.email?.toLowerCase() === cleanEmail || m.name.toLowerCase() === targetUser!.name.toLowerCase()
                ? { ...m, email: cleanEmail, role }
                : m
            )
          : [
              ...p.members,
              {
                name: targetUser!.name,
                initials: targetUser!.initials,
                avatarColor: targetUser!.avatarColor,
                email: cleanEmail,
                role,
              },
            ];
        return { ...p, memberEmails, members };
      })
    );

    return { success: true, user: targetUser };
  };

  // Share a portfolio (and optionally its projects) with an email
  const sharePortfolio = (portfolioId: string, email: string, role = 'Editor', includeProjects = true) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Masukkan alamat email yang valid.' };
    }

    let targetUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      targetUser = getOrCreateInvitedUser(cleanEmail);
      setAllUsers((prev) => [...prev, targetUser!]);
    }

    linkCollaborators([cleanEmail]);

    const targetPortfolio = allPortfolios.find((pf) => pf.id === portfolioId);

    setAllPortfolios((prev) =>
      prev.map((pf) => {
        if (pf.id !== portfolioId) return pf;
        const memberEmails = Array.from(new Set([...(pf.memberEmails || []), cleanEmail]));
        const hasMember = pf.members.some(
          (m) => m.email?.toLowerCase() === cleanEmail || m.name.toLowerCase() === targetUser!.name.toLowerCase()
        );
        const members = hasMember
          ? pf.members.map((m) =>
              m.email?.toLowerCase() === cleanEmail || m.name.toLowerCase() === targetUser!.name.toLowerCase()
                ? { ...m, email: cleanEmail, role }
                : m
            )
          : [
              ...pf.members,
              {
                name: targetUser!.name,
                initials: targetUser!.initials,
                avatarColor: targetUser!.avatarColor,
                email: cleanEmail,
                role,
              },
            ];
        return { ...pf, memberEmails, members };
      })
    );

    if (includeProjects && targetPortfolio && targetPortfolio.projectIds.length > 0) {
      const portProjectIds = new Set(targetPortfolio.projectIds);
      setAllProjects((prev) =>
        prev.map((p) => {
          if (!portProjectIds.has(p.id)) return p;
          const memberEmails = Array.from(new Set([...(p.memberEmails || []), cleanEmail]));
          const hasMember = p.members.some(
            (m) => m.email?.toLowerCase() === cleanEmail || m.name.toLowerCase() === targetUser!.name.toLowerCase()
          );
          const members = hasMember
            ? p.members
            : [
                ...p.members,
                {
                  name: targetUser!.name,
                  initials: targetUser!.initials,
                  avatarColor: targetUser!.avatarColor,
                  email: cleanEmail,
                  role,
                },
              ];
          return { ...p, memberEmails, members };
        })
      );
    }

    return { success: true, user: targetUser };
  };

  // Share currentUser's My Tasks with an email
  const shareMyTasks = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Masukkan alamat email yang valid.' };
    }

    let targetUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      targetUser = getOrCreateInvitedUser(cleanEmail);
      setAllUsers((prev) => [...prev, targetUser!]);
    }

    linkCollaborators([cleanEmail]);

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === myEmail) {
          const nextShared = Array.from(new Set([...(u.sharedTaskAccessEmails || []), cleanEmail]));
          const updated = { ...u, sharedTaskAccessEmails: nextShared };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );

    setAllTasks((prev) =>
      prev.map((t) => {
        if ((t.ownerEmail || '').toLowerCase() === myEmail) {
          const nextShared = Array.from(new Set([...(t.sharedWithEmails || []), cleanEmail]));
          return { ...t, sharedWithEmails: nextShared };
        }
        return t;
      })
    );

    return { success: true, user: targetUser };
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
    projectId,
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
    const resolvedProjectId = projectId || visibleProjects[0]?.id || 'personal-tasks';
    const project = visibleProjects.find((p) => p.id === resolvedProjectId);
    const taskAssignee: Assignee = assignee || {
      name: currentUser.name,
      initials: currentUser.initials,
      avatarColor: currentUser.avatarColor,
      email: myEmail,
    };

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: name.trim() || 'New task',
      completed: false,
      section,
      myTasksSection:
        myTasksSection ||
        (section && ['Recently assigned', 'Do today', 'Do next week', 'Do later'].includes(section)
          ? section
          : 'Recently assigned'),
      taskType,
      projectId: resolvedProjectId,
      projectName: project ? project.name : `${currentUser.name.split(' ')[0]}'s project`,
      ownerEmail: myEmail,
      assigneeEmail: taskAssignee.email || myEmail,
      sharedWithEmails: currentUser.sharedTaskAccessEmails || [],
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

    setAllTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setAllTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  const reorderTasks = useCallback((newVisibleTasks: Task[]) => {
    setAllTasks((prev) => {
      const updatedIds = new Set(newVisibleTasks.map((t) => t.id));
      const others = prev.filter((t) => !updatedIds.has(t.id));
      return [...newVisibleTasks, ...others];
    });
  }, []);

  const toggleTaskComplete = (taskId: string) => {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
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
      ownerEmail: myEmail,
      memberEmails: [myEmail],
      members: [
        {
          name: currentUser.name,
          initials: currentUser.initials,
          avatarColor: currentUser.avatarColor,
          email: myEmail,
          role: 'Project admin',
        },
      ],
      portfolios: [],
      lastModified: 'Just now',
      description,
      sections: ['To do', 'Doing', 'Done'],
    };

    setAllProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const createPortfolio = (
    name: string,
    defaultView: 'List' | 'Timeline' | 'Workload' = 'List'
  ): Portfolio => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now()}`;
    const defaultProjIds = visibleProjects.length > 0 ? [visibleProjects[0].id] : [];
    const newPort: Portfolio = {
      id,
      name,
      status: 'On track',
      ownerEmail: myEmail,
      memberEmails: [myEmail],
      owner: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
        email: myEmail,
        role: 'Portfolio admin',
      },
      members: [
        {
          name: currentUser.name,
          initials: currentUser.initials,
          avatarColor: currentUser.avatarColor,
          email: myEmail,
          role: 'Portfolio admin',
        },
      ],
      projectIds: defaultProjIds,
      defaultView,
      privacy: 'Public to My workspace',
      dueDateRange: 'Nov 3 – Dec 1',
      isStarred: false,
      joined: true,
      lastModified: new Date().toISOString(),
      statusUpdate: {
        title: `${name} is on track!`,
        summary:
          'This is a sample portfolio status update. Use portfolio status updates to give teammates and leaders visibility into how projects are progressing.',
        updatedAt: 'Just now',
        author: currentUser.name,
      },
    };

    setAllPortfolios((prev) => [...prev, newPort]);
    return newPort;
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setAllPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePortfolio = (id: string) => {
    setAllPortfolios((prev) => prev.filter((p) => p.id !== id));
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

    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t))
    );
  };

  const addSubtask = (taskId: string, name: string) => {
    if (!name.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      completed: false,
    };

    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t))
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setAllTasks((prev) =>
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
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t
      )
    );
  };

  const removeAttachment = (taskId: string, attachmentId: string) => {
    setAllTasks((prev) =>
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
      setAllUsers((prevUsers) => prevUsers.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  const updateUserAccount = (userId: string, data: Partial<UserAccount>) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...data };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const updateWorkspaceName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCurrentUser((prev) => ({ ...prev, workspace: trimmed }));
    setAllUsers((prev) => prev.map((u) => ({ ...u, workspace: trimmed })));
  };

  const createGoal = (goalData: { title: string; timePeriod?: string; privacy?: string }) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: goalData.title.trim() || 'New Goal',
      ownerEmail: myEmail,
      sharedWithEmails: [],
      owner: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
        email: myEmail,
      },
      timePeriod: goalData.timePeriod || 'Q4 FY26 Oct 1 - Dec 31',
      privacy: goalData.privacy || 'Public to My workspace',
      progress: 0,
      status: 'On track',
      dueDate: 'Dec 31',
    };
    setAllGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  };

  const addTeamMessage = (title: string, content: string) => {
    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      title: title.trim(),
      ownerEmail: myEmail,
      sharedWithEmails: Array.from(myCollaboratorEmails),
      author: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
        email: myEmail,
      },
      content: content.trim(),
      createdAt: 'Just now',
      likes: 0,
      commentsCount: 0,
    };
    setAllTeamMessages((prev) => [newMsg, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        tasks: visibleTasks,
        projects: visibleProjects,
        users: visibleUsers,
        currentUser,
        isAuthenticated,
        isHydrated,
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
        shareProject,
        sharePortfolio,
        shareMyTasks,
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
        portfolios: visiblePortfolios,
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
        goals: visibleGoals,
        createGoal,
        updateUserProfile,
        teamMessages: visibleTeamMessages,
        addTeamMessage,
        teamDescription,
        setTeamDescription,
        allUsers,
        updateUserAccount,
        updateWorkspaceName,
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
