import Link from "next/link";
import { Brand } from "./header";
import Icon from "../landing/Icon";
import styles from "../landing/landing.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Brand footer />
            <p className="mt-4 text-sm text-slate-200">
              Equipment rental made simple.
            </p>
            <p className="mt-3 max-w-64 text-xs leading-6 text-slate-300">
              A little less owning.
              <br />A whole lot more possibility.
            </p>
          </div>
          <nav aria-label="Explore">
            <h2 className="mb-3 text-xs font-semibold">Explore</h2>
            <a href="#equipment" className={styles.footerLink}>
              Browse Equipment
            </a>
            <a href="#categories" className={styles.footerLink}>
              Categories
            </a>
            <a href="#how-it-works" className={styles.footerLink}>
              How It Works
            </a>
          </nav>
          <nav aria-label="Account">
            <h2 className="mb-3 text-xs font-semibold">Your account</h2>
            <Link href="/login" className={styles.footerLink}>
              Log In
            </Link>
            <Link href="/register" className={styles.footerLink}>
              Sign Up
            </Link>
            <Link href="/register" className={styles.footerLink}>
              List Your Equipment
            </Link>
          </nav>
          <nav aria-label="About GearSphere">
            <h2 className="mb-3 text-xs font-semibold">GearSphere</h2>
            <a href="#why-gearsphere" className={styles.footerLink}>
              About GearSphere
            </a>
            <a href="#get-started" className={styles.footerLink}>
              Join the community
            </a>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-6 text-[11px] text-slate-300">
          <p>© {new Date().getFullYear()} GearSphere. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Icon name="leaf" width={14} height={14} />
            More shared. More possible.
          </p>
        </div>
      </div>
    </footer>
  );
}
