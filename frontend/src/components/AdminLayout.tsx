"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  ClipboardList, Settings, LogOut, Menu, X, Building2
} from 'lucide-react';

const nav = [
  { p: '/dashboard', l: 'Dashboard', i: LayoutDashboard },
  { p: '/appointments', l: 'Appointments', i: Calendar },
  { p: '/doctors', l: 'Doctors', i: Stethoscope },
  { p: '/patients', l: 'Patients', i: Users },
  { p: '/services', l: 'Services', i: ClipboardList },
  { p: '/settings', l: 'Settings', i: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clinic, logout } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 overflow-hidden">
      {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 ${open ? 'translate-x-0 shadow-2xl shadow-slate-900/10' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100/80 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 leading-tight tracking-tight">ClinicBook</div>
            <div className="text-[10px] text-slate-400 truncate font-medium">{clinic?.name || 'My Clinic'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map(n => {
            const active = path === n.p || path.startsWith(n.p + '/');
            return (
              <Link key={n.p} href={n.p} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm border border-blue-100/50'
                    : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-700 border border-transparent'
                }`}>
                <n.i size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-blue-600' : ''} />
                {n.l}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-100/80">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[12px] font-bold text-white shadow-md shadow-blue-500/15">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize font-medium">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-[12px] font-medium text-slate-400 hover:text-red-500 w-full px-3 py-2 rounded-xl hover:bg-red-50/80 transition-all duration-200">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-6 bg-white/60 backdrop-blur-xl border-b border-slate-200/40 flex-shrink-0 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <Building2 size={15} className="text-slate-300" />
            <span className="font-semibold text-slate-600">{clinic?.name || 'ClinicBook'}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
