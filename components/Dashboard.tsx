
import React, { useState, useEffect } from 'react';
import { Board, Activity, AppRoute } from '../types';
import { api } from '../services/mockApi';

interface DashboardProps {
  onSelectBoard: (id: string) => void;
  onGoToDocs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectBoard, onGoToDocs }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);

  const fetchData = async () => {
    const b = await api.getBoards();
    const { items, total } = await api.getActivities(activityPage, 10);
    setBoards(b);
    setActivities(items);
    setTotalActivities(total);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = api.subscribe(() => fetchData());
    return unsubscribe;
  }, [activityPage]);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    await api.createBoard(newBoardTitle);
    setNewBoardTitle('');
    setShowCreateBoard(false);
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Good morning,<br/>Builder.</h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-xl font-medium opacity-90">
            You are managing {boards.length} active projects. Your system is fully synchronized and ready for the next sprint.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={() => onGoToDocs()}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              System Specs
            </button>
            <button 
              onClick={() => setShowCreateBoard(true)}
              className="bg-indigo-500/40 backdrop-blur-md border border-indigo-400/30 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all active:scale-95"
            >
              Create Project
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Board List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Boards</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Workspace Overview</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {boards.map(board => (
              <button 
                key={board.id} 
                onClick={() => onSelectBoard(board.id)}
                className="group relative p-8 bg-white border border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:ring-8 hover:ring-indigo-50 transition-all shadow-sm hover:shadow-2xl"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400 shadow-inner">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{board.title}</h3>
                <div className="flex items-center gap-2 text-slate-400">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-xs font-bold uppercase tracking-widest">{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
            <button 
              onClick={() => setShowCreateBoard(true)}
              className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white hover:shadow-xl transition-all gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="font-black uppercase tracking-widest text-xs">New Board</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity Log</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Stream</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex-grow space-y-8 pr-2">
              {activities.length === 0 ? (
                <div className="text-center text-slate-300 py-20 italic">No events recorded.</div>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="flex gap-4 items-start relative pb-8 border-l-2 border-slate-100 pl-6 ml-2 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                    <div className="flex-grow">
                      <p className="text-slate-800 text-sm leading-relaxed">
                        <span className="font-black text-indigo-600">{act.userName}</span>
                        {' '}<span className="font-medium">{act.action}</span>
                      </p>
                      <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">{new Date(act.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination Controls */}
            <div className="mt-8 pt-6 border-t flex justify-between items-center">
               <button 
                 disabled={activityPage === 1}
                 onClick={() => setActivityPage(p => p - 1)}
                 className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {activityPage} / {Math.max(1, Math.ceil(totalActivities / 10))}</span>
               <button 
                 disabled={activityPage >= Math.ceil(totalActivities / 10)}
                 onClick={() => setActivityPage(p => p + 1)}
                 className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Initialize Board</h3>
                <button onClick={() => setShowCreateBoard(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Title</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="E.g. Hintro v2.0 Roadmap"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
                <button 
                  onClick={handleCreateBoard}
                  className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
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
