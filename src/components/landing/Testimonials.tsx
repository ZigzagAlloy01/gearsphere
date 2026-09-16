import styles from "./landing.module.css";

const localTestimonials = [
  {
    name: "Alex",
    role: "Renter",
    initials: "AL",
    quote:
      "GearSphere made it much easier to find the equipment I needed for my project.",
  },
  {
    name: "Daniel",
    role: "Equipment owner",
    initials: "DA",
    quote:
      "I had equipment sitting unused. GearSphere gives me a way to make it available to people who need it.",
  },
  {
    name: "Sarah",
    role: "Renter",
    initials: "SA",
    quote:
      "Finding and comparing equipment is much simpler when everything is in one place.",
  },
];

import type { Testimonial } from "./data";

export default function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  const demo = testimonials.length === 0;
  const people = demo ? localTestimonials.map((person) => ({ ...person, id: person.name })) : testimonials;
  return (
    <section
      className={`${styles.container} ${styles.section}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="text-center">
        <p className={`${styles.eyebrow} justify-center`}>
          Built for people like you
        </p>
        <h2 id="testimonials-heading" className={`${styles.heading} mt-3`}>
          What our users say
        </h2>
        <p className={styles.description}>
          A glimpse of the experiences we’re building for.
        </p>
        {demo && <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
          Demo testimonials · Illustrative stories
        </span>}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {people.map((person) => (
          <figure key={person.id} className={styles.testimonial}>
            <span
              aria-hidden="true"
              className="h-8 font-serif text-5xl leading-none text-primary/35"
            >
              “
            </span>
            <blockquote className="mt-3 flex-1 text-sm leading-7 text-secondary">
              {person.quote}
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full bg-primary/8 text-xs font-semibold text-primary"
              >
                {person.initials}
              </span>
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{person.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
