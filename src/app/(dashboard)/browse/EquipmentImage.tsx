"use client";

import Image, { ImageProps, } from "next/image";

import { useState } from "react";

type Props = Omit<
  ImageProps,
  "src"
> & {
  src: string | null;
};

export default function EquipmentImage({
  src,
  alt,
  ...props
}: Props) {
  const [failed, setFailed] =
    useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            width="18"
            height="18"
            x="3"
            y="3"
            rx="2"
          />

          <circle
            cx="8.5"
            cy="8.5"
            r="1.5"
          />

          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${props.className ?? ""}`}
    />
  );
}