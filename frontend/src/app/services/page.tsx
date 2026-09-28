"use client";

import { useState, useEffect } from 'react';
import { serviceAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ServicesPage() {
  const [list, setList] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [f, setF] = useState({ name: '', description: '', duration: 30, price: 0 });

  useEffect(() => { loadS(); }, []);
  useEffect(() => { document.body.style.overflow = show ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [show]);

  const loadS = async () => { try { const { data } = await serviceAPI.list(); setList(data); } catch {} finally { setLoad(false); } };
  const reset = () => setF({ name: '', description: '', duration: 30, price: 0 });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await serviceAPI.update(edit.id, f); toast.success('Updated'); }
      else { await serviceAPI.create(f); toast.success('Added'); }
      setShow(false); setEdit(null); reset(); loadS();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const del = async (id: string) => { if (!confirm('Delete?')) return; try { await serviceAPI.delete(id); toast.success('Deleted'); loadS(); } catch { toast.error('Failed'); } };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-4 animate-fade">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-slate-900">Services</h1><p className="text-xs text-slate-400">{list.length} service{list.length !== 1 ? 's' : ''}</p></div>
          <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue"><Plus size={15} /> Add Service</button>
        </div>

        {show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ paddingTop: '4vh' }}>
            <div className="fixed inset-0 bg-black/50" onClick={() => { setShow(false); setEdit(null); }} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 mb-8 animate-pop">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="text-base font-bold">{edit ? 'Edit Service' : 'Add Service'}</h3>
                <button onClick={() => { setShow(false); setEdit(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={save} className="px-5 py-4 space-y-3.5">
                <div><label className="lbl">Service Name <span className="req">*</span></label><input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="inp" placeholder="e.g. General Consultation" /></div>
                <div><label className="lbl">Description</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="inp" rows={3} placeholder="What does this include?" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Duration (min)</label><input type="number" value={f.duration} onChange={e => setF({ ...f, duration: Number(e.target.value) })} className="inp" placeholder="30" /></div>
                  <div><label className="lbl">Price (Rs.)</label><input type="number" value={f.price} onChange={e => setF({ ...f, price: Number(e.target.value) })} className="inp" placeholder="1500" /></div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => { setShow(false); setEdit(null); }} className="btn-ghost px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-blue px-5 py-2">{edit ? 'Save' : 'Add Service'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {load ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-3 w-20 mb-2" /><div className="skeleton h-3 w-14" /></div>)}</div>
        ) : list.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No services</p>
            <button onClick={() => { reset(); setEdit(null); setShow(true); }} className="btn-blue text-xs mt-2">Add Service</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(svc => (
              <div key={svc.id} className="card p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">{svc.name}</p>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEdit(svc); setF({ name: svc.name, description: svc.description || '', duration: svc.duration, price: svc.price }); setShow(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                    <button onClick={() => del(svc.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                {svc.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{svc.description}</p>}
                {!svc.description && <div className="mb-3" />}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">{svc.duration} min</span>
                  <span className="font-semibold text-slate-900">Rs. {svc.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
