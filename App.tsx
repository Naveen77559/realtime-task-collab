
import React, { useState, useEffect } from 'react';
import { User, AppRoute } from './types';
import { api } from './services/mockApi';
import { BoardView } from './components/BoardView';
import { Dashboard } from './components/Dashboard';
import { Documentation } from './components/Documentation';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<AppRoute>(AppRoute.AUTH);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setRoute(AppRoute.DASHBOARD);
      } else {
        setRoute(AppRoute.AUTH);
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      const u = await api.signup(name, email);
      setUser(u);
    } else {
      const u = await api.login(email);
      setUser(u);
    }
    setRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setRoute(AppRoute.AUTH);
  };

  const navigateToBoard = (id: string) => {
    setSelectedBoardId(id);
    setRoute(AppRoute.BOARD);
  };

  const navigateToDashboard = () => {
    setSelectedBoardId(null);
    setRoute(AppRoute.DASHBOARD);
  };

  const navigateToDocs = () => {
    setRoute(AppRoute.DOCS);
  };

  if (route === AppRoute.AUTH) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full border border-slate-200/50">
          <div className="md:w-1/2 p-14 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-12">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-slate-900 rounded-md"></div>
                </div>
                <span className="font-black tracking-tighter text-2xl uppercase italic">HINTRO</span>
              </div>
              <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter">Collaborate<br/>at Speed.</h1>
              <p className="text-slate-400 text-lg font-medium">The high-performance platform for elite engineering squads.</p>
            </div>
            
            <div className="mt-16 relative z-10">
              <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-xl" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Live Sync</p>
                  <p className="text-xs text-slate-400 font-medium">Built with real-time broadcast engine.</p>
                </div>
              </div>
            </div>
            
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          </div>
          
          <div className="md:w-1/2 p-14 bg-white">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{isSignup ? 'Get Started' : 'Welcome back'}</h2>
              <p className="text-slate-400 mt-3 font-medium">{isSignup ? 'Create your workspace profile' : 'Access your enterprise dashboard'}</p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-8">
              {isSignup && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sreesanth Osuri" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="sreesanth@hintro.com" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {!isSignup && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secret Key</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 transform active:scale-[0.98]"
              >
                {isSignup ? 'Complete Signup' : 'Authenticate'}
              </button>
            </form>
            
            <div className="mt-10 pt-10 border-t text-center">
               <button 
                 onClick={() => setIsSignup(!isSignup)}
                 className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
               >
                 {isSignup ? 'Already have an account? Sign In' : 'New here? Create Workspace'}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-30">
        <div className="flex items-center gap-12">
          <button 
            onClick={navigateToDashboard}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-slate-200">
              <div className="w-5 h-5 bg-white rounded-md"></div>
            </div>
            <span className="font-black tracking-tighter text-slate-900 text-2xl uppercase italic">HINTRO</span>
          </button>
          
          <div className="hidden lg:flex gap-2">
            <button 
              onClick={navigateToDashboard}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${route === AppRoute.DASHBOARD ? 'bg-slate-900 text-white shadow-xl shadow-slate-100' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={navigateToDocs}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${route === AppRoute.DOCS ? 'bg-slate-900 text-white shadow-xl shadow-slate-100' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              System Specs
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Server Connected</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Lead Architect</p>
             </div>
             <div className="relative group">
                <img src={user?.avatar} className="w-12 h-12 rounded-2xl border-2 border-slate-100 p-0.5 cursor-pointer shadow-sm hover:scale-105 transition-transform" />
                <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 hidden group-hover:block z-50 animate-in slide-in-from-top-2 duration-200">
                   <div className="p-4 border-b border-slate-50 mb-2">
                      <p className="text-xs font-black text-slate-900">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{user?.email}</p>
                   </div>
                   <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl flex items-center gap-3 transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                     Terminate
                   </button>
                </div>
             </div>
          </div>
        </div>
      </nav>

      {/* Primary Viewport */}
      <main className="flex-grow overflow-hidden relative">
        {route === AppRoute.DASHBOARD && <Dashboard onSelectBoard={navigateToBoard} onGoToDocs={navigateToDocs} />}
        {route === AppRoute.BOARD && selectedBoardId && <BoardView boardId={selectedBoardId} />}
        {route === AppRoute.DOCS && <Documentation />}
      </main>

      {/* Mobile System Bar */}
      <div className="lg:hidden flex border-t bg-white h-20 shrink-0 justify-around items-center px-6">
         <button onClick={navigateToDashboard} className={`p-4 rounded-2xl transition-all ${route === AppRoute.DASHBOARD ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
         </button>
         <button onClick={navigateToDocs} className={`p-4 rounded-2xl transition-all ${route === AppRoute.DOCS ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
         </button>
         <button onClick={handleLogout} className="p-4 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
         </button>
      </div>
    </div>
  );
};

export default App;
