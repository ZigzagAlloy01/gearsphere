export const localCategories = [
  {
    name: "Construction",
    image: "construction",
    description: "Build something bigger.",
    detail: "Equipment for building and site projects.",
  },
  {
    name: "Photography",
    image: "camera",
    description: "Capture every moment.",
    detail: "Cameras, lenses, and lighting equipment.",
  },
  {
    name: "Events",
    image: "events",
    description: "Make it memorable.",
    detail: "Equipment for gatherings and outdoor adventures.",
  },
  {
    name: "Tools",
    image: "tools",
    description: "Bring your ideas to life.",
    detail: "Power tools, hand tools, and workshop essentials.",
  },
  {
    name: "Agriculture",
    image: "agriculture",
    description: "Grow your possibilities.",
    detail: "Equipment and machinery for agricultural work.",
  },
  {
    name: "Electronics",
    image: "speaker",
    description: "Stay connected.",
    detail: "Speakers, projectors, and electronic equipment.",
  },
] as const;

export type Category = string;
export type Equipment = {
  id: string;
  name: string;
  category: Category;
  image: string;
  alt: string;
  rating?: string;
  price: number;
  description: string;
  currency?: string;
  location?: string;
};

// Demonstration content only. Replace this array with marketplace data when available.
export const demoEquipment: Equipment[] = [
  {
    id: "camera",
    name: "Mirrorless Camera Kit",
    category: "Photography",
    image: "camera",
    alt: "Sony mirrorless camera with interchangeable lenses",
    rating: "4.8",
    price: 25,
    description:
      "Capture your next project with a versatile camera kit for portraits, travel, and everyday creativity.",
  },
  {
    id: "drill",
    name: "Cordless Power Drill",
    category: "Power Tools",
    image: "tools",
    alt: "Cordless power drill on a workshop bench",
    rating: "4.7",
    price: 15,
    description:
      "A practical companion for home improvements, furniture assembly, and your next weekend project.",
  },
  {
    id: "tent",
    name: "Camping Tent",
    category: "Outdoor & Camping",
    image: "camping",
    alt: "Camping tent set up outdoors",
    rating: "4.6",
    price: 20,
    description:
      "Make room for your next outdoor adventure with a tent for a weekend away.",
  },
  {
    id: "speaker",
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    image: "speaker",
    alt: "Portable wireless speaker",
    rating: "4.8",
    price: 30,
    description:
      "Bring the soundtrack to your next gathering with a portable speaker that is easy to take along.",
  },
];


export type LandingCategory = { id: string; name: string; description: string; image: string };
export type Testimonial = { id: string; name: string; role: string; initials: string; quote: string };
export function categoryImage(name: string): string {
  const images: Record<string, string> = {
    Construction: "construction", Photography: "camera", "Party & Events": "events", Events: "events",
    "Power Tools": "tools", "Hand Tools": "tools", Tools: "tools", Automotive: "tools",
    "Outdoor & Camping": "camping", "Sports & Recreation": "camping",
    Gardening: "agriculture", Agriculture: "agriculture", Electronics: "speaker",
  };
  return `/images/landing/${images[name] ?? "tools"}.jpg`;
}
export function imageSource(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const src = value.trim();
  return /^https?:\/\//i.test(src) || (src.startsWith("/") && !src.startsWith("//")) ? src : fallback;
}
export function formatPrice(price: number, currency = "USD"): string {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.trim().toUpperCase() || "USD", maximumFractionDigits: 2 }).format(price); }
  catch { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price); }
}
