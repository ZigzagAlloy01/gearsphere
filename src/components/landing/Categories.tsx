"use client";

import LandingImage from "./LandingImage";
import Icon from "./Icon";
import { useCatalog } from "./catalog";
import { categoryImage, type LandingCategory } from "./data";
import styles from "./landing.module.css";

export default function Categories({ categories }: { categories: LandingCategory[] }) {
  const { setCategory } = useCatalog();
  return (
    <section
      id="categories"
      className={`${styles.container} ${styles.section}`}
      aria-labelledby="categories-heading"
    >
      <p className={styles.eyebrow}>A world of possibilities</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="categories-heading" className={styles.heading}>
            The gear for whatever comes next.
          </h2>
          <p className={styles.description}>
            Explore equipment for work, projects, events, and a little
            adventure.
          </p>
        </div>
        <a
          href="#equipment"
          onClick={() => setCategory("All equipment")}
          className={styles.textLink}
        >
          Explore All Categories
          <Icon name="arrow" width={17} height={17} />
        </a>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((category) => (
          <a
            key={category.id}
            href="#equipment"
            aria-label={`Explore ${category.name}: ${category.description}`}
            onClick={() => setCategory(category.name)}
            className={styles.categoryCard}
          >
            <div className="relative aspect-[1.2] overflow-hidden bg-slate-100">
              <LandingImage
                src={category.image}
                fallback={categoryImage(category.name)}
                alt=""
                fill
                sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 190px"
              />
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              <h3 className="text-[13px] font-semibold">{category.name}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                {category.description}
              </p>
              <Icon
                name="arrow"
                width={17}
                height={17}
                className="mt-4 ml-auto text-primary"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
