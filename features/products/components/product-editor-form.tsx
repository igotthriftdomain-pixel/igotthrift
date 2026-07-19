"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Category } from "@/features/categories/types";
import { type ProductWithCategoryAndImages } from "../types";
import { productSchema } from "../schema";
import {
  createProductAction,
  updateProductAction,
  uploadProductImageAction,
  removeProductImageAction,
} from "../actions";
import { CHARACTER_LIMITS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { LivePreviewCard } from "./live-preview-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import {
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Eye,
  ArrowUp,
  ArrowDown,
  Star,
  AlertTriangle,
} from "lucide-react";

interface ProductEditorFormProps {
  productId: string;
  categories: Category[];
  initialProduct?: ProductWithCategoryAndImages;
}

interface UploadedImageState {
  storage_path: string;
  publicUrl: string;
  display_order: number;
  is_primary: boolean;
  file?: File; // optional
  uploading?: boolean;
}

export function ProductEditorForm({
  productId,
  categories,
  initialProduct,
}: ProductEditorFormProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  // General Fields
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || "");
  const [description, setDescription] = useState(initialProduct?.description || "");

  // Pricing Fields
  const [price, setPrice] = useState(initialProduct?.price ? initialProduct.price.toString() : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.compare_at_price ? initialProduct.compare_at_price.toString() : ""
  );

  // Inventory Fields
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct?.stock_quantity ? initialProduct.stock_quantity.toString() : "0"
  );

  // Organization Fields
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");

  // Visibility Fields
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [publishedAt, setPublishedAt] = useState(
    initialProduct?.published_at
      ? new Date(initialProduct.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );


  // Images state
  const [images, setImages] = useState<UploadedImageState[]>(() => {
    if (initialProduct?.product_images) {
      return initialProduct.product_images.map((img) => ({
        storage_path: img.storage_path,
        publicUrl: img.publicUrl || "",
        display_order: img.display_order,
        is_primary: img.is_primary,
      }));
    }
    return [];
  });
  const [isSlugEdited, setIsSlugEdited] = useState(!!initialProduct);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Derived dirty state check
  const isDirty =
    name !== (initialProduct?.name || "") ||
    slug !== (initialProduct?.slug || "") ||
    shortDescription !== (initialProduct?.short_description || "") ||
    description !== (initialProduct?.description || "") ||
    price !== (initialProduct?.price ? initialProduct.price.toString() : "") ||
    compareAtPrice !== (initialProduct?.compare_at_price ? initialProduct.compare_at_price.toString() : "") ||
    sku !== (initialProduct?.sku || "") ||
    stockQuantity !== (initialProduct?.stock_quantity ? initialProduct.stock_quantity.toString() : "0") ||
    categoryId !== (initialProduct?.category_id || "") ||
    featured !== (initialProduct?.featured || false) ||
    active !== (initialProduct?.active ?? true);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid image format. PNG, JPG, JPEG, and WEBP allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size exceeds the 5MB limit.");
      return;
    }

    const imageUuid = typeof crypto.randomUUID === "function" 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);

    // Create temporary optimistic state entry
    const tempUrl = URL.createObjectURL(file);
    const newIndex = images.length;
    const tempImage: UploadedImageState = {
      storage_path: "",
      publicUrl: tempUrl,
      display_order: newIndex,
      is_primary: newIndex === 0, // Primary if first image
      uploading: true,
    };

    setImages((prev) => [...prev, tempImage]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadProductImageAction(productId, imageUuid, formData);
      if (res.success) {
        const successRes = res as { success: true; storagePath: string; publicUrl: string };
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === newIndex
              ? {
                  storage_path: successRes.storagePath,
                  publicUrl: successRes.publicUrl,
                  display_order: newIndex,
                  is_primary: newIndex === 0,
                  uploading: false,
                }
              : img
          )
        );
        toast.success("Image uploaded successfully");
      } else {
        // Rollback
        setImages((prev) => prev.filter((_, idx) => idx !== newIndex));
        toast.error((res as { error: string }).error || "Failed to upload image");
      }
    } catch {
      setImages((prev) => prev.filter((_, idx) => idx !== newIndex));
      toast.error("Network error uploading image");
    }
  };

  // Primary selection toggle
  const makePrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  // Remove image
  const removeImage = async (index: number) => {
    const targetImage = images[index];
    if (targetImage.uploading) return;

    const previousImages = [...images];
    // Remove from state immediately
    setImages((prev) => {
      const updated = prev
        .filter((_, idx) => idx !== index)
        .map((img, idx) => ({
          ...img,
          display_order: idx,
          // Re-evaluate primary if the deleted image was primary
          is_primary: targetImage.is_primary ? idx === 0 : img.is_primary,
        }));
      return updated;
    });

    try {
      const res = await removeProductImageAction(targetImage.storage_path);
      if (res.success) {
        toast.success("Image removed");
      } else {
        setImages(previousImages);
        toast.error(res.error || "Failed to remove image");
      }
    } catch {
      setImages(previousImages);
      toast.error("Network error removing image");
    }
  };

  // Shift orders Up/Down
  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    setImages((prev) => {
      const nextList = [...prev];
      const temp = nextList[index];
      nextList[index] = nextList[targetIdx];
      nextList[targetIdx] = temp;

      // Reset display orders sequentially
      return nextList.map((img, idx) => ({
        ...img,
        display_order: idx,
      }));
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formattedPrice = Number(price);
    const formattedComparePrice = compareAtPrice ? Number(compareAtPrice) : null;
    const formattedStock = Number(stockQuantity);

    const validation = productSchema.safeParse({
      name,
      slug,
      short_description: shortDescription || null,
      description: description || null,
      price: formattedPrice,
      compare_at_price: formattedComparePrice,
      sku: sku || null,
      stock_quantity: formattedStock,
      category_id: categoryId,
      featured,
      active,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      images: images.map((img) => ({
        storage_path: img.storage_path,
        display_order: img.display_order,
        is_primary: img.is_primary,
      })),
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    try {
      const res = isEditing
        ? await updateProductAction(productId, validation.data)
        : await createProductAction(productId, validation.data);

      if (res.success) {
        toast.success(`Product ${isEditing ? "updated" : "created"} successfully`);
        if (!isEditing) {
          router.push(`/products/${productId}/edit`);
        } else {
          router.refresh();
        }
      } else {
        setErrors({ general: res.error || "Saving failed" });
        toast.error(res.error || "Failed to save product");
      }
    } catch {
      setErrors({ general: "Network error saving product." });
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Find primary image url
  const primaryImage = images.find((img) => img.is_primary)?.publicUrl || null;

  // Remaining characters calculations
  const shortDescLeft = CHARACTER_LIMITS.shortDescription - shortDescription.length;
  const descLeft = CHARACTER_LIMITS.description - description.length;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Editor Columns */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {errors.general && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {errors.general}
            </div>
          )}

          {/* General Section */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">General Information</CardTitle>
              <CardDescription>Configure core metadata properties of this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Product Name</FieldLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="e.g. Vintage Denim Jacket"
                      aria-label="Product Name"
                    />
                    {errors.name && <FieldError className="text-red-400 text-xs mt-1">{errors.name}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">URL Slug</FieldLabel>
                    <Input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 font-mono text-xs"
                      placeholder="e.g. vintage-denim-jacket"
                      aria-label="URL Slug"
                    />
                    {errors.slug && <FieldError className="text-red-400 text-xs mt-1">{errors.slug}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex justify-between items-center">
                    <span>Short Description</span>
                    <span className={`text-xs ${shortDescLeft < 15 ? "text-amber-500 font-semibold" : "text-zinc-400"}`}>
                      {shortDescLeft} characters remaining
                    </span>
                  </FieldLabel>
                  <Input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                    placeholder="Brief single-sentence tag line for previews..."
                    aria-label="Short Description"
                  />
                  {errors.short_description && <FieldError className="text-red-400 text-xs mt-1">{errors.short_description}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex justify-between items-center">
                    <span>Full Description</span>
                    <span className={`text-xs ${descLeft < 50 ? "text-amber-500 font-semibold" : "text-zinc-400"}`}>
                      {descLeft} characters remaining
                    </span>
                  </FieldLabel>
                  {/* Rich-text ready: Wrapper wrapper component ready */}
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 min-h-[120px]"
                    placeholder="Describe styling fits, conditions, size, and wear details..."
                    aria-label="Full Description"
                  />
                  {errors.description && <FieldError className="text-red-400 text-xs mt-1">{errors.description}</FieldError>}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Pricing</CardTitle>
                <CardDescription>Setup item listing price tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Selling Price (₹)</FieldLabel>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="1299"
                      aria-label="Selling Price"
                    />
                    {errors.price && <FieldError className="text-red-400 text-xs mt-1">{errors.price}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Compare-at Price (₹)</FieldLabel>
                    <Input
                      type="number"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="1999"
                      aria-label="Compare-at Price"
                    />
                    {errors.compare_at_price && <FieldError className="text-red-400 text-xs mt-1">{errors.compare_at_price}</FieldError>}
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Inventory</CardTitle>
                <CardDescription>Track stock allocations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">SKU (Stock Keeping Unit)</FieldLabel>
                    <Input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="VDJ-90S"
                      aria-label="SKU"
                    />
                    {errors.sku && <FieldError className="text-red-400 text-xs mt-1">{errors.sku}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Stock Quantity</FieldLabel>
                    <Input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="5"
                      aria-label="Stock Quantity"
                    />
                    {errors.stock_quantity && <FieldError className="text-red-400 text-xs mt-1">{errors.stock_quantity}</FieldError>}
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* Media Section */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <ImageIcon className="size-4" /> Product Media Gallery
              </CardTitle>
              <CardDescription>Upload multiple images. The first image represents the card thumbnail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
                accept="image/*"
              />

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/20"
              >
                <div className="mx-auto size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 mb-2">
                  <UploadCloud className="size-6 text-zinc-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Drag files here or click to select</span>
                <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, JPEG or WEBP (Max 5MB per file)</p>
              </div>

              {errors.images && <p className="text-red-400 text-xs">{errors.images}</p>}

              {/* Uploaded Images Grid */}
              {images.length > 0 && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-4">
                  {images.map((img, index) => (
                    <div
                      key={img.storage_path || img.publicUrl}
                      className={`relative aspect-square rounded-lg border overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 ${
                        img.is_primary ? "border-amber-500" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.publicUrl} alt={`Gallery item ${index}`} className="w-full h-full object-cover" />

                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-[9px] text-white font-medium bg-zinc-900/90 py-1 px-2 border border-zinc-800 rounded">
                            Uploading...
                          </span>
                        </div>
                      )}

                      {/* Action Overlays */}
                      {!img.uploading && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 flex justify-between items-center">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 text-white hover:bg-white/20"
                              disabled={index === 0}
                              onClick={() => moveImage(index, "up")}
                              aria-label="Move Image Left"
                            >
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 text-white hover:bg-white/20"
                              disabled={index === images.length - 1}
                              onClick={() => moveImage(index, "down")}
                              aria-label="Move Image Right"
                            >
                              <ArrowDown className="size-3" />
                            </Button>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`size-6 hover:bg-white/20 ${img.is_primary ? "text-amber-400" : "text-white"}`}
                              onClick={() => makePrimary(index)}
                              aria-label="Mark as Primary"
                            >
                              <Star className="size-3 fill-current" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 text-red-400 hover:bg-red-950/50"
                              onClick={() => removeImage(index)}
                              aria-label="Delete Image"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-6"
            >
              {saving ? "Saving Changes..." : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview and Side Panel Sidebar Column */}
      <div className="space-y-6">
        {/* Live Preview Card */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Eye className="size-4 text-emerald-500" /> Live Storefront Preview
            </CardTitle>
            <CardDescription>Representation of this item in customer storefronts</CardDescription>
          </CardHeader>
          <CardContent>
            <LivePreviewCard
              name={name}
              price={Number(price) || 0}
              compareAtPrice={compareAtPrice ? Number(compareAtPrice) : null}
              featured={featured}
              active={active}
              imagePublicUrl={primaryImage}
            />
          </CardContent>
        </Card>

        {/* Organization / Status Cards */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Publish & Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Store Category</FieldLabel>
                <Select
                  value={categoryId}
                  onValueChange={(val) => setCategoryId(val || "")}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <FieldError className="text-red-400 text-xs mt-1">{errors.category_id}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Published Date & Time</FieldLabel>
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  disabled={saving}
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                  aria-label="Published Date"
                />
              </Field>

              <div className="space-y-3 pt-2">
                <Field className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    disabled={saving}
                    className="rounded border-zinc-300 dark:border-zinc-800 text-zinc-900 focus:ring-zinc-950 size-4 cursor-pointer"
                    id="product-active"
                    aria-label="Active status"
                  />
                  <label htmlFor="product-active" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium">
                    Make this product active (visible)
                  </label>
                </Field>

                <Field className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    disabled={saving}
                    className="rounded border-zinc-300 dark:border-zinc-800 text-zinc-900 focus:ring-zinc-950 size-4 cursor-pointer"
                    id="product-featured"
                    aria-label="Featured status"
                  />
                  <label htmlFor="product-featured" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium flex items-center gap-1">
                    Mark as Featured <Sparkles className="size-3.5 text-amber-500 fill-current" />
                  </label>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
