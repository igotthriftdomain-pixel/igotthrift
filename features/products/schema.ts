import { z } from "zod";
import { CHARACTER_LIMITS } from "./constants";

export const productSchema = z
  .object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(CHARACTER_LIMITS.name),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    short_description: z
      .string()
      .max(CHARACTER_LIMITS.shortDescription, `Short description cannot exceed ${CHARACTER_LIMITS.shortDescription} characters`)
      .nullable()
      .optional(),
    description: z
      .string()
      .max(CHARACTER_LIMITS.description, `Description cannot exceed ${CHARACTER_LIMITS.description} characters`)
      .nullable()
      .optional(),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    compare_at_price: z.number().min(0, "Compare-at price must be greater than or equal to 0").nullable().optional(),
    sku: z.string().max(CHARACTER_LIMITS.sku, `SKU cannot exceed ${CHARACTER_LIMITS.sku} characters`).nullable().optional(),
    stock: z.number().int().min(0, "Stock quantity cannot be negative"),
    category_id: z.string().uuid("Invalid category selection"),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    published_at: z.string().nullable().optional(),
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
    images: z
      .array(
        z.object({
          storage_path: z.string().min(1, "Image path is required"),
          display_order: z.number().int(),
          is_primary: z.boolean(),
        })
      )
      .min(1, "At least one product image is required"),
  })
  .refine(
    (data) => {
      if (
        data.compare_at_price !== undefined &&
        data.compare_at_price !== null &&
        data.price >= data.compare_at_price
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Selling price must be lower than compare-at price",
      path: ["price"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;
