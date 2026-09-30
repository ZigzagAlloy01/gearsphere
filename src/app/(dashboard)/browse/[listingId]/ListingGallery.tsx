"use client";

import { useState } from "react";
import EquipmentImage from "../EquipmentImage";

type GalleryImage = {
    id: string;
    image_url: string;
    display_order: number;
};

type ListingGalleryProps = {
    title: string;
    primaryImage: string | null;
    images: GalleryImage[];
};

export default function ListingGallery({
    title,
    primaryImage,
    images,
}: ListingGalleryProps) {
    const gallery = 
        images.length > 0
            ? images
            : primaryImage
              ? [
                    {
                        id: "primary",
                        image_url: primaryImage,
                        display_order: 0,
                    },
                ]
              : [];

    const [selectedIndex, setSelectedIndex] = useState(0);
    const currentImage = gallery[selectedIndex]?.image_url ?? null;

    function previousImage() {
        if (gallery.length <= 1) return;

        setSelectedIndex((current) =>
            current === 0 ? gallery.length - 1 : current - 1
        );
    }

    function nextImage() {
        if (gallery.length <= 1) return;

        setSelectedIndex((current) =>
            current === gallery.length - 1 ? 0 : current + 1
        );
    }

    return (
        <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-sm sm:aspect-[16/10]">
                {currentImage ? (
                <EquipmentImage
                    src={currentImage}
                    alt={title}
                    fill
                    priority={selectedIndex === 0}
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover"
                    />
                ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <div className="text-center">
                    <svg
                        className="mx-auto"
                        width="48"
                        height="48"
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
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>

                    <p className="mt-3 text-sm font-medium">
                        No images available
                    </p>
                    </div>
                </div>
                )}
                {gallery.length > 1 && (
                <>
                    <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                    >
                    <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    </button>
                    <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                    >
                    <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {selectedIndex + 1} / {gallery.length}
                    </div>
                </>
                )}
            </div>
            {gallery.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((image, index) => (
                    <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl transition ${
                        selectedIndex === index
                        ? "ring-2 ring-slate-900 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    >
                    <div className="relative h-full w-full">
                        <EquipmentImage
                            src={image.image_url}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    </div>
                    </button>
                ))}
                </div>
            )}
            </div>
    );
}