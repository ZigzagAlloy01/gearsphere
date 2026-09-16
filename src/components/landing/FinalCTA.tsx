import Link from "next/link";
import Icon from "./Icon";
import styles from "./landing.module.css";

export default function FinalCTA() {
  return (
    <section
      id="get-started"
      className={styles.container}
      aria-labelledby="cta-heading"
    >
      <div className={styles.cta}>
        <div className="grid items-center gap-9 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold tracking-[.17em] text-white/75 uppercase">
              Your next project starts here
            </p>
            <h2 id="cta-heading" className={`${styles.heading} mt-4 max-w-lg`}>
              Ready to find the equipment you need?
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
              Bring your plans to life. Explore equipment and get started with
              GearSphere.
            </p>
            <a
              href="#equipment"
              className={`${styles.button} mt-7 bg-white text-primary hover:bg-slate-100`}
            >
              Browse Equipment
              <Icon name="arrow" width={17} height={17} />
            </a>
          </div>
          <div className="border-t border-white/20 pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <Icon name="box" width={32} height={32} className="text-white/80" />
            <h3 className="mt-5 text-lg font-semibold tracking-tight">
              Great gear sitting unused?
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/80">
              Your equipment could be someone else’s next big possibility.
            </p>
            <Link
              href="/register"
              className={`${styles.button} ${styles.inverse} mt-5`}
            >
              List Your Equipment
              <Icon name="arrow" width={17} height={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
