import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CreditCard, Plus, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import API from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchFees = async (page: number, status: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10', ...(status && { status }) });
  const res = await API.get(`/fees?${params}`);
  return res.data;
};

export default function FeesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['fees', page, status], queryFn: () => fetchFees(page, status) });
  const fees = data?.data || [];
  const pagination = data?.pagination || {};

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createFee = useMutation({
    mutationFn: (d: any) => API.post('/fees', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee record created!'); setShowModal(false); reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create fee.'),
  });

  const markPaid = useMutation({
    mutationFn: ({ id, method }: any) => API.put(`/fees/${id}/pay`, { paymentMethod: method }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Payment recorded!'); },
    onError: () => toast.error('Failed to mark payment.'),
  });

  const totalRevenue = fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.finalAmount || f.amount), 0);
  const pendingAmount = fees.filter((f: any) => f.status === 'pending').reduce((sum: number, f: any) => sum + (f.finalAmount || f.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Fee Management</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} fee records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 self-start">
          <Plus size={16} /> Create Fee
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3"><CheckCircle size={18} className="text-white" /></div>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-heading">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-slate-500 mt-1">Collected (this page)</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-3"><Clock size={18} className="text-white" /></div>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-heading">{formatCurrency(pendingAmount)}</p>
          <p className="text-sm text-slate-500 mt-1">Pending (this page)</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3"><AlertTriangle size={18} className="text-white" /></div>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-heading">{fees.filter((f: any) => f.status === 'overdue').length}</p>
          <p className="text-sm text-slate-500 mt-1">Overdue</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', status === s ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Student</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Invoice</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Month</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Due Date</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td>)}</tr>
              )) : fees.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16"><CreditCard size={40} className="text-slate-200 mx-auto mb-3" /><p className="text-slate-500">No fee records found</p></td></tr>
              ) : fees.map((fee: any, i: number) => (
                <motion.tr key={fee._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{fee.studentId?.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{fee.studentId?.userId?.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{fee.invoiceNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{formatCurrency(fee.finalAmount || fee.amount)}</p>
                    {fee.discount > 0 && <p className="text-xs text-emerald-600">-{formatCurrency(fee.discount)} discount</p>}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm text-slate-600 dark:text-slate-400">{fee.month}</span></td>
                  <td className="px-5 py-4 hidden lg:table-cell"><span className="text-sm text-slate-500">{formatDate(fee.dueDate)}</span></td>
                  <td className="px-5 py-4"><span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(fee.status))}>{fee.status}</span></td>
                  <td className="px-5 py-4">
                    {fee.status === 'pending' && (
                      <button onClick={() => markPaid.mutate({ id: fee._id, method: 'cash' })} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors font-medium">Mark Paid</button>
                    )}
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

      {/* Create Fee Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Create Fee Record</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createFee.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID</label>
                  <input {...register('studentId', { required: true })} placeholder="Student MongoDB ID" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">User ID</label>
                  <input {...register('userId', { required: true })} placeholder="User MongoDB ID" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (₹)</label>
                    <input {...register('amount', { required: true, valueAsNumber: true })} type="number" placeholder="5000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                    <select {...register('type')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="hostel">Hostel</option>
                      <option value="mess">Mess</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Month</label>
                    <input {...register('month', { required: true })} placeholder="August 2026" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                    <input {...register('dueDate', { required: true })} type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Creating...' : 'Create Fee'}
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
