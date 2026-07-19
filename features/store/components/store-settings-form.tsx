"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Store } from "../types";
import {
  updateStoreSettingsAction,
  uploadLogoAction,
  uploadBannerAction,
  removeLogoAction,
  removeBannerAction,
} from "../actions";
import { CHARACTER_LIMITS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import {
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Eye,
  AlertTriangle,
} from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface StoreSettingsFormProps {
  initialStore: Store;
  initialLogoUrl: string | null;
  initialBannerUrl: string | null;
}

export function StoreSettingsForm({
  initialStore,
  initialLogoUrl,
  initialBannerUrl,
}: StoreSettingsFormProps) {
  const router = useRouter();

  // Core Store Fields State
  const [name, setName] = useState(initialStore.name);
  const [description, setDescription] = useState(initialStore.description || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialStore.whatsapp_number);
  const [address, setAddress] = useState(initialStore.address || "");
  const [themeColor, setThemeColor] = useState(initialStore.theme_color);
  const [currencyCode, setCurrencyCode] = useState(initialStore.currency_code);
  const [currencySymbol, setCurrencySymbol] = useState(initialStore.currency_symbol);
  const [website, setWebsite] = useState(initialStore.website || "");
  const [instagram, setInstagram] = useState(initialStore.instagram || "");
  const [facebook, setFacebook] = useState(initialStore.facebook || "");

  // Image Upload / Preview States
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialBannerUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Form Submission / Saving States
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // File Inputs references
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Derived unsaved changes dirty state detection
  const isDirty =
    name !== initialStore.name ||
    description !== (initialStore.description || "") ||
    whatsappNumber !== initialStore.whatsapp_number ||
    address !== (initialStore.address || "") ||
    themeColor !== initialStore.theme_color ||
    currencyCode !== initialStore.currency_code ||
    currencySymbol !== initialStore.currency_symbol ||
    website !== (initialStore.website || "") ||
    instagram !== (initialStore.instagram || "") ||
    facebook !== (initialStore.facebook || "");

  // Unsaved changes browser-unload hook
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

  // Sync color picker inputs
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThemeColor(e.target.value);
  };

  // Image File Validations
  const validateFile = (file: File): boolean => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file format. Please upload PNG, JPG, JPEG, or WEBP.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum allowed size is 5MB.");
      return false;
    }
    return true;
  };

  // Upload Handlers
  const handleLogoUpload = async (file: File) => {
    if (!validateFile(file)) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadLogoAction(formData);
      if (res.success) {
        setLogoPreview(URL.createObjectURL(file));
        toast.success("Logo uploaded successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Logo upload failed");
      }
    } catch {
      toast.error("Logo upload failed due to network error");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!validateFile(file)) return;
    setBannerUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadBannerAction(formData);
      if (res.success) {
        setBannerPreview(URL.createObjectURL(file));
        toast.success("Banner uploaded successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Banner upload failed");
      }
    } catch {
      toast.error("Banner upload failed due to network error");
    } finally {
      setBannerUploading(false);
    }
  };

  // Remove Image Handlers
  const handleRemoveLogo = async () => {
    setLogoUploading(true);
    try {
      const res = await removeLogoAction();
      if (res.success) {
        setLogoPreview(null);
        toast.success("Logo removed");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove logo");
      }
    } catch {
      toast.error("Network error removing logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setBannerUploading(true);
    try {
      const res = await removeBannerAction();
      if (res.success) {
        setBannerPreview(null);
        toast.success("Banner removed");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove banner");
      }
    } catch {
      toast.error("Network error removing banner");
    } finally {
      setBannerUploading(false);
    }
  };

  // Drag and Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerUpload(file);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const res = await updateStoreSettingsAction({
        name,
        description,
        whatsapp_number: whatsappNumber,
        address,
        theme_color: themeColor,
        currency_code: currencyCode,
        currency_symbol: currencySymbol,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        meta_title: initialStore.meta_title || null,
        meta_description: initialStore.meta_description || null,
      });

      if (res.success) {
        toast.success("Store settings updated successfully");
        router.refresh();
      } else {
        setErrors({ general: res.error || "Validation failed" });
        toast.error(res.error || "Update failed");
      }
    } catch {
      toast.error("Update failed due to network error");
    } finally {
      setSaving(false);
    }
  };

  // Character counters limits check
  const descCharsLeft = CHARACTER_LIMITS.description - description.length;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Settings Form Column */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">General Shop Information</CardTitle>
              <CardDescription>Configure the basic storefront metadata settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.general && (
                <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  {errors.general}
                </div>
              )}

              <FieldGroup className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Store Name</FieldLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      aria-label="Store Name"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                      Store Slug <span className="text-xs text-zinc-400 font-normal">(Read-only)</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      value={initialStore.slug}
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
                      aria-label="Store Slug"
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      Updating the store slug is disabled after initial registration.
                    </p>
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex justify-between items-center">
                    <span>Store Description</span>
                    <span
                      className={`text-xs ${
                        descCharsLeft < 15 ? "text-amber-500 font-semibold" : "text-zinc-400"
                      }`}
                    >
                      {descCharsLeft} characters remaining
                    </span>
                  </FieldLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 min-h-[80px]"
                    aria-label="Store Description"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field className="md:col-span-1">
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">WhatsApp Number</FieldLabel>
                    <Input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="+919876543210"
                      aria-label="WhatsApp Number"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Currency Symbol</FieldLabel>
                    <Input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="₹"
                      aria-label="Currency Symbol"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Currency Code</FieldLabel>
                    <Input
                      type="text"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="INR"
                      aria-label="Currency Code"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Address</FieldLabel>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                    aria-label="Address"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Style Customizer */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Theme Styling</CardTitle>
              <CardDescription>Customize the core palette of the storefront catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Primary Accent Color</FieldLabel>
                <div className="flex gap-3 items-center">
                  <div className="relative size-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={handleColorChange}
                      disabled={saving}
                      className="absolute inset-0 size-full cursor-pointer p-0 border-0"
                      aria-label="Color Picker"
                    />
                  </div>
                  <Input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    disabled={saving}
                    placeholder="#000000"
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 w-36 uppercase font-mono"
                    aria-label="Color Hex Input"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Social & Links integrations</CardTitle>
              <CardDescription>Link social accounts to display in the header/footer of the store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-2">
                    <Globe className="size-4 text-zinc-400" />
                    Website Link
                  </FieldLabel>
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                    placeholder="https://yourdomain.com"
                    aria-label="Website Link"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-2">
                      <InstagramIcon className="size-4 text-zinc-400" />
                      Instagram Username
                    </FieldLabel>
                    <Input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="yourstore"
                      aria-label="Instagram Handle"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-2">
                      <FacebookIcon className="size-4 text-zinc-400" />
                      Facebook Handle
                    </FieldLabel>
                    <Input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      disabled={saving}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                      placeholder="yourstore"
                      aria-label="Facebook Handle"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>


          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-6"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>

      {/* Media Upload & Previews Sidebar Column */}
      <div className="space-y-6">
        {/* Logo Upload Card */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
          {logoUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-15">
              <div className="text-xs text-white font-medium bg-zinc-900/90 py-1.5 px-3 border border-zinc-800 rounded-lg">
                Uploading Logo...
              </div>
            </div>
          )}
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" /> Store Logo
            </CardTitle>
            <CardDescription>Brand identifier displayed on product items and headers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
              className="hidden"
              accept="image/*"
            />

            <div
              onDragOver={handleDragOver}
              onDrop={handleLogoDrop}
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/20"
            >
              {logoPreview ? (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="size-20 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Store logo preview" className="max-h-full object-contain" />
                  </div>
                  <span className="text-xs text-zinc-500">Drag a file here or click to replace</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto size-10 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <UploadCloud className="size-5 text-zinc-400" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Upload store logo</span>
                    <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, JPEG or WEBP (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {logoPreview && (
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="bg-transparent text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900 text-xs"
                >
                  Replace Logo
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="bg-red-950/20 text-red-400 border border-red-950/50 hover:bg-red-950/50 text-xs gap-1.5"
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banner Upload Card */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
          {bannerUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-15">
              <div className="text-xs text-white font-medium bg-zinc-900/90 py-1.5 px-3 border border-zinc-800 rounded-lg">
                Uploading Banner...
              </div>
            </div>
          )}
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ImageIcon className="size-4 text-indigo-500" /> Hero Banner
            </CardTitle>
            <CardDescription>Hero element graphic displayed at the top of the storefront</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={bannerInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBannerUpload(file);
              }}
              className="hidden"
              accept="image/*"
            />

            <div
              onDragOver={handleDragOver}
              onDrop={handleBannerDrop}
              onClick={() => bannerInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/20"
            >
              {bannerPreview ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerPreview} alt="Store banner preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-zinc-500">Drag banner here or click to replace</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto size-10 rounded-full bg-zinc-100 dark:bg-zinc-855 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <UploadCloud className="size-5 text-zinc-400" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Upload store banner</span>
                    <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, JPEG or WEBP (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {bannerPreview && (
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                  className="bg-transparent text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900 text-xs"
                >
                  Replace Banner
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveBanner}
                  className="bg-red-950/20 text-red-400 border border-red-950/50 hover:bg-red-950/50 text-xs gap-1.5"
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Theme Preview Card */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Eye className="size-4 text-emerald-500" /> Live Theme Accent Preview
            </CardTitle>
            <CardDescription>How the theme color will style checkout buttons and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 space-y-3">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold">Simulated Button</span>
              <button
                type="button"
                className="w-full h-9 rounded-lg font-semibold text-xs transition-all shadow-xs cursor-default pointer-events-none"
                style={{
                  backgroundColor: themeColor,
                  color: "#ffffff",
                }}
              >
                Order on WhatsApp
              </button>

              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold mt-2">Active Link Accent</span>
              <span
                className="text-xs font-semibold cursor-default hover:underline transition-colors block"
                style={{ color: themeColor }}
              >
                View Category Catalog →
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
