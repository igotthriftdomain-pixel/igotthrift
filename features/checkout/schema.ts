import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^[0-9+\s-]+$/, "Invalid phone number format")
    .trim(),
  address: z.string()
    .min(10, "Address must be at least 10 characters")
    .max(300, "Address cannot exceed 300 characters")
    .trim(),
});
