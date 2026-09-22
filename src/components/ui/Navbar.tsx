"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { logoutAction } from "@/src/app/(auth)/logout/actions";
import Icon from "../landing/Icon";
import styles from "../landing/landing.module.css";

const links = [
  { href: "#equipment", label: "Browse Equipment" },
  { href: "#categories", label: "Categories" },
  { href: "#how-it-works", label: "How It Works" },
];

function AccountLinks({
  userName,
  onNavigate,
}: {
  userName: string | null;
  onNavigate?: () => void;
}) {
  const [state, action, pending] = useActionState(logoutAction, null);

  if (!userName) {
    return (
      <>
        <Link href="/login" className={styles.navLink} onClick={onNavigate}>
          Log In
        </Link>
        <Link
          href="/register"
          className={`${styles.button} ${styles.primary}`}
          onClick={onNavigate}
        >
          Get Started
          <Icon name="arrow" width={16} height={16} />
        </Link>
      </>
    );
  }

  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <>
      <Link
        href="/dashboard"
        aria-label={`${userName} — Go to dashboard`}
        className={`${styles.navLink} min-w-0 gap-2`}
        onClick={onNavigate}
      >
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="max-w-32 truncate" title={userName}>{userName}</span>
      </Link>
      <form action={action} className="relative shrink-0">
        <button type="submit" disabled={pending} className={`${styles.navLink} disabled:cursor-wait disabled:opacity-60`}>
          {pending ? "Logging out…" : "Log Out"}
        </button>
        {state?.error && (
          <p role="alert" className="absolute right-0 top-full z-40 w-52 rounded-lg border border-red-100 bg-white p-3 text-xs text-red-700 shadow-sm">
            {state.error}
          </p>
        )}
      </form>
    </>
  );
}

export default function Navbar({ userName = null }: { userName?: string | null }) {
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
        <AccountLinks userName={userName} />
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
              <AccountLinks userName={userName} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
