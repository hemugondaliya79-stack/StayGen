import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[500px]"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/5">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-base font-heading">S</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white font-heading text-2xl tracking-tight">
                StayGen
              </span>
            </Link>
          </div>

          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading mb-2">Password Reset!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting to login page...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  Reset Password
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Enter the 6-digit OTP code sent to <strong className="text-slate-900 dark:text-white">{email || 'your email'}</strong> and set a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* 6-Digit OTP */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp"
                    {...register('otp')}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="input-auth text-center text-xl font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal"
                  />
                  {errors.otp && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.otp.message}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    New Password
                  </label>
                  <div className="relative w-full flex items-center">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <input
                      id="password"
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      className="input-auth input-has-left-icon input-has-right-icon"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center z-10"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative w-full flex items-center">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <input
                      id="confirmPassword"
                      {...register('confirmPassword')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      className="input-auth input-has-left-icon"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.confirmPassword.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 min-h-[52px] gradient-bg text-white font-bold text-base rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link to="/login" className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
