import { z } from "zod";
import { CHARACTER_LIMITS } from "./constants";

export const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z
    .string()
    .max(CHARACTER_LIMITS.description, `Description cannot exceed ${CHARACTER_LIMITS.description} characters`)
    .nullable()
    .optional(),
  whatsapp_number: z.string().min(10, "WhatsApp number must be at least 10 characters"),
  address: z.string().nullable().optional(),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Theme color must be a valid 6-character hex color (e.g. #0F172A)"),
  currency_code: z.string().min(3, "Currency code must be exactly 3 characters").max(3),
  currency_symbol: z.string().min(1, "Currency symbol is required"),
  website: z.string().url("Invalid website URL").or(z.literal("")).nullable().optional(),
  instagram: z.string().max(50, "Instagram handle cannot exceed 50 characters").nullable().optional(),
  facebook: z.string().max(50, "Facebook handle cannot exceed 50 characters").nullable().optional(),
  meta_title: z
    .string()
    .max(CHARACTER_LIMITS.metaTitle, `Meta title cannot exceed ${CHARACTER_LIMITS.metaTitle} characters`)
    .nullable()
    .optional(),
  meta_description: z
    .string()
    .max(CHARACTER_LIMITS.metaDescription, `Meta description cannot exceed ${CHARACTER_LIMITS.metaDescription} characters`)
    .nullable()
    .optional(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
