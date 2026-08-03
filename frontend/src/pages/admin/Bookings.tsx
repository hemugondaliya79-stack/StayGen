import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchBookings = async (page: number, status: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10', ...(status && { status }) });
  const res = await API.get(`/bookings?${params}`);
  return res.data;
};

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['bookings', page, status], queryFn: () => fetchBookings(page, status) });
  const bookings = data?.data || [];
  const pagination = data?.pagination || {};

  const updateStatus = useMutation({
    mutationFn: ({ id, status, reason }: any) => API.put(`/bookings/${id}/status`, { status, rejectionReason: reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Booking updated!'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update.'),
  });

  const handleApprove = (id: string) => {
    if (confirm('Approve this booking?')) updateStatus.mutate({ id, status: 'approved' });
  };
  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    updateStatus.mutate({ id, status: 'rejected', reason });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total bookings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'rejected', 'waitlisted'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', status === s ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300')}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Room</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Check In</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Requested</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td>)}</tr>
              )) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16"><BookOpen size={40} className="text-slate-200 mx-auto mb-3" /><p className="text-slate-500">No bookings found</p></td></tr>
              ) : bookings.map((b: any, i: number) => (
                <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{b.studentId?.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{b.studentId?.userId?.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Room {b.roomId?.roomNumber}</p>
                      <p className="text-xs text-slate-500">{b.roomId?.type} â€¢ â‚¹{b.roomId?.price}/mo</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(b.status))}>{b.status}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(b.checkIn)}</span></td>
                  <td className="px-5 py-4 hidden lg:table-cell"><span className="text-sm text-slate-500">{formatDate(b.createdAt)}</span></td>
                  <td className="px-5 py-4">
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(b._id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleReject(b._id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {b.status !== 'pending' && <span className="text-xs text-slate-400">â€”</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
