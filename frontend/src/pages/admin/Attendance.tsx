import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarCheck, QrCode, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../lib/api';
import { cn } from '../../lib/utils';

const fetchAttendanceStats = () => API.get('/attendance/stats').then(r => r.data.data);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MOCK_WEEKLY = DAYS.map((d, i) => ({ day: d.slice(0, 3), present: Math.floor(Math.random() * 30 + 60), absent: Math.floor(Math.random() * 20) }));

export default function AttendancePage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['attendance-stats'], queryFn: fetchAttendanceStats });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Today's attendance overview</p>
        </div>
        <button className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 self-start">
          <QrCode size={16} /> Generate QR
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Users, label: 'Total Students', value: isLoading ? 'â€”' : stats?.total || 0, color: 'bg-indigo-500' },
          { icon: CalendarCheck, label: 'Present Today', value: isLoading ? 'â€”' : stats?.present || 0, color: 'bg-emerald-500' },
          { icon: Users, label: 'Absent Today', value: isLoading ? 'â€”' : stats?.absent || 0, color: 'bg-red-500' },
          { icon: TrendingUp, label: 'Attendance %', value: isLoading ? 'â€”' : `${stats?.percentage || 0}%`, color: 'bg-purple-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-700">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-6">Weekly Attendance Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={MOCK_WEEKLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
            <Bar dataKey="present" name="Present" fill="#5B5FEF" radius={[6, 6, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Today's Attendance Rate</h3>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats?.percentage || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full gradient-bg rounded-full"
            />
          </div>
          <span className="font-bold text-slate-900 dark:text-white w-12 text-right">{stats?.percentage || 0}%</span>
        </div>
        <div className="flex gap-6 mt-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Present: {stats?.present || 0}</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-300" /> Absent: {stats?.absent || 0}</div>
        </div>
      </div>
    </div>
  );
}
