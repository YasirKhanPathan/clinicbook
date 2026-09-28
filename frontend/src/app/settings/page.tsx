"use client";

import { useState, useEffect } from 'react';
import { clinicAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { Save, Building2, ExternalLink, Copy, Check, Settings, Link2 } from 'lucide-react';

export default function SettingsPage() {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', email: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadClinic(); }, []);

  const loadClinic = async () => {
    try {
      const { data } = await clinicAPI.getCurrent();
      setClinic(data);
      setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '', city: data.city || '', email: data.email || '' });
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await clinicAPI.update(form); toast.success('Settings saved'); loadClinic(); }
    catch (err: any) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(`https://clinicbook.22.jugaar.ai/book/${clinic?.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-2xl animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-slate-100">
              <Settings size={14} className="text-slate-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Manage your clinic profile and booking link</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8">
            <div className="space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton h-3 w-24 mb-2 rounded-lg" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Clinic Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Clinic Information</h2>
                  <p className="text-[12px] text-slate-400">Update your clinic details</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="field-group">
                  <label>Clinic Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium" placeholder="My Clinic" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="field-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium" placeholder="clinic@email.com" />
                  </div>
                  <div className="field-group">
                    <label>Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-premium" placeholder="+92 3XX XXXXXXX" />
                  </div>
                </div>
                <div className="field-group">
                  <label>Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-premium" placeholder="Full clinic address" />
                </div>
                <div className="field-group">
                  <label>City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-premium" placeholder="e.g. Lahore" />
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-[13px] flex items-center gap-2">
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Booking URL Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Link2 size={18} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Patient Booking Link</h2>
                  <p className="text-[12px] text-slate-400">Share this with your patients</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="flex-1 text-[13px] text-slate-600 font-mono truncate">
                  clinicbook.22.jugaar.ai/book/{clinic?.slug}
                </span>
                <button onClick={copyBookingUrl} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2.5">Patients can book appointments directly without logging in.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
