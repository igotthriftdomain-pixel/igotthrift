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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ArrowLeft,
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
  file?: File;
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
  const [description, setDescription] = useState(initialProduct?.description || "");

  // Pricing Fields
  const [price, setPrice] = useState(initialProduct?.price ? initialProduct.price.toString() : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.compare_at_price ? initialProduct.compare_at_price.toString() : ""
  );

  // Inventory Fields
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct?.stock !== undefined ? initialProduct.stock.toString() : (initialProduct?.stock_quantity ? initialProduct.stock_quantity.toString() : "0")
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
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Derived dirty state check
  const isDirty =
    name !== (initialProduct?.name || "") ||
    slug !== (initialProduct?.slug || "") ||
    description !== (initialProduct?.description || "") ||
    price !== (initialProduct?.price ? initialProduct.price.toString() : "") ||
    compareAtPrice !== (initialProduct?.compare_at_price ? initialProduct.compare_at_price.toString() : "") ||
    sku !== (initialProduct?.sku || "") ||
    stockQuantity !== (initialProduct?.stock !== undefined ? initialProduct.stock.toString() : (initialProduct?.stock_quantity ? initialProduct.stock_quantity.toString() : "0")) ||
    categoryId !== (initialProduct?.category_id || "") ||
    featured !== (initialProduct?.featured || false) ||
    active !== (initialProduct?.active ?? true);

  // Unsaved changes browser beforeunload warning
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

  // Intercept navigation if unsaved changes exist
  const handleBackOrCancel = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      router.push("/products");
    }
  };

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

    const tempUrl = URL.createObjectURL(file);
    const newIndex = images.length;
    const tempImage: UploadedImageState = {
      storage_path: "",
      publicUrl: tempUrl,
      display_order: newIndex,
      is_primary: newIndex === 0,
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
        setImages((prev) => prev.filter((_, idx) => idx !== newIndex));
        toast.error((res as { error: string }).error || "Failed to upload image");
      }
    } catch {
      setImages((prev) => prev.filter((_, idx) => idx !== newIndex));
      toast.error("Network error uploading image");
    }
  };

  const makePrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  const removeImage = async (index: number) => {
    const targetImage = images[index];
    if (targetImage.uploading) return;

    const previousImages = [...images];
    setImages((prev) => {
      return prev
        .filter((_, idx) => idx !== index)
        .map((img, idx) => ({
          ...img,
          display_order: idx,
          is_primary: targetImage.is_primary ? idx === 0 : img.is_primary,
        }));
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

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    setImages((prev) => {
      const nextList = [...prev];
      const temp = nextList[index];
      nextList[index] = nextList[targetIdx];
      nextList[targetIdx] = temp;

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
      short_description: null,
      description: description || null,
      price: formattedPrice,
      compare_at_price: formattedComparePrice,
      sku: sku || null,
      stock: formattedStock,
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

  const primaryImage = images.find((img) => img.is_primary)?.publicUrl || null;
  const descLeft = CHARACTER_LIMITS.description - description.length;

  return (
    <div className="space-y-6">
      {/* Navigation Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBackOrCancel}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5"
          >
            <ArrowLeft className="size-4" /> Back to Products
          </Button>
          {isDirty && (
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackOrCancel}
            className="text-zinc-500 dark:text-zinc-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-editor-form"
            disabled={saving || !isDirty}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-5 h-9 text-xs"
          >
            {saving ? "Saving Changes..." : isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Editor Form Columns */}
        <div className="lg:col-span-2 space-y-6">
          <form id="product-editor-form" onSubmit={handleSave} className="space-y-6">
            {errors.general && (
              <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {errors.general}
              </div>
            )}

            {/* General Information Card */}
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
                      <span>Product Description</span>
                      <span className={`text-xs ${descLeft < 50 ? "text-amber-500 font-semibold" : "text-zinc-400"}`}>
                        {descLeft} characters remaining
                      </span>
                    </FieldLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 min-h-[120px]"
                      placeholder="Describe styling fits, conditions, size, and wear details..."
                      aria-label="Product Description"
                    />
                    {errors.description && <FieldError className="text-red-400 text-xs mt-1">{errors.description}</FieldError>}
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Pricing & Inventory Cards */}
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
                      {errors.stock && <FieldError className="text-red-400 text-xs mt-1">{errors.stock}</FieldError>}
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>

            {/* Media Gallery Section */}
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

            {/* Bottom Form Actions */}
            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackOrCancel}
                className="text-zinc-500 dark:text-zinc-400"
              >
                Cancel
              </Button>
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

        {/* Live Storefront Preview Column */}
        <div className="space-y-6">
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

          {/* Publish & Organization Card */}
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
                    <SelectTrigger className="w-full h-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
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

                {/* Fixed Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label htmlFor="product-active" className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      disabled={saving}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 accent-zinc-900 dark:accent-zinc-100 size-4 cursor-pointer"
                      id="product-active"
                    />
                    <span className="text-xs md:text-sm text-zinc-800 dark:text-zinc-200 font-medium select-none">
                      Make product active (visible)
                    </span>
                  </label>

                  <label htmlFor="product-featured" className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      disabled={saving}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 accent-zinc-900 dark:accent-zinc-100 size-4 cursor-pointer"
                      id="product-featured"
                    />
                    <span className="text-xs md:text-sm text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5 select-none">
                      Mark as Featured <Sparkles className="size-3.5 text-amber-500 fill-current" />
                    </span>
                  </label>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unsaved Changes Dialog Modal */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              You have unsaved changes to this product. If you leave now, your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-2">
            <AlertDialogCancel
              onClick={() => setShowUnsavedDialog(false)}
              className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Stay & Edit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                router.push("/products");
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4"
            >
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
