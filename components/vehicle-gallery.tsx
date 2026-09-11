"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Boxed hero slideshow for the vehicle detail page — a large 16:9 photo
 * within the page's usual content column, with side arrows and a thumbnail
 * strip beneath it.
 */
export function VehicleGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const go = (delta: number) =>
    setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div className="mx-auto max-w-[1320px] px-5 pt-8 sm:px-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-ground">
        {photos.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={`${alt} — foto ${i + 1} de ${photos.length}`}
            fill
            priority={i === 0}
            sizes="(max-width: 1320px) 100vw, 1320px"
            className={
              "object-cover transition-opacity duration-500 ease-out " +
              (i === index ? "opacity-100" : "pointer-events-none opacity-0")
            }
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="tnum absolute bottom-5 right-5 rounded-full bg-black/55 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-md">
              {index + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 pt-4">
          {photos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl outline-2 outline-offset-2 outline-red-hi transition-[opacity,outline-width] " +
                (i === index ? "outline" : "opacity-60 hover:opacity-100")
              }
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
