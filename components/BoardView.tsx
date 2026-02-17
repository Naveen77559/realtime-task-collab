
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Board, List, Task, User, Activity, Priority } from '../types';
import { api } from '../services/mockApi';

interface BoardViewProps {
  boardId: string;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles = {
    high: 'bg-red-50 text-red-600 border-red-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const AssigneePicker: React.FC<{ 
  currentId?: string, 
  users: User[], 
  onSelect: (userId: string) => void 
}> = ({ currentId, users, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedUser = users.find(u => u.id === currentId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group hover:bg-slate-50 p-1 rounded-lg transition-colors"
      >
        {selectedUser ? (
          <img src={selectedUser.avatar} className="w-7 h-7 rounded-full border border-slate-200 ring-2 ring-transparent group-hover:ring-indigo-100" title={selectedUser.name} />
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 border-b bg-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Assign to...</p>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            <button 
              onClick={() => { onSelect(''); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              Unassigned
            </button>
            {users.map(user => (
              <button 
                key={user.id}
                onClick={() => { onSelect(user.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${user.id === currentId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200" />
                <span className="font-medium">{user.name}</span>
                {user.id === currentId && <svg className="w-4 h-4 ml-auto text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BoardView: React.FC<BoardViewProps> = ({ boardId }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState<{ listId: string } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [allBoards, allLists, allTasks, allUsers] = await Promise.all([
        api.getBoards(),
        api.getLists(boardId),
        api.getTasks(boardId),
        api.getAllUsers()
      ]);
      const currentBoard = allBoards.find(b => b.id === boardId);
      setBoard(currentBoard || null);
      setLists(allLists);
      setTasks(allTasks);
      setUsers(allUsers);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
    const unsubscribe = api.subscribe(() => fetchData());
    return unsubscribe;
  }, [fetchData]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !showTaskModal) return;
    await api.createTask({
      title: newTaskTitle,
      listId: showTaskModal.listId,
      boardId: boardId,
      priority: 'medium'
    });
    setNewTaskTitle('');
    setShowTaskModal(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Permanently delete this task?')) {
      await api.deleteTask(taskId);
    }
  };

  const handleAssignUser = async (taskId: string, userId: string) => {
    await api.updateTask(taskId, { assigneeId: userId });
  };

  const onDragTask = async (taskId: string, targetListId: string) => {
    await api.moveTask(taskId, targetListId, 0);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  if (loading) return (
    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-medium animate-pulse">Syncing board state...</p>
    </div>
  );

  if (!board) return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 max-w-sm">
        <h2 className="text-lg font-bold mb-1">Board Not Found</h2>
        <p className="text-sm">The board you're looking for doesn't exist or has been deleted.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="p-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{board.title}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-medium text-slate-400">Live Collaboration Active</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-grow md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full bg-slate-50 text-sm font-medium transition-all"
            />
          </div>
          <div className="flex -space-x-2">
            {users.map(user => (
              <img key={user.id} src={user.avatar} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" title={user.name} />
            ))}
            <button className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow p-6 md:p-8 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-8 h-full items-start">
          {lists.map(list => (
            <div key={list.id} className="w-80 flex-shrink-0 flex flex-col max-h-full bg-slate-200/40 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
              <div className="p-4 flex justify-between items-center bg-white/40 rounded-t-2xl border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 tracking-tight">{list.title}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-white text-slate-400 border border-slate-200 rounded-md">
                    {filteredTasks.filter(t => t.listId === list.id).length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-white rounded-md transition-all">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {filteredTasks
                  .filter(task => task.listId === list.id)
                  .map(task => (
                    <div 
                      key={task.id} 
                      className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDragTask(task.id, list.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <PriorityBadge priority={task.priority} />
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{task.description}</p>
                      )}
                      
                      <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Assignee</span>
                          <AssigneePicker 
                            users={users} 
                            currentId={task.assigneeId} 
                            onSelect={(id) => handleAssignUser(task.id, id)} 
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Updated</p>
                          <p className="text-[10px] font-bold text-slate-500">{new Date(task.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                <button 
                  onClick={() => setShowTaskModal({ listId: list.id })}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  New Task
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-80 flex-shrink-0 h-16 bg-white/60 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-400 transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            Create List
          </button>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Task</h3>
                  <p className="text-slate-400 text-sm font-medium">Drafting in {lists.find(l => l.id === showTaskModal.listId)?.title}</p>
                </div>
                <button onClick={() => setShowTaskModal(null)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g. Fix login bug"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
                <button 
                  onClick={handleCreateTask}
                  className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  Confirm & Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
