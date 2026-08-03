import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, Star, CheckCircle2, Users, BedDouble,
  CreditCard, Bell, ChevronDown, Menu, X, Check
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    desc: 'Centralized student profiles, document storage, emergency contacts, and automated room allocations.'
  },
  {
    icon: BedDouble,
    title: 'Smart Room Booking',
    desc: 'Real-time room availability, online booking requests, Warden approval workflow, and waitlist handling.'
  },
  {
    icon: Shield,
    title: 'Visitor Security Pass',
    desc: 'Instant QR code visitor verification, gatekeeper scanning, pass generation, and entry/exit audit logs.'
  },
  {
    icon: CreditCard,
    title: 'Automated Fee Management',
    desc: 'Digital invoices, recurring fee collection, payment receipts, instant notifications, and overdue reminders.'
  },
  {
    icon: Bell,
    title: 'Real-Time Broadcast Alerts',
    desc: 'Send targeted announcements, urgent complaint status updates, and broadcast notices to students instantly.'
  },
  {
    icon: Zap,
    title: 'Mess & Laundry Services',
    desc: 'Publish weekly mess menus, collect meal ratings, and digitize laundry token requests without paper registers.'
  },
];

const testimonials = [
  {
    name: 'Dr. Ramesh Patel',
    role: 'Hostel Warden, IIT Surat',
    text: 'StayGen completely transformed our 500-student hostel operations. What used to take hours of register entries now happens in seconds on mobile.',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Student Representative, NIT Gujarat',
    text: 'Room requests, fee receipts, and complaint tracking are so fast and intuitive. The mobile experience is smooth and super clean.',
    rating: 5
  },
  {
    name: 'Amit Joshi',
    role: 'Operations Head, MIT Campus Hostels',
    text: 'Visitor security scanning and analytics have helped us reduce complaint turnaround times by 70%. It is a essential SaaS tool.',
    rating: 5
  },
];

const faqs = [
  {
    q: 'How long does setup take for a new hostel?',
    a: 'You can import your rooms and student data via Excel/CSV and go live in less than 15 minutes. No custom hardware required.'
  },
  {
    q: 'Is StayGen accessible on both desktop and mobile devices?',
    a: 'Yes! StayGen is engineered with responsive B2B design standards and works seamlessly on desktops, laptops, tablets, and smartphones (360px+).'
  },
  {
    q: 'How does visitor QR code verification work at the gate?',
    a: 'Students submit visitor details in their app to generate a temporary digital QR pass. Security personnel scan the pass with any smartphone camera for immediate verification.'
  },
  {
    q: 'Can we export financial and student attendance reports?',
    a: 'Yes, admins can export comprehensive fee ledgers, monthly attendance sheets, and complaint audit logs in Excel or PDF format anytime.'
  },
];

