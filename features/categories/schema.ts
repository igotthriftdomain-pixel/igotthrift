import { z } from "zod";
import { CHARACTER_LIMITS } from "./constants";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(CHARACTER_LIMITS.name),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z
    .string()
    .max(CHARACTER_LIMITS.description, `Description cannot exceed ${CHARACTER_LIMITS.description} characters`)
    .nullable()
    .optional(),
  image_path: z.string({ message: "Category image is required" }).min(1, "Category image is required"),
  active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
