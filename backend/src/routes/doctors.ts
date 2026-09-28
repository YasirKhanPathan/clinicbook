import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware, adminOnly } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

const router = Router();
router.use(authMiddleware);

// List doctors for this clinic
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: req.clinicId },
      include: { services: { include: { service: true } }, availability: true },
      orderBy: { name: "asc" },
    });
    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get doctor by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, clinicId: req.clinicId },
      include: { services: { include: { service: true } }, availability: true },
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Create doctor
router.post("/", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, specialty, qualifications, bio, consultationFee, slotDurationMinutes, serviceIds } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const doctor = await prisma.doctor.create({
      data: {
        clinicId: req.clinicId!,
        name,
        email,
        phone,
        specialty,
        qualifications,
        bio,
        consultationFee: consultationFee || 0,
        slotDurationMinutes: slotDurationMinutes || 30,
        services: serviceIds?.length ? { create: serviceIds.map((id: string) => ({ serviceId: id })) } : undefined,
      },
      include: { services: { include: { service: true } } },
    });

    // Create default availability (Mon-Fri 9-5)
    const defaultAvailability = [1, 2, 3, 4, 5].map(day => ({
      doctorId: doctor.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    }));
    await prisma.availability.createMany({ data: defaultAvailability });

    res.status(201).json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update doctor
router.put("/:id", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, email, phone, specialty, qualifications, bio, consultationFee, slotDurationMinutes, isActive } = req.body;
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { name, email, phone, specialty, qualifications, bio, consultationFee, slotDurationMinutes, isActive },
    });
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update doctor availability
router.put("/:id/availability", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { availability } = req.body; // [{dayOfWeek, startTime, endTime, isAvailable}]

    await prisma.availability.deleteMany({ where: { doctorId } });
    if (availability?.length) {
      await prisma.availability.createMany({
        data: availability.map((a: any) => ({ doctorId, ...a })),
      });
    }

    const updated = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { availability: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Delete doctor
router.delete("/:id", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.doctor.delete({ where: { id: doctorId } });
    res.json({ message: "Doctor deleted" });
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
