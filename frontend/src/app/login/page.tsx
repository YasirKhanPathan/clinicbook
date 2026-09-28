"use client";

import { useState, useRef } from 'react';
import { Stethoscope, Loader2, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('cb_token', data.token);
      localStorage.setItem('cb_user', JSON.stringify(data.user));
      localStorage.setItem('cb_clinic', JSON.stringify(data.clinic));
      window.location.href = '/dashboard';
    } catch (err: any) { setError(err.message || 'Network error'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 items-center justify-center relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-cyan-300/15 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 text-white px-14 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-10 border border-white/20 shadow-lg shadow-black/10">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">Smart Clinic<br />Management</h2>
          <p className="text-blue-100 text-[15px] leading-relaxed mb-10">Streamline appointments, manage patients, and grow your practice.</p>
          <div className="flex flex-wrap gap-3 text-[13px] text-blue-100">
            {['Online Booking', 'Patient Records', 'Analytics'].map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white to-slate-50/50">
        <div className="w-full max-w-sm animate-fade">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25 mb-3">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ClinicBook</h1>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1.5 mb-7">Sign in to your clinic dashboard</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-scale-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={emailRef} type="email" className="input-premium !pl-10" placeholder="you@clinic.com" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={passwordRef} type="password" className="input-premium !pl-10" placeholder="Enter password" required autoComplete="current-password" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Start free trial</Link>
          </p>
          <div className="text-center mt-3">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1.5 transition-colors"><ArrowLeft size={11} /> Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
