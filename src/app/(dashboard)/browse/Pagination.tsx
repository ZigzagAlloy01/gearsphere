import Link from "next/link";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type Props = {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
};

function createHref(
  searchParams: SearchParams,
  page: number
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(
    ([key, value]) => {
      if (typeof value === "string") {
        params.set(key, value);
      }

      if (
        Array.isArray(value) &&
        value.length > 0
      ) {
        params.set(key, value[0]);
      }
    }
  );

  params.set(
    "page",
    String(page)
  );

  return `/browse?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (
    let page = currentPage - 1;
    page <= currentPage + 1;
    page++
  ) {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      pages.add(page);
    }
  }

  const sortedPages = Array.from(
    pages
  ).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Marketplace pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={createHref(
            searchParams,
            currentPage - 1
          )}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Previous
        </Link>
      )}

      {sortedPages.map(
        (page, index) => {
          const previous =
            sortedPages[index - 1];

          return (
            <div
              key={page}
              className="flex items-center gap-2"
            >
              {previous &&
                page - previous > 1 && (
                  <span className="px-1 text-slate-400">
                    ...
                  </span>
                )}

              <Link
                href={createHref(
                  searchParams,
                  page
                )}
                className={
                  page === currentPage
                    ? "rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
                    : "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                }
              >
                {page}
              </Link>
            </div>
          );
        }
      )}

      {currentPage < totalPages && (
        <Link
          href={createHref(
            searchParams,
            currentPage + 1
          )}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}