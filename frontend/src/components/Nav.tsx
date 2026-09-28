"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Menu, X } from 'lucide-react';

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/40 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow">
              <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[17px] text-slate-900 tracking-tight">ClinicBook</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'How It Works', 'Reviews'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[13px] font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100/60 transition-all duration-200"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 transition-all duration-200">
              Sign In
            </Link>
            <Link href="/signup" className="text-[13px] font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:shadow-xl transition-all duration-300 active:scale-[0.97]">
              Start Free Trial
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100/60 transition-all">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100/60 px-4 py-4 space-y-1 animate-fade-in shadow-lg shadow-slate-900/5">
          {['Features', 'How It Works', 'Reviews'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              {item}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link href="/login" className="block text-center px-4 py-2.5 text-[13px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">Sign In</Link>
            <Link href="/signup" className="block text-center px-4 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/25">Start Free Trial</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
