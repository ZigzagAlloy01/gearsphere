import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import styles from "../landing/landing.module.css";

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" aria-label="GearSphere home" className={styles.brand}>
      <Image
        src={footer ? "/GearSphere-sec-Logo.png" : "/GearSphere-Logo.png"}
        alt="GearSphere"
        width={1120}
        height={348}
        className="h-auto w-[180px] rounded-sm sm:w-[210px]"
        preload={!footer}
      />
    </Link>
  );
}

export default function Header({ userName = null }: { userName?: string | null }) {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>
      <div
        className={`${styles.container} flex min-h-20 items-center justify-between gap-6`}
      >
        <Brand />
        <Navbar userName={userName} />
      </div>
    </header>
  );
}
