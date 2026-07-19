"use client";

import { useState } from "react";
import { deleteCategoryAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await deleteCategoryAction(categoryId);
      if (res.success) {
        toast.success("Category deleted successfully");
        onOpenChange(false);
      } else {
        setErrorMessage(res.error || "Failed to delete category");
      }
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">Delete Category</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
            Are you sure you want to delete the category <span className="font-semibold text-zinc-900 dark:text-zinc-100">&ldquo;{categoryName}&rdquo;</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg flex gap-2 items-start mt-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            disabled={loading}
            className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {loading ? "Deleting..." : "Delete Category"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
