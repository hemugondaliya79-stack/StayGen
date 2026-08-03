import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BedDouble, CalendarCheck, CreditCard, Bell, AlertCircle, UserCheck, Percent, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor, cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const fetchStudentDashboard = () => API.get('/dashboard/student').then(r => r.data.data);
const fetchMenu = () => API.get('/mess/current').then(r => r.data.data);
const fetchNotices = () => API.get('/notices?limit=3').then(r => r.data.data);

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const getTodayMenu = (menu: any) => {
  if (!menu?.menu) return null;
  const dayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  return menu.menu[dayName];
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['student-dashboard'], queryFn: fetchStudentDashboard });
  const { data: messMenu } = useQuery({ queryKey: ['mess-current'], queryFn: fetchMenu });
  const { data: notices } = useQuery({ queryKey: ['notices-student'], queryFn: fetchNotices });

  const todayMenu = getTodayMenu(messMenu);
  const student = data?.student;
  const attendance = data?.monthlyAttendance;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="gradient-bg rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/20 to-purple-700/20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div className="text-white">
            <p className="text-white/70 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} ðŸ‘‹</p>
            <h1 className="text-2xl font-bold font-heading mt-1">{user?.name}</h1>
            {student?.roomId && <p className="text-white/80 text-sm mt-1">ðŸ“ Room {student.roomId.roomNumber}, Floor {student.roomId.floor}</p>}
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-3">
            <div className={cn('w-2.5 h-2.5 rounded-full', data?.todayAttendance === 'present' ? 'bg-emerald-400' : 'bg-amber-400')} />
            <span className="text-white text-sm font-medium">
              {data?.todayAttendance === 'present' ? 'Present Today' : 'Mark Attendance'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: BedDouble, label: 'My Room', value: student?.roomId ? `Room ${student.roomId.roomNumber}` : 'Not Assigned', color: 'bg-indigo-500', link: '/student/booking' },
          { icon: Percent, label: 'Attendance', value: `${attendance?.percentage || 0}%`, color: 'bg-emerald-500', link: '/student/attendance' },
          { icon: CreditCard, label: 'Due Fees', value: data?.pendingFees?.length ? formatCurrency(data.pendingFees.reduce((s: number, f: any) => s + f.amount, 0)) : 'â‚¹0', color: 'bg-amber-500', link: '/student/fees' },
          { icon: AlertCircle, label: 'Open Complaints', value: data?.activeComplaints?.length || 0, color: 'bg-red-500', link: '/student/complaints' },
        ].map((stat, i) => (
          <Link to={stat.link} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.color)}>
                <stat.icon size={16} className="text-white" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{isLoading ? <span className="skeleton h-5 w-16 block rounded" /> : stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's mess */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white font-heading">Today's Mess</h3>
            <Link to="/student/mess" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View Week â†’</Link>
          </div>
          {todayMenu ? (
            <div className="space-y-2">
              {[['â˜€ï¸ Breakfast', todayMenu.breakfast], ['ðŸ± Lunch', todayMenu.lunch], ['ðŸª Snacks', todayMenu.snacks], ['ðŸŒ™ Dinner', todayMenu.dinner]].map(([label, meal], i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-500 min-w-20 flex-shrink-0">{label}</span>
                  <span className="text-slate-700 dark:text-slate-300">{meal || 'TBD'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">No menu for today</p>
            </div>
          )}
        </div>

        {/* Pending fees */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white font-heading">Pending Fees</h3>
            <Link to="/student/fees" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All â†’</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">{Array(2).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : data?.pendingFees?.length ? (
            <div className="space-y-3">
              {data.pendingFees.map((fee: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{fee.month}</p>
                    <p className="text-xs text-slate-500">Due: {formatDate(fee.dueDate)}</p>
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{formatCurrency(fee.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-emerald-500 text-2xl mb-2">âœ“</p>
              <p className="text-slate-500 text-sm">All fees paid!</p>
            </div>
          )}
        </div>

        {/* Notices */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white font-heading">Latest Notices</h3>
            <Link to="/student/notices" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All â†’</Link>
          </div>
          {notices?.length ? (
            <div className="space-y-3">
              {notices.map((notice: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{notice.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.content}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(notice.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Bell size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No new notices</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading">Monthly Attendance</h3>
          <Link to="/student/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View Details â†’</Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6 mb-3">
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${attendance?.percentage || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full gradient-bg rounded-full"
            />
          </div>
          <span className="font-bold text-slate-900 dark:text-white w-12 text-right">{attendance?.percentage || 0}%</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <span>Present: <strong className="text-emerald-600">{attendance?.present || 0}</strong></span>
          <span>Total: <strong className="text-slate-700 dark:text-slate-300">{attendance?.total || 0}</strong></span>
          {(attendance?.percentage || 0) < 75 && (
            <span className="text-red-500 font-medium">âš ï¸ Below 75% threshold</span>
          )}
        </div>
      </div>
    </div>
  );
}
