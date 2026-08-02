import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(new Date(date));

export const formatRelativeTime = (date: string | Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-100 text-slate-700',
    paid: 'bg-emerald-100 text-emerald-700',
    overdue: 'bg-red-100 text-red-700',
    checked_in: 'bg-blue-100 text-blue-700',
    checked_out: 'bg-slate-100 text-slate-700',
    available: 'bg-emerald-100 text-emerald-700',
    occupied: 'bg-red-100 text-red-700',
    maintenance: 'bg-amber-100 text-amber-700',
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-slate-100 text-slate-700',
    waitlisted: 'bg-purple-100 text-purple-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
};

export const getPriorityColor = (priority: string) => {
  const map: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return map[priority] || 'bg-slate-100 text-slate-700';
};

export const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    super_admin: 'Super Admin',
    hostel_admin: 'Hostel Admin',
    student: 'Student',
    security: 'Security',
  };
  return map[role] || role;
};

export const getRoleColor = (role: string) => {
  const map: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    hostel_admin: 'bg-blue-100 text-blue-700',
    student: 'bg-emerald-100 text-emerald-700',
    security: 'bg-orange-100 text-orange-700',
  };
  return map[role] || 'bg-slate-100 text-slate-700';
};

export const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
