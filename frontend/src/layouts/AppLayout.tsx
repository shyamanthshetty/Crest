import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-display antialiased text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-slate-100 bg-white flex flex-col z-10 shrink-0">
        <div className="pt-8 pb-10 px-8 flex items-center gap-3.5 shrink-0">
            <div className="w-10 h-10 rounded-[12px] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <span className="material-symbols-outlined text-[22px]">book_4</span>
            </div>
            <div className="flex flex-col">
                <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Crest</h1>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em] mt-0.5">Highs and Lows</span>
            </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-5 flex flex-col gap-1">
            <div className="relative group">
                <Link 
                  to="/list" 
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all relative z-10 ${
                    isActive('/list') || isActive('/') || isActive('/new')
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                    <span className={`material-symbols-outlined text-[20px] ${isActive('/list') || isActive('/') || isActive('/new') ? 'fill' : ''}`}>book</span>
                    <span className="text-[14px]">Journal</span>
                </Link>
                {(isActive('/list') || isActive('/') || isActive('/new')) && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full"></div>
                )}
            </div>
            
            <Link 
              to="/stats" 
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-medium ${
                isActive('/stats') 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isActive('/stats') ? 'fill' : ''}`}>monitoring</span>
                <span className="text-[14px]">Stats</span>
            </Link>
            
            <div className="my-1.5" />
            
            <Link 
              to="/search" 
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-medium ${
                isActive('/search') 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isActive('/search') ? 'fill' : ''}`}>search</span>
                <span className="text-[14px]">Search</span>
            </Link>

            <Link 
              to="/settings" 
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-medium ${
                isActive('/settings') 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isActive('/settings') ? 'fill' : ''}`}>settings</span>
                <span className="text-[14px]">Settings</span>
            </Link>
        </nav>
        
        {/* Bottom Area */}
        <div className="p-6 pt-4 pb-8 mt-auto flex flex-col gap-3">
           <Link to="/new" className="flex items-center justify-center gap-2 px-4 py-3.5 w-full rounded-xl bg-indigo-500 text-white font-medium shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)] hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_4px_8px_-2px_rgba(99,102,241,0.4)] transition-all text-[14px]">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Entry
           </Link>
           
           <button 
             onClick={() => logout()}
             className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all text-[14px]"
           >
              <LogOut size={18} />
              Sign Out
           </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  );
}
