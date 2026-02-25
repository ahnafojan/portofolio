"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { SanityImage } from "@/lib/types";

interface ProjectImageCarouselProps {
  images: SanityImage[];
  title: string;
}

function getImageAspectRatio(image: SanityImage) {
  const ref = image.asset?._ref ?? "";
  const match = ref.match(/-(\d+)x(\d+)-/);
  if (!match) return 16 / 9;

  const width = Number.parseInt(match[1] ?? "", 10);
  const height = Number.parseInt(match[2] ?? "", 10);
  if (!width || !height) return 16 / 9;
  return width / height;
}

export default function ProjectImageCarousel({ images, title }: ProjectImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length > 1;
  const ratios = useMemo(() => images.map((image) => getImageAspectRatio(image)), [images]);
  const activeRatio = ratios[activeIndex] ?? 16 / 9;
  const [frameWidth, setFrameWidth] = useState(0);
  const dynamicHeight = frameWidth > 0 ? frameWidth / activeRatio : 0;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const update = () => {
      setFrameWidth(frame.clientWidth);
    };

    update();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setFrameWidth(entry.contentRect.width);
    });

    observer.observe(frame);
    window.addEventListener("orientationchange", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const prev = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-hidden"
      style={{
        ...(dynamicHeight > 0
          ? {
              height: `${dynamicHeight}px`,
              transition: "height 420ms cubic-bezier(0.16,1,0.3,1)",
            }
          : {
              aspectRatio: `${activeRatio}`,
            }),
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (!hasMultiple || touchStartX.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 40) return;
        if (delta < 0) next();
        if (delta > 0) prev();
      }}
      onTouchCancel={() => {
        touchStartX.current = null;
      }}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={image.asset?._ref ?? `${title}-${index}`}
            className="relative h-full w-full shrink-0 bg-[#07070f]"
          >
            <Image
              src={urlFor(image).auto("format").fit("max").width(1600).url()}
              alt={`${title} preview ${index + 1}`}
              fill
              className="object-contain p-2 sm:p-3"
              sizes="(max-width: 768px) 100vw, 1200px"
              unoptimized
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={prev}
            className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              color: "#ede9fe",
              background: "rgba(0,0,0,0.58)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={next}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              color: "#ede9fe",
              background: "rgba(0,0,0,0.58)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_image, index) => (
              <button
                key={`${title}-image-dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: activeIndex === index ? "18px" : "8px",
                  background: activeIndex === index ? "#a78bfa" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
