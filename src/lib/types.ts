export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type StatusLevel = 'On track' | 'At risk' | 'Off track';

export interface Assignee {
  name: string;
  initials: string;
  avatarColor?: string;
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
  projectId?: string;
  projectName?: string;
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
}

export interface Project {
  id: string;
  name: string;
  joined: boolean;
  status?: string;
  members: Assignee[];
  portfolios: string[];
  lastModified: string;
  description?: string;
  sections: string[];
}
