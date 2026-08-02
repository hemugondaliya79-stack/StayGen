import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'hostel_admin', 'security']),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister({ name: data.name, email: data.email, password: data.password, role: data.role, phone: data.phone });
      toast.success('Account created successfully! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="relative z-10 text-white max-w-md text-center">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur">
            <span className="text-3xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold font-heading mb-4">Join StayGen Today</h1>
          <p className="text-white/80 text-lg leading-relaxed">Create your account and experience the future of hostel management. It takes less than 2 minutes.</p>
          <div className="mt-10 space-y-3 text-left">
            {['Free 14-day trial — no credit card needed', 'Setup completes in minutes', 'Dedicated onboarding support', 'Cancel anytime'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-slate-900 font-heading text-xl">StayGen</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 font-heading mb-2">Create account</h2>
          <p className="text-slate-500 mb-8">Join thousands of hostel teams on StayGen</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('name')} type="text" placeholder="Arjun Sharma" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (Optional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('phone')} type="tel" placeholder="9876543210" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select {...register('role')} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 appearance-none cursor-pointer">
                <option value="student">Student</option>
                <option value="hostel_admin">Hostel Admin</option>
                <option value="security">Security Guard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={18} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
