"use client";


import { type ProductWithCategoryAndImages } from "../types";
import { deleteProductAction } from "../actions";
import { useRouter } from "next/navigation";
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
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit2, Trash2, MoreHorizontal, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ProductsTableProps {
  products: ProductWithCategoryAndImages[];
  currencySymbol: string;
}

export function ProductsTable({ products, currencySymbol }: ProductsTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(productId);
    try {
      const res = await deleteProductAction(productId);
      if (res.success) {
        toast.success("Product soft-deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    } catch {
      toast.error("Network error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (product: ProductWithCategoryAndImages) => {
    if (!product.active) return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
    const isScheduled = product.published_at && new Date(product.published_at) > new Date();
    if (isScheduled) return <Badge className="bg-blue-600 text-white border-0 text-[10px]">Scheduled</Badge>;
    return <Badge className="bg-emerald-600 text-white border-0 text-[10px]">Published</Badge>;
  };

  const getPrimaryImage = (product: ProductWithCategoryAndImages) => {
    const primary = product.product_images?.find((img) => img.is_primary);
    return primary ? primary.publicUrl : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-950 shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <TableRow>
            <TableHead className="w-16">Item</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Product Name</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Category</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Price</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Compare Price</TableHead>
            <TableHead className="text-zinc-500 font-semibold text-center w-20">Stock</TableHead>
            <TableHead className="text-zinc-500 font-semibold text-center w-20">Featured</TableHead>
            <TableHead className="text-zinc-500 font-semibold text-center w-24">Status</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Created</TableHead>
            <TableHead className="text-zinc-500 font-semibold">Updated</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const primaryUrl = getPrimaryImage(product);
            return (
              <TableRow key={product.id} className="border-zinc-150 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                <TableCell className="py-2.5">
                  <div className="size-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {primaryUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={primaryUrl} alt={product.name} className="size-full object-cover" />
                    ) : (
                      <ShoppingBag className="size-4 text-zinc-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-50 py-2.5">{product.name}</TableCell>
                <TableCell className="text-zinc-500 py-2.5">{product.categories?.name || "—"}</TableCell>
                <TableCell className="font-bold py-2.5">{currencySymbol}{product.price.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-zinc-400 line-through py-2.5">
                  {product.compare_at_price ? `${currencySymbol}${product.compare_at_price.toLocaleString("en-IN")}` : "—"}
                </TableCell>
                <TableCell className="text-center font-mono text-zinc-800 dark:text-zinc-300 py-2.5">{product.stock ?? product.stock_quantity ?? 0}</TableCell>
                <TableCell className="text-center py-2.5">
                  {product.featured && <Star className="size-4 text-amber-500 fill-current mx-auto" />}
                </TableCell>
                <TableCell className="text-center py-2.5">{getStatusBadge(product)}</TableCell>
                <TableCell className="text-zinc-500 text-xs py-2.5">{formatDate(product.created_at)}</TableCell>
                <TableCell className="text-zinc-500 text-xs py-2.5">{formatDate(product.updated_at)}</TableCell>
                <TableCell className="py-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "cursor-pointer size-8")}
                      aria-label="Open Actions Menu"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                      <DropdownMenuItem
                        onClick={() => router.push(`/products/${product.id}/edit`)}
                        className="cursor-pointer flex gap-2 items-center text-xs"
                      >
                        <Edit2 className="size-3.5 text-zinc-400" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="cursor-pointer flex gap-2 items-center text-xs text-red-600 hover:text-red-700 hover:bg-red-550 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
