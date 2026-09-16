"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { imageSource } from "./data";

export default function LandingImage({ src, fallback, alt, ...props }: Omit<ImageProps, "src"> & { src: string; fallback: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const source = failed === src ? fallback : imageSource(src, fallback);
  return <Image {...props} alt={alt} src={source} unoptimized={source.startsWith("http")} onError={() => setFailed(src)} />;
}
