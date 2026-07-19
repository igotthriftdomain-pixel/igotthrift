"use client";

import { useState } from "react";
import { type Category } from "../types";
import { categorySchema } from "../schema";
import { createCategoryAction, updateCategoryAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

export function CategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!category;
  const [name, setName] = useState(category ? category.name : "");
  const [slug, setSlug] = useState(category ? category.slug : "");
  const [description, setDescription] = useState(category ? category.description || "" : "");
  const [active, setActive] = useState(category ? category.active : true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSlugEdited, setIsSlugEdited] = useState(!!category);

  // Auto-slugify name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugEdited) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validation = categorySchema.safeParse({
      name,
      slug,
      description: description || null,
      active,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = isEditing
        ? await updateCategoryAction(category.id, validation.data)
        : await createCategoryAction(validation.data);

      if (res.success) {
        toast.success(`Category ${isEditing ? "updated" : "created"} successfully`);
        onOpenChange(false);
      } else {
        setErrors({ general: res.error || "An error occurred" });
      }
    } catch {
      setErrors({ general: "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {isEditing ? "Modify the properties of your category." : "Create a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {errors.general && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg">
              {errors.general}
            </div>
          )}

          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Category Name</FieldLabel>
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                placeholder="e.g. Vintage Outerwear"
                aria-label="Category Name"
              />
              {errors.name && <FieldError className="text-red-400 text-xs mt-1">{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">URL Slug</FieldLabel>
              <Input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 font-mono text-xs"
                placeholder="e.g. vintage-outerwear"
                aria-label="URL Slug"
              />
              {errors.slug && <FieldError className="text-red-400 text-xs mt-1">{errors.slug}</FieldError>}
            </Field>

            <Field>
              <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Description</FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 min-h-[80px]"
                placeholder="Briefly describe products under this category..."
                aria-label="Description"
              />
              {errors.description && <FieldError className="text-red-400 text-xs mt-1">{errors.description}</FieldError>}
            </Field>

            <Field className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300 dark:border-zinc-800 text-zinc-900 focus:ring-zinc-950 size-4 cursor-pointer"
                id="category-active"
                aria-label="Active status"
              />
              <label htmlFor="category-active" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium">
                Make this category active on storefront
              </label>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-5"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
