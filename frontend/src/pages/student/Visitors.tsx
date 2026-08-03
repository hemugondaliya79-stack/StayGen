import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UserCheck, Plus, X, QrCode } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchMyVisitors = () => API.get('/visitors/my').then(r => r.data.data);

export default function StudentVisitors() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();
  const { data: visitors, isLoading } = useQuery({ queryKey: ['my-visitors'], queryFn: fetchMyVisitors });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const addVisitor = useMutation({
    mutationFn: (d: any) => API.post('/visitors', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-visitors'] }); toast.success('Visitor registered! QR code will be sent.'); setShowModal(false); reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">My Visitors</h1>
          <p className="text-slate-500 text-sm mt-1">Pre-register visitors for easy check-in</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> Add Visitor
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : !visitors?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <UserCheck size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No visitors registered yet</p>
          <p className="text-slate-400 text-sm mt-1">Pre-register visitors to get a QR code for easy entry</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {visitors.map((v: any, i: number) => (
            <motion.div key={v._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{v.visitorName}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(v.status))}>{v.status.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>ðŸ“ž {v.visitorPhone}</span>
                    <span>ðŸ‘¥ {v.relation || 'Guest'}</span>
                    <span>ðŸ“… {formatDate(v.expectedDate)}</span>
                    <span>ðŸŽ¯ {v.purpose}</span>
                  </div>
                </div>
                {v.qrCode && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={v.qrCode} alt="QR Code" className="w-16 h-16 rounded-xl border border-slate-200" />
                    <a href={v.qrCode} download className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      <QrCode size={12} /> Download
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Register Visitor</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => addVisitor.mutate(d))} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visitor Name *</label>
                  <input {...register('visitorName', { required: true })} placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone *</label>
                    <input {...register('visitorPhone', { required: true })} type="tel" placeholder="9876543210" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Relation</label>
                    <input {...register('relation')} placeholder="Father, Friend..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Date *</label>
                    <input {...register('expectedDate', { required: true })} type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Purpose</label>
                    <input {...register('purpose')} placeholder="Meeting, Delivery..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Registering...' : 'Register Visitor'}
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
