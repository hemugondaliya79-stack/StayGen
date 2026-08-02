import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import API from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor, cn } from '../../lib/utils';

const fetchMyFees = () => API.get('/fees/my').then(r => r.data.data);

export default function StudentFees() {
  const { data: fees, isLoading } = useQuery({ queryKey: ['my-fees'], queryFn: fetchMyFees });
  const pending = fees?.filter((f: any) => f.status === 'pending') || [];
  const paid = fees?.filter((f: any) => f.status === 'paid') || [];
  const totalDue = pending.reduce((s: number, f: any) => s + (f.finalAmount || f.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">My Fees</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage your fee payments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gradient-bg rounded-2xl p-5 text-white">
          <p className="text-white/70 text-sm mb-1">Total Due</p>
          <p className="text-3xl font-bold font-heading">{formatCurrency(totalDue)}</p>
          <p className="text-white/70 text-xs mt-1">{pending.length} pending invoices</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <p className="text-sm text-slate-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{pending.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <p className="text-sm text-slate-500">Paid</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{paid.length}</p>
        </div>
      </div>

      {/* Pending fees */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Pending Payments</h3>
          <div className="space-y-3">
            {pending.map((fee: any, i: number) => (
              <motion.div key={fee._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white capitalize">{fee.type} Fee</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{fee.month}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Invoice: <code className="text-slate-700 dark:text-slate-300">{fee.invoiceNumber}</code></span>
                      <span>Due: <span className={new Date(fee.dueDate) < new Date() ? 'text-red-500 font-medium' : ''}>{formatDate(fee.dueDate)}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(fee.finalAmount || fee.amount)}</p>
                      {fee.discount > 0 && <p className="text-xs text-emerald-600">-{formatCurrency(fee.discount)} off</p>}
                    </div>
                    <a href={`/pay/${fee._id}`} className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                      Pay Now
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Payment History</h3>
        {isLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : !fees?.length ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <CreditCard size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No fee records found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Month</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {fees.map((fee: any) => (
                  <tr key={fee._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white capitalize">{fee.type}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{fee.month}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(fee.finalAmount || fee.amount)}</td>
                    <td className="px-5 py-3"><span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(fee.status))}>{fee.status}</span></td>
                    <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">{fee.paidDate ? formatDate(fee.paidDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
