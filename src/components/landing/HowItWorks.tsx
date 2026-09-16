import Icon, { type IconName } from "./Icon";
import styles from "./landing.module.css";

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "Find your perfect gear",
    text: "Explore the categories and find the right equipment for what you have in mind.",
  },
  {
    icon: "calendar",
    title: "Book it for your plans",
    text: "Choose your dates and reserve available equipment with the owner.",
  },
  {
    icon: "check",
    title: "Get out there. Get it done.",
    text: "Pick up your equipment, bring your plans to life, and return it when you’re done.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`${styles.section} ${styles.process}`}
      aria-labelledby="how-heading"
    >
      <div className={styles.container}>
        <div className="text-center">
          <p className={`${styles.eyebrow} justify-center`}>
            Less hassle. More doing.
          </p>
          <h2 id="how-heading" className={`${styles.heading} mt-3`}>
            How GearSphere works
          </h2>
          <p className={styles.description}>
            From finding it to using it, in three simple steps.
          </p>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`${styles.step} flex gap-5 md:block`}
            >
              <div
                className={`${styles.iconBox} relative z-10 !size-[60px] !rounded-2xl !bg-white ring-1 ring-primary/10`}
              >
                <Icon name={step.icon} width={27} height={27} />
                <span className={styles.stepNumber}>0{index + 1}</span>
              </div>
              <div className="md:mt-6">
                <h3 className="text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-72 text-sm leading-7 text-slate-500">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
