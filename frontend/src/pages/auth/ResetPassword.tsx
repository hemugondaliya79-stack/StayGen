import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await API.post('/auth/reset-password', { email, otp: data.otp, password: data.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Check your OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Password Reset!</h2>
              <p className="text-slate-500 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                <Lock size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading text-center mb-2">Reset Password</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">Enter the OTP sent to <strong>{email}</strong> and your new password.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">6-Digit OTP</label>
                  <input {...register('otp')} type="text" maxLength={6} placeholder="000000" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-center text-xl font-bold tracking-widest placeholder-slate-300" />
                  {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400" />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
          <div className="text-center mt-6">
            <Link to="/login" className="text-slate-500 text-sm hover:text-slate-700">Back to Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
