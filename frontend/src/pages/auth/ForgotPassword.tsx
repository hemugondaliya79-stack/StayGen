import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('OTP sent to your email!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
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

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                  Enter your registered email and we'll send a 6-digit OTP code to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative w-full flex items-center">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-auth input-has-left-icon"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 min-h-[52px] gradient-bg text-white font-bold text-base rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading mb-2">Check Your Email</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                We've sent a 6-digit OTP code to <strong className="text-slate-900 dark:text-white">{email}</strong>. It expires in 10 minutes.
              </p>
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="gradient-bg text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-95 shadow-md inline-flex items-center justify-center gap-2 min-h-[48px] w-full"
              >
                <span>Enter OTP Code</span>
                <ArrowRight size={18} />
              </Link>
            </div>
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
