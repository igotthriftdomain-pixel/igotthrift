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
      <div className="aspect-square w-full rounded-2xl bg-[#F3EFE7] dark:bg-zinc-900 border border-[#E8E2D8] dark:border-zinc-800 flex items-center justify-center text-zinc-300">
        <ShoppingBag className="size-16" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Primary Display Frame with 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#E8E2D8] dark:border-zinc-800 bg-[#F3EFE7] dark:bg-zinc-950 flex items-center justify-center group shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.publicUrl}
          alt={`Product drop view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Carousel overlay arrow triggers (Only if > 1 image) */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity size-9 rounded-full border-[#E8E2D8] bg-white/95 dark:bg-[#0A0A0A]/95 text-[#0A0A0A] dark:text-[#FAF8F3] cursor-pointer shadow-md"
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity size-9 rounded-full border-[#E8E2D8] bg-white/95 dark:bg-[#0A0A0A]/95 text-[#0A0A0A] dark:text-[#FAF8F3] cursor-pointer shadow-md"
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
              className={`relative size-20 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                idx === activeIndex
                  ? "border-[#FFBC0A] ring-2 ring-[#FFBC0A]/40"
                  : "border-[#E8E2D8] dark:border-zinc-800 opacity-70 hover:opacity-100"
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
