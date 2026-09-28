import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware, adminOnly } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

const router = Router();
router.use(authMiddleware);

// Get clinic settings
router.get("/current", async (req: AuthRequest, res: Response) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.clinicId },
      select: { id: true, name: true, slug: true, email: true, phone: true, address: true, city: true, logo: true, timezone: true, workingHours: true, isActive: true },
    });
    res.json(clinic);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Update clinic settings
router.put("/current", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, logo, timezone, workingHours } = req.body;
    const clinic = await prisma.clinic.update({
      where: { id: req.clinicId },
      data: { name, phone, address, city, logo, timezone, workingHours },
    });
    res.json(clinic);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
