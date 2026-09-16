"use client";

import LandingImage from "./LandingImage";
import { useRef, useState } from "react";
import Icon from "./Icon";
import { useCatalog } from "./catalog";
import { categoryImage, formatPrice, type Equipment, type LandingCategory } from "./data";
import styles from "./landing.module.css";

export default function FeatureEquipment({
  equipment, categories, demo,
}: {
  equipment: Equipment[];
  categories: LandingCategory[];
  demo: boolean;
}) {
  const { category, setCategory } = useCatalog();
  const [selected, setSelected] = useState<Equipment | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const visibleEquipment = equipment.filter(
    (item) => category === "All equipment" || item.category === category,
  );
  const visibleFilters = [...new Set(["All equipment", ...categories.map(item => item.name), ...equipment.map(item => item.category)])];

  function openDetails(item: Equipment) {
    setSelected(item);
    dialog.current?.showModal();
  }

  return (
    <section
      id="equipment"
      className={`${styles.container} ${styles.section}`}
      aria-labelledby="equipment-heading"
    >
      <p className={styles.eyebrow}>Find your next great rental</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="equipment-heading" className={styles.heading}>
            Latest Equipment
          </h2>
          <p className={styles.description}>
            A little inspiration for your next project or adventure.
          </p>
        </div>
        {demo && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
          Demo collection
        </span>}
      </div>
      <div
        className="mt-7 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter equipment by category"
      >
        {visibleFilters.map((filter) => (
          <button
            key={filter}
            className={styles.filter}
            aria-pressed={category === filter}
            onClick={() => setCategory(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {visibleEquipment.length} listings shown for {category}.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleEquipment.map((item) => (
          <article key={item.id} className={styles.equipmentCard}>
            <div className="relative aspect-[1.4] overflow-hidden bg-slate-100">
              <LandingImage
                src={item.image}
                fallback={categoryImage(item.category)}
                alt={item.alt}
                fill
                sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 285px"
              />
              <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-primary">
                {item.category}
              </span>
            </div>
            <div className="p-5">
              {item.rating && <div className="flex items-center gap-1.5 text-xs">
                <Icon
                  name="star"
                  width={13}
                  height={13}
                  className="fill-accent text-accent"
                />
                <span className="font-semibold">{item.rating}</span>
                <span className="text-slate-500">{demo ? "Sample rating" : "Rating"}</span>
              </div>}
              <h3 className="mt-3 text-[15px] font-semibold tracking-tight">
                {item.name}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                {item.location || "For your next big thing."}
              </p>
              <div className="mt-5 flex items-baseline gap-1 border-t border-slate-100 pt-4">
                <span className="text-2xl font-semibold tracking-tight">
                  {formatPrice(item.price, item.currency)}
                </span>
                <span className="text-xs text-slate-500">/ day</span>
              </div>
              <button
                onClick={() => openDetails(item)}
                aria-label={`View details for ${item.name}`}
                className={`${styles.button} ${styles.secondary} mt-4 w-full !min-h-10 !py-2.5`}
              >
                View Details
                <Icon name="arrow" width={15} height={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {visibleEquipment.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <span className={`${styles.iconBox} mx-auto`}>
            <Icon name="box" />
          </span>
          <h3 className="mt-4 font-semibold">
            More possibilities on the horizon.
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no {category.toLowerCase()} listings to display yet.
          </p>
          <button
            onClick={() => setCategory("All equipment")}
            className={`${styles.button} ${styles.primary} mt-5`}
          >
            Explore all equipment
            <Icon name="arrow" width={16} height={16} />
          </button>
        </div>
      )}
      {demo && <p className="mt-5 text-xs leading-relaxed text-slate-500">
        An example of what you can discover. Listings, photos, prices, and
        ratings are illustrative; these items are not available to book.
      </p>}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="equipment-detail-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {selected && (
          <>
            <div className="relative aspect-[1.8] overflow-hidden bg-slate-100">
              <LandingImage
                src={selected.image}
                fallback={categoryImage(selected.category)}
                alt={selected.alt}
                fill
                sizes="520px"
                className="object-cover"
              />
              <button
                autoFocus
                onClick={() => dialog.current?.close()}
                aria-label="Close equipment details"
                className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white text-slate-900 shadow-sm"
              >
                <Icon name="close" width={20} height={20} />
              </button>
            </div>
            <div className="p-7">
              <p className={styles.eyebrow}>
                {selected.category}{demo ? " / Demo listing" : ""}
              </p>
              <h2
                id="equipment-detail-title"
                className="mt-3 text-2xl font-semibold tracking-tight"
              >
                {selected.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {selected.description}
              </p>
              <p className="mt-6 text-2xl font-semibold">
                {formatPrice(selected.price, selected.currency)}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  / day{demo ? " / example price" : ""}
                </span>
              </p>
              {demo && <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                This is a preview of an equipment listing. The photo,
                rating, and price are illustrative. Booking is not
                available for demo equipment.
              </p>}
              <button
                onClick={() => dialog.current?.close()}
                className={`${styles.button} ${styles.primary} mt-5 w-full`}
              >
                Continue exploring
                <Icon name="arrow" width={17} height={17} />
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
