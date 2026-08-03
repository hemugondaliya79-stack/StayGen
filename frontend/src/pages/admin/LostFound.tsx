import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';

const fetchItems = async (type: string) => {
  const params = type ? `?type=${type}` : '';
  const res = await API.get(`/lost-found${params}&limit=20`);
  return res.data.data;
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'ðŸ’»', clothing: 'ðŸ‘•', documents: 'ðŸ“„', accessories: 'âŒš', books: 'ðŸ“š', other: 'ðŸ“¦'
};

export default function LostFoundPage() {
  const [type, setType] = useState('');

  const { data: items, isLoading } = useQuery({ queryKey: ['lostfound', type], queryFn: () => fetchItems(type) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Lost & Found</h1>
          <p className="text-slate-500 text-sm mt-1">{items?.length || 0} reports</p>
        </div>
        <div className="flex gap-2">
          {['', 'lost', 'found'].map(t => (
            <button key={t} onClick={() => setType(t)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', type === t ? 'gradient-bg text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
              {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : !items?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Search size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No items reported</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item: any, i: number) => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{CATEGORY_ICONS[item.category] || 'ðŸ“¦'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>{item.type}</span>
                  </div>
                  <p className="text-xs text-slate-500 capitalize">{item.category}</p>
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
                {item.location && <p>ðŸ“ {item.location}</p>}
                <p>ðŸ“… {formatDate(item.date)}</p>
                <p>ðŸ‘¤ {item.reportedBy?.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
