import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BedDouble, Plus, X, CheckCircle, Clock, Wind } from 'lucide-react';
import API from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchRooms = () => API.get('/rooms?status=available&limit=20').then(r => r.data.data);
const fetchMyBookings = () => API.get('/bookings/my').then(r => r.data.data);

export default function StudentBooking() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const qc = useQueryClient();

  const { data: rooms, isLoading: roomsLoading } = useQuery({ queryKey: ['available-rooms'], queryFn: fetchRooms });
  const { data: myBookings, isLoading: bookingsLoading } = useQuery({ queryKey: ['my-bookings'], queryFn: fetchMyBookings });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createBooking = useMutation({
    mutationFn: (d: any) => API.post('/bookings', { ...d, roomId: selectedRoom._id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-bookings'] }); toast.success('Booking request submitted! Awaiting approval.'); setShowModal(false); reset(); setSelectedRoom(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Booking failed.'),
  });

  const cancelBooking = useMutation({
    mutationFn: (id: string) => API.put(`/bookings/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-bookings'] }); toast.success('Booking cancelled.'); },
    onError: () => toast.error('Cannot cancel this booking.'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Room Booking</h1>
        <p className="text-slate-500 text-sm mt-1">Browse and book available rooms</p>
      </div>

      {/* My bookings */}
      {myBookings?.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">My Bookings</h3>
          <div className="space-y-3">
            {myBookings.map((b: any, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <BedDouble size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">Room {b.roomId?.roomNumber}</p>
                  <p className="text-xs text-slate-500">Check in: {formatDate(b.checkIn)} · {b.roomId?.type} room</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(b.status))}>{b.status}</span>
                  {['pending', 'waitlisted'].includes(b.status) && (
                    <button onClick={() => { if (confirm('Cancel booking?')) cancelBooking.mutate(b._id); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available rooms */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Available Rooms</h3>
        {roomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
          </div>
        ) : !rooms?.length ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <BedDouble size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No rooms available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room: any, i: number) => (
              <motion.div key={room._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                <div className="h-24 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-4">
                  <BedDouble size={28} className="text-indigo-300" />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Room {room.roomNumber}</h3>
                    <p className="text-xs text-slate-500">Floor {room.floor}, Block {room.block}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(room.price)}</p>
                    <p className="text-xs text-slate-500">/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{room.type}</span>
                  {room.isAC && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><Wind size={10} /> AC</span>}
                  {room.isAttached && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Attached</span>}
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {Array(room.capacity).fill(0).map((_: any, j: number) => (
                    <div key={j} className={cn('flex-1 h-1.5 rounded-full', j < room.occupied ? 'bg-red-300' : 'bg-emerald-300')} />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mb-4">{room.occupied}/{room.capacity} beds occupied</p>
                <button
                  onClick={() => { setSelectedRoom(room); setShowModal(true); }}
                  className="w-full gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Book This Room
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Book Room {selectedRoom.roomNumber}</h2>
                  <p className="text-sm text-slate-500">{formatCurrency(selectedRoom.price)}/month</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createBooking.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Check-in Date *</label>
                  <input {...register('checkIn', { required: true })} type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Check-out Date *</label>
                  <input {...register('checkOut', { required: true })} type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special Requests</label>
                  <textarea {...register('specialRequests')} rows={2} placeholder="Any special requirements..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  <Clock size={12} className="inline mr-1" />
                  Your request will be reviewed by the hostel admin before confirmation.
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