const pricing = [
  {
    name: 'Starter',
    price: 'â‚¹2,999',
    period: '/month',
    desc: 'Ideal for small or independent hostels',
    students: 'Up to 100 students included',
    features: [
      'Room & Bed Allocation',
      'Digital Student Profiles',
      'Fee Collection & Receipts',
      'Standard Complaint Ticketing',
      'Email Support'
    ],
    popular: false
  },
  {
    name: 'Growth',
    price: 'â‚¹5,999',
    period: '/month',
    desc: 'Most popular for mid-size institutions',
    students: 'Up to 500 students included',
    features: [
      'Everything in Starter plan',
      'QR Code Visitor Gatekeeper Pass',
      'Daily Attendance & Leave Log',
      'Mess Menu & Laundry Module',
      'Real-time SMS & Push Alerts',
      'Priority 24/7 Support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For multi-campus universities & chains',
    students: 'Unlimited students & campuses',
    features: [
      'Everything in Growth plan',
      'Custom ERP/Biometric Integrations',
      'Dedicated Account Manager',
      '99.9% Uptime SLA Guarantee',
      'Custom Domain & White Labeling',
      'On-premise Security Audit'
    ],
    popular: false
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Sticky Opaque Blurred Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-base font-heading">S</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white font-heading text-xl tracking-tight">
              StayGen
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Testimonials', 'Pricing', 'FAQ'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="gradient-bg text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-95 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:shadow-indigo-500/30"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Toggle Button (Min 44px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl px-4 pt-3 pb-6 flex flex-col gap-3 shadow-xl">
            {['Features', 'Testimonials', 'Pricing', 'FAQ'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-slate-800 dark:text-slate-200 font-semibold py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full gradient-bg text-white text-center font-semibold py-3 rounded-xl shadow-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Balanced 2-Column Desktop, Stacked Mobile) */}
      <section className="pt-32 sm:pt-36 lg:pt-44 pb-20 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
              <span>Next-Gen Hostel OS â€” Version 2.0 Live</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              The OS for{' '}
              <span className="gradient-text block sm:inline">Student Living</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              StayGen replaces manual paper registers with an intelligent, automated platform.
              Streamline room bookings, fee collection, gate security, and student complaints â€” all in one modern B2B portal.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="gradient-bg text-white font-semibold px-7 py-3.5 rounded-xl text-base hover:opacity-95 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 group min-h-[48px]"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-base min-h-[48px] bg-white dark:bg-slate-900"
              >
                Sign In
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Check size={16} className="text-[#10B981]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={16} className="text-[#10B981]" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={16} className="text-[#10B981]" />
                <span>Setup in 15 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Polished Dashboard Preview Card */}
          <div className="lg:col-span-5 mt-4 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Mockup Top Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/70">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 mx-3 bg-slate-800/80 rounded-md py-1 px-3 text-slate-400 text-xs text-center font-mono truncate">
                  app.staygen.com/admin
                </div>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="p-4 sm:p-5 space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-1">Total Students</p>
                    <p className="text-xl font-bold text-white font-heading">487</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">+12% active</p>
                  </div>
                  <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-1">Available Rooms</p>
                    <p className="text-xl font-bold text-white font-heading">23</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">+3 ready</p>
                  </div>
                  <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-1">Monthly Revenue</p>
                    <p className="text-xl font-bold text-white font-heading">â‚¹2.4L</p>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">+8% collected</p>
                  </div>
                  <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-1">Open Complaints</p>
                    <p className="text-xl font-bold text-white font-heading">7</p>
                    <p className="text-xs text-rose-400 font-semibold mt-0.5">-2 resolved</p>
                  </div>
                </div>

                {/* Mini Bar Chart Preview */}
                <div className="bg-slate-800/90 rounded-xl p-4 md:p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Occupancy & Revenue Trend</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Updated Live</span>
                  </div>
                  <div className="w-full flex items-end gap-2 h-24 pt-2">
                    {[45, 60, 50, 85, 65, 95, 75].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${val}%`,
                          background: 'linear-gradient(to top, #5B5FEF, #7C3AED)',
                          opacity: 0.9
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:gap-6">
            {[
              { value: '500+', label: 'Hostels Managed' },
              { value: '50,000+', label: 'Active Resident Students' },
              { value: '99.9%', label: 'Uptime Guarantee SLA' },
              { value: '4.9/5', label: 'Warden & Student Rating' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 md:p-6 sm:p-6 text-center shadow-xs"
              >
                <p className="text-2xl sm:text-4xl font-extrabold gradient-text font-heading">{stat.value}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mb-3">
            Everything you need to <span className="gradient-text">run a modern hostel</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            One unified cloud platform designed for wardens, administration staff, security gatekeepers, and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="card-clean p-6 lg:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 text-white shadow-sm">
                  <item.icon size={22} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mb-3">
              Loved by <span className="gradient-text">hostel administrators</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">
              See why leading warden teams and institutions trust StayGen for daily operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="card-clean p-6 lg:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16} fill="#F59E0B" className="text-amber-400 flex-shrink-0" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white text-sm font-heading">{t.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mb-3">
            Simple, <span className="gradient-text">transparent B2B pricing</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">No hidden charges. Upgrade or cancel subscription anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {pricing.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl lg:rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="gradient-bg text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl font-heading mb-1">{plan.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4">{plan.desc}</p>

                <div className="flex items-baseline flex-wrap gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold gradient-text font-heading">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{plan.period}</span>}
                </div>

                <p className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold mb-6">{plan.students}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className={`w-full text-center font-semibold py-3.5 rounded-xl min-h-[48px] flex items-center justify-center transition-all ${
                  plan.popular
                    ? 'gradient-bg text-white hover:opacity-95 shadow-sm'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mb-3">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">Have questions? We have answers.</p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card-clean overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4 md:gap-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base min-h-[48px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${openFaq === idx ? 'rotate-180 text-indigo-500' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="gradient-bg rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl shadow-indigo-500/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading mb-4">
            Ready to modernize your hostel management?
          </h2>
          <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Join over 500+ wardens and institutions already delivering a modern hostel experience with StayGen.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-base hover:bg-slate-50 transition-colors inline-flex items-center gap-2 shadow-md min-h-[48px]"
          >
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Brand column */}
            <div className="space-y-4 md:space-y-6 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm font-heading">S</span>
                </div>
                <span className="font-extrabold text-white font-heading text-lg">StayGen</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Next-Gen SaaS Operating System for Student Living, Hostel Security, & Fee Management.
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Product</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Account links */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Access</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Admin Sign In</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Security Gatekeeper</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Free Account</Link></li>
              </ul>
            </div>

            {/* Legal / Company */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Legal</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Overview</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance SLA</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-xs text-slate-500">
            <p>Â© {new Date().getFullYear()} StayGen Platform. All rights reserved. Built for modern hostel management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
