import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import API from '../../lib/api';
import { formatRelativeTime, getStatusColor, getPriorityColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchComplaints = async (page: number, status: string, category: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10', ...(status && { status }), ...(category && { category }) });
  const res = await API.get(`/complaints?${params}`);
  return res.data;
};

const STATUS_FLOW = ['open', 'in_progress', 'resolved', 'closed'];
const CATEGORY_ICONS: Record<string, string> = {
  maintenance: 'ðŸ”§', electrical: 'âš¡', plumbing: 'ðŸš°', cleanliness: 'ðŸ§¹',
  food: 'ðŸ½ï¸', security: 'ðŸ›¡ï¸', staff: 'ðŸ‘¤', other: 'ðŸ“‹',
};

export default function ComplaintsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['complaints', page, status, category],
    queryFn: () => fetchComplaints(page, status, category),
  });
  const complaints = data?.data || [];
  const pagination = data?.pagination || {};

  const updateStatus = useMutation({
    mutationFn: ({ id, status, message }: any) => API.put(`/complaints/${id}/status`, { status, message }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); toast.success('Complaint updated!'); },
    onError: () => toast.error('Failed to update complaint.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Complaints</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total complaints</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', status === s ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300')}>
              {s ? s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'maintenance', 'electrical', 'plumbing', 'cleanliness', 'food', 'security', 'other'].map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all', category === c ? 'bg-indigo-100 text-indigo-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
            {c ? `${CATEGORY_ICONS[c] || ''} ${c.charAt(0).toUpperCase() + c.slice(1)}` : 'All Categories'}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <CheckCircle size={48} className="text-emerald-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No complaints found ðŸŽ‰</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {complaints.map((c: any, i: number) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-lg">{CATEGORY_ICONS[c.category] || 'ðŸ“‹'}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(c.status))}>{c.status.replace('_', ' ')}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getPriorityColor(c.priority))}>{c.priority}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 md:gap-6 text-xs text-slate-500">
                    <span>By: <strong className="text-slate-700 dark:text-slate-300">{c.studentId?.userId?.name}</strong></span>
                    <span>{formatRelativeTime(c.createdAt)}</span>
                    {c.images?.length > 0 && <span>ðŸ“· {c.images.length} image{c.images.length > 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {STATUS_FLOW.filter(s => s !== c.status).slice(0, 2).map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => updateStatus.mutate({ id: c._id, status: nextStatus, message: `Status changed to ${nextStatus}` })}
                      className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border', nextStatus === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : nextStatus === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')}
                    >
                      â†’ {nextStatus.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              {/* Images */}
              {c.images?.length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {c.images.map((img: any, j: number) => (
                    <a key={j} href={img.url} target="_blank" rel="noopener noreferrer">
                      <img src={img.url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50">Next</button>
        </div>
      )}
    </div>
  );
}
