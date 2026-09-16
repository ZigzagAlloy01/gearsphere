"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Icon from "../landing/Icon";
import styles from "../landing/landing.module.css";

const links = [
  { href: "#equipment", label: "Browse Equipment" },
  { href: "#categories", label: "Categories" },
  { href: "#how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-8 lg:flex"
      >
        {links.map((link) => (
          <a key={link.href} href={link.href} className={styles.navLink}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="hidden items-center gap-6 lg:flex">
        <Link href="/login" className={styles.navLink}>
          Log In
        </Link>
        <Link href="/register" className={`${styles.button} ${styles.primary}`}>
          Get Started
          <Icon name="arrow" width={16} height={16} />
        </Link>
      </div>
      <button
        ref={toggle}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="grid size-11 place-items-center rounded-lg border border-slate-200 text-primary lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-6 py-5 shadow-lg lg:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          <div className="mx-auto flex max-w-xl flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex items-center gap-6 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setOpen(false)}
              >
                Get Started
                <Icon name="arrow" width={16} height={16} />
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
