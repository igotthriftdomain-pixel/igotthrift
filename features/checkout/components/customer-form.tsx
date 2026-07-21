"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type CheckoutDetails } from "../types";

export interface CustomerFormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

interface CustomerFormProps {
  details: CheckoutDetails;
  errors: CustomerFormErrors;
  onChange: (field: keyof CheckoutDetails, val: string) => void;
  disabled?: boolean;
}

export function CustomerForm({ details, errors, onChange, disabled }: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-left">
        <Label htmlFor="name" className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF8F3]">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          value={details.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Alex Sharma"
          disabled={disabled}
          className="h-10 bg-white dark:bg-zinc-900 border-[#E8E2D8] dark:border-zinc-800 text-[#0A0A0A] dark:text-[#FAF8F3] text-sm focus:border-[#FFBC0A]"
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-semibold" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="phone" className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF8F3]">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={details.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="e.g. 9876543210"
          disabled={disabled}
          className="h-10 bg-white dark:bg-zinc-900 border-[#E8E2D8] dark:border-zinc-800 text-[#0A0A0A] dark:text-[#FAF8F3] text-sm focus:border-[#FFBC0A]"
        />
        {errors.phone && (
          <p className="text-xs text-red-500 font-semibold" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="address" className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF8F3]">
          Delivery Address
        </Label>
        <Textarea
          id="address"
          value={details.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Enter complete house no., street name, landmark, pin code..."
          disabled={disabled}
          rows={3}
          className="bg-white dark:bg-zinc-900 border-[#E8E2D8] dark:border-zinc-800 text-[#0A0A0A] dark:text-[#FAF8F3] text-sm focus:border-[#FFBC0A]"
        />
        {errors.address && (
          <p className="text-xs text-red-500 font-semibold" role="alert">
            {errors.address}
          </p>
        )}
      </div>
    </div>
  );
}
