import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, Star, CheckCircle, Users, BedDouble,
  CreditCard, Bell, Smartphone, Globe, ChevronDown, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Users, title: 'Student Management', desc: 'Complete student profiles, documents, emergency contacts, and room assignments.' },
  { icon: BedDouble, title: 'Smart Room Booking', desc: 'Automated room allocation, booking requests, approval workflow, and waitlisting.' },
  { icon: Shield, title: 'Visitor Security', desc: 'QR code-based visitor verification, digital pass generation, and check-in/out tracking.' },
  { icon: CreditCard, title: 'Fee Management', desc: 'Automated fee collection, invoice generation, payment tracking, and overdue alerts.' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Instant alerts for bookings, complaints, fee reminders, and important announcements.' },
  { icon: Zap, title: 'Mess & Laundry', desc: 'Weekly mess menus, food ratings, and automated laundry request management.' },
];

const testimonials = [
  { name: 'Dr. Ramesh Patel', role: 'Hostel Warden, IIT Surat', text: 'StayGen transformed how we manage our 500-student hostel. What used to take hours now takes minutes.', rating: 5 },
  { name: 'Priya Sharma', role: 'Student, NIT Gujarat', text: 'Everything is so smooth — from booking my room to raising complaints. The app is genuinely beautiful.', rating: 5 },
  { name: 'Amit Joshi', role: 'Admin, MIT Hostel', text: 'The analytics and real-time notifications have helped us reduce complaint resolution time by 70%.', rating: 5 },
];

const faqs = [
  { q: 'How does room booking work?', a: 'Students can browse available rooms, submit booking requests, and get instant approvals via email and in-app notifications.' },
  { q: 'Is the system mobile-friendly?', a: 'Yes! StayGen is fully responsive and works seamlessly on mobile, tablet, and desktop.' },
  { q: 'How is visitor verification handled?', a: 'Students pre-register visitors who receive a unique QR code. Security scans this on arrival for instant verification.' },
  { q: 'Can we export reports?', a: 'Yes, all data can be exported as PDF or Excel including attendance reports, fee records, and complaint analytics.' },
];

const pricing = [
  { name: 'Starter', price: '₹2,999', period: '/month', desc: 'Perfect for small hostels', students: 'Up to 100 students', features: ['Room Management', 'Student Profiles', 'Fee Tracking', 'Basic Reports'], color: 'border-slate-200' },
  { name: 'Growth', price: '₹5,999', period: '/month', desc: 'Most popular for mid-size hostels', students: 'Up to 500 students', features: ['Everything in Starter', 'Visitor Management', 'QR Attendance', 'Real-time Notifications', 'Mess Management'], color: 'border-primary', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large institutions', students: 'Unlimited students', features: ['Everything in Growth', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee', 'White Labeling'], color: 'border-slate-200' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-slate-900 font-heading text-lg">StayGen</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Testimonials', 'Pricing', 'FAQ'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{item}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
              <Link to="/register" className="gradient-bg text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/30 bg-white/90 backdrop-blur px-4 py-4 flex flex-col gap-3">
            {['Features', 'Testimonials', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 py-2">{item}</a>
            ))}
            <Link to="/login" className="text-sm font-medium text-slate-600 py-2">Sign In</Link>
            <Link to="/register" className="gradient-bg text-white text-center text-sm font-semibold px-5 py-3 rounded-xl">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">Now live — Next-Gen Hostel Management</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6">
            The OS for
            <span className="gradient-text block">Student Living</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            StayGen replaces outdated hostel management with a beautiful, intelligent platform.
            Manage rooms, fees, complaints, and more — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="gradient-bg text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 group">
              Start Free Trial
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center gap-2 text-slate-600 font-semibold px-8 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg">
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            {['No credit card required', 'Free 14-day trial', 'Setup in minutes'].map((text, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/30 border border-slate-800">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 mx-4 bg-slate-800 rounded-lg py-1.5 px-3 text-slate-400 text-xs text-center">
                app.staygen.com/admin
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: '487', color: '#5B5FEF', change: '+12%' },
                { label: 'Available Rooms', value: '23', color: '#22C55E', change: '+3' },
                { label: 'Monthly Revenue', value: '₹2.4L', color: '#7C3AED', change: '+8%' },
                { label: 'Open Complaints', value: '7', color: '#EF4444', change: '-2' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-slate-800 rounded-2xl p-4"
                >
                  <p className="text-slate-400 text-xs mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.change}</p>
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="bg-slate-800 rounded-2xl p-4 h-32 flex items-center justify-center">
                <div className="w-full flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                      className="flex-1 rounded-t-lg"
                      style={{ background: `linear-gradient(to top, #5B5FEF, #7C3AED)`, opacity: 0.8 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Hostels Trust Us' },
            { value: '50K+', label: 'Students Managed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '4.9★', label: 'App Rating' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <p className="text-4xl font-bold gradient-text font-heading">{stat.value}</p>
              <p className="text-slate-600 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-slate-900 mb-4">Everything you need to <span className="gradient-text">run a hostel</span></h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">One platform for students, admins, and security — with modules for every use case.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2 font-heading">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-slate-900 mb-4">Loved by <span className="gradient-text">hostel teams</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" className="text-amber-400" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-slate-900 mb-4">Simple, <span className="gradient-text">transparent pricing</span></h2>
            <p className="text-slate-600">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl border-2 p-6 ${plan.color} ${plan.popular ? 'shadow-xl shadow-indigo-500/10' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-bg text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <h3 className="font-bold text-slate-900 text-xl font-heading mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold gradient-text font-heading">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-indigo-600 text-sm font-medium mb-6">{plan.students}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center font-semibold py-3 rounded-xl transition-all ${plan.popular ? 'gradient-bg text-white hover:opacity-90' : 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-slate-900 mb-4">Frequently asked <span className="gradient-text">questions</span></h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-6">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white font-heading mb-4">Ready to modernize your hostel?</h2>
              <p className="text-white/80 text-lg mb-8">Join 500+ hostels already using StayGen.</p>
              <Link to="/register" className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                Start Free Trial <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <span className="font-bold text-white font-heading">StayGen</span>
                <p className="text-xs text-slate-500">Next-Gen Student Living</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2024 StayGen. All rights reserved. Built with ❤️ for modern hostels.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
