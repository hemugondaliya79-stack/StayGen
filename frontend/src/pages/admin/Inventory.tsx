import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Package, Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import API from '../../lib/api';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchInventory = async (page: number) => {
  const res = await API.get(`/inventory?page=${page}&limit=12`);
  return res.data;
};

const CATEGORY_ICONS: Record<string, string> = {
  furniture: '🪑', electronics: '💻', cleaning: '🧹', kitchen: '🍳', sports: '⚽', stationery: '✏️', other: '📦'
};
const CONDITION_COLORS: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-700', fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-orange-100 text-orange-700', damaged: 'bg-red-100 text-red-700'
};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['inventory', page], queryFn: () => fetchInventory(page) });
  const items = data?.data || [];
  const pagination = data?.pagination || {};

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createItem = useMutation({
    mutationFn: (d: any) => API.post('/inventory', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item added!'); setShowModal(false); reset(); },
    onError: () => toast.error('Failed to add item.'),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => API.delete(`/inventory/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item deleted.'); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} items</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Package size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No inventory items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item: any, i: number) => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{CATEGORY_ICONS[item.category] || '📦'}</span>
                <div className="flex items-center gap-2">
                  {item.quantity <= item.minQuantity && (
                    <span className="text-amber-500 text-xs font-bold">⚠️</span>
                  )}
                  <button onClick={() => { if (confirm('Delete?')) deleteItem.mutate(item._id); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-3 capitalize">{item.category}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{item.quantity}</p>
                  <p className="text-xs text-slate-500">{item.unit}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium', CONDITION_COLORS[item.condition])}>{item.condition}</span>
                  {item.location && <p className="text-xs text-slate-400 mt-1">{item.location}</p>}
                </div>
              </div>
              {item.quantity <= item.minQuantity && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-amber-600 font-medium">⚠️ Low stock — reorder needed</p>
                </div>
              )}
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Add Inventory Item</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createItem.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Item Name *</label>
                  <input {...register('name', { required: true })} placeholder="e.g. Study Chair" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select {...register('category')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['furniture', 'electronics', 'cleaning', 'kitchen', 'sports', 'stationery', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Condition</label>
                    <select {...register('condition')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['good', 'fair', 'poor', 'damaged'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity *</label>
                    <input {...register('quantity', { required: true, valueAsNumber: true })} type="number" min="0" placeholder="50" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Unit</label>
                    <input {...register('unit')} placeholder="units" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                  <input {...register('location')} placeholder="e.g. Storage Room B" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                    {isSubmitting ? 'Adding...' : 'Add Item'}
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
