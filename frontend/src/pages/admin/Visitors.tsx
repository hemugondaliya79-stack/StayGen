import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, LogIn, LogOut, QrCode } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, formatRelativeTime, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchVisitors = async (page: number, status: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10', ...(status && { status }) });
  const res = await API.get(`/visitors?${params}`);
  return res.data;
};

export default function VisitorsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['visitors', page, status], queryFn: () => fetchVisitors(page, status) });
  const visitors = data?.data || [];
  const pagination = data?.pagination || {};

  const approve = useMutation({
    mutationFn: (id: string) => API.put(`/visitors/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['visitors'] }); toast.success('Visitor approved!'); },
    onError: () => toast.error('Failed to approve.'),
  });

  const checkIn = useMutation({
    mutationFn: (id: string) => API.put(`/visitors/${id}/checkin`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['visitors'] }); toast.success('Checked in!'); },
    onError: () => toast.error('Failed.'),
  });

  const checkOut = useMutation({
    mutationFn: (id: string) => API.put(`/visitors/${id}/checkout`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['visitors'] }); toast.success('Checked out!'); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Visitor Management</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} visitor requests</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'checked_in', 'checked_out'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', status === s ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
              {s ? s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 md:space-y-6">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <UserCheck size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No visitors found</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {visitors.map((v: any, i: number) => (
            <motion.div key={v._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{v.visitorName}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(v.status))}>{v.status.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500">
                    <span>ðŸ“ž {v.visitorPhone}</span>
                    <span>ðŸ‘¤ {v.relation || 'Guest'}</span>
                    <span>ðŸŽ¯ {v.purpose || 'Visit'}</span>
                    <span>ðŸ“… {formatDate(v.expectedDate)}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Student: <strong className="text-slate-700 dark:text-slate-300">{v.studentId?.userId?.name}</strong>
                    {v.checkIn && <span className="ml-3">In: {formatRelativeTime(v.checkIn)}</span>}
                    {v.checkOut && <span className="ml-3">Out: {formatRelativeTime(v.checkOut)}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {v.status === 'pending' && (
                    <button onClick={() => approve.mutate(v._id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
                      <CheckCircle size={14} /> Approve
                    </button>
                  )}
                  {v.status === 'approved' && (
                    <button onClick={() => checkIn.mutate(v._id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors">
                      <LogIn size={14} /> Check In
                    </button>
                  )}
                  {v.status === 'checked_in' && (
                    <button onClick={() => checkOut.mutate(v._id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                      <LogOut size={14} /> Check Out
                    </button>
                  )}
                  {v.qrCode && (
                    <a href={v.qrCode} download={`visitor-${v._id}.png`} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                      <QrCode size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
