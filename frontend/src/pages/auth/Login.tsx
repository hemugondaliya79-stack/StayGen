import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! ðŸ‘‹');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    }
  };

  return (
    <div className="auth-page min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[500px]"
      >
        <div className="auth-card bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10">
          {/* Header & Logo Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-base font-heading">S</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white font-heading text-2xl tracking-tight">
                StayGen
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Sign in to your StayGen account
            </p>
          </div>

          {/* Demo credentials info box */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl p-4 md:p-6 mb-6">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1.5 uppercase tracking-wider">
              ðŸ”‘ Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-indigo-900 dark:text-indigo-200 font-mono">
              <p><span className="font-semibold text-slate-600 dark:text-slate-400">Admin:</span> admin@staygen.com / Admin@123</p>
              <p><span className="font-semibold text-slate-600 dark:text-slate-400">Student:</span> student1@staygen.com / Student@123</p>
              <p><span className="font-semibold text-slate-600 dark:text-slate-400">Security:</span> security@staygen.com / Admin@123</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative w-full flex items-center">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-auth input-has-left-icon"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative w-full flex items-center">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] gradient-bg text-white font-bold text-base rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Line */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
