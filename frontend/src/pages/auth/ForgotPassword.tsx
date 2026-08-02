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
    if (!email) return toast.error('Please enter your email.');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-white" />
          </div>
          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 font-heading text-center mb-2">Forgot Password?</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={18} /> Send OTP</>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Check Your Email</h2>
              <p className="text-slate-500 text-sm mb-6">We've sent a 6-digit OTP to <strong>{email}</strong>. It expires in 10 minutes.</p>
              <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="gradient-bg text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 inline-flex items-center gap-2">
                Enter OTP <ArrowRight size={18} />
              </Link>
            </div>
          )}
          <div className="text-center mt-6">
            <Link to="/login" className="text-slate-500 text-sm hover:text-slate-700 inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
