import Icon, { type IconName } from "./Icon";
import styles from "./landing.module.css";

const benefits: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "layers",
    title: "Convenient",
    description:
      "Everything you need, in one place. Spend less time searching and more time doing.",
  },
  {
    icon: "calendar",
    title: "Flexible",
    description:
      "A day, a weekend, or a project. Find equipment for when you actually need it.",
  },
  {
    icon: "eye",
    title: "Transparent",
    description:
      "Explore the details, compare your options, and make a decision that feels right.",
  },
  {
    icon: "people",
    title: "Community driven",
    description:
      "Good equipment deserves to be used. Connect with the people who have what you need.",
  },
];

export default function WhyGearSphere() {
  return (
    <section
      id="why-gearsphere"
      className={styles.container}
      aria-labelledby="why-heading"
    >
      <div className={styles.why}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className={styles.eyebrow}>
              Good for your plans. Great for your community.
            </p>
            <h2 id="why-heading" className={`${styles.heading} mt-3`}>
              Why GearSphere?
            </h2>
            <p className={styles.description}>
              A smarter, simpler way to find the equipment you need.
            </p>
          </div>
          <span className="hidden size-16 items-center justify-center rounded-full border border-primary/15 text-primary md:flex">
            <Icon name="leaf" width={30} height={30} />
          </span>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title}>
              <span className={`${styles.iconBox} !bg-white`}>
                <Icon name={benefit.icon} width={23} height={23} />
              </span>
              <h3 className="mt-5 text-sm font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
