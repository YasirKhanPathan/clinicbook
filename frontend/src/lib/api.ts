import axios from 'axios';
import type { Clinic, User, Doctor, Service, Patient, Appointment, DashboardStats } from './types';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cb_token');
      localStorage.removeItem('cb_user');
      localStorage.removeItem('cb_clinic');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string, clinicSlug?: string) =>
    api.post<{ clinic: Clinic; user: User; token: string }>('/auth/login', { email, password, clinicSlug }),
  register: (data: Record<string, unknown>) =>
    api.post<{ clinic: Clinic; user: User; token: string }>('/auth/register', data),
  getProfile: () => api.get<{ user: User; clinic: Clinic }>('/auth/me'),
};

export const clinicAPI = {
  getCurrent: () => api.get<Clinic>('/clinics/current'),
  update: (data: Partial<Clinic>) => api.put<Clinic>('/clinics/current', data),
};

export const doctorAPI = {
  list: () => api.get<Doctor[]>('/doctors'),
  get: (id: string) => api.get<Doctor>(`/doctors/${id}`),
  create: (data: Partial<Doctor> & { serviceIds?: string[] }) => api.post<Doctor>('/doctors', data),
  update: (id: string, data: Partial<Doctor>) => api.put<Doctor>(`/doctors/${id}`, data),
  updateAvailability: (id: string, availability: Array<{ dayOfWeek: number; isAvailable: boolean; startTime: string; endTime: string }>) =>
    api.put<Doctor>(`/doctors/${id}/availability`, { availability }),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

export const serviceAPI = {
  list: () => api.get<Service[]>('/services'),
  create: (data: Partial<Service>) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const patientAPI = {
  list: (search?: string) => api.get<Patient[]>('/patients', { params: { search } }),
  get: (id: string) => api.get<Patient & { appointments: Appointment[] }>(`/patients/${id}`),
  create: (data: Partial<Patient>) => api.post<Patient>('/patients', data),
  update: (id: string, data: Partial<Patient>) => api.put<Patient>(`/patients/${id}`, data),
};

export const appointmentAPI = {
  list: (params?: { date?: string; doctorId?: string; status?: string }) =>
    api.get<Appointment[]>('/appointments', { params }),
  get: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Record<string, unknown>) => api.post<Appointment>('/appointments', data),
  update: (id: string, data: Record<string, unknown>) => api.put<Appointment>(`/appointments/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<Appointment>(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.post(`/appointments/${id}/cancel`),
};

export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

// Public API (no auth)
export const publicAPI = {
  getClinic: (slug: string) => api.get(`/public/clinic/${slug}`),
  getDoctors: (slug: string) => api.get(`/public/clinic/${slug}/doctors`),
  getServices: (slug: string) => api.get(`/public/clinic/${slug}/services`),
  getSlots: (slug: string, doctorId: string, date: string) =>
    api.get(`/public/clinic/${slug}/slots/${doctorId}/${date}`),
  book: (slug: string, data: any) => api.post(`/public/clinic/${slug}/book`, data),
  getAppointments: (slug: string, phone: string) =>
    api.get(`/public/clinic/${slug}/appointments/${phone}`),
};

export default api;
