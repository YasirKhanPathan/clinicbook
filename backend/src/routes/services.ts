import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware, adminOnly } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { clinicId: req.clinicId, isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

router.post("/", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, price } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const service = await prisma.service.create({
      data: { clinicId: req.clinicId!, name, description, duration: duration || 30, price: price || 0 },
    });
    res.status(201).json(service);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

router.put("/:id", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, duration, price, isActive } = req.body;
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: { name, description, duration, price, isActive },
    });
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

router.delete("/:id", adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.service.delete({ where: { id: serviceId } });
    res.json({ message: "Service deleted" });
  } catch (error: any) {
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
