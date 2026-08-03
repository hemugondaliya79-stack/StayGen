import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, BedDouble, AlertCircle, CalendarCheck,
  UtensilsCrossed, CreditCard, UserCheck, Bell, Shirt, Search, LogOut, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials, cn } from '../lib/utils';
import { MobileMenu, type NavItem } from '../components/MobileMenu';

const navItems: NavItem[] = [
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
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={cn('flex h-screen overflow-hidden', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:flex flex-col w-60 border-r flex-shrink-0 z-20', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <div className={cn('flex items-center gap-3 px-4 py-5 border-b', isDark ? 'border-slate-800' : 'border-slate-100')}>
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white font-heading text-sm">StayGen</p>
            <p className="text-xs text-slate-500">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 min-h-[44px]',
                  isActive
                    ? 'gradient-bg text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )
              }
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={cn('p-3 border-t', isDark ? 'border-slate-800' : 'border-slate-100')}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name || '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={toggleTheme}
              className={cn('p-2 rounded-lg transition-colors flex-1 flex justify-center items-center h-10', isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={logout}
              className="flex-1 h-10 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 text-xs font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={cn('flex items-center justify-between px-4 lg:px-6 py-3 border-b flex-shrink-0 min-h-[56px]', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <MobileMenu navItems={navItems} title="StayGen" subtitle="Student Portal" />

          <div className="hidden lg:block">
            <h1 className="text-base font-bold text-slate-900 dark:text-white font-heading">Student Portal</h1>
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[11px] text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
