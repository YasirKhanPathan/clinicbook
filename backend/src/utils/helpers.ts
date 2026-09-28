/** Normalize Pakistani phone numbers to 03XXXXXXXXX format */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) return "0" + digits.slice(2);
  if (digits.startsWith("03") && digits.length === 11) return digits;
  if (digits.startsWith("3") && digits.length === 10) return "0" + digits;
  return digits;
}

/** Sanitize error messages — never leak internal details to clients */
export function sanitizeError(error: any): string {
  if (error?.code === "P2002") return "A record with this information already exists";
  if (error?.code === "P2025") return "Record not found";
  if (error?.code === "P2003") return "Invalid reference";
  return "Something went wrong. Please try again.";
}
