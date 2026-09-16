import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { MotionToggle } from "./LandingMotion";
import styles from "./landing.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className="size-1.5 rounded-full bg-primary" />
            Rent <span aria-hidden="true">·</span> List{" "}
            <span aria-hidden="true">·</span> Connect
          </p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            The right equipment,
            <br />
            <span className="text-primary">when you need it.</span>
          </h1>
          <p className="mt-6 max-w-[390px] text-base leading-relaxed text-slate-500">
            Big ideas. Weekend plans. Everyday projects.
            <br className="hidden sm:block" /> Discover, rent, and list
            equipment through one simple marketplace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#equipment"
              className={`${styles.button} ${styles.primary}`}
            >
              Browse Equipment
              <Icon name="arrow" width={17} height={17} />
            </a>
            <Link
              href="/register"
              className={`${styles.button} ${styles.secondary}`}
            >
              List Your Equipment
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Icon
                name="check"
                width={16}
                height={16}
                className="text-primary"
              />
              More possibilities. Less to own.
            </span>
            <span className="flex items-center gap-2">
              <Icon
                name="people"
                width={16}
                height={16}
                className="text-primary"
              />
              Built around community
            </span>
          </div>
        </div>
        <div
          className={styles.heroVisual}
          aria-label="Explore photography, tools, and outdoor equipment"
        >
          <div className={`${styles.heroPhoto} ${styles.heroCamera}`}>
            <Image
              src="/images/landing/camera.jpg"
              alt="Mirrorless camera and lenses ready for your next creative project"
              fill
              sizes="(max-width: 767px) 65vw, 370px"
              preload
            />
            <span className={styles.photoLabel}>
              For your next big idea.
              <Icon
                name="diagonal"
                className="float-right"
                width={18}
                height={18}
              />
            </span>
          </div>
          <div className={`${styles.heroPhoto} ${styles.heroTools}`}>
            <Image
              src="/images/landing/tools.jpg"
              alt="Power drill for home and workshop projects"
              fill
              sizes="(max-width: 767px) 35vw, 200px"
            />
            <span className={styles.photoLabel}>Make it happen.</span>
          </div>
          <div className={`${styles.heroPhoto} ${styles.heroCamping}`}>
            <Image
              src="/images/landing/camping.jpg"
              alt="Tent ready for an outdoor adventure"
              fill
              sizes="(max-width: 767px) 40vw, 240px"
            />
            <span className={styles.photoLabel}>Go a little further.</span>
          </div>
          <div className={styles.heroNote}>
            <span className={`${styles.iconBox} !size-9 !rounded-full`}>
              <Icon name="leaf" width={19} height={19} />
            </span>
            <div>
              <strong className="block text-primary">
                Great gear. Shared.
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500">
                Own less. Do more.
              </span>
            </div>
          </div>
        </div>
      </div>
      <MotionToggle />
    </section>
  );
}
