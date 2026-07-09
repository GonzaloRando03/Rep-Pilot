import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./CatalogPagination.css";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  t: Translations["catalog"];
}

export function CatalogPagination({
  page,
  totalPages,
  total,
  onPageChange,
  t,
}: CatalogPaginationProps) {
  if (totalPages <= 1 && total === 0) return null;

  return (
    <nav className="catalog-pagination" aria-label="Pagination">
      <span className="catalog-pagination__info">
        {t.pageInfo(page, totalPages, total)}
      </span>
      <div className="catalog-pagination__controls">
        <button
          type="button"
          className="catalog-pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t.prevPage}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {t.prevPage}
        </button>
        <button
          type="button"
          className="catalog-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t.nextPage}
        >
          {t.nextPage}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
