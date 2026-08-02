import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BedDouble, Plus, Search, Wifi, Wind, X, Check, Trash2 } from 'lucide-react';
import API from '../../lib/api';
import { formatCurrency, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchRooms = async (params: any) => {
  const q = new URLSearchParams(params);
  const res = await API.get(`/rooms?${q}`);
  return res.data;
};

export default function RoomsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', search, statusFilter, typeFilter],
    queryFn: () => fetchRooms({ search, ...(statusFilter && { status: statusFilter }), ...(typeFilter && { type: typeFilter }) }),
  });
  const rooms = data?.data || [];

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createRoom = useMutation({
    mutationFn: (d: any) => API.post('/rooms', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room created!'); setShowModal(false); reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create room.'),
  });

  const deleteRoom = useMutation({
    mutationFn: (id: string) => API.delete(`/rooms/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room deleted.'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Cannot delete this room.'),
  });

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = { available: 'bg-emerald-500', occupied: 'bg-red-500', maintenance: 'bg-amber-500', reserved: 'bg-blue-500' };
    return map[status] || 'bg-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Rooms</h1>
          <p className="text-slate-500 text-sm mt-1">{rooms.length} rooms total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity self-start">
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Room number..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <BedDouble size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No rooms found</p>
          <p className="text-slate-400 text-sm mt-1">Add your first room to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room: any, i: number) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              {/* Room image or placeholder */}
              <div className="h-28 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-4 relative overflow-hidden">
                {room.images?.[0] ? (
                  <img src={room.images[0].url} alt={room.roomNumber} className="w-full h-full object-cover" />
                ) : (
                  <BedDouble size={32} className="text-indigo-300" />
                )}
                <div className="absolute top-2 right-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', getStatusDot(room.status))} />
                </div>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-heading">Room {room.roomNumber}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Floor {room.floor}, Block {room.block}</p>
                </div>
                <button
                  onClick={() => { if (confirm('Delete this room?')) deleteRoom.mutate(room._id); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {room.isAC && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><Wind size={10} /> AC</span>}
                {room.isAttached && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Attached</span>}
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{room.type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array(room.capacity).fill(0).map((_: any, j: number) => (
                      <div key={j} className={cn('w-5 h-5 rounded-md border', j < room.occupied ? 'bg-red-100 border-red-200' : 'bg-emerald-50 border-emerald-200')} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{room.occupied}/{room.capacity} occupied</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(room.price)}</p>
                  <p className="text-xs text-slate-500">/month</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Add New Room</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit(d => createRoom.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Number *</label>
                    <input {...register('roomNumber', { required: true })} placeholder="101" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Floor *</label>
                    <input {...register('floor', { required: true, valueAsNumber: true })} type="number" min="1" placeholder="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Block</label>
                    <input {...register('block')} placeholder="A" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type *</label>
                    <select {...register('type')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Capacity *</label>
                    <input {...register('capacity', { required: true, valueAsNumber: true })} type="number" min="1" placeholder="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Price (₹) *</label>
                    <input {...register('price', { required: true, valueAsNumber: true })} type="number" placeholder="5000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input {...register('isAC')} type="checkbox" className="rounded" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">AC Room</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input {...register('isAttached')} type="checkbox" className="rounded" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Attached Bathroom</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea {...register('description')} rows={2} placeholder="Room description..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Creating...' : 'Create Room'}
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
