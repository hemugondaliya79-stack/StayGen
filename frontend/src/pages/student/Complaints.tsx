import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { AlertCircle, Plus, X, Upload } from 'lucide-react';
import API from '../../lib/api';
import { formatRelativeTime, getStatusColor, getPriorityColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchMyComplaints = () => API.get('/complaints/my').then(r => r.data.data);

const CATEGORY_ICONS: Record<string, string> = {
  maintenance: '🔧', electrical: '⚡', plumbing: '🚰', cleanliness: '🧹',
  food: '🍽️', security: '🛡️', staff: '👤', other: '📋',
};

export default function StudentComplaints() {
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const qc = useQueryClient();

  const { data: complaints, isLoading } = useQuery({ queryKey: ['my-complaints'], queryFn: fetchMyComplaints });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createComplaint = useMutation({
    mutationFn: async (d: any) => {
      const fd = new FormData();
      Object.entries(d).forEach(([k, v]) => fd.append(k, v as string));
      images.forEach(img => fd.append('images', img));
      return API.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-complaints'] }); toast.success('Complaint submitted!'); setShowModal(false); reset(); setImages([]); },
    onError: () => toast.error('Failed to submit complaint.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">My Complaints</h1>
          <p className="text-slate-500 text-sm mt-1">{complaints?.length || 0} complaints</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : !complaints?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <AlertCircle size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No complaints yet</p>
          <p className="text-slate-400 text-sm mt-1">Raise a complaint if you face any issues</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c: any, i: number) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[c.category] || '📋'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(c.status))}>{c.status.replace('_', ' ')}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getPriorityColor(c.priority))}>{c.priority}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{c.description}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(c.createdAt)}</p>
                  {c.adminResponse && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm text-indigo-800 dark:text-indigo-300">
                      <p className="font-medium text-xs mb-1">Admin Response:</p>
                      {c.adminResponse.message}
                    </div>
                  )}
                </div>
              </div>
              {c.images?.length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {c.images.map((img: any, j: number) => (
                    <a key={j} href={img.url} target="_blank" rel="noopener noreferrer">
                      <img src={img.url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    </a>
                  ))}
                </div>
              )}
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Raise a Complaint</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createComplaint.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                  <input {...register('title', { required: true })} placeholder="Brief description of issue" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select {...register('category')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                    <select {...register('priority')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description *</label>
                  <textarea {...register('description', { required: true })} rows={4} placeholder="Describe the issue in detail..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Images (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-indigo-300 transition-colors">
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Upload photos of the issue</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImages(Array.from(e.target.files || []))} />
                  </label>
                  {images.length > 0 && <p className="text-xs text-indigo-600 mt-1">{images.length} file{images.length > 1 ? 's' : ''} selected</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
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
