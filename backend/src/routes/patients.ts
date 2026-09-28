import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { normalizePhone, sanitizeError } from "../utils/helpers";

const router = Router();
router.use(authMiddleware);

// List patients
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = { clinicId: req.clinicId };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }
    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Get patient by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const patientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: req.clinicId },
      include: { appointments: { orderBy: { date: "desc" }, take: 10, include: { doctor: true } } },
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Create or find patient
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, dateOfBirth, gender, address, cnic, bloodGroup, allergies, medicalHistory } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

    const normalizedPhone = normalizePhone(phone);
    const dob = dateOfBirth ? new Date(dateOfBirth + "T00:00:00.000Z") : null;

    // Find existing patient by phone in this clinic
    let patient = await prisma.patient.findFirst({
      where: { clinicId: req.clinicId, phone: normalizedPhone },
    });

    if (patient) {
      // Update existing
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: { name, phone: normalizedPhone, email, dateOfBirth: dob, gender, address, cnic, bloodGroup, allergies, medicalHistory },
      });
    } else {
      patient = await prisma.patient.create({
        data: { clinicId: req.clinicId!, name, phone: normalizedPhone, email, dateOfBirth: dob, gender, address, cnic, bloodGroup, allergies, medicalHistory },
      });
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update patient
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, phone, email, dateOfBirth, gender, address, cnic, bloodGroup, allergies, medicalHistory, insuranceProvider, insuranceNumber } = req.body;
    const normalizedPhone = phone ? normalizePhone(phone) : phone;
    const dob = dateOfBirth ? new Date(dateOfBirth + "T00:00:00.000Z") : undefined;
    const patient = await prisma.patient.update({
      where: { id },
      data: { name, phone: normalizedPhone, email, dateOfBirth: dob, gender, address, cnic, bloodGroup, allergies, medicalHistory, insuranceProvider, insuranceNumber },
    });
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
