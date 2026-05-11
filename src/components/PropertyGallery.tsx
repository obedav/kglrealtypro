"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? 0 : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? 0 : (i + 1) % images.length)),
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, close, prev, next]);

  if (images.length === 0) return null;

  const strip = images.slice(1, 5);
  const moreCount = images.length > 5 ? images.length - 5 : 0;

  return (
    <>
      {/* Main image */}
      <button
        type="button"
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setLightbox(0)}
        aria-label={`View full gallery — ${images.length} photos`}
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={images[0]}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
        </div>
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            1 / {images.length}
          </span>
        )}
      </button>

      {/* Thumbnail strip */}
      {strip.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {strip.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightbox(i + 1)}
              className="relative aspect-square overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Photo ${i + 2}`}
            >
              <Image
                src={src}
                alt={`${title} — photo ${i + 2}`}
                fill
                className="object-cover transition-opacity hover:opacity-85"
                sizes="25vw"
              />
              {i === 3 && moreCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                  +{moreCount}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property photo gallery"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={22} />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[85vh] w-[92vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox]}
              alt={`${title} — photo ${lightbox + 1} of ${images.length}`}
              fill
              priority
              className="object-contain"
              sizes="92vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
