import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, UserCheck, Users, CheckCircle, LogIn, LogOut, QrCode, Clock } from 'lucide-react';
import API from '../../lib/api';
import { formatRelativeTime, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchTodayVisitors = () => API.get('/visitors?status=approved&limit=50').then(r => r.data);
const fetchCheckedIn = () => API.get('/visitors?status=checked_in&limit=50').then(r => r.data);
const fetchStats = () => API.get('/dashboard/security').then(r => r.data.data);

export default function SecurityDashboard() {
  const qc = useQueryClient();
  const { data: pendingData } = useQuery({ queryKey: ['pending-visitors'], queryFn: fetchTodayVisitors, refetchInterval: 30000 });
  const { data: checkedInData } = useQuery({ queryKey: ['checkedin-visitors'], queryFn: fetchCheckedIn, refetchInterval: 30000 });
  const { data: stats } = useQuery({ queryKey: ['security-stats'], queryFn: fetchStats });

  const approved = pendingData?.data || [];
  const checkedIn = checkedInData?.data || [];

  const checkIn = useMutation({
    mutationFn: (id: string) => API.put(`/visitors/${id}/checkin`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-visitors'] }); qc.invalidateQueries({ queryKey: ['checkedin-visitors'] }); toast.success('Checked in!'); },
    onError: () => toast.error('Failed.'),
  });

  const checkOut = useMutation({
    mutationFn: (id: string) => API.put(`/visitors/${id}/checkout`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checkedin-visitors'] }); toast.success('Checked out!'); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Security Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage visitor entry</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: UserCheck, label: 'Awaiting Entry', value: approved.length, color: 'bg-amber-500' },
          { icon: Users, label: 'Inside Now', value: checkedIn.length, color: 'bg-emerald-500' },
          { icon: CheckCircle, label: "Today's Total", value: stats?.todayTotal || 0, color: 'bg-indigo-500' },
          { icon: Clock, label: 'Avg Duration', value: `${stats?.avgDuration || 0}m`, color: 'bg-purple-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Awaiting Entry */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Awaiting Entry ({approved.length})</h3>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {approved.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No visitors awaiting entry</div>
            ) : approved.map((v: any) => (
              <div key={v._id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-sm">{v.visitorName?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{v.visitorName}</p>
                  <p className="text-xs text-slate-500">{v.studentId?.userId?.name} · {v.purpose}</p>
                </div>
                <button onClick={() => checkIn.mutate(v._id)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-medium hover:bg-emerald-600 transition-colors flex-shrink-0">
                  <LogIn size={13} /> Check In
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Currently Inside */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Inside Now ({checkedIn.length})</h3>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {checkedIn.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No visitors inside</div>
            ) : checkedIn.map((v: any) => (
              <div key={v._id} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-9 h-9 rounded-xl bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">{v.visitorName?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{v.visitorName}</p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(v.checkIn)} · {v.studentId?.userId?.name}</p>
                </div>
                <button onClick={() => checkOut.mutate(v._id)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0">
                  <LogOut size={13} /> Check Out
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
