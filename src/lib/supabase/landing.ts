import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  categoryImage,
  demoEquipment,
  imageSource,
  localCategories,
  type Equipment,
  type LandingCategory,
  type Testimonial,
} from "../../components/landing/data";

type Row = Record<string, unknown>;
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function getLandingContent() {
  const fallback = {
    categories: localCategories.map((item) => ({
      id: item.name,
      name: item.name,
      description: item.description,
      image: categoryImage(item.name),
    })) as LandingCategory[],
    equipment: demoEquipment.map((item) => ({
      ...item,
      image: `/images/landing/${item.image}.jpg`,
    })),
    testimonials: [] as Testimonial[],
    demo: true,
  };
  const url = process.env.GEARSPHERE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.GEARSPHERE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback;

  // Public content always uses the anonymous key, independent of a visitor's session.
  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }),
    },
  });

  async function read(
    table: string,
    columns: string,
    all = false,
  ): Promise<Row[]> {
    const rows: Row[] = [];
    try {
      for (let offset = 0; ; offset += 100) {
        const query = supabase.from(table).select(columns);
        const { data, error } = await (table === "categories"
          ? query
              .order("name")
              .order("id")
              .range(offset, offset + 99)
          : query
              .order("created_at", { ascending: false })
              .order("id")
              .limit(12));
        if (error) {
          console.warn(
            `[landing] ${table} unavailable (${error.code}); using local fallback.`,
          );
          return [];
        }
        rows.push(...(data as unknown as Row[]));
        if (!all || data.length < 100) return rows;
      }
    } catch {
      console.warn(`[landing] ${table} request failed; using local fallback.`);
      return [];
    }
  }

  const [categories, listings, reviews] = await Promise.all([
    read("categories", "*", true),
    // Optional image/currency fields may be added without breaking older schemas.
    read("listings", "*"),
    read("reviews", "id,comment,rating,created_at"),
  ]);

  const mappedCategories = categories
    .filter((row) => text(row.id) && text(row.name))
    .map((row) => ({
      id: text(row.id),
      name: text(row.name),
      description: text(row.description),
      image: imageSource(
        row.image_url ?? row.image,
        categoryImage(text(row.name)),
      ),
    }));
  const equipment: Equipment[] = listings
    .filter(
      (row) =>
        text(row.id) &&
        text(row.title) &&
        row.price_per_day !== null &&
        row.price_per_day !== undefined &&
        Number.isFinite(Number(row.price_per_day)),
    )
    .map((row) => {
      const category =
        text(row.category_name) ||
        mappedCategories.find((item) => item.id === row.category_id)?.name ||
        "Other";
      return {
        id: text(row.id),
        name: text(row.title),
        category,
        description: text(row.description),
        price: Number(row.price_per_day),
        currency: text(row.currency) || "USD",
        image: imageSource(row.primary_image, categoryImage(category)),
        alt: text(row.title),
        location: [text(row.city), text(row.state)].filter(Boolean).join(", "),
      };
    });
  const testimonials = reviews
    .filter((row) => text(row.comment))
    .slice(0, 3)
    .map((row) => ({
      id: text(row.id),
      name: "GearSphere member",
      role: "Community review",
      initials: "GS",
      quote: text(row.comment),
    }));
  return {
    categories: mappedCategories.length
      ? mappedCategories
      : fallback.categories,
    equipment: equipment.length ? equipment : fallback.equipment,
    testimonials,
    demo: equipment.length === 0,
  };
}
