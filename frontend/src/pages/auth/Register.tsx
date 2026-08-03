import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock, ChevronDown } from 'lucide-react';
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
      await authRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone
      });
      toast.success('Account created successfully! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.');
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
              Create account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Join thousands of hostel teams on StayGen
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Full Name
              </label>
              <div className="relative w-full flex items-center">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  placeholder="Arjun Sharma"
                  className="input-auth input-has-left-icon"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
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

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative w-full flex items-center">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="phone"
                  {...register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  className="input-auth input-has-left-icon"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.phone.message}</p>}
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Role
              </label>
              <div className="relative w-full flex items-center">
                <select
                  id="role"
                  {...register('role')}
                  className="input-auth px-4 pr-10 appearance-none cursor-pointer text-base font-medium"
                >
                  <option value="student">Student</option>
                  <option value="hostel_admin">Hostel Admin</option>
                  <option value="security">Security Guard</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Password
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
                Confirm Password
              </label>
              <div className="relative w-full flex items-center">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
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
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Line */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
