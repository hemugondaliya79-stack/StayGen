import { Outlet, NavLink } from 'react-router-dom';
import { Shield, UserCheck, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export default function SecurityLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={cn('flex h-screen overflow-hidden', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <aside className={cn('hidden lg:flex flex-col w-60 border-r flex-shrink-0', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <div className={cn('flex items-center gap-3 px-4 py-5 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}>
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white font-heading">StayGen</p>
            <p className="text-xs text-slate-500">Security Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-2">
          <NavLink to="/security" end className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1', isActive ? 'gradient-bg text-white' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}>
            <Shield size={18} /> <span className="text-sm font-medium">Dashboard</span>
          </NavLink>
          <NavLink to="/security/visitors" className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl', isActive ? 'gradient-bg text-white' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}>
            <UserCheck size={18} /> <span className="text-sm font-medium">Visitors</span>
          </NavLink>
        </nav>
        <div className={cn('p-4 border-t', isDark ? 'border-slate-700' : 'border-slate-100')}>
          <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">{user?.name}</p>
          <div className="flex gap-1">
            <button onClick={toggleTheme} className={cn('p-2 rounded-lg', isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={logout} className="flex-1 p-2 rounded-lg text-red-500 hover:bg-red-50 text-sm flex items-center gap-2 justify-center">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
