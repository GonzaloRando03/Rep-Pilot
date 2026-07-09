import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, PackageSearch } from "lucide-react";
import { useResourceSearch } from "../../shared/hooks/useResourceSearch";
import { useTags } from "../../shared/hooks/useTags";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { ResourceCard } from "../../shared/ui/ResourceCard/ResourceCard";
import { CatalogFilters } from "./components/CatalogFilters";
import { CatalogPagination } from "./components/CatalogPagination";
import { AddResourceModal } from "./components/AddResourceModal";
import "./CatalogPage.css";

export function CatalogPage() {
  const {
    filters,
    setSearch,
    setType,
    setTags,
    setPage,
    refresh,
    data,
    resources,
    isLoading,
    error,
  } = useResourceSearch();

  const { tags, isLoading: tagsLoading } = useTags();
  const t = useTranslation();
  const tc = t.catalog;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="catalog-page">
      <CatalogFilters
        filters={filters}
        tags={tags}
        tagsLoading={tagsLoading}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onTagsChange={setTags}
        onAddResource={() => setIsAddModalOpen(true)}
        t={tc}
      />

      {error ? (
        <div className="catalog-feedback catalog-feedback--error" role="alert">
          <AlertTriangle size={24} aria-hidden="true" />
          <div>
            <p className="catalog-feedback__title">{tc.errorTitle}</p>
            <p className="catalog-feedback__desc">{tc.errorDescription}</p>
          </div>
        </div>
      ) : (
        <>
          <section
            className="catalog-grid"
            aria-label="Resources"
            aria-busy={isLoading}
          >
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ResourceCard key={i} loading />
              ))
            ) : resources.length === 0 ? (
              <div className="catalog-feedback catalog-feedback--empty">
                <PackageSearch size={32} aria-hidden="true" />
                <div>
                  <p className="catalog-feedback__title">{tc.noResults}</p>
                  <p className="catalog-feedback__desc">
                    {tc.noResultsDescription}
                  </p>
                </div>
              </div>
            ) : (
              resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  name={resource.name}
                  type={resource.type}
                  description={resource.description}
                  tags={resource.tags.map((t) =>
                    typeof t === "string" ? t : t.name,
                  )}
                  stars={resource.stars.length}
                  createdAt={resource.createdAt}
                  onClick={() => navigate(`/resources/${resource.id}`)}
                />
              ))
            )}
          </section>

          {!isLoading && data && resources.length > 0 && (
            <CatalogPagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
              t={tc}
            />
          )}
        </>
      )}

      {isAddModalOpen && (
        <AddResourceModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            refresh();
          }}
          t={tc.addResource}
        />
      )}
    </div>
  );
}
