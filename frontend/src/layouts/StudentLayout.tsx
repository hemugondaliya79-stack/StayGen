import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, BedDouble, AlertCircle, CalendarCheck,
  UtensilsCrossed, CreditCard, UserCheck, Bell, Shirt, Search, LogOut, Sun, Moon, Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials } from '../lib/utils';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
  { icon: User, label: 'My Profile', path: '/student/profile' },
  { icon: BedDouble, label: 'Room Booking', path: '/student/booking' },
  { icon: AlertCircle, label: 'Complaints', path: '/student/complaints' },
  { icon: CalendarCheck, label: 'Attendance', path: '/student/attendance' },
  { icon: CreditCard, label: 'Fees', path: '/student/fees' },
  { icon: UtensilsCrossed, label: 'Mess Menu', path: '/student/mess' },
  { icon: UserCheck, label: 'Visitors', path: '/student/visitors' },
  { icon: Bell, label: 'Notices', path: '/student/notices' },
  { icon: Shirt, label: 'Laundry', path: '/student/laundry' },
  { icon: Search, label: 'Lost & Found', path: '/student/lost-found' },
];

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}>
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-white font-heading">StayGen</p>
          <p className="text-xs text-slate-500">Student Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/student'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200',
              isActive ? 'gradient-bg text-white shadow-md' : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={cn('p-4 border-t', isDark ? 'border-slate-700' : 'border-slate-100')}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : getInitials(user?.name || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={toggleTheme} className={cn('p-2 rounded-lg transition-colors', isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={logout} className="flex-1 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('flex h-screen overflow-hidden', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className={cn('fixed left-0 top-0 h-full w-64 z-40 lg:hidden border-r', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={cn('hidden lg:flex flex-col w-60 border-r flex-shrink-0', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={cn('flex items-center px-4 lg:px-6 py-4 border-b flex-shrink-0', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <button onClick={() => setMobileOpen(true)} className={cn('lg:hidden p-2 rounded-xl', isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}>
            <Menu size={20} />
          </button>
          <div className="ml-auto hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
