"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dashboardAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster } from 'react-hot-toast';
import {
  Calendar, Users, Clock, CheckCircle, TrendingUp,
  AlertCircle, Stethoscope, ArrowUpRight, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening');
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-amber-500" />
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">Welcome back</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Good {greeting || 'day'}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5">Here&apos;s what&apos;s happening at your clinic today</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80">
                <div className="skeleton h-4 w-28 mb-4" />
                <div className="skeleton h-8 w-20" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-blue-200/60 hover:shadow-premium transition-all duration-300 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/20">
                    <Calendar size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="relative text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Appointments</p>
                <p className="relative text-3xl font-extrabold text-slate-900 mt-1.5">{stats.todayAppointments}</p>
              </div>

              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-emerald-200/60 hover:shadow-premium transition-all duration-300 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-emerald-500/20">
                    <CheckCircle size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="relative text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                <p className="relative text-3xl font-extrabold text-slate-900 mt-1.5">{stats.completedToday}</p>
              </div>

              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-amber-200/60 hover:shadow-premium transition-all duration-300 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 group-hover:from-amber-600 group-hover:to-amber-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-amber-500/20">
                    <Clock size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className="relative text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                <p className="relative text-3xl font-extrabold text-slate-900 mt-1.5">{stats.pendingToday}</p>
              </div>

              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-violet-200/60 hover:shadow-premium transition-all duration-300 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 text-violet-600 group-hover:from-violet-600 group-hover:to-violet-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-violet-500/20">
                    <TrendingUp size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                </div>
                <p className="relative text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Revenue</p>
                <p className="relative text-3xl font-extrabold text-slate-900 mt-1.5">Rs. {stats.todayRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-5 stagger-children">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-blue-200/60 hover:shadow-premium transition-all duration-300 text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/15 transition-all duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <p className="relative text-3xl font-extrabold text-slate-900">{stats.totalPatients}</p>
                <p className="relative text-[12px] text-slate-400 font-semibold mt-1">Total Patients</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-emerald-200/60 hover:shadow-premium transition-all duration-300 text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/15 transition-all duration-300">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <p className="relative text-3xl font-extrabold text-slate-900">{stats.totalDoctors}</p>
                <p className="relative text-[12px] text-slate-400 font-semibold mt-1">Doctors</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/80 hover:border-violet-200/60 hover:shadow-premium transition-all duration-300 text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/15 transition-all duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="relative text-3xl font-extrabold text-slate-900">{stats.weekAppointments}</p>
                <p className="relative text-[12px] text-slate-400 font-semibold mt-1">This Week</p>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100/80 overflow-hidden animate-fade-in shadow-soft" style={{ animationDelay: '200ms' }}>
              <div className="px-6 py-5 border-b border-slate-100/60 flex items-center justify-between bg-gradient-to-r from-slate-50/40 to-transparent">
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">Upcoming Appointments</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">{stats.upcoming.length} total</p>
                </div>
              </div>
              <div className="divide-y divide-slate-50/80">
                {stats.upcoming.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-[14px] text-slate-400 font-medium">No upcoming appointments</p>
                  </div>
                ) : (
                  stats.upcoming.map((apt: any, i: number) => (
                    <div key={apt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[14px] shadow-md shadow-blue-500/15">
                          {apt.patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[13px] text-slate-900">{apt.patient.name}</p>
                          <p className="text-[12px] text-slate-400">{apt.doctor.name} · {apt.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                          <p className="text-[13px] font-semibold text-slate-700">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-[12px] text-slate-400">{apt.startTime} – {apt.endTime}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-400' :
                            apt.status === 'PENDING' ? 'bg-amber-400' : 'bg-slate-400'
                          }`} />
                          <span className={`badge text-[11px] font-bold ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                            apt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                            'bg-slate-50 text-slate-600 border border-slate-200/50'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-[14px] text-slate-400 font-medium">Failed to load dashboard data</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
