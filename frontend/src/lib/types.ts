export interface Clinic {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  logo?: string;
  timezone: string;
  workingHours?: Record<string, { start: string; end: string }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  clinicId: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  phone?: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  qualifications?: string;
  bio?: string;
  imageUrl?: string;
  consultationFee: number;
  slotDurationMinutes: number;
  isActive: boolean;
  services?: DoctorService[];
  availability?: Availability[];
}

export interface Service {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface DoctorService {
  id: string;
  doctorId: string;
  serviceId: string;
  service: Service;
}

export interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  cnic?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  type: "CONSULTATION" | "FOLLOW_UP" | "PROCEDURE" | "EMERGENCY";
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  patient?: Patient;
  doctor?: Doctor;
  payments?: Payment[];
  prescriptions?: Prescription[];
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: "CASH" | "CARD" | "ONLINE";
  status: "PAID" | "REFUNDED" | "PENDING";
  transactionId?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  appointmentId?: string;
  doctorName: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  weekAppointments: number;
  completedToday: number;
  pendingToday: number;
  todayRevenue: number;
  recentAppointments: Appointment[];
  upcoming: Appointment[];
}
