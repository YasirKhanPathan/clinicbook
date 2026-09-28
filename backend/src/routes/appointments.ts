import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

const router = Router();
router.use(authMiddleware);

// Helper: parse a YYYY-MM-DD date string using Asia/Karachi timezone
function parseLocalDate(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr + "T00:00:00.000+05:00");
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return { start: d, end: next };
}

// List appointments
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as Record<string, string | string[] | undefined>;
    const date = query.date;
    const doctorId = query.doctorId;
    const status = query.status;
    const from = query.from;
    const to = query.to;
    const where: any = { clinicId: req.clinicId };

    if (date) {
      const { start, end } = parseLocalDate(Array.isArray(date) ? date[0] : date);
      where.date = { gte: start, lt: end };
    }
    if (from && to) {
      const { start } = parseLocalDate(Array.isArray(from) ? from[0] : from);
      const { end } = parseLocalDate(Array.isArray(to) ? to[0] : to);
      where.date = { gte: start, lt: end };
    }
    if (doctorId) where.doctorId = Array.isArray(doctorId) ? doctorId[0] : doctorId;
    if (status) where.status = Array.isArray(status) ? status[0] : status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get appointment by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const appointment = await prisma.appointment.findFirst({
      where: { id, clinicId: req.clinicId },
      include: { patient: true, doctor: true, payments: true, prescriptions: true },
    });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Create appointment
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, serviceId, date, startTime, endTime, type, notes, symptoms } = req.body;
    if (!patientId || !doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Patient, doctor, date, and time are required" });
    }

    // Check slot availability
    const existing = await prisma.appointment.findFirst({
      where: { doctorId, date: new Date(date), startTime, status: { not: "CANCELLED" } },
    });
    if (existing) return res.status(400).json({ error: "This time slot is already booked" });

    const appointment = await prisma.appointment.create({
      data: {
        clinicId: req.clinicId!,
        patientId,
        doctorId,
        serviceId,
        date: new Date(date),
        startTime,
        endTime,
        type: type || "CONSULTATION",
        notes,
        symptoms,
        createdById: req.userId,
      },
      include: { patient: true, doctor: true },
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Create appointment error:", error?.message);
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update appointment status
router.patch("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update appointment details
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { notes, symptoms, diagnosis, type } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { notes, symptoms, diagnosis, type },
      include: { patient: true, doctor: true },
    });
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Cancel appointment
router.post("/:id/cancel", async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
