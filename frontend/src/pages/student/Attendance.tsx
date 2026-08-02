import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';

const fetchMyAttendance = () => API.get('/attendance/my').then(r => r.data.data);

const STATUS_STYLE: Record<string, string> = {
  present: 'bg-emerald-500 text-white',
  absent: 'bg-red-400 text-white',
  late: 'bg-amber-400 text-white',
  excused: 'bg-blue-400 text-white',
  holiday: 'bg-slate-200 text-slate-600',
};

export default function StudentAttendance() {
  const { data, isLoading } = useQuery({ queryKey: ['my-attendance'], queryFn: fetchMyAttendance });
  const records = data?.records || [];
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">My Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">Track your daily attendance records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: stats.total || 0, color: 'bg-slate-500' },
          { label: 'Present', value: stats.present || 0, color: 'bg-emerald-500' },
          { label: 'Absent', value: stats.absent || 0, color: 'bg-red-500' },
          { label: 'Percentage', value: `${stats.percentage || 0}%`, color: stats.percentage >= 75 ? 'bg-indigo-500' : 'bg-red-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 text-center">
            <div className={cn('w-3 h-3 rounded-full mx-auto mb-2', s.color)} />
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Attendance Rate</h3>
          <span className={cn('text-sm font-bold', stats.percentage >= 75 ? 'text-emerald-600' : 'text-red-500')}>{stats.percentage || 0}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full rounded-full', stats.percentage >= 75 ? 'gradient-bg' : 'bg-red-400')}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span className="text-amber-600 font-medium">⚠️ 75% minimum</span>
          <span>100%</span>
        </div>
      </div>

      {/* Attendance records */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">{Array(28).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
      ) : !records.length ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <CalendarCheck size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No attendance records yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Check In</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {records.map((r: any, i: number) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{formatDate(r.date)}</td>
                    <td className="px-5 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_STYLE[r.status] || 'bg-slate-100 text-slate-700')}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 hidden sm:table-cell">{r.checkInTime || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500 hidden sm:table-cell">{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
