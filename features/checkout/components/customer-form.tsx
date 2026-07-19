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
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={details.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. John Doe"
          disabled={disabled}
          className="h-10"
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-semibold" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={details.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="e.g. 9876543210"
          disabled={disabled}
          className="h-10"
        />
        {errors.phone && (
          <p className="text-xs text-red-500 font-semibold" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="address">Delivery Address</Label>
        <Textarea
          id="address"
          value={details.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Enter full street, landmark, pin code..."
          disabled={disabled}
          rows={3}
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
