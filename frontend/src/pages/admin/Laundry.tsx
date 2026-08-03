import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchLaundry = async () => { const res = await API.get('/laundry?limit=20'); return res.data.data; };

const STATUS_NEXT: Record<string, string> = {
  requested: 'picked_up', picked_up: 'in_progress', in_progress: 'ready', ready: 'delivered'
};
const STATUS_LABELS: Record<string, string> = {
  requested: 'ðŸ“‹ Requested', picked_up: 'ðŸ§º Picked Up', in_progress: 'ðŸ”„ In Progress', ready: 'âœ… Ready', delivered: 'ðŸ“¦ Delivered'
};

export default function LaundryPage() {
  const qc = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ['laundry'], queryFn: fetchLaundry });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => API.put(`/laundry/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['laundry'] }); toast.success('Status updated!'); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Laundry Requests</h1>
        <p className="text-slate-500 text-sm mt-1">{requests?.length || 0} requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : !requests?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Shirt size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No laundry requests</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {requests.map((r: any, i: number) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-lg">ðŸ‘•</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.studentId?.userId?.name || 'Student'}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(r.status))}>{r.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex gap-4 md:gap-6 text-xs text-slate-500">
                    <span>ðŸ§º {r.totalItems} item{r.totalItems !== 1 ? 's' : ''}</span>
                    <span>ðŸ“… Pickup: {formatDate(r.pickupDate)}</span>
                    {r.deliveryDate && <span>ðŸ“¦ Delivery: {formatDate(r.deliveryDate)}</span>}
                  </div>
                  {r.items?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.items.map((item: any, j: number) => (
                        <span key={j} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {item.name} Ã—{item.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {STATUS_NEXT[r.status] && (
                  <button onClick={() => updateStatus.mutate({ id: r._id, status: STATUS_NEXT[r.status] })}
                    className="px-4 py-2 gradient-bg text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                    â†’ {STATUS_LABELS[STATUS_NEXT[r.status]]}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
