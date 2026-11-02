import { Project, Task, UserAccount } from './types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-kevin',
    name: 'Kevin Safrisal',
    email: 'karashii866@gmail.com',
    password: 'password123',
    initials: 'KS',
    avatarColor: '#d84b7f',
    workspace: 'My workspace',
    role: 'Owner',
  },
  {
    id: 'user-friend',
    name: 'Alex Teammate',
    email: 'friend@kizuna.pm',
    password: 'password123',
    initials: 'AT',
    avatarColor: '#4573d2',
    workspace: 'My workspace',
    role: 'Member',
  },
];

export const INITIAL_USER = INITIAL_USERS[0];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'kevins-first-project',
    name: "Kevin's first project",
    joined: true,
    status: 'On track',
    members: [
      {
        name: 'Kevin Safrisal',
        initials: 'KS',
        avatarColor: '#d84b7f',
      },
      {
        name: 'Alex Teammate',
        initials: 'AT',
        avatarColor: '#4573d2',
      },
    ],
    portfolios: [],
    lastModified: 'Just now',
    description: 'Welcome to your first project! Track work, assign due dates, and collaborate.',
    sections: ['To do', 'Doing', 'Done'],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    name: 'Task 1',
    completed: false,
    section: 'To do',
    projectId: 'kevins-first-project',
    projectName: "Kevin's first project",
    assignee: {
      name: 'Kevin Safrisal',
      initials: 'KS',
      avatarColor: '#d84b7f',
    },
    dueDate: 'Today – Nov 4',
    priority: 'Low',
    status: 'On track',
    visibility: 'My workspace',
    description: 'Set up project milestones and review initial requirements for the Asana duplicate.',
    subtasks: [
      { id: 'sub-1', name: 'Review UI mockups and screenshot references', completed: true },
      { id: 'sub-2', name: 'Establish dark theme design tokens and styles', completed: false },
    ],
    attachments: [],
    comments: [
      {
        id: 'c-1',
        author: 'Kevin Safrisal',
        initials: 'KS',
        text: 'Started working on this task. Looking great!',
        createdAt: 'Yesterday at 3:45 PM',
      },
    ],
    createdAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'task-2',
    name: 'Task 2',
    completed: false,
    section: 'To do',
    projectId: 'kevins-first-project',
    projectName: "Kevin's first project",
    assignee: {
      name: 'Kevin Safrisal',
      initials: 'KS',
      avatarColor: '#d84b7f',
    },
    dueDate: 'Nov 3 – 5',
    priority: 'Medium',
    status: 'At risk',
    visibility: 'My workspace',
    description: 'Connect Cloudflare R2 bucket for file attachment uploads and configure storage endpoints.',
    subtasks: [
      { id: 'sub-3', name: 'Verify S3 client with R2 credentials', completed: false },
    ],
    attachments: [],
    comments: [],
    createdAt: '2026-11-01T09:30:00.000Z',
  },
  {
    id: 'task-3',
    name: 'Task 3',
    completed: false,
    section: 'To do',
    projectId: 'kevins-first-project',
    projectName: "Kevin's first project",
    assignee: {
      name: 'Alex Teammate',
      initials: 'AT',
      avatarColor: '#4573d2',
    },
    dueDate: 'Nov 4 – 6',
    priority: 'High',
    status: 'Off track',
    visibility: 'My workspace',
    description: 'Collaborate with Kevin on UI review and verify multi-user authorization.',
    subtasks: [],
    attachments: [],
    comments: [
      {
        id: 'c-2',
        author: 'Alex Teammate',
        initials: 'AT',
        text: 'Ready to collaborate on this task!',
        createdAt: 'Today at 10:15 AM',
      },
    ],
    createdAt: '2026-11-02T01:15:00.000Z',
  },
];
