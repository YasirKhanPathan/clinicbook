import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { generateToken } from "../middleware/auth";
import { sanitizeError } from "../utils/helpers";

const router = Router();

// Register clinic + admin
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { clinicName, slug, email, password, name, phone } = req.body;
    if (!clinicName || !slug || !email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check slug availability
    const existing = await prisma.clinic.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: "This clinic URL is already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        slug,
        email,
        users: {
          create: { email, passwordHash, name, role: "ADMIN", phone },
        },
      },
      include: { users: true },
    });

    const user = clinic.users[0];
    const token = generateToken({ userId: user.id, clinicId: clinic.id, role: user.role });

    res.status(201).json({
      clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error: any) {
    console.error("Register error:", error?.message);
    res.status(500).json({ error: sanitizeError(error) });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, clinicSlug } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user, optionally filtered by clinic
    const where: any = { email };
    if (clinicSlug) {
      const clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug } });
      if (!clinic) return res.status(404).json({ error: "Clinic not found" });
      where.clinicId = clinic.id;
    }

    const user = await prisma.user.findFirst({ where, include: { clinic: true } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken({ userId: user.id, clinicId: user.clinicId, role: user.role });

    res.json({
      clinic: { id: user.clinic.id, name: user.clinic.name, slug: user.clinic.slug },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error?.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const { verifyToken } = await import("../middleware/auth");
    const payload = verifyToken(authHeader.split(" ")[1]);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { clinic: { select: { id: true, name: true, slug: true, logo: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      clinic: user.clinic,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
