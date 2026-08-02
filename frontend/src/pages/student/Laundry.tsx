import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Shirt, Plus, X, Package } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchMyLaundry = () => API.get('/laundry/my').then(r => r.data.data);

const STATUS_STEPS = ['requested', 'picked_up', 'in_progress', 'ready', 'delivered'];
const STATUS_ICONS: Record<string, string> = {
  requested: '📋', picked_up: '🧺', in_progress: '🔄', ready: '✅', delivered: '📦'
};

export default function StudentLaundry() {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([{ name: '', quantity: 1 }]);
  const qc = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ['my-laundry'], queryFn: fetchMyLaundry });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createRequest = useMutation({
    mutationFn: (d: any) => API.post('/laundry', { ...d, items }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-laundry'] }); toast.success('Laundry request submitted!'); setShowModal(false); reset(); setItems([{ name: '', quantity: 1 }]); },
    onError: () => toast.error('Failed to submit.'),
  });

  const addItem = () => setItems(prev => [...prev, { name: '', quantity: 1 }]);
  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Laundry</h1>
          <p className="text-slate-500 text-sm mt-1">{requests?.length || 0} requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> New Request
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : !requests?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Shirt size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No laundry requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r: any, i: number) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👕</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.totalItems} items</p>
                    <p className="text-xs text-slate-500">Pickup: {formatDate(r.pickupDate)}</p>
                  </div>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(r.status))}>{r.status.replace('_', ' ')}</span>
              </div>

              {/* Progress stepper */}
              <div className="flex items-center gap-0 mb-4">
                {STATUS_STEPS.map((step, j) => {
                  const stepIdx = STATUS_STEPS.indexOf(r.status);
                  const done = j <= stepIdx;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all', done ? 'gradient-bg text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400')}>
                        {done ? '✓' : j + 1}
                      </div>
                      {j < STATUS_STEPS.length - 1 && (
                        <div className={cn('flex-1 h-0.5 mx-1', j < stepIdx ? 'gradient-bg' : 'bg-slate-100 dark:bg-slate-700')} />
                      )}
                    </div>
                  );
                })}
              </div>

              {r.items?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {r.items.map((item: any, j: number) => (
                    <span key={j} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                      {item.name} ×{item.quantity}
                    </span>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">New Laundry Request</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createRequest.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pickup Date *</label>
                  <input {...register('pickupDate', { required: true })} type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Clothing Items *</label>
                    <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add Item</button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Item name" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        {items.length > 1 && (
                          <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special Instructions</label>
                  <textarea {...register('instructions')} rows={2} placeholder="Any special washing instructions..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
