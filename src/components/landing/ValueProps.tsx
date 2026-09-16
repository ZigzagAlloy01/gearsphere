import Icon, { type IconName } from "./Icon";
import styles from "./landing.module.css";

const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "Find What You Need",
    text: "Different categories. One place to find it all.",
  },
  {
    icon: "calendar",
    title: "Book With Confidence",
    text: "Choose equipment and dates that work for you.",
  },
  {
    icon: "people",
    title: "Connect With Owners",
    text: "Find your gear through a community of owners.",
  },
  {
    icon: "bolt",
    title: "Simple & Flexible",
    text: "Less complexity. More getting things done.",
  },
];

export default function ValueProps() {
  return (
    <section
      aria-label="The benefits of GearSphere"
      className={styles.valueStrip}
    >
      <div
        className={`${styles.container} grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4`}
      >
        {benefits.map((item) => (
          <div className="flex gap-3.5" key={item.title}>
            <span className={`${styles.iconBox} !size-10 !rounded-xl`}>
              <Icon name={item.icon} width={20} height={20} />
            </span>
            <div>
              <h2 className="text-[13px] font-semibold">{item.title}</h2>
              <p className="mt-1.5 max-w-52 text-xs leading-relaxed text-slate-500">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
