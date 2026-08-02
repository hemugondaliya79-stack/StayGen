import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Search, Plus, X, Upload } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchLostFound = (type: string) => API.get(`/lost-found?limit=20${type ? `&type=${type}` : ''}`).then(r => r.data.data);

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', clothing: '👕', documents: '📄', accessories: '⌚', books: '📚', other: '📦'
};

export default function StudentLostFound() {
  const [type, setType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({ queryKey: ['lostfound', type], queryFn: () => fetchLostFound(type) });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const report = useMutation({
    mutationFn: async (d: any) => {
      const fd = new FormData();
      Object.entries(d).forEach(([k, v]) => fd.append(k, v as string));
      images.forEach(img => fd.append('images', img));
      return API.post('/lost-found', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lostfound'] }); toast.success('Report submitted!'); setShowModal(false); reset(); setImages([]); },
    onError: () => toast.error('Failed.'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Lost & Found</h1>
          <p className="text-slate-500 text-sm mt-1">Report or find lost items</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> Report Item
        </button>
      </div>

      <div className="flex gap-2">
        {['', 'lost', 'found'].map(t => (
          <button key={t} onClick={() => setType(t)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', type === t ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
            {t === '' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : !items?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Search size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nothing reported yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any, i: number) => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{CATEGORY_ICONS[item.category] || '📦'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                    {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                  </span>
                </div>
              </div>
              {item.description && <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{item.description}</p>}
              {item.images?.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {item.images.slice(0, 3).map((img: any, j: number) => (
                    <img key={j} src={img.url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                  ))}
                </div>
              )}
              <div className="text-xs text-slate-500 space-y-1">
                {item.location && <p>📍 {item.location}</p>}
                <p>📅 {formatDate(item.date || item.createdAt)}</p>
                {item.contactInfo && <p>📞 Contact: {item.contactInfo}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Report Lost/Found Item</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => report.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type *</label>
                    <select {...register('type', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select {...register('category')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                  <input {...register('title', { required: true })} placeholder="e.g. Blue earphones" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea {...register('description')} rows={3} placeholder="Describe the item in detail..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last seen location</label>
                    <input {...register('location')} placeholder="e.g. Library, Room 201" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                    <input {...register('date')} type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Photos (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-indigo-300">
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Upload images</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImages(Array.from(e.target.files || []))} />
                  </label>
                  {images.length > 0 && <p className="text-xs text-indigo-600 mt-1">{images.length} file(s) selected</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
