import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials, getRoleLabel, getRoleColor, cn } from '../lib/utils';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function MobileMenu({ navItems, title = 'StayGen', subtitle = 'Portal' }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="lg:hidden">
      {/* Hamburger Trigger Button (Minimum 44px touch target) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className={cn(
          'w-11 h-11 flex items-center justify-center rounded-xl transition-colors',
          isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
        )}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-out Sidebar Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 w-4/5 max-w-xs z-50 flex flex-col shadow-2xl border-r',
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              {/* Drawer Header */}
              <div className={cn('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-slate-800' : 'border-slate-100')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">S</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white font-heading text-base">{title}</h2>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Menu"
                  className={cn('w-10 h-10 flex items-center justify-center rounded-xl', isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin' || item.path === '/student' || item.path === '/security'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]',
                        isActive
                          ? 'gradient-bg text-white shadow-md'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )
                    }
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* User Footer */}
              <div className={cn('p-4 border-t space-y-3', isDark ? 'border-slate-800' : 'border-slate-100')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name || '')
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getRoleColor(user?.role || ''))}>
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={toggleTheme}
                    className={cn('flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-medium border', isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700')}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{isDark ? 'Light' : 'Dark'}</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
