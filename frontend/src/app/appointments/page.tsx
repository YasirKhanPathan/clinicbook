"use client";

import { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { localDateStr } from '@/lib/utils';

export default function AppointmentsPage() {
  const [apts, setApts] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [pats, setPats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(localDateStr());
  const [fDoc, setFDoc] = useState('');
  const [fSt, setFSt] = useState('');
  const [show, setShow] = useState(false);
  const [f, setF] = useState<{ patientId: string; doctorId: string; date: string; startTime: string; endTime: string; type: string; notes: string }>({ patientId: '', doctorId: '', date: localDateStr(), startTime: '09:00', endTime: '09:30', type: 'CONSULTATION', notes: '' });

  useEffect(() => { fetchData(); }, [date, fDoc, fSt]);
  useEffect(() => { document.body.style.overflow = show ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [show]);

  const fetchData = async () => {
    try {
      const p: any = { date }; if (fDoc) p.doctorId = fDoc; if (fSt) p.status = fSt;
      const [a, d, pt] = await Promise.all([appointmentAPI.list(p), doctorAPI.list(), patientAPI.list()]);
      setApts(a.data); setDocs(d.data); setPats(pt.data);
    } catch {} finally { setLoading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await appointmentAPI.create(f); toast.success('Booked'); setShow(false); setF({ patientId: '', doctorId: '', date, startTime: '09:00', endTime: '09:30', type: 'CONSULTATION', notes: '' }); fetchData(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const updateStatus = async (id: string, s: string) => {
    try { await appointmentAPI.updateStatus(id, s); toast.success(s.toLowerCase()); fetchData(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const shiftDate = (d: number) => { const dt = new Date(date + 'T00:00:00'); dt.setDate(dt.getDate() + d); setDate(localDateStr(dt)); };
  const fmtDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const sc: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200', CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border border-blue-200', CANCELLED: 'bg-red-50 text-red-600 border border-red-200',
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-4 animate-fade">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-slate-900">Appointments</h1><p className="text-xs text-slate-400">{fmtDate}</p></div>
          <button onClick={() => setShow(true)} className="btn-blue"><Plus size={15} /> New</button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 card px-2 py-1.5">
            <button onClick={() => shiftDate(-1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={14} /></button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-xs font-medium text-slate-700 outline-none w-[110px]" />
            <button onClick={() => shiftDate(1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={14} /></button>
          </div>
          <button onClick={() => setDate(localDateStr())} className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100">Today</button>
          <select value={fDoc} onChange={e => setFDoc(e.target.value)} className="inp !w-auto !py-1 !text-xs"><option value="">All Doctors</option>{docs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          <select value={fSt} onChange={e => setFSt(e.target.value)} className="inp !w-auto !py-1 !text-xs"><option value="">All Status</option><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option></select>
        </div>

        {show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ paddingTop: '4vh' }}>
            <div className="fixed inset-0 bg-black/50" onClick={() => setShow(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 mb-8 animate-pop">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="text-base font-bold">Book Appointment</h3>
                <button onClick={() => setShow(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={save} className="px-5 py-4 space-y-3.5">
                <div><label className="lbl">Patient <span className="req">*</span></label>
                  <select required value={f.patientId} onChange={e => setF({ ...f, patientId: e.target.value })} className="inp"><option value="">Choose</option>{pats.map(p => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}</select>
                </div>
                <div><label className="lbl">Doctor <span className="req">*</span></label>
                  <select required value={f.doctorId} onChange={e => setF({ ...f, doctorId: e.target.value })} className="inp"><option value="">Choose</option>{docs.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}</select>
                </div>
                <div><label className="lbl">Date <span className="req">*</span></label><input type="date" required value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className="inp" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Start <span className="req">*</span></label><input type="time" required value={f.startTime} onChange={e => setF({ ...f, startTime: e.target.value })} className="inp" /></div>
                  <div><label className="lbl">End <span className="req">*</span></label><input type="time" required value={f.endTime} onChange={e => setF({ ...f, endTime: e.target.value })} className="inp" /></div>
                </div>
                <div><label className="lbl">Type</label>
                  <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className="inp"><option value="CONSULTATION">Consultation</option><option value="FOLLOWUP">Follow-up</option><option value="CHECKUP">Check-up</option></select>
                </div>
                <div><label className="lbl">Notes</label><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} className="inp" rows={2} placeholder="Optional..." /></div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShow(false)} className="btn-ghost px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-blue px-5 py-2">Book</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="card p-3"><div className="skeleton h-3 w-40" /></div>)}</div>
        ) : apts.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No appointments</p>
            <button onClick={() => setShow(true)} className="btn-blue text-xs mt-2">Book Appointment</button>
          </div>
        ) : (
          <div className="space-y-2">
            {apts.map(a => (
              <div key={a.id} className="card px-4 py-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                    {a.patient?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.patient?.name}</p>
                    <p className="text-xs text-slate-400">{a.doctor?.name} · {a.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-slate-500 hidden sm:block">{a.startTime}-{a.endTime}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  <div className="flex gap-0.5">
                    {a.status === 'PENDING' && <button onClick={() => updateStatus(a.id, 'CONFIRMED')} className="text-[10px] text-emerald-600 hover:bg-emerald-50 px-1.5 py-0.5 rounded">Confirm</button>}
                    {a.status === 'CONFIRMED' && <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="text-[10px] text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded">Complete</button>}
                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="text-[10px] text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded">Cancel</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
