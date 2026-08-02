import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BedDouble, BookOpen, AlertCircle,
  CalendarCheck, UtensilsCrossed, CreditCard, UserCheck, Bell,
  Package, Shirt, Search, ChevronLeft, ChevronRight, LogOut,
  Sun, Moon, Settings, Menu, X, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials, getRoleLabel, getRoleColor } from '../lib/utils';
import { cn } from '../lib/utils';

const navItems = [
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}>
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}>
              <p className="font-bold text-slate-800 dark:text-white font-heading">StayGen</p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group',
              isActive
                ? 'gradient-bg text-white shadow-md'
                : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <item.icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className={cn('p-4 border-t', isDark ? 'border-slate-700' : 'border-slate-100')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              getInitials(user?.name || '')
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', getRoleColor(user?.role || ''))}>
                  {getRoleLabel(user?.role || '')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={cn('flex gap-1 mt-3', collapsed ? 'flex-col' : 'flex-row')}>
          <button onClick={toggleTheme} className={cn('p-2 rounded-lg transition-colors', isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={logout} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-1 flex justify-center">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('flex h-screen overflow-hidden', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn('fixed left-0 top-0 h-full w-64 z-40 lg:hidden border-r', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn('hidden lg:flex flex-col border-r flex-shrink-0 relative', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-10',
            isDark ? 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={cn('flex items-center justify-between px-4 lg:px-6 py-4 border-b flex-shrink-0', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <button
            onClick={() => setMobileOpen(true)}
            className={cn('lg:hidden p-2 rounded-xl', isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className={cn('text-right hidden sm:block')}>
              <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
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
