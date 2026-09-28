import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

function localToday() {
  const now = new Date();
  const pk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  pk.setHours(0, 0, 0, 0);
  const next = new Date(pk);
  next.setDate(next.getDate() + 1);
  const weekStart = new Date(pk);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return { start: pk, end: next, weekStart };
}

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const { start: today, end: tomorrow, weekStart } = localToday();

    const [
      todayAppointments,
      totalPatients,
      totalDoctors,
      weekAppointments,
      completedToday,
      pendingToday,
      todayRevenue,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { clinicId: req.clinicId, date: { gte: today, lt: tomorrow } },
      }),
      prisma.patient.count({ where: { clinicId: req.clinicId } }),
      prisma.doctor.count({ where: { clinicId: req.clinicId, isActive: true } }),
      prisma.appointment.count({
        where: { clinicId: req.clinicId, date: { gte: weekStart } },
      }),
      prisma.appointment.count({
        where: { clinicId: req.clinicId, date: { gte: today, lt: tomorrow }, status: "COMPLETED" },
      }),
      prisma.appointment.count({
        where: { clinicId: req.clinicId, date: { gte: today, lt: tomorrow }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.payment.aggregate({
        where: { appointment: { clinicId: req.clinicId }, createdAt: { gte: today, lt: tomorrow }, status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    // Recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: { clinicId: req.clinicId },
      include: { patient: true, doctor: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Upcoming appointments
    const upcoming = await prisma.appointment.findMany({
      where: {
        clinicId: req.clinicId,
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { patient: true, doctor: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 10,
    });

    res.json({
      todayAppointments,
      totalPatients,
      totalDoctors,
      weekAppointments,
      completedToday,
      pendingToday,
      todayRevenue: todayRevenue._sum.amount || 0,
      recentAppointments,
      upcoming,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error?.message);
    res.status(500).json({ error: sanitizeError(error) });
  }
});

export default router;
