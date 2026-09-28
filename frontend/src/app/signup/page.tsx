"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Loader2, ArrowRight, CheckCircle, Building2, User, Mail, Lock, Phone, Globe, Sparkles, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clinicName: '',
    slug: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
  };

  const handleClinicNameChange = (value: string) => {
    setForm({ ...form, clinicName: value, slug: generateSlug(value) });
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clinicName.trim()) { setError('Please enter your clinic name'); return; }
    if (!form.slug.trim()) { setError('Please choose a URL slug'); return; }
    if (form.slug.length < 3) { setError('URL must be at least 3 characters'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.email.trim()) { setError('Please enter your email'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName: form.clinicName,
          slug: form.slug,
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('cb_token', data.token);
      localStorage.setItem('cb_user', JSON.stringify(data.user));
      localStorage.setItem('cb_clinic', JSON.stringify(data.clinic));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-cyan-300/15 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-[13px] font-medium mb-10">
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-10 border border-white/20 shadow-lg shadow-black/10">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
            Start Your Free<br />Trial Today
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md mb-10">
            Create your clinic account in 60 seconds. No credit card required. Full access for 14 days.
          </p>

          <div className="space-y-4">
            {[
              'Smart appointment scheduling',
              'Online patient booking portal',
              'Complete patient management',
              'Real-time analytics dashboard',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-emerald-400/20">
                  <CheckCircle size={14} className="text-emerald-300" />
                </div>
                <span className="text-[14px] text-blue-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 sm:py-16 bg-gradient-to-br from-white to-slate-50/50">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo + back */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-[12px] font-medium">
              <ArrowLeft size={12} /> Back to home
            </Link>
          </div>

          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25 mb-3">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ClinicBook</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-blue-600" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Create Account</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 ? 'Set up your clinic' : 'Your details'}
            </h2>
            <p className="text-[13px] text-slate-400 mt-1.5">
              {step === 1 ? 'Choose your clinic name and URL' : 'Create your admin account'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all duration-300 ${step === 1 ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'}`}>
              {step > 1 ? <CheckCircle size={14} /> : <span className="w-5 text-center">1</span>}
              <span className="hidden sm:inline">Clinic Info</span>
            </div>
            <div className={`h-0.5 w-10 rounded-full transition-all duration-300 ${step > 1 ? 'bg-gradient-to-r from-emerald-300 to-emerald-400' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all duration-300 ${step === 2 ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-100 text-slate-400'}`}>
              <span className="w-5 text-center">2</span>
              <span className="hidden sm:inline">Admin Account</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-scale-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Clinic Info */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Clinic Name *</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.clinicName}
                    onChange={(e) => handleClinicNameChange(e.target.value)}
                    className="input-premium !pl-10"
                    placeholder="e.g. City Health Clinic"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Clinic URL *</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="input-premium !pl-10"
                    placeholder="city-health"
                    required
                    minLength={3}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Your booking link: <span className="font-mono text-slate-500">clinicbook.22.jugaar.ai/book/{form.slug || '...'}</span>
                </p>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-3 text-[14px]">
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Your Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-premium !pl-10"
                      placeholder="Dr. Ali"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-premium !pl-10"
                      placeholder="+92 3XX XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-premium !pl-10"
                    placeholder="you@clinic.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-premium !pl-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Confirm *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="input-premium !pl-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-5 py-3.5 text-[13px]">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-[14px]">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-[13px] text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 justify-center text-[11px] text-slate-400">
            <Lock size={11} />
            <span>Secured with encryption. 14-day free trial.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
