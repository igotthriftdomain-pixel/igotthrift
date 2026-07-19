"use client";

import { useState } from "react";
import { type Category } from "../types";
import { updateCategoriesOrderAction } from "../actions";
import { CategoryStatusToggle } from "./category-status-toggle";
import { CategoryDialog } from "./category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface CategoryTableProps {
  categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>(undefined);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[nextIndex];
    newCategories[nextIndex] = temp;

    const orderedIds = newCategories.map((c) => c.id);

    try {
      const res = await updateCategoriesOrderAction(orderedIds);
      if (res.success) {
        toast.success("Sort order updated successfully");
      } else {
        toast.error(res.error || "Failed to update sorting");
      }
    } catch {
      toast.error("Network error updating sort order");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <TableRow>
            <TableHead className="w-20 text-zinc-500 font-semibold">Order</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Name</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Slug</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Description</TableHead>
            <TableHead className="text-zinc-500 font-semibold w-24 text-center">Status</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Created</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Updated</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id} className="border-zinc-150 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
              <TableCell className="py-3">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    aria-label="Move Up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === categories.length - 1}
                    onClick={() => handleMove(index, "down")}
                    aria-label="Move Down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-zinc-50 py-3">{category.name}</TableCell>
              <TableCell className="font-mono text-xs text-zinc-500 py-3">/{category.slug}</TableCell>
              <TableCell className="text-zinc-500 max-w-[200px] truncate py-3" title={category.description || ""}>
                {category.description || "—"}
              </TableCell>
              <TableCell className="text-center py-3">
                <CategoryStatusToggle categoryId={category.id} initialActive={category.active} />
              </TableCell>
              <TableCell className="text-zinc-500 text-xs py-3">{formatDate(category.created_at)}</TableCell>
              <TableCell className="text-zinc-500 text-xs py-3">{formatDate(category.updated_at)}</TableCell>
              <TableCell className="py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "cursor-pointer")}
                    aria-label="Open Actions Menu"
                  >
                    <MoreHorizontal className="size-4 text-zinc-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <DropdownMenuItem
                      onClick={() => setEditingCategory(category)}
                      className="cursor-pointer flex gap-2 items-center text-xs"
                    >
                      <Edit2 className="size-3.5 text-zinc-400" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingCategory(category)}
                      className="cursor-pointer flex gap-2 items-center text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Editing dialog mount */}
      {editingCategory && (
        <CategoryDialog
          category={editingCategory}
          open={editingCategory !== undefined}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(undefined);
          }}
        />
      )}

      {/* Deleting confirmation dialog mount */}
      {deletingCategory && (
        <DeleteCategoryDialog
          categoryId={deletingCategory.id}
          categoryName={deletingCategory.name}
          open={deletingCategory !== undefined}
          onOpenChange={(open) => {
            if (!open) setDeletingCategory(undefined);
          }}
        />
      )}
    </div>
  );
}
