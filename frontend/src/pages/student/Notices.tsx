import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getPriorityColor, cn } from '../../lib/utils';

const fetchNotices = () => API.get('/notices?limit=50').then(r => r.data.data);

const CATEGORY_ICONS: Record<string, string> = {
  general: 'ðŸ“¢', academic: 'ðŸ“š', maintenance: 'ðŸ”§', emergency: 'ðŸš¨', event: 'ðŸŽ‰', hostel: 'ðŸ '
};
const PRIORITY_BANNER: Record<string, string> = {
  urgent: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30',
  high: 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30',
  medium: 'bg-amber-50 border-amber-100 dark:bg-slate-800 dark:border-slate-700',
  low: 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700',
};

export default function StudentNotices() {
  const { data: notices, isLoading } = useQuery({ queryKey: ['notices'], queryFn: fetchNotices });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Notice Board</h1>
        <p className="text-slate-500 text-sm mt-1">{notices?.length || 0} active notices</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 md:space-y-6">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : !notices?.length ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Bell size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No notices available</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {notices.map((notice: any, i: number) => (
            <div key={notice._id} className={cn('rounded-2xl border p-5 transition-all hover:shadow-sm', PRIORITY_BANNER[notice.priority] || PRIORITY_BANNER.low)}>
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-2xl flex-shrink-0">{CATEGORY_ICONS[notice.category] || 'ðŸ“¢'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{notice.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getPriorityColor(notice.priority))}>{notice.priority}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{notice.category}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{notice.content}</p>
                  <div className="flex items-center gap-4 md:gap-6 mt-3 text-xs text-slate-400">
                    <span>Posted by {notice.publishedBy?.name}</span>
                    <span>{formatDate(notice.createdAt)}</span>
                    {notice.expiresAt && <span>Expires {formatDate(notice.expiresAt)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
