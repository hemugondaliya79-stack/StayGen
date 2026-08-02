import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Users, Eye, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import API from '../../lib/api';
import { formatDate, getStatusColor, getRoleColor, getInitials, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchStudents = async (page: number, search: string, status: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10', search, ...(status && { status }) });
  const res = await API.get(`/students?${params}`);
  return res.data;
};

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, status],
    queryFn: () => fetchStudents(page, search, status),
  });

  const students = data?.data || [];
  const pagination = data?.pagination || {};

  const toggleActive = useMutation({
    mutationFn: (userId: string) => API.patch(`/users/${userId}/toggle-active`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Status updated.'); },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, email, roll number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button type="submit" className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90">
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Course</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Room</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Users size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No students found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                students.map((student: any, i: number) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {student.userId?.avatar
                            ? <img src={student.userId.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                            : getInitials(student.userId?.name || '')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{student.userId?.name}</p>
                          <p className="text-xs text-slate-500">{student.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{student.studentId || '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-700 dark:text-slate-300 max-w-[160px] truncate">{student.course || '—'}</p>
                      {student.year && <p className="text-xs text-slate-500">Year {student.year}</p>}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {student.roomId ? `Room ${student.roomId.roomNumber}` : <span className="text-slate-400">Not assigned</span>}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(student.status))}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-500">{formatDate(student.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive.mutate(student.userId?._id)}
                        title="Toggle active status"
                        className={cn('p-1.5 rounded-lg transition-colors', student.userId?.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50')}
                      >
                        {student.userId?.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
