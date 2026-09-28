"use client";

import { useState, useEffect } from 'react';
import { publicAPI } from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import { Stethoscope, Clock, Phone, CheckCircle, Loader2, ChevronLeft, ArrowRight, Sparkles, User, Mail, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { localDateStr, phoneRe } from '@/lib/utils';

export default function BookingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [clinic, setClinic] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [patientForm, setPatientForm] = useState({ name: '', phone: '', email: '', gender: '', dob: '', cnic: '', symptoms: '', notes: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [phoneTouched, setPhoneTouched] = useState(false);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedDoctor && selectedDate) loadSlots(); }, [selectedDoctor, selectedDate]);

  const loadData = async () => {
    try {
      const [clinicRes, doctorsRes, servicesRes] = await Promise.all([
        publicAPI.getClinic(slug), publicAPI.getDoctors(slug), publicAPI.getServices(slug),
      ]);
      setClinic(clinicRes.data);
      setDoctors(doctorsRes.data);
      setServices(servicesRes.data);
    } catch { toast.error('Clinic not found'); }
    finally { setLoading(false); }
  };

  const loadSlots = async () => {
    try {
      const { data } = await publicAPI.getSlots(slug, selectedDoctor.id, selectedDate);
      // API returns string[] like ["09:00", "09:30"], transform to {time, available} objects
      const slotObjects = Array.isArray(data)
        ? data.map((t: string) => ({ time: t, available: true }))
        : [];
      setSlots(slotObjects);
    } catch { setSlots([]); }
  };

  const validatePhone = (phone: string) => phoneRe.test(phone.replace(/[\s\-]/g, ''));

  const handleBook = async () => {
    const errors: Record<string, string> = {};
    if (!patientForm.name.trim()) errors.name = 'Full name is required';
    if (!patientForm.phone.trim()) errors.phone = 'Phone number is required';
    else if (!validatePhone(patientForm.phone)) errors.phone = 'Enter a valid Pakistani phone number';
    if (patientForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientForm.email)) errors.email = 'Enter a valid email address';
    if (patientForm.cnic && !/^\d{5}-\d{7}-\d$/.test(patientForm.cnic.replace(/\s/g, ''))) errors.cnic = 'CNIC format: XXXXX-XXXXXXX-X';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the errors below');
      return;
    }
    setFieldErrors({});
    setBooking(true);
    try {
      await publicAPI.book(slug, {
        doctorId: selectedDoctor.id, serviceId: selectedService?.id, date: selectedDate,
        startTime: selectedSlot.time, endTime: selectedSlot.endTime,
        patientName: patientForm.name.trim(), patientPhone: patientForm.phone.trim(),
        patientEmail: patientForm.email.trim() || undefined,
        patientGender: patientForm.gender || undefined,
        patientDob: patientForm.dob || undefined,
        patientCnic: patientForm.cnic.replace(/\s/g, '') || undefined,
        symptoms: patientForm.symptoms, notes: patientForm.notes,
      });
      setBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Booking failed'); }
    finally { setBooking(false); }
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      days.push({
        date: localDateStr(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  };

  const steps = ['Select Doctor', 'Choose Date & Time', 'Your Details'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-[13px] text-slate-400 mt-3 font-medium">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Clinic Not Found</h1>
          <p className="text-[13px] text-slate-400 mt-2">This clinic doesn&apos;t exist or is inactive.</p>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-[13px] text-slate-400 mb-6">Your appointment has been booked successfully.</p>
          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 border border-slate-100">
            <div className="flex justify-between"><span className="text-[12px] text-slate-400 font-medium">Doctor</span><span className="text-[13px] font-semibold text-slate-900">{selectedDoctor.name}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-slate-400 font-medium">Date</span><span className="text-[13px] font-semibold text-slate-900">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-slate-400 font-medium">Time</span><span className="text-[13px] font-semibold text-slate-900">{selectedSlot.time} – {selectedSlot.endTime}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-slate-400 font-medium">Patient</span><span className="text-[13px] font-semibold text-slate-900">{patientForm.name}</span></div>
          </div>
          <button onClick={() => { setBooked(false); setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(null); setPatientForm({ name: '', phone: '', email: '', gender: '', dob: '', cnic: '', symptoms: '', notes: '' }); }} className="mt-6 btn-primary px-6 py-3 text-[13px]">
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/15">
            <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-[15px] text-slate-900">{clinic.name}</h1>
            <p className="text-[12px] text-slate-400">{clinic.address}{clinic.city && ` · ${clinic.city}`}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 ${
                step > i + 1 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' :
                step === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' :
                'bg-slate-100 text-slate-400'
              }`}>
                {step > i + 1 ? <CheckCircle size={14} /> : <span className="w-5 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 rounded-full transition-colors ${step > i + 1 ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Select a Doctor</h2>
            <p className="text-[13px] text-slate-400 mb-6">Choose your preferred physician</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {doctors.map((doc) => (
                <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className="bg-white rounded-2xl p-5 border-2 text-left transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 border-transparent hover:border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-[15px] shadow-md shadow-blue-500/15">
                      {doc.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[14px] text-slate-900">{doc.name}</p>
                      <p className="text-[12px] text-blue-600 font-medium">{doc.specialty}</p>
                    </div>
                  </div>
                  {doc.qualifications && <p className="text-[11px] text-slate-400 mb-3">{doc.qualifications}</p>}
                  <div className="flex items-center justify-between text-[13px] border-t border-slate-100 pt-3">
                    <span className="font-semibold text-slate-900">Rs. {doc.consultationFee}</span>
                    <span className="flex items-center gap-1 text-slate-400 text-[12px]"><Clock size={12} />{doc.slotDurationMinutes} min</span>
                  </div>
                  {doc.services?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.services.map((ds: any) => (
                        <span key={ds.service.id} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ds.service.name}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"><ChevronLeft size={18} /></button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choose Date & Time</h2>
                <p className="text-[13px] text-slate-400">Pick your preferred appointment slot</p>
              </div>
            </div>

            {services.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">Select Service (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {services.map((svc) => (
                    <button key={svc.id} onClick={() => setSelectedService(selectedService?.id === svc.id ? null : svc)}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                        selectedService?.id === svc.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}>
                      {svc.name} · Rs. {svc.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {getNextDays().map((day) => {
                  const doctorAvail = selectedDoctor?.availability?.find((a: any) => a.dayOfWeek === day.dayOfWeek && a.isAvailable);
                  const isUnavailable = !doctorAvail;
                  return (
                    <button key={day.date} onClick={() => !isUnavailable && setSelectedDate(day.date)} disabled={isUnavailable}
                      className={`flex-shrink-0 px-4 py-3.5 rounded-2xl text-center border-2 transition-all duration-200 ${
                        isUnavailable ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed' :
                        selectedDate === day.date ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' :
                        'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-md'
                      }`}>
                      <p className="text-[10px] font-semibold uppercase">{day.label.split(' ')[0]}</p>
                      <p className="text-[13px] font-bold mt-0.5">{day.label.split(' ').slice(1).join(' ')}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">Available Slots</p>
                {slots.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[13px] text-slate-400 font-medium">No slots available for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button key={slot.time} onClick={() => slot.available && setSelectedSlot(slot)} disabled={!slot.available}
                        className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold border-2 transition-all duration-200 ${
                          !slot.available ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed' :
                          selectedSlot?.time === slot.time ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' :
                          'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSlot && (
              <button onClick={() => setStep(3)} className="btn-primary px-6 py-3 text-[13px] flex items-center gap-2">
                Continue <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}

        {/* Step 3: Patient Details */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"><ChevronLeft size={18} /></button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Details</h2>
                <p className="text-[13px] text-slate-400">Complete your booking information</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Form */}
              <div className="flex-1 space-y-6">

                {/* Personal Information */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft">
                  <div className="px-6 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Personal Information</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name <span className="text-rose-400">*</span></label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input type="text" value={patientForm.name}
                            onChange={(e) => { setPatientForm({ ...patientForm, name: e.target.value }); setFieldErrors(prev => ({ ...prev, name: '' })); }}
                            className={`input-premium !pl-9 ${fieldErrors.name ? '!border-rose-300 focus:!ring-rose-500/20 focus:!border-rose-400' : ''}`}
                            placeholder="e.g. Ahmad Khan" />
                        </div>
                        {fieldErrors.name && <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.name}</p>}
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone <span className="text-rose-400">*</span></label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input type="tel" value={patientForm.phone}
                            onChange={(e) => { setPatientForm({ ...patientForm, phone: e.target.value }); setFieldErrors(prev => ({ ...prev, phone: '' })); }}
                            onBlur={() => setPhoneTouched(true)}
                            className={`input-premium !pl-9 ${fieldErrors.phone ? '!border-rose-300 focus:!ring-rose-500/20 focus:!border-rose-400' : phoneTouched && patientForm.phone && validatePhone(patientForm.phone) ? '!border-emerald-300 !pr-9' : ''}`}
                            placeholder="03XXXXXXXXX or +923XXXXXXXXX" />
                          {!fieldErrors.phone && phoneTouched && patientForm.phone && validatePhone(patientForm.phone) && (
                            <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                          )}
                        </div>
                        {fieldErrors.phone && <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.phone}</p>}
                        {!fieldErrors.phone && phoneTouched && patientForm.phone && validatePhone(patientForm.phone) && (
                          <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={10} /> Valid Pakistani number</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                      {/* Gender */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Gender <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                        <select value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                          className="input-premium">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {/* Date of Birth */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date of Birth <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                        <input type="date" value={patientForm.dob} max={localDateStr()}
                          onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                          className="input-premium" />
                      </div>
                      {/* CNIC */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">CNIC <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                        <input type="text" value={patientForm.cnic} maxLength={15}
                          onChange={(e) => { setPatientForm({ ...patientForm, cnic: e.target.value }); setFieldErrors(prev => ({ ...prev, cnic: '' })); }}
                          className={`input-premium ${fieldErrors.cnic ? '!border-rose-300 focus:!ring-rose-500/20 focus:!border-rose-400' : ''}`}
                          placeholder="XXXXX-XXXXXXX-X" />
                        {fieldErrors.cnic && <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.cnic}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="email" value={patientForm.email}
                          onChange={(e) => { setPatientForm({ ...patientForm, email: e.target.value }); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                          className={`input-premium !pl-9 ${fieldErrors.email ? '!border-rose-300 focus:!ring-rose-500/20 focus:!border-rose-400' : ''}`}
                          placeholder="your@email.com" />
                      </div>
                      {fieldErrors.email && <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft">
                  <div className="px-6 py-3.5 border-b border-slate-100 bg-gradient-to-r from-green-50/80 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Stethoscope size={16} className="text-green-600" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visit Information</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Symptoms / Reason for Visit <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                        <span className="text-[10px] text-slate-400">{patientForm.symptoms.length}/500</span>
                      </div>
                      <textarea value={patientForm.symptoms}
                        onChange={(e) => { if (e.target.value.length <= 500) setPatientForm({ ...patientForm, symptoms: e.target.value }); }}
                        className="input-premium" rows={3} placeholder="Describe your symptoms or reason for visiting..." />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Additional Notes <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                        <span className="text-[10px] text-slate-400">{patientForm.notes.length}/300</span>
                      </div>
                      <textarea value={patientForm.notes}
                        onChange={(e) => { if (e.target.value.length <= 300) setPatientForm({ ...patientForm, notes: e.target.value }); }}
                        className="input-premium" rows={2} placeholder="Any special requests or information for the clinic..." />
                    </div>
                  </div>
                </div>

                {/* Submit Button - Mobile */}
                <button onClick={handleBook} disabled={booking || !patientForm.name.trim() || !patientForm.phone.trim()}
                  className="lg:hidden w-full px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold text-[14px] hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]">
                  {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>

              {/* Right: Summary Sidebar */}
              <div className="lg:w-80 shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Sparkles size={16} className="text-blue-600" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Booking Summary</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Doctor */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-[14px] shadow-md shadow-blue-500/15">
                          {selectedDoctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{selectedDoctor.name}</p>
                          <p className="text-[11px] text-blue-600 font-medium">{selectedDoctor.specialty}</p>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Calendar size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
                          <p className="text-[13px] font-semibold text-slate-900">{selectedDate}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Clock size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Time</p>
                          <p className="text-[13px] font-semibold text-slate-900">{selectedSlot.time} – {selectedSlot.endTime}</p>
                        </div>
                      </div>

                      {/* Service */}
                      {selectedService && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Sparkles size={14} className="text-violet-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Service</p>
                            <p className="text-[13px] font-semibold text-slate-900">{selectedService.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-slate-100" />

                      {/* Consultation Fee */}
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-500 font-medium">Consultation Fee</span>
                        <span className="text-[15px] font-bold text-slate-900">Rs. {selectedDoctor.consultationFee}</span>
                      </div>

                      {/* Submit Button - Desktop */}
                      <button onClick={handleBook} disabled={booking || !patientForm.name.trim() || !patientForm.phone.trim()}
                        className="hidden lg:flex w-full px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold text-[14px] hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]">
                        {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {booking ? 'Booking...' : 'Confirm Booking'}
                      </button>

                      {/* Trust Note */}
                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        Your information is secure and will only be shared with the clinic.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
