import { Router, Request, Response } from "express";
import prisma from "../config/database";
import { normalizePhone, sanitizeError } from "../utils/helpers";

const router = Router();

// Get clinic by slug (public booking page)
router.get("/clinic/:slug", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const clinic = await prisma.clinic.findUnique({
      where: { slug, isActive: true },
      select: { id: true, name: true, slug: true, phone: true, address: true, city: true, logo: true, timezone: true },
    });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });
    res.json(clinic);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get doctors for public booking
router.get("/clinic/:slug/doctors", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id, isActive: true },
      include: { services: { include: { service: true } }, availability: true },
      orderBy: { name: "asc" },
    });
    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get services for public booking
router.get("/clinic/:slug/services", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const services = await prisma.service.findMany({
      where: { clinicId: clinic.id, isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get available slots for a doctor on a date
router.get("/clinic/:slug/slots/:doctorId/:date", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const doctorId = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
    const dateParam = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
    
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, clinicId: clinic.id },
      include: { availability: true },
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const date = new Date(dateParam);
    const dayOfWeek = date.getDay();

    // Get doctor's availability for this day
    const avail = doctor.availability.find((a: any) => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (!avail) return res.json([]);

    // Generate all possible slots
    const slots: string[] = [];
    const [startH, startM] = avail.startTime.split(":").map(Number);
    const [endH, endM] = avail.endTime.split(":").map(Number);
    const duration = doctor.slotDurationMinutes || 30;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      current += duration;
    }

    // Get booked appointments
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const booked = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: date, lt: nextDay },
        status: { not: "CANCELLED" },
      },
      select: { startTime: true },
    });
    const bookedTimes = new Set(booked.map((b) => b.startTime));

    // Filter out booked slots
    const availableSlots = slots.filter((s) => !bookedTimes.has(s));
    res.json(availableSlots);
  } catch (error: any) {
    console.error("Slots error:", error?.message);
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Book appointment (public - patient booking)
router.post("/clinic/:slug/book", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const { doctorId, serviceId, date, startTime, endTime, patientName, patientPhone, patientEmail, patientGender, patientDob, patientCnic, type, notes, symptoms } = req.body;

    if (!doctorId || !date || !startTime || !patientName || !patientPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check slot availability
    const existing = await prisma.appointment.findFirst({
      where: { doctorId, date: new Date(date), startTime, status: { not: "CANCELLED" } },
    });
    if (existing) return res.status(400).json({ error: "This time slot is already booked" });

    // Look up doctor's slot duration to compute endTime if not provided
    let computedEndTime = endTime;
    if (!computedEndTime) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { slotDurationMinutes: true } });
      const duration = doctor?.slotDurationMinutes || 30;
      const [h, m] = startTime.split(":").map(Number);
      const totalMin = h * 60 + m + duration;
      computedEndTime = `${Math.floor(totalMin / 60).toString().padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`;
    }

    // Normalize phone for consistent storage and lookup
    const normalizedPhone = normalizePhone(patientPhone);

    // Find or create patient
    const patientData: any = {
      clinicId: clinic.id,
      name: patientName,
      phone: normalizedPhone,
      email: patientEmail || undefined,
    };
    if (patientGender) patientData.gender = patientGender;
    if (patientDob) patientData.dateOfBirth = new Date(patientDob);
    if (patientCnic) patientData.cnic = patientCnic;

    let patient = await prisma.patient.findFirst({
      where: { clinicId: clinic.id, phone: normalizedPhone },
    });
    if (!patient) {
      patient = await prisma.patient.create({ data: patientData });
    } else {
      const updateData: any = { name: patientName, email: patientEmail || undefined };
      if (patientGender) updateData.gender = patientGender;
      if (patientDob) updateData.dateOfBirth = new Date(patientDob);
      if (patientCnic) updateData.cnic = patientCnic;
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: updateData,
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId,
        serviceId,
        date: new Date(date),
        startTime,
        endTime: computedEndTime,
        type: type || "CONSULTATION",
        notes,
        symptoms,
        status: "PENDING",
      },
    });

    res.status(201).json({ appointment, message: "Appointment booked successfully!" });
  } catch (error: any) {
    console.error("Book error:", error?.message);
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get appointments by phone (patient lookup)
router.get("/clinic/:slug/appointments/:phone", async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const phone = Array.isArray(req.params.phone) ? req.params.phone[0] : req.params.phone;
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const normalizedPhone = normalizePhone(phone);
    const patient = await prisma.patient.findFirst({
      where: { clinicId: clinic.id, phone: normalizedPhone },
    });
    if (!patient) return res.json([]);

    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinic.id, patientId: patient.id },
      include: { doctor: true },
      orderBy: { date: "desc" },
      take: 20,
    });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
