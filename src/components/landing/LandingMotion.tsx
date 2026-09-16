"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./landing.module.css";

const MotionContext = createContext({ paused: false, toggle: () => {} });

export function MotionToggle() {
  const { paused, toggle } = useContext(MotionContext);
  return (
    <button
      type="button"
      className={styles.motionToggle}
      onClick={toggle}
      aria-pressed={paused}
    >
      <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
      {paused ? "Play animations" : "Pause animations"}
    </button>
  );
}

export default function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const seen = useRef(new WeakSet<Element>());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const animations = new Set<Animation>();

    function stop() {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }

    function setup() {
      stop();
      if (!element) return;
      element.dataset.motionEnabled = String(!preference.matches);
      if (preference.matches || paused || !("IntersectionObserver" in window))
        return;

      const hero = element.querySelector("." + styles.hero);
      const targets = element.querySelectorAll(
        [
          styles.categoryCard,
          styles.step,
          styles.equipmentCard,
          styles.testimonial,
          styles.why,
          styles.cta,
        ]
          .map((name) => "." + name)
          .join(","),
      );
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target === hero) {
              element.dataset.heroVisible = String(entry.isIntersecting);
              continue;
            }
            if (!entry.isIntersecting || seen.current.has(entry.target))
              continue;
            seen.current.add(entry.target);
            observer?.unobserve(entry.target);
            // Content stays visible without JavaScript; animate only as it enters view.
            if (entry.target.contains(document.activeElement)) continue;
            const index = Array.from(
              entry.target.parentElement?.children ?? [],
            ).indexOf(entry.target);
            const animation = entry.target.animate(
              [
                { opacity: 0, translate: "0 24px" },
                { opacity: 1, translate: "0 0" },
              ],
              {
                duration: 650,
                delay: Math.min(index, 5) * 75,
                easing: "cubic-bezier(.22,1,.36,1)",
                fill: "backwards",
              },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          }
        },
        { threshold: 0.12 },
      );
      targets.forEach((target) => observer?.observe(target));
      if (hero) observer.observe(hero);
    }

    function onFocus(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      animations.forEach((animation) => {
        const animated = (animation.effect as KeyframeEffect | null)?.target;
        if (animated instanceof Element && animated.contains(target))
          animation.finish();
      });
    }

    setup();
    preference.addEventListener("change", setup);
    element.addEventListener("focusin", onFocus);
    return () => {
      stop();
      preference.removeEventListener("change", setup);
      element.removeEventListener("focusin", onFocus);
    };
  }, [paused]);

  return (
    <MotionContext.Provider
      value={{ paused, toggle: () => setPaused((value) => !value) }}
    >
      <main
        ref={root}
        id="main-content"
        tabIndex={-1}
        data-motion-paused={paused}
      >
        {children}
      </main>
    </MotionContext.Provider>
  );
}
