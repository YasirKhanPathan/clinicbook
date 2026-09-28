import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ClinicBook database...");

  // Create demo clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "City Health Clinic",
      slug: "city-health",
      email: "info@cityhealth.com",
      phone: "+92 300 1234567",
      address: "123 Medical Center Road",
      city: "Karachi",
      timezone: "Asia/Karachi",
      workingHours: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: { start: "10:00", end: "14:00" },
        sunday: null,
      },
    },
  });

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: "admin@cityhealth.com",
      passwordHash: adminHash,
      name: "Dr. Ahmed Khan",
      role: "ADMIN",
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.create({ data: { clinicId: clinic.id, name: "General Consultation", duration: 30, price: 1500 } }),
    prisma.service.create({ data: { clinicId: clinic.id, name: "Follow-up Visit", duration: 15, price: 800 } }),
    prisma.service.create({ data: { clinicId: clinic.id, name: "Detailed Checkup", duration: 45, price: 2500 } }),
    prisma.service.create({ data: { clinicId: clinic.id, name: "Vaccination", duration: 15, price: 500 } }),
  ]);

  // Create doctors
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        clinicId: clinic.id,
        name: "Dr. Ahmed Khan",
        email: "ahmed@cityhealth.com",
        phone: "+92 300 1111111",
        specialty: "General Physician",
        qualifications: "MBBS, FCPS",
        bio: "Experienced general physician with 15 years of practice.",
        consultationFee: 1500,
        slotDurationMinutes: 30,
        services: { create: [{ serviceId: services[0].id }, { serviceId: services[1].id }] },
        availability: { create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
        ] },
      },
    }),
    prisma.doctor.create({
      data: {
        clinicId: clinic.id,
        name: "Dr. Fatima Ali",
        email: "fatima@cityhealth.com",
        phone: "+92 300 2222222",
        specialty: "Pediatrician",
        qualifications: "MBBS, DCH",
        bio: "Specialist in children's health and vaccinations.",
        consultationFee: 1200,
        slotDurationMinutes: 20,
        services: { create: [{ serviceId: services[0].id }, { serviceId: services[3].id }] },
        availability: { create: [
          { dayOfWeek: 1, startTime: "10:00", endTime: "16:00" },
          { dayOfWeek: 3, startTime: "10:00", endTime: "16:00" },
          { dayOfWeek: 5, startTime: "10:00", endTime: "16:00" },
        ] },
      },
    }),
    prisma.doctor.create({
      data: {
        clinicId: clinic.id,
        name: "Dr. Hassan Raza",
        email: "hassan@cityhealth.com",
        phone: "+92 300 3333333",
        specialty: "Dermatologist",
        qualifications: "MBBS, MCPS Dermatology",
        bio: "Expert in skin care and cosmetic dermatology.",
        consultationFee: 2000,
        slotDurationMinutes: 30,
        services: { create: [{ serviceId: services[0].id }, { serviceId: services[2].id }] },
        availability: { create: [
          { dayOfWeek: 2, startTime: "09:00", endTime: "15:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "15:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
        ] },
      },
    }),
  ]);

  // Create sample patients
  const patients = await Promise.all([
    prisma.patient.create({ data: { clinicId: clinic.id, name: "Ali Hassan", phone: "+92 301 1234567", email: "ali@email.com", gender: "Male" } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: "Sara Malik", phone: "+92 302 2345678", email: "sara@email.com", gender: "Female" } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: "Usman Ghani", phone: "+92 303 3456789", gender: "Male" } }),
  ]);

  // Create sample appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Promise.all([
    prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        serviceId: services[0].id,
        date: today,
        startTime: "10:00",
        endTime: "10:30",
        status: "CONFIRMED",
        type: "CONSULTATION",
        symptoms: "Headache and fever",
      },
    }),
    prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        serviceId: services[3].id,
        date: today,
        startTime: "11:00",
        endTime: "11:20",
        status: "CONFIRMED",
        type: "CONSULTATION",
      },
    }),
    prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patients[2].id,
        doctorId: doctors[2].id,
        serviceId: services[2].id,
        date: new Date(today.getTime() + 86400000), // tomorrow
        startTime: "09:30",
        endTime: "10:15",
        status: "PENDING",
        type: "FOLLOW_UP",
      },
    }),
  ]);

  console.log("✅ Seed complete!");
  console.log(`   Clinic: ${clinic.name} (${clinic.slug})`);
  console.log(`   Admin: admin@cityhealth.com / admin123`);
  console.log(`   Doctors: ${doctors.length}`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Patients: ${patients.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
