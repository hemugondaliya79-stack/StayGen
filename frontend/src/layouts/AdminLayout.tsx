import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BedDouble, BookOpen, AlertCircle,
  CalendarCheck, UtensilsCrossed, CreditCard, UserCheck, Bell,
  Package, Shirt, Search, ChevronLeft, ChevronRight, LogOut,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials, getRoleLabel, getRoleColor, cn } from '../lib/utils';
import { MobileMenu, type NavItem } from '../components/MobileMenu';

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Students', path: '/admin/students' },
  { icon: BedDouble, label: 'Rooms', path: '/admin/rooms' },
  { icon: BookOpen, label: 'Bookings', path: '/admin/bookings' },
  { icon: AlertCircle, label: 'Complaints', path: '/admin/complaints' },
  { icon: CalendarCheck, label: 'Attendance', path: '/admin/attendance' },
  { icon: UtensilsCrossed, label: 'Mess', path: '/admin/mess' },
  { icon: CreditCard, label: 'Fees', path: '/admin/fees' },
  { icon: UserCheck, label: 'Visitors', path: '/admin/visitors' },
  { icon: Bell, label: 'Notices', path: '/admin/notices' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory' },
  { icon: Shirt, label: 'Laundry', path: '/admin/laundry' },
  { icon: Search, label: 'Lost & Found', path: '/admin/lost-found' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={cn('flex h-screen overflow-hidden', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Desktop Sidebar (Hidden on mobile <1024px) */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn('hidden lg:flex flex-col border-r flex-shrink-0 relative z-20', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}
      >
        {/* Logo Header */}
        <div className={cn('flex items-center gap-3 px-4 py-5 border-b', isDark ? 'border-slate-800' : 'border-slate-100')}>
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white font-heading text-sm">StayGen</p>
              <p className="text-xs text-slate-500 truncate">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group min-h-[44px]',
                  isActive
                    ? 'gradient-bg text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className={cn('p-3 border-t', isDark ? 'border-slate-800' : 'border-slate-100')}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name || '')}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', getRoleColor(user?.role || ''))}>
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
            )}
          </div>
          <div className={cn('flex gap-1 mt-2', collapsed ? 'flex-col' : 'flex-row')}>
            <button
              onClick={toggleTheme}
              className={cn('p-2 rounded-lg transition-colors flex-1 flex justify-center items-center h-10', isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-1 flex justify-center items-center h-10"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-30',
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className={cn('flex items-center justify-between px-4 lg:px-6 py-3 border-b flex-shrink-0 min-h-[56px]', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          {/* Mobile Hamburger Drawer Trigger */}
          <MobileMenu navItems={navItems} title="StayGen" subtitle="Admin Panel" />

          {/* Desktop Title Header */}
          <div className="hidden lg:block">
            <h1 className="text-base font-bold text-slate-900 dark:text-white font-heading">StayGen Admin</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
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
