"use client";

import { useState, useEffect } from 'react';
import { patientAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search, Edit2, X } from 'lucide-react';
import { phoneRe } from '@/lib/utils';

export default function PatientsPage() {
  const [list, setList] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [f, setF] = useState({ name: '', phone: '', email: '', gender: '', dateOfBirth: '', bloodGroup: '', address: '' });

  useEffect(() => { loadP(); }, [q]);
  useEffect(() => { document.body.style.overflow = show ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [show]);

  const loadP = async () => { try { const { data } = await patientAPI.list(q); setList(data); } catch {} finally { setLoad(false); } };
  const reset = () => setF({ name: '', phone: '', email: '', gender: '', dateOfBirth: '', bloodGroup: '', address: '' });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneRe.test(f.phone.replace(/[\s\-]/g, ''))) {
      toast.error('Enter valid Pakistani phone (03XXXXXXXXX or +923XXXXXXXXX)');
      return;
    }
    try {
      if (edit) { await patientAPI.update(edit.id, f); toast.success('Updated'); }
      else { await patientAPI.create(f); toast.success('Added'); }
      setShow(false); setEdit(null); reset(); loadP();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-4 animate-fade">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-slate-900">Patients</h1><p className="text-xs text-slate-400">{list.length} patient{list.length !== 1 ? 's' : ''}</p></div>
          <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue"><Plus size={15} /> Add Patient</button>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="inp !pl-8 !py-1.5 !text-xs" />
        </div>

        {show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ paddingTop: '4vh' }}>
            <div className="fixed inset-0 bg-black/50" onClick={() => { setShow(false); setEdit(null); }} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 mb-8 animate-pop">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="text-base font-bold">{edit ? 'Edit Patient' : 'Add Patient'}</h3>
                <button onClick={() => { setShow(false); setEdit(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={save} className="px-5 py-4 space-y-3.5">
                <div><label className="lbl">Full Name <span className="req">*</span></label><input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="inp" placeholder="Patient name" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Phone <span className="req">*</span></label><input required value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="inp" placeholder="+92 3XX XXXXXXX" /></div>
                  <div><label className="lbl">Email</label><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="inp" placeholder="email@example.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Gender</label>
                    <select value={f.gender} onChange={e => setF({ ...f, gender: e.target.value })} className="inp"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select>
                  </div>
                  <div><label className="lbl">Blood Group</label><input value={f.bloodGroup} onChange={e => setF({ ...f, bloodGroup: e.target.value })} className="inp" placeholder="A+, B-, O+" /></div>
                </div>
                <div><label className="lbl">Date of Birth</label><input type="date" value={f.dateOfBirth} onChange={e => setF({ ...f, dateOfBirth: e.target.value })} className="inp" /></div>
                <div><label className="lbl">Address</label><textarea value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="inp" rows={2} placeholder="House #, Street, City" /></div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => { setShow(false); setEdit(null); }} className="btn-ghost px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-blue px-5 py-2">{edit ? 'Save' : 'Add Patient'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {load ? (
          <div className="card p-8"><div className="skeleton h-3 w-40" /></div>
        ) : list.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No patients</p>
            <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue text-xs mt-2">Add Patient</button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Phone</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 hidden md:table-cell">Gender</th>
                <th className="px-4 py-2"></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {list.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 group">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell">{p.email || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">{p.gender || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { setEdit(p); setF({ name: p.name, phone: p.phone, email: p.email || '', gender: p.gender || '', dateOfBirth: p.dateOfBirth?.split('T')[0] || '', bloodGroup: p.bloodGroup || '', address: p.address || '' }); setShow(true); }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
