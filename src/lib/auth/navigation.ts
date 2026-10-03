const protectedRoots = [
  "/dashboard", "/browse", "/listings", "/requests", "/rentals", "/profile", "/favorites",
];

export function isProtectedPath(pathname: string) {
  const path = pathname.toLowerCase();
  return protectedRoots.some(root => path === root || path.startsWith(`${root}/`));
}

export function getLoginDestination(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") ||
      value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, "https://gearsphere.local");
    if (url.origin !== "https://gearsphere.local" || !isProtectedPath(url.pathname)) {
      return "/dashboard";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
