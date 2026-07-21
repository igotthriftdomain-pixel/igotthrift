"use client";

import React, { useState, useEffect } from "react";
import { type StorefrontDetails, type HeroBannerSlide } from "../types";
import { MOCK_BANNER_URL } from "../constants";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

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
    <section className="relative min-h-[480px] lg:min-h-[520px] flex items-center justify-center overflow-hidden bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8">
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
                  className="w-full h-full object-cover opacity-45 scale-105"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.url}
                  alt={`${store.name} Hero Slide ${index + 1}`}
                  className="w-full h-full object-cover opacity-40 scale-105"
                />
              )}
            </div>
          );
        })}
        {/* Layered vignette and warm gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-black/30 z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.7)_100%)] z-20" />
      </div>

      <div className="relative z-30 max-w-4xl mx-auto text-center space-y-7 flex flex-col items-center">
        {/* Editorial Pill Chip */}
        <div className="inline-flex items-center gap-2 bg-[#FFBC0A]/10 border border-[#FFBC0A]/30 text-[#FFBC0A] px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs">
          <Sparkles className="size-3.5 text-[#FFBC0A]" />
          <span>Curated Vintage Collection</span>
        </div>

        {/* Store Logo */}
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt={store.name}
            className="size-24 rounded-full object-cover border-4 border-[#0A0A0A] ring-2 ring-[#FFBC0A]/50 shadow-2xl"
          />
        ) : (
          <div className="size-24 rounded-full bg-[#0A0A0A] text-[#FFBC0A] flex items-center justify-center font-black text-3xl border-4 border-[#0A0A0A] ring-2 ring-[#FFBC0A]/50 shadow-2xl uppercase tracking-tighter">
            {store.name.substring(0, 2)}
          </div>
        )}

        {/* Store Name & Description */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#FAF8F3] drop-shadow-lg leading-none">
            {store.name}
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed drop-shadow-sm font-normal max-w-xl mx-auto">
            {store.description || "Discover exclusive vintage fashion drops and handpicked streetwear statement pieces."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="#products-catalog"
            className="inline-flex items-center justify-center rounded-xl bg-[#F36B00] hover:bg-[#e06200] text-white text-xs font-bold uppercase tracking-wider px-8 h-12 transition-all shadow-xl active:scale-95 gap-2 border border-[#F36B00]"
          >
            <span>Explore Collection</span>
            <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Statistics section */}
        {totalProducts !== undefined && totalProducts > 0 && (
          <div className="pt-6 flex justify-center gap-10 border-t border-white/10 w-full max-w-md mt-6">
            <div className="text-center">
              <span className="block text-2xl font-black text-[#FFBC0A]">{totalProducts}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Available Items</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-[#FFBC0A] flex items-center justify-center gap-1">
                100% <ShieldCheck className="size-4 text-[#FFBC0A]" />
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Hand-Curated</span>
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
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex
                    ? "bg-[#FFBC0A] w-7"
                    : "bg-white/30 hover:bg-white/60 w-2"
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
