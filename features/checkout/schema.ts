import { z } from "zod";

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name (at least 2 characters)")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\s()-]+$/, "Invalid phone number format")
    .trim(),
  address: z
    .string()
    .min(3, "Please enter your delivery address")
    .max(300, "Address cannot exceed 300 characters")
    .trim(),
});
