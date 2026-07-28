"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  storagePath: string;
  publicUrl: string;
  displayOrder: number;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-[#F6F6F4] dark:bg-zinc-900 border border-[#E7E7E5] dark:border-zinc-800 flex items-center justify-center text-[#8A8A8A]">
        <ShoppingBag className="size-16" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Primary Display Frame with 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#E7E7E5] dark:border-zinc-800 bg-[#F6F6F4] dark:bg-zinc-950 flex items-center justify-center group shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.publicUrl}
          alt={`Product drop view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Carousel overlay arrow triggers (Only if > 1 image) */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out size-9 rounded-md border-[#E7E7E5] bg-[#0A0A0A] text-white hover:bg-[#171717] active:scale-95 cursor-pointer shadow-xs"
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out size-9 rounded-md border-[#E7E7E5] bg-[#0A0A0A] text-white hover:bg-[#171717] active:scale-95 cursor-pointer shadow-xs"
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails strip (Only if > 1 image) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.storagePath}
              onClick={() => setActiveIndex(idx)}
              className={`relative size-20 shrink-0 rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ease-out ${
                idx === activeIndex
                  ? "border-[#0A0A0A] dark:border-white ring-2 ring-[#0A0A0A] dark:ring-white scale-100"
                  : "border-[#E7E7E5] dark:border-zinc-800 opacity-60 hover:opacity-100 scale-95"
              }`}
              aria-label={`View image thumbnail ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.publicUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

