"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Nav from '@/components/Nav';
import { useInView } from '@/lib/hooks';
import {
  Stethoscope, ArrowRight, Calendar, Users, ClipboardList,
  CheckCircle, Star, Sparkles, Shield, BarChart3, Globe, Zap, Heart
} from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const features = [
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Automated appointment booking with real-time slot management, conflict detection, and calendar sync.', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50', glow: 'shadow-blue-500/10' },
  { icon: Users, title: 'Patient Management', desc: 'Complete patient profiles with medical history, contact info, and visit records — all in one place.', gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-50', glow: 'shadow-violet-500/10' },
  { icon: ClipboardList, title: 'Service Catalog', desc: 'Define services, set pricing, and track which treatments your clinic offers — organized and accessible.', gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', glow: 'shadow-emerald-500/10' },
  { icon: Globe, title: 'Online Booking Portal', desc: 'Share a unique booking link with patients. They book appointments directly — no phone calls needed.', gradient: 'from-amber-500 to-orange-400', bg: 'bg-amber-50', glow: 'shadow-amber-500/10' },
  { icon: BarChart3, title: 'Dashboard & Analytics', desc: 'Track daily appointments, revenue, completion rates, and pending visits at a glance.', gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-50', glow: 'shadow-rose-500/10' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, encrypted data, and role-based access control. Your clinic data stays yours.', gradient: 'from-indigo-500 to-blue-400', bg: 'bg-indigo-50', glow: 'shadow-indigo-500/10' },
];

const steps = [
  { num: '01', title: 'Create Your Clinic', desc: 'Sign up in 60 seconds. Pick your clinic name and unique URL.' },
  { num: '02', title: 'Add Your Team', desc: 'Add doctors, set their specialties, fees, and availability.' },
  { num: '03', title: 'Share Your Link', desc: 'Patients book directly through your branded booking page.' },
  { num: '04', title: 'Manage & Grow', desc: 'Track appointments, manage patients, and grow your practice.' },
];

const testimonials = [
  { name: 'Dr. Ayesha Khan', role: 'City Health Clinic', text: 'ClinicBook transformed how we manage appointments. No more phone tag — patients book themselves.', stars: 5 },
  { name: 'Dr. Hassan Raza', role: 'Wellness Medical Center', text: 'The dashboard gives me instant visibility into our daily schedule. Game changer for our practice.', stars: 5 },
  { name: 'Dr. Fatima Zahra', role: 'CareFirst Hospital', text: 'Simple, elegant, and powerful. Our patients love the online booking experience.', stars: 5 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-400/15 to-blue-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <Section>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/80 backdrop-blur-sm rounded-full mb-8 border border-blue-100/60 shadow-sm">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-[12px] font-bold text-blue-600 uppercase tracking-wider">Smart Clinic Platform</span>
            </div>
          </Section>

          <Section delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6">
              Manage Your Clinic{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 animate-gradient-shift bg-[length:200%_200%]">
                Effortlessly
              </span>
            </h1>
          </Section>

          <Section delay={200}>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              From appointment booking to patient records — one elegant platform that handles it all.
              Built for modern clinics in Pakistan.
            </p>
          </Section>

          <Section delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-[15px] shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                Start Free Trial
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/book/city-health" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2">
                See Demo Booking
              </Link>
            </div>
          </Section>

          <Section delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-slate-400 font-medium">
              {['Free 14-day trial', 'No credit card required', 'Setup in 60 seconds'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={12} className="text-emerald-600" />
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────── */}
      <Section>
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 sm:p-14 relative overflow-hidden shadow-2xl shadow-slate-900/20">
              {/* Decorative orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1"><AnimatedCounter target={500} suffix="+" /></p>
                  <p className="text-[13px] text-slate-400 font-medium">Clinics Registered</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1"><AnimatedCounter target={50} suffix="K+" /></p>
                  <p className="text-[13px] text-slate-400 font-medium">Appointments Booked</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">99.9%</p>
                  <p className="text-[13px] text-slate-400 font-medium">Uptime</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">4.9<span className="text-amber-400">★</span></p>
                  <p className="text-[13px] text-slate-400 font-medium">User Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ─── Features ──────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Features</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                Everything Your Clinic Needs
              </h2>
              <p className="text-[15px] text-slate-500 mt-3 max-w-lg mx-auto">
                A complete toolkit designed to streamline your clinic operations and delight your patients.
              </p>
            </div>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((f) => (
              <div key={f.title} className={`group bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 card-hover relative overflow-hidden`}>
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                <div className={`relative w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg ${f.glow} transition-all duration-300`}>
                  <f.icon size={22} className="text-slate-700" />
                </div>
                <h3 className="relative font-bold text-[16px] text-slate-900 mb-2">{f.title}</h3>
                <p className="relative text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="max-w-5xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                Up and Running in Minutes
              </h2>
              <p className="text-[15px] text-slate-500 mt-3">
                No complicated setup. No training required. Just sign up and go.
              </p>
            </div>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {steps.map((s, i) => (
              <div key={s.num} className="relative group">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-slate-200 -translate-x-1/2" />}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 group-hover:border-blue-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 flex items-center justify-center mx-auto mb-5 transition-all duration-300">
                    <span className="text-[20px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{s.num}</span>
                  </div>
                  <h3 className="font-bold text-[15px] text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                Loved by Doctors
              </h2>
              <p className="text-[15px] text-slate-500 mt-3">
                See what healthcare professionals are saying about ClinicBook.
              </p>
            </div>
          </Section>

          <div className="grid sm:grid-cols-3 gap-6 stagger-children">
            {testimonials.map((t) => (
              <div key={t.name} className="group bg-white rounded-2xl p-7 border border-slate-100 card-hover relative">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[14px] text-slate-600 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[13px] shadow-md shadow-blue-500/15">
                    {t.name.replace(/^Dr\.\s*/i, '').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────── */}
      <Section>
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
              {/* Animated decorative orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 animate-float" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Ready to Transform Your Clinic?
                </h2>
                <p className="text-blue-100 text-[15px] max-w-lg mx-auto mb-10 leading-relaxed">
                  Join hundreds of clinics already using ClinicBook to manage appointments, patients, and grow their practice.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-[15px] shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                    Start Free Trial
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-[15px] hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                    Sign In to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-[16px] text-slate-900">ClinicBook</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-slate-400 font-medium">
              <a href="#features" className="hover:text-slate-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-slate-600 transition-colors">Reviews</a>
              <span className="text-slate-300">|</span>
              <span>© 2026 ClinicBook</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
