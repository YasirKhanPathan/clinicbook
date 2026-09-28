"use client";

import { useState, useEffect } from 'react';
import { doctorAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
interface Av { d: number; on: boolean; s: string; e: string; }
const defAv: Av[] = [1, 2, 3, 4, 5].map(d => ({ d, on: true, s: '09:00', e: '17:00' }));

export default function DoctorsPage() {
  const [list, setList] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [f, setF] = useState({ name: '', email: '', phone: '', specialty: '', qualifications: '', bio: '', consultationFee: 0, slotDurationMinutes: 30 });
  const [av, setAv] = useState<Av[]>(defAv);

  useEffect(() => { loadD(); }, []);
  useEffect(() => { document.body.style.overflow = show ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [show]);

  const loadD = async () => { try { const { data } = await doctorAPI.list(); setList(data); } catch {} finally { setLoad(false); } };
  const reset = () => { setF({ name: '', email: '', phone: '', specialty: '', qualifications: '', bio: '', consultationFee: 0, slotDurationMinutes: 30 }); setAv(defAv); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let doc;
      if (edit) { const { data } = await doctorAPI.update(edit.id, f); doc = data; toast.success('Updated'); }
      else { const { data } = await doctorAPI.create(f); doc = data; toast.success('Added'); }
      if (doc?.id) await doctorAPI.updateAvailability(doc.id, av.map(a => ({ dayOfWeek: a.d, isAvailable: a.on, startTime: a.s, endTime: a.e })));
      setShow(false); setEdit(null); reset(); loadD();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const onEdit = (d: any) => {
    setF({ name: d.name, email: d.email || '', phone: d.phone || '', specialty: d.specialty || '', qualifications: d.qualifications || '', bio: d.bio || '', consultationFee: d.consultationFee, slotDurationMinutes: d.slotDurationMinutes });
    if (d.availability?.length > 0) setAv([0, 1, 2, 3, 4, 5, 6].map(day => { const ex = d.availability.find((a: any) => a.dayOfWeek === day); return ex ? { d: day, on: ex.isAvailable, s: ex.startTime, e: ex.endTime } : { d: day, on: false, s: '09:00', e: '17:00' }; }));
    else setAv(defAv);
    setEdit(d); setShow(true);
  };

  const del = async (id: string) => { if (!confirm('Delete?')) return; try { await doctorAPI.delete(id); toast.success('Deleted'); loadD(); } catch { toast.error('Failed'); } };

  const specs = ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Gynecologist', 'ENT Specialist', 'Neurologist'];

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-4 animate-fade">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-slate-900">Doctors</h1><p className="text-xs text-slate-400">{list.length} doctor{list.length !== 1 ? 's' : ''}</p></div>
          <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue"><Plus size={15} /> Add Doctor</button>
        </div>

        {show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ paddingTop: '4vh' }}>
            <div className="fixed inset-0 bg-black/50" onClick={() => { setShow(false); setEdit(null); }} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 mb-8 animate-pop">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="text-base font-bold">{edit ? 'Edit Doctor' : 'Add Doctor'}</h3>
                <button onClick={() => { setShow(false); setEdit(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={save} className="px-5 py-4 space-y-3.5">
                <div><label className="lbl">Full Name <span className="req">*</span></label><input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="inp" placeholder="Dr. Muhammad Ali" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Email</label><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="inp" placeholder="doctor@clinic.com" /></div>
                  <div><label className="lbl">Phone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="inp" placeholder="+92 3XX XXXXXXX" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Specialty</label>
                    <select value={f.specialty} onChange={e => setF({ ...f, specialty: e.target.value })} className="inp"><option value="">Select</option>{specs.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                  <div><label className="lbl">Qualifications</label><input value={f.qualifications} onChange={e => setF({ ...f, qualifications: e.target.value })} className="inp" placeholder="MBBS, FCPS" /></div>
                </div>
                <div><label className="lbl">Bio</label><textarea value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} className="inp" rows={2} placeholder="Brief background..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Fee (Rs.)</label><input type="number" min="0" value={f.consultationFee || ''} onChange={e => setF({ ...f, consultationFee: Number(e.target.value) })} className="inp" placeholder="1500" /></div>
                  <div><label className="lbl">Slot (min)</label><input type="number" min="5" step="5" value={f.slotDurationMinutes || ''} onChange={e => setF({ ...f, slotDurationMinutes: Number(e.target.value) })} className="inp" placeholder="30" /></div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Availability</p>
                  <div className="space-y-1.5">
                    {av.map(a => (
                      <div key={a.d} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${a.on ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                        <button type="button" onClick={() => setAv(prev => prev.map(x => x.d === a.d ? { ...x, on: !x.on } : x))}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${a.on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {a.on ? '✓' : DS[a.d]}
                        </button>
                        <span className={`w-20 font-medium text-xs ${a.on ? 'text-slate-700' : 'text-slate-400'}`}>{DAYS[a.d]}</span>
                        {a.on ? (
                          <div className="flex items-center gap-1 ml-auto">
                            <input type="time" value={a.s} onChange={e => setAv(prev => prev.map(x => x.d === a.d ? { ...x, s: e.target.value } : x))} className="w-20 px-1.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400" />
                            <span className="text-slate-300 text-xs">-</span>
                            <input type="time" value={a.e} onChange={e => setAv(prev => prev.map(x => x.d === a.d ? { ...x, e: e.target.value } : x))} className="w-20 px-1.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400" />
                          </div>
                        ) : <span className="ml-auto text-slate-300 text-xs">Off</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => { setShow(false); setEdit(null); }} className="btn-ghost px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-blue px-5 py-2">{edit ? 'Save' : 'Add Doctor'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {load ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-3 w-20 mb-2" /><div className="skeleton h-3 w-14" /></div>)}</div>
        ) : list.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No doctors yet</p>
            <p className="text-xs text-slate-400 mb-3">Add your first doctor to get started</p>
            <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue text-xs">Add Doctor</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(doc => (
              <div key={doc.id} className="card p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      {doc.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                      {doc.specialty && <p className="text-[11px] text-blue-600">{doc.specialty}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(doc)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                    <button onClick={() => del(doc.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                {doc.qualifications && <p className="text-[11px] text-slate-400 mb-2">{doc.qualifications}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-900">Rs. {doc.consultationFee.toLocaleString()}</span>
                  <span className="text-slate-400">{doc.slotDurationMinutes}m</span>
                </div>
                {doc.availability?.length > 0 && (
                  <div className="flex gap-0.5 mt-2">
                    {doc.availability.filter((a: any) => a.isAvailable).map((a: any) => (
                      <span key={a.dayOfWeek} className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded">{DAYS[a.dayOfWeek].slice(0, 2)}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
