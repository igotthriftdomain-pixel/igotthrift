"use client";

import { useState } from "react";
import { toggleCategoryStatusAction } from "../actions";
import { toast } from "sonner";

export function CategoryStatusToggle({
  categoryId,
  initialActive,
}: {
  categoryId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    const nextActive = !active;

    // Optimistic UI update
    setActive(nextActive);

    try {
      const res = await toggleCategoryStatusAction(categoryId, nextActive);
      if (res.success) {
        toast.success(`Category ${nextActive ? "enabled" : "disabled"}`);
      } else {
        // Rollback
        setActive(active);
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      // Rollback
      setActive(active);
      toast.error("Network error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
      }`}
      role="switch"
      aria-checked={active}
      aria-label="Toggle active status"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-zinc-950 shadow-sm ring-0 transition duration-200 ease-in-out ${
          active ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
