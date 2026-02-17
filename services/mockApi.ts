
import { Board, List, Task, User, Activity, Priority } from '../types';

// Storage Keys
const KEYS = {
  USER: 'hintro_user',
  BOARDS: 'hintro_boards',
  LISTS: 'hintro_lists',
  TASKS: 'hintro_tasks',
  ACTIVITIES: 'hintro_activities'
};

const syncChannel = new BroadcastChannel('hintro_sync');

class MockBackend {
  private users: User[] = [
    { id: 'u1', name: 'Sreesanth Osuri', email: 'sreesanth@hintro.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sreesanth' },
    { id: 'u2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 'u3', name: 'James Miller', email: 'james@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
  ];

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData() {
    if (!localStorage.getItem(KEYS.BOARDS)) {
      const defaultBoard: Board = { id: 'b1', title: 'Enterprise Roadmap 2025', ownerId: 'u1', createdAt: Date.now() };
      const defaultLists: List[] = [
        { id: 'l1', title: 'Backlog', boardId: 'b1', order: 0 },
        { id: 'l2', title: 'In Review', boardId: 'b1', order: 1 },
        { id: 'l3', title: 'Deployed', boardId: 'b1', order: 2 }
      ];
      const defaultTasks: Task[] = [
        { id: 't1', title: 'Architecture Review', description: 'Evaluate system scalability for 1M concurrent users.', listId: 'l1', boardId: 'b1', order: 0, priority: 'high', createdAt: Date.now(), updatedAt: Date.now(), assigneeId: 'u1' },
        { id: 't2', title: 'Frontend UI Audit', description: 'Ensure WCAG 2.1 compliance across all modules.', listId: 'l2', boardId: 'b1', order: 0, priority: 'medium', createdAt: Date.now(), updatedAt: Date.now(), assigneeId: 'u2' }
      ];

      localStorage.setItem(KEYS.BOARDS, JSON.stringify([defaultBoard]));
      localStorage.setItem(KEYS.LISTS, JSON.stringify(defaultLists));
      localStorage.setItem(KEYS.TASKS, JSON.stringify(defaultTasks));
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([]));
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem(KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  async login(email: string): Promise<User> {
    const user = this.users.find(u => u.email === email) || this.users[0];
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  }

  async signup(name: string, email: string): Promise<User> {
    const newUser: User = { 
      id: `u${Date.now()}`, 
      name, 
      email, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` 
    };
    this.users.push(newUser);
    localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
    return newUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(KEYS.USER);
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getBoards(): Promise<Board[]> {
    return JSON.parse(localStorage.getItem(KEYS.BOARDS) || '[]');
  }

  async createBoard(title: string): Promise<Board> {
    const user = await this.getCurrentUser();
    const boards = await this.getBoards();
    const newBoard: Board = { id: `b${Date.now()}`, title, ownerId: user?.id || 'u1', createdAt: Date.now() };
    localStorage.setItem(KEYS.BOARDS, JSON.stringify([...boards, newBoard]));
    
    // Create default lists for the new board
    const allLists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
    const defaultLists: List[] = [
      { id: `l${Date.now()}1`, title: 'To Do', boardId: newBoard.id, order: 0 },
      { id: `l${Date.now()}2`, title: 'Doing', boardId: newBoard.id, order: 1 },
      { id: `l${Date.now()}3`, title: 'Done', boardId: newBoard.id, order: 2 }
    ];
    localStorage.setItem(KEYS.LISTS, JSON.stringify([...allLists, ...defaultLists]));
    
    this.notify('BOARDS_UPDATED');
    return newBoard;
  }

  async getLists(boardId: string): Promise<List[]> {
    const allLists: List[] = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
    return allLists.filter(l => l.boardId === boardId).sort((a, b) => a.order - b.order);
  }

  async getTasks(boardId: string): Promise<Task[]> {
    const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    return allTasks.filter(t => t.boardId === boardId).sort((a, b) => a.order - b.order);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: task.title || 'New Task',
      description: task.description || '',
      listId: task.listId!,
      boardId: task.boardId!,
      priority: (task.priority as Priority) || 'medium',
      order: allTasks.filter(t => t.listId === task.listId).length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assigneeId: task.assigneeId
    };
    const updated = [...allTasks, newTask];
    localStorage.setItem(KEYS.TASKS, JSON.stringify(updated));
    this.addActivity('created', newTask.id, 'task');
    this.notify('TASKS_UPDATED');
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    const index = allTasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');
    
    const oldTask = allTasks[index];
    const updatedTask = { ...oldTask, ...updates, updatedAt: Date.now() };
    allTasks[index] = updatedTask;
    
    localStorage.setItem(KEYS.TASKS, JSON.stringify(allTasks));
    
    if (updates.assigneeId !== undefined && updates.assigneeId !== oldTask.assigneeId) {
      const newUser = this.users.find(u => u.id === updates.assigneeId);
      this.addActivity(`assigned "${oldTask.title}" to ${newUser?.name || 'Unassigned'}`, taskId, 'task');
    } else if (updates.listId && updates.listId !== oldTask.listId) {
      this.addActivity(`moved "${oldTask.title}" across lists`, taskId, 'task');
    } else {
      this.addActivity(`updated "${oldTask.title}"`, taskId, 'task');
    }
    
    this.notify('TASKS_UPDATED');
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    const filtered = allTasks.filter(t => t.id !== taskId);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(filtered));
    this.notify('TASKS_UPDATED');
  }

  async moveTask(taskId: string, newListId: string, newOrder: number): Promise<void> {
    const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = allTasks.splice(taskIndex, 1)[0];
    task.listId = newListId;
    task.updatedAt = Date.now();

    const listTasks = allTasks.filter(t => t.listId === newListId).sort((a, b) => a.order - b.order);
    listTasks.splice(newOrder, 0, task);

    listTasks.forEach((t, i) => {
      t.order = i;
    });

    const otherTasks = allTasks.filter(t => t.listId !== newListId);
    localStorage.setItem(KEYS.TASKS, JSON.stringify([...otherTasks, ...listTasks]));
    this.notify('TASKS_UPDATED');
  }

  private async addActivity(action: string, targetId: string, targetType: 'task' | 'list' | 'board'): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    const activities: Activity[] = JSON.parse(localStorage.getItem(KEYS.ACTIVITIES) || '[]');
    const newActivity: Activity = {
      id: `act${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action,
      targetId,
      targetType,
      timestamp: Date.now()
    };
    const updated = [newActivity, ...activities].slice(0, 100);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(updated));
    this.notify('ACTIVITY_UPDATED');
  }

  async getActivities(page = 1, pageSize = 10): Promise<{ items: Activity[], total: number }> {
    const activities: Activity[] = JSON.parse(localStorage.getItem(KEYS.ACTIVITIES) || '[]');
    const start = (page - 1) * pageSize;
    return {
      items: activities.slice(start, start + pageSize),
      total: activities.length
    };
  }

  private notify(type: string) {
    syncChannel.postMessage({ type });
  }

  subscribe(callback: (type: string) => void) {
    const handler = (e: MessageEvent) => callback(e.data.type);
    syncChannel.addEventListener('message', handler);
    return () => syncChannel.removeEventListener('message', handler);
  }
}

export const api = new MockBackend();
