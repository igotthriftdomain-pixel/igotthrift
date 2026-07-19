"use client";

import { useState } from "react";
import { useCart } from "../../storefront/context/cart-context";
import { type StorefrontDetails } from "../../storefront/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CustomerForm, type CustomerFormErrors } from "./customer-form";
import { OrderSummary } from "./order-summary";
import { type CheckoutDetails } from "../types";
import { checkoutSchema } from "../schema";
import { checkoutAction } from "../actions";
import { toast } from "sonner";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

export function CheckoutSheet({ store }: { store: StorefrontDetails }) {
  const { items, subtotal, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails>({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  const handleFieldChange = (field: keyof CheckoutDetails, val: string) => {
    setDetails((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = checkoutSchema.safeParse(details);
    if (!validation.success) {
      const fieldErrors: CustomerFormErrors = {};
      validation.error.issues.forEach((err) => {
        const path = err.path[0] as keyof CheckoutDetails;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Please correct checkout errors.");
      return;
    }

    setLoading(true);
    try {
      const res = await checkoutAction(store.id, store.slug, details, items);
      if (res.success) {
        toast.success("Order recorded! Opening WhatsApp...");
        clearCart();
        setOpen(false);
        if (typeof window !== "undefined") {
          window.open(res.whatsappUrl, "_blank");
        }
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-green-400"
        aria-label="Proceed to checkout sheet"
      >
        <Send className="size-4 fill-current" />
        <span>Checkout with WhatsApp</span>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-zinc-950 p-0 border-l border-zinc-200 dark:border-zinc-800">
        <SheetHeader className="p-6 border-b border-zinc-150 dark:border-zinc-900 flex flex-row items-center justify-between">
          <div className="space-y-0.5 text-left">
            <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Checkout Details
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400 dark:text-zinc-500">
              Provide delivery details to submit order
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Scrollable form and summary */}
        <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <CustomerForm
              details={details}
              errors={errors}
              onChange={handleFieldChange}
              disabled={loading}
            />

            <OrderSummary
              items={items}
              store={store}
              subtotal={subtotal}
            />
          </div>

          <div className="space-y-2 pt-6">
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full h-11 rounded-xl bg-[var(--store-theme)] hover:bg-[var(--store-theme-hover)] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <Send className="size-4 fill-current" />
                  <span>Confirm Order & Redirect</span>
                </>
              )}
            </Button>

            <SheetClose className="w-full h-11 inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold text-xs tracking-wide cursor-pointer transition-all">
              <ArrowLeft className="size-3.5 mr-1.5" /> Back to Cart
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
