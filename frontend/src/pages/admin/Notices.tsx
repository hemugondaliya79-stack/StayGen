import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Bell, Plus, X, Trash2 } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, getPriorityColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchNotices = async () => { const res = await API.get('/notices?limit=50'); return res.data.data; };

const CATEGORY_ICONS: Record<string, string> = { general: '📢', academic: '📚', maintenance: '🔧', emergency: '🚨', event: '🎉', hostel: '🏠' };

export default function NoticesPage() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: notices, isLoading } = useQuery({ queryKey: ['notices'], queryFn: fetchNotices });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createNotice = useMutation({
    mutationFn: (d: any) => API.post('/notices', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice published!'); setShowModal(false); reset(); },
    onError: () => toast.error('Failed to publish notice.'),
  });

  const deleteNotice = useMutation({
    mutationFn: (id: string) => API.delete(`/notices/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice deleted.'); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Notice Board</h1>
          <p className="text-slate-500 text-sm mt-1">{notices?.length || 0} active notices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> Post Notice
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : !notices?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Bell size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No notices yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any, i: number) => (
            <motion.div key={notice._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg flex-shrink-0">
                  {CATEGORY_ICONS[notice.category] || '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{notice.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getPriorityColor(notice.priority))}>{notice.priority}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{notice.category}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>By {notice.publishedBy?.name}</span>
                    <span>{formatDate(notice.createdAt)}</span>
                    {notice.expiresAt && <span>Expires: {formatDate(notice.expiresAt)}</span>}
                  </div>
                </div>
                <button onClick={() => { if (confirm('Delete this notice?')) deleteNotice.mutate(notice._id); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Post Notice</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createNotice.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                  <input {...register('title', { required: true })} placeholder="Notice title" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content *</label>
                  <textarea {...register('content', { required: true })} rows={4} placeholder="Notice content..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select {...register('category')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['general', 'academic', 'maintenance', 'emergency', 'event', 'hostel'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                    <select {...register('priority')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Publishing...' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
