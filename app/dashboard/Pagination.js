import Link from "next/link";

// Server-safe pagination: pure links (?page=N), no client JS needed.
export default function Pagination({ page, totalPages, makeHref }) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="pg">
      <Link
        href={makeHref(page - 1)}
        className={`pg__btn ${prevDisabled ? "pg__btn--disabled" : ""}`}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : 0}
      >
        ← Prev
      </Link>
      <span className="pg__status">
        Page <b>{page}</b> of {totalPages}
      </span>
      <Link
        href={makeHref(page + 1)}
        className={`pg__btn ${nextDisabled ? "pg__btn--disabled" : ""}`}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : 0}
      >
        Next →
      </Link>
    </div>
  );
}
