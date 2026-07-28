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
        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] dark:text-[#FAF9F7]">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          value={details.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Alex Sharma"
          disabled={disabled}
          className="h-10 bg-[#FFFFFF] dark:bg-zinc-900 border-[#E7E7E5] dark:border-zinc-800 text-[#111111] dark:text-[#FAF9F7] text-sm focus:border-[#0A0A0A] rounded-none"
        />
        {errors.name && (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] dark:text-[#FAF9F7]">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={details.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="e.g. 9876543210"
          disabled={disabled}
          className="h-10 bg-[#FFFFFF] dark:bg-[#FAF9F7] border-[#E7E7E5] dark:border-zinc-800 text-[#111111] dark:text-[#FAF9F7] text-sm focus:border-[#0A0A0A] rounded-none"
        />
        {errors.phone && (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] dark:text-[#FAF9F7]">
          Delivery Address
        </Label>
        <Textarea
          id="address"
          value={details.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Enter complete house no., street name, landmark, pin code..."
          disabled={disabled}
          rows={3}
          className="bg-[#FFFFFF] dark:bg-zinc-900 border-[#E7E7E5] dark:border-zinc-800 text-[#111111] dark:text-[#FAF9F7] text-sm focus:border-[#0A0A0A] rounded-none"
        />
        {errors.address && (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {errors.address}
          </p>
        )}
      </div>
    </div>
  );
}

