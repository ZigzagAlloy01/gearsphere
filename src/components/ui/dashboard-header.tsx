import Link from "next/link";
import { Brand } from "./header";
import styles from "../landing/landing.module.css";

export default function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Brand />

        <nav
          aria-label="Dashboard navigation"
          className="flex flex-wrap items-center gap-6"
        >
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>

          <Link href="/browse" className={styles.navLink}>
            Browse
          </Link>

          <Link href="/listings" className={styles.navLink}>
            My Listings
          </Link>

          <Link href="/Profile" className={styles.navLink}>
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
