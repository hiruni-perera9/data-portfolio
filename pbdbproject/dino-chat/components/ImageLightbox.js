"use client";

import Image from "next/image";

export default function ImageLightbox({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-15 text-white/90 hover:text-white text-md px-3 py-1 rounded-full bg-slate-100/20 border border-white/20"
        >✕</button>

        {/* Main Image */}
        <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden">
          <Image
            src={image.url}
            alt={image.title || "Dinosaur image"}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 800px, 100vw"
          />
        </div>

        {/* Caption */}
        <div className="mt-3 text-sm text-white/70">
          <div className="font-medium">{image.title || "Dinosaur image"}</div>
          <div className="text-xs text-white/50">
            Source: {image.source || "Wikimedia Commons"}
          </div>
        </div>
      </div>
    </div>
  );
}
