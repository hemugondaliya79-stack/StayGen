import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed, Star } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];
const MEAL_ICONS: Record<string, string> = { breakfast: 'â˜€ï¸', lunch: 'ðŸ±', snacks: 'ðŸª', dinner: 'ðŸŒ™' };

const fetchMenu = () => API.get('/mess/current').then(r => r.data.data);

export default function StudentMess() {
  const [activeDay, setActiveDay] = useState(() => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const { data: menu, isLoading } = useQuery({ queryKey: ['mess-current'], queryFn: fetchMenu });

  const handleRate = async (meal: string, rating: number) => {
    setRatings(prev => ({ ...prev, [meal]: rating }));
    try {
      await API.post('/mess/rate', { meal, rating, date: new Date() });
      toast.success('Rating submitted! ðŸŒŸ');
    } catch {
      toast.error('Failed to submit rating.');
    }
  };

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Mess Menu</h1>
        <p className="text-slate-500 text-sm mt-1">Weekly food schedule</p>
      </div>

      {isLoading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : !menu ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <UtensilsCrossed size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Menu not set for this week</p>
        </div>
      ) : (
        <>
          {/* Day tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-700">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => setActiveDay(day)} className={`flex-1 min-w-16 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeDay === day ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  {DAY_LABELS[day]}
                  {i === todayIndex && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />}
                  {activeDay === day && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
              ))}
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {MEALS.map(meal => (
                  <div key={meal} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 md:p-6">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{MEAL_ICONS[meal]} {meal}</p>
                    <p className="text-sm text-slate-800 dark:text-white font-medium mb-3">
                      {(menu.menu?.[activeDay] as any)?.[meal] || <span className="text-slate-400">Not set</span>}
                    </p>
                    {/* Rating (only for today) */}
                    {DAYS[todayIndex] === activeDay && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => handleRate(meal, star)} className="transition-transform hover:scale-110">
                            <Star
                              size={16}
                              className={star <= (ratings[meal] || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                            />
                          </button>
                        ))}
                        {ratings[meal] && <span className="text-xs text-slate-500 ml-1">{ratings[meal]}/5</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's highlight */}
          <div className="gradient-bg rounded-2xl p-4 md:p-6 text-white">
            <h3 className="font-semibold font-heading mb-3">ðŸ½ï¸ Today's Menu â€” {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MEALS.map(meal => (
                <div key={meal} className="bg-white/15 backdrop-blur rounded-xl p-3">
                  <p className="text-white/70 text-xs mb-1">{MEAL_ICONS[meal]} {meal}</p>
                  <p className="text-white text-sm font-medium">{(menu.menu?.[DAYS[todayIndex]] as any)?.[meal] || 'TBD'}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
