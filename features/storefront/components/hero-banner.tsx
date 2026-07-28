"use client";

import React, { useState, useEffect } from "react";
import { type StorefrontDetails, type HeroBannerSlide } from "../types";
import { MOCK_BANNER_URL } from "../constants";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HeroBanner({
  store,
  totalProducts,
}: {
  store: StorefrontDetails;
  totalProducts?: number;
}) {
  const slides: HeroBannerSlide[] =
    store.heroSlides && store.heroSlides.length > 0
      ? store.heroSlides
      : [
          {
            url: store.bannerUrl || MOCK_BANNER_URL,
            type:
              store.bannerUrl &&
              (store.bannerUrl.endsWith(".mp4") || store.bannerUrl.endsWith(".webm"))
                ? "video"
                : "image",
          },
        ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-slide carousel swap every 6 seconds if multiple slides exist
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative min-h-[500px] lg:min-h-[560px] flex items-center justify-center overflow-hidden bg-[#0A0A0A] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E7E7E5] dark:border-zinc-800">
      {/* Background Media & Editorial Gradient overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={slide.url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {slide.type === "video" ? (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-50 scale-105"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.url}
                  alt={`${store.name} Hero Slide ${index + 1}`}
                  className="w-full h-full object-cover opacity-45 scale-105"
                />
              )}
            </div>
          );
        })}
        {/* Layered vignette and dark gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-black/40 z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.75)_100%)] z-20" />
      </div>

      <div className="relative z-30 max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
        {/* Editorial Pill Chip */}
        <div className="inline-flex items-center gap-2 bg-[#FAF9F7]/10 border border-[#FAF9F7]/25 text-[#FAF9F7] px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur-md">
          <span className="inline-block size-1.5 rounded-full bg-[#FAF9F7]" />
          <span>Curated Drop Collection</span>
        </div>

        {/* Store Logo */}
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt={store.name}
            className="size-24 rounded-full object-cover border-2 border-[#FAF9F7]/30 ring-1 ring-white/10 shadow-2xl"
          />
        ) : (
          <div className="size-24 rounded-full bg-[#171717] text-[#FAF9F7] flex items-center justify-center font-semibold text-2xl border-2 border-[#FAF9F7]/30 ring-1 ring-white/10 shadow-2xl uppercase tracking-wider">
            {store.name.substring(0, 2)}
          </div>
        )}

        {/* Store Name & Description */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF9F7] leading-none break-words max-w-full">
            {store.name}
          </h1>
          <p className="text-[#D4D4D2] text-sm sm:text-base leading-relaxed font-normal max-w-xl mx-auto tracking-wide">
            {store.description || "Discover exclusive vintage fashion drops and handpicked streetwear statement pieces."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="#products-catalog"
            className="inline-flex items-center justify-center rounded-none bg-[#FFFFFF] hover:bg-[#FAF9F7] text-[#0A0A0A] text-xs font-bold uppercase tracking-[0.2em] px-6 sm:px-9 h-12 transition-all shadow-md active:scale-98 gap-2 border border-[#FFFFFF] max-w-full"
          >
            <span>Explore Collection</span>
            <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Statistics section */}
        {totalProducts !== undefined && totalProducts > 0 && (
          <div className="pt-6 flex justify-center gap-12 border-t border-white/15 w-full max-w-md mt-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-[#FAF9F7] tracking-tight">{totalProducts}</span>
              <span className="text-[10px] text-[#8A8A8A] font-medium uppercase tracking-[0.2em]">Available Items</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-[#FAF9F7] tracking-tight flex items-center justify-center gap-1.5">
                100% <ShieldCheck className="size-4 text-[#FAF9F7]" />
              </span>
              <span className="text-[10px] text-[#8A8A8A] font-medium uppercase tracking-[0.2em]">Hand-Curated</span>
            </div>
          </div>
        )}

        {/* Slide Swap Indicator Dots */}
        {slides.length > 1 && (
          <div className="pt-3 flex justify-center items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex
                    ? "bg-[#FAF9F7] w-6"
                    : "bg-white/30 hover:bg-white/60 w-1.5"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

