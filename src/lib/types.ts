export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type StatusLevel = 'On track' | 'At risk' | 'Off track';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  workspace: string;
  workspaces?: string[];
  role?: string;
  jobTitle?: string;
  department?: string;
  aboutMe?: string;
  pronouns?: string;
  isOutOfOffice?: boolean;
  outOfOfficeNote?: string;
  collaboratorEmails?: string[];
  sharedTaskAccessEmails?: string[];
  licenseTier?: string;
  aiSpendingEnabled?: boolean;
  userStatus?: 'Active' | 'Invited' | 'Suspended';
  userType?: 'Member' | 'Admin' | 'Guest' | 'Invited';
  invitedBy?: string;
  invitedDate?: string;
  lastActivity?: string;
}

export interface Goal {
  id: string;
  title: string;
  owner: { name: string; initials: string; avatarColor: string; email?: string };
  ownerEmail?: string;
  sharedWithEmails?: string[];
  members?: { name: string; email: string }[];
  timePeriod: string;
  privacy: string;
  progress: number;
  status: StatusLevel;
  dueDate?: string;
  workspace?: string;
}

export interface TeamMessage {
  id: string;
  title: string;
  author: { name: string; initials: string; avatarColor: string; email?: string };
  ownerEmail?: string;
  sharedWithEmails?: string[];
  content: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
}

export interface Assignee {
  name: string;
  initials: string;
  avatarColor?: string;
  email?: string;
  role?: string;
  isPlaceholder?: boolean;
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
  isR2?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  initials: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  section: string; // e.g. "To do", "Doing", "Done", "Recently assigned", "Do today", "Do next week", "Do later"
  myTasksSection?: string; // 'Recently assigned' | 'Do today' | 'Do next week' | 'Do later'
  projectId?: string;
  projectName?: string;
  ownerEmail?: string;
  assigneeEmail?: string;
  sharedWithEmails?: string[];
  assignee: Assignee;
  dueDate: string;
  dueDateRaw?: string; // ISO format or relative
  priority?: PriorityLevel;
  status?: StatusLevel;
  visibility?: string;
  description?: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  taskType?: 'task' | 'milestone' | 'approval';
  customFields?: Record<string, string>;
  workspace?: string;
}

export interface CustomColumn {
  id: string;
  name: string;
  type:
  | 'single_select'
  | 'multi_select'
  | 'date'
  | 'people'
  | 'reference'
  | 'text'
  | 'number'
  | 'formula'
  | 'timer'
  | 'time_tracking'
  | 'rollup';
  options?: string[];
  width?: number;
}

export interface Project {
  id: string;
  name: string;
  joined: boolean;
  status?: string;
  ownerEmail?: string;
  memberEmails?: string[];
  members: Assignee[];
  portfolios: string[];
  dueDateRange?: string;
  lastModified: string;
  description?: string;
  sections: string[];
  workspace?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  status: 'On track' | 'At risk' | 'Off track' | 'On hold' | 'Complete';
  statusUpdate?: {
    title: string;
    summary: string;
    updatedAt: string;
    author: string;
  };
  ownerEmail?: string;
  memberEmails?: string[];
  owner: Assignee;
  members: Assignee[];
  projectIds: string[];
  defaultView: 'List' | 'Timeline' | 'Workload';
  privacy: string;
  dueDateRange?: string;
  isStarred?: boolean;
  color?: string;
  joined?: boolean;
  parentPortfolio?: string;
  lastModified?: string;
  workspace?: string;
}
