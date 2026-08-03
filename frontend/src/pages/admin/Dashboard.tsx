import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, BedDouble, CreditCard, AlertCircle, CalendarCheck, UserCheck, TrendingUp, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../lib/api';
import { formatCurrency, formatRelativeTime, getStatusColor, cn } from '../../lib/utils';

const fetchDashboard = async () => {
  const res = await API.get('/dashboard/admin');
  return res.data.data;
};

const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{value}</p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-emerald-500 font-medium mt-2">{sub}</p>}
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
    <div className="skeleton w-11 h-11 rounded-xl mb-4" />
    <div className="skeleton h-7 w-24 mb-2" />
    <div className="skeleton h-4 w-32" />
  </div>
);

const COLORS = ['#5B5FEF', '#7C3AED', '#06B6D4', '#22C55E'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchDashboard, refetchInterval: 30000 });

  const stats = data?.stats || {};
  const revenueChart = data?.charts?.revenueChart || [];
  const recent = data?.recent || {};

  const roomPieData = [
    { name: 'Available', value: stats.availableRooms || 0 },
    { name: 'Occupied', value: stats.occupiedRooms || 0 },
    { name: 'Maintenance', value: stats.maintenanceRooms || 0 },
  ];

  const statCards = [
    { icon: Users, label: 'Total Students', value: stats.totalStudents || 0, color: 'bg-indigo-500', sub: 'Active residents' },
    { icon: BedDouble, label: 'Available Rooms', value: stats.availableRooms || 0, color: 'bg-emerald-500', sub: `${stats.occupiedRooms || 0} occupied` },
    { icon: CreditCard, label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue || 0), color: 'bg-purple-500', sub: 'This month' },
    { icon: AlertCircle, label: 'Open Complaints', value: stats.pendingComplaints || 0, color: 'bg-red-500', sub: 'Needs attention' },
    { icon: CalendarCheck, label: 'Attendance Today', value: `${stats.attendancePercentage || 0}%`, color: 'bg-cyan-500', sub: 'Present today' },
    { icon: UserCheck, label: "Today's Visitors", value: stats.todayVisitors || 0, color: 'bg-amber-500', sub: 'Checked in' },
    { icon: BedDouble, label: 'Pending Bookings', value: stats.pendingBookings || 0, color: 'bg-slate-500', sub: 'Awaiting approval' },
    { icon: TrendingUp, label: 'Total Rooms', value: stats.totalRooms || 0, color: 'bg-pink-500', sub: 'All blocks' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading
          ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => <StatCard key={i} {...card} delay={i * 0.05} />)
        }
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white font-heading">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">+12% this month</span>
          </div>
          {isLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `â‚¹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#5B5FEF" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#5B5FEF', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-6">Room Status</h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={roomPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {roomPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {roomPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Recent Bookings</h3>
          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : recent.bookings?.length ? (
            <div className="space-y-3">
              {recent.bookings.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {b.studentId?.userId?.name?.[0] || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{b.studentId?.userId?.name || 'Student'}</p>
                    <p className="text-xs text-slate-500">Room {b.roomId?.roomNumber}</p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(b.status))}>{b.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BedDouble size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No recent bookings</p>
            </div>
          )}
        </div>

        {/* Recent complaints */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Recent Complaints</h3>
          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : recent.complaints?.length ? (
            <div className="space-y-3">
              {recent.complaints.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', c.priority === 'urgent' ? 'bg-red-100' : 'bg-amber-100')}>
                    <AlertCircle size={16} className={c.priority === 'urgent' ? 'text-red-500' : 'text-amber-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.studentId?.userId?.name} Â· {formatRelativeTime(c.createdAt)}</p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(c.status))}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-emerald-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No open complaints ðŸŽ‰</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
