import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 👋');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-800/30" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur">
            <span className="text-3xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold font-heading mb-4">Next-Gen Student Living</h1>
          <p className="text-white/80 text-lg leading-relaxed">Manage your hostel experience — rooms, fees, attendance, and more — all in one beautiful platform.</p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {['Smart Room Booking', 'QR Attendance', 'Fee Management', 'Real-time Alerts'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Floating blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex items-center justify-center p-8 bg-slate-50"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-slate-900 font-heading text-xl">StayGen</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 font-heading mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your StayGen account</p>

          {/* Demo credentials */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-indigo-700 mb-2">🔑 Demo Credentials</p>
            <div className="space-y-1 text-xs text-indigo-600">
              <p>Admin: <strong>admin@staygen.com</strong> / Admin@123</p>
              <p>Student: <strong>student1@staygen.com</strong> / Student@123</p>
              <p>Security: <strong>security@staygen.com</strong> / Admin@123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
