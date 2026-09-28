import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import clinicRoutes from "./routes/clinics";
import doctorRoutes from "./routes/doctors";
import serviceRoutes from "./routes/services";
import patientRoutes from "./routes/patients";
import appointmentRoutes from "./routes/appointments";
import dashboardRoutes from "./routes/dashboard";
import publicRoutes from "./routes/public";

const app = express();
const PORT = process.env.PORT || 3007;

// Security headers
app.use(helmet());

// CORS — restrict to known origins in production
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:3008", "http://localhost:3000"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "1mb" }));

// Global rate limit: 100 requests per minute per IP
const globalLimiter = rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);

// Stricter rate limit for auth & booking: 15 requests per 15 minutes
const strictLimiter = rateLimit({ windowMs: 15 * 60_000, max: 15, standardHeaders: true, legacyHeaders: false });

// Public routes (no auth)
app.use("/api/auth", strictLimiter, authRoutes);
app.use("/api/public", strictLimiter, publicRoutes);

// Protected routes
app.use("/api/clinics", clinicRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "clinicbook", timestamp: new Date().toISOString() });
});

// Error handler — never leak internals
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err?.message || err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`ClinicBook backend running on port ${PORT}`);
});

export default app;
