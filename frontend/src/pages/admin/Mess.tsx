import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UtensilsCrossed, Star, Plus, X } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];
const DAY_LABELS: Record<string, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const MEAL_ICONS: Record<string, string> = { breakfast: '☀️', lunch: '🍱', snacks: '🍪', dinner: '🌙' };

const fetchMenu = () => API.get('/mess/current').then(r => r.data.data);
const fetchRatings = () => API.get('/mess/ratings').then(r => r.data.data);

export default function MessPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeDay, setActiveDay] = useState('monday');
  const qc = useQueryClient();

  const { data: menu, isLoading } = useQuery({ queryKey: ['mess-menu'], queryFn: fetchMenu });
  const { data: ratings } = useQuery({ queryKey: ['mess-ratings'], queryFn: fetchRatings });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createMenu = useMutation({
    mutationFn: (d: any) => API.post('/mess', { weekStartDate: new Date(), menu: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mess-menu'] }); toast.success('Menu updated!'); setShowModal(false); reset(); },
    onError: () => toast.error('Failed to update menu.'),
  });

  const getTodayMenu = () => {
    if (!menu?.menu) return null;
    const dayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    return menu.menu[dayName];
  };

  const todayMenu = getTodayMenu();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Mess Management</h1>
          <p className="text-slate-500 text-sm mt-1">Weekly menu and food ratings</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 self-start">
          <Plus size={16} /> Update Menu
        </button>
      </div>

      {/* Today's highlight */}
      {todayMenu && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🍽️</span>
            <h3 className="font-semibold font-heading">Today's Menu</h3>
            <span className="text-white/70 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MEALS.map(meal => (
              <div key={meal} className="bg-white/15 backdrop-blur rounded-xl p-3">
                <p className="text-white/70 text-xs mb-1">{MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}</p>
                <p className="text-white text-sm font-medium">{(todayMenu as any)[meal] || 'TBD'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings */}
      {ratings && ratings.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Average Ratings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ratings.map((r: any) => (
              <div key={r._id} className="text-center">
                <p className="text-sm text-slate-500 mb-1">{MEAL_ICONS[r._id]} {r._id}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star size={16} fill="#F59E0B" className="text-amber-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{r.avgRating?.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-400">{r.count} ratings</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Menu */}
      {isLoading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : menu ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Day tabs */}
          <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-700">
            {DAYS.map(day => (
              <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeDay === day ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MEALS.map(meal => (
                <div key={meal} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{MEAL_ICONS[meal]} {meal}</p>
                  <p className="text-sm text-slate-800 dark:text-white">{(menu.menu?.[activeDay] as any)?.[meal] || <span className="text-slate-400">Not set</span>}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <UtensilsCrossed size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No menu set for this week</p>
          <button onClick={() => setShowModal(true)} className="mt-4 gradient-bg text-white px-4 py-2 rounded-xl text-sm">Add Menu</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Update Weekly Menu</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(d => createMenu.mutate(d))} className="space-y-6">
                {DAYS.map(day => (
                  <div key={day}>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 capitalize">{day}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {MEALS.map(meal => (
                        <div key={meal}>
                          <label className="block text-xs text-slate-500 mb-1">{MEAL_ICONS[meal]} {meal}</label>
                          <input {...register(`${day}.${meal}`)} placeholder={`${meal} items...`} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-800 pb-1">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? 'Saving...' : 'Save Menu'}
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
