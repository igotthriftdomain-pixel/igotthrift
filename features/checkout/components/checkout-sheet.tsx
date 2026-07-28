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
import { Send, ArrowLeft, Loader2, MessageSquareCode } from "lucide-react";

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
      toast.error(validation.error.issues[0]?.message || "Please fill in all required checkout fields.");
      return;
    }

    // Open tab synchronously in response to user click to prevent desktop pop-up blockers from dropping recipient URL query parameters
    const targetTab = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    setLoading(true);
    try {
      const res = await checkoutAction(store.id, store.slug, details, items);
      if (res.success) {
        toast.success("Order recorded! Opening WhatsApp...");
        clearCart();
        setOpen(false);

        if (targetTab) {
          targetTab.location.href = res.whatsappUrl;
        } else if (typeof window !== "undefined") {
          window.location.href = res.whatsappUrl;
        }
      } else {
        if (targetTab) targetTab.close();
        toast.error(res.error);
      }
    } catch (err) {
      if (targetTab) targetTab.close();
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="w-full h-12 inline-flex items-center justify-center rounded-none bg-[#0A0A0A] hover:bg-[#171717] text-white dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-zinc-200 font-semibold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden active:scale-98"
        aria-label="Proceed to checkout sheet"
      >
        <MessageSquareCode className="size-4" />
        <span>Checkout with WhatsApp</span>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-[#FAF9F7] dark:bg-[#0A0A0A] p-0 border-l border-[#E7E7E5] dark:border-zinc-800">
        <SheetHeader className="p-6 border-b border-[#E7E7E5] dark:border-zinc-800 bg-[#FFFFFF] dark:bg-zinc-950 flex flex-row items-center justify-between">
          <div className="space-y-0.5 text-left">
            <SheetTitle className="text-base font-bold text-[#111111] dark:text-[#FAF9F7] uppercase tracking-[0.15em]">
              Customer Details
            </SheetTitle>
            <SheetDescription className="text-xs text-[#666666] font-normal tracking-wide">
              Provide delivery details to submit your WhatsApp order
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

          <div className="space-y-2.5 pt-6 border-t border-[#E7E7E5] dark:border-zinc-800">
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full h-12 rounded-none bg-[#0A0A0A] hover:bg-[#171717] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-[#0A0A0A] font-semibold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Send className="size-4 fill-current" />
                  <span>Confirm Order & Open WhatsApp</span>
                </>
              )}
            </Button>

            <SheetClose className="w-full h-10 inline-flex items-center justify-center rounded-none border border-[#E7E7E5] dark:border-zinc-800 text-[#111111] dark:text-zinc-300 bg-[#FFFFFF] dark:bg-zinc-900 hover:bg-[#F6F6F4] dark:hover:bg-zinc-800 font-semibold text-xs uppercase tracking-[0.15em] cursor-pointer transition-all">
              <ArrowLeft className="size-3.5 mr-1.5" /> Back to Cart
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

