
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  listId: string;
  boardId: string;
  priority: Priority;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string;
  targetType: 'task' | 'list' | 'board';
  timestamp: number;
}

export enum AppRoute {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  BOARD = 'BOARD',
  DOCS = 'DOCS'
}
