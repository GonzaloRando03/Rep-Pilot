import { Plus, Search, X } from "lucide-react";
import type { ResourceType } from "../../../shared/lib/resources/resourcesApi";
import { getResourceTypeLabel } from "../../../shared/lib/resources/resourcesApi";
import type { Tag } from "../../../shared/lib/resources/tagsApi";
import type { CatalogFilters as CatalogFiltersState } from "../../../shared/hooks/useResourceSearch";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import { TagDropdown } from "../../../shared/ui/TagDropdown/TagDropdown";
import "./CatalogFilters.css";

const RESOURCE_TYPES: ResourceType[] = [
  "MCP",
  "AGENT",
  "SKILL",
  "INSTRUCTION",
  "KIT",
];

interface CatalogFiltersProps {
  filters: CatalogFiltersState;
  tags: Tag[];
  tagsLoading: boolean;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: ResourceType | "") => void;
  onTagsChange: (ids: string[]) => void;
  onAddResource: () => void;
  t: Translations["catalog"];
}

export function CatalogFilters({
  filters,
  tags,
  tagsLoading,
  onSearchChange,
  onTypeChange,
  onTagsChange,
  onAddResource,
  t,
}: CatalogFiltersProps) {
  return (
    <div className="catalog-filters">
      {/* Row 1: search + add button */}
      <div className="catalog-search-row">
        <div className="catalog-search-input">
          <Search
            className="catalog-search-input__icon"
            size={16}
            aria-hidden="true"
          />
          <input
            type="search"
            className="catalog-search-input__field"
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={t.searchPlaceholder}
          />
          {filters.search && (
            <button
              type="button"
              className="catalog-search-input__clear"
              onClick={() => onSearchChange("")}
              aria-label={t.clearSearchAriaLabel}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          className="catalog-add-btn"
          onClick={onAddResource}
          aria-label={t.addResource.buttonLabel}
        >
          <Plus size={14} aria-hidden="true" />
          {t.addResource.buttonLabel}
        </button>
      </div>

      {/* Row 2: type tabs + tag dropdown */}
      <div className="catalog-filters__type-row">
        <div
          className="catalog-type-tabs"
          role="tablist"
          aria-label={t.filterByTypeAriaLabel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={filters.type === ""}
            className={`catalog-type-tab${filters.type === "" ? " catalog-type-tab--active" : ""}`}
            onClick={() => onTypeChange("")}
          >
            {t.filterAll}
          </button>
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={filters.type === type}
              className={`catalog-type-tab catalog-type-tab--${type}${filters.type === type ? " catalog-type-tab--active" : ""}`}
              onClick={() => onTypeChange(type)}
            >
              {getResourceTypeLabel(type)}
            </button>
          ))}
        </div>

        <TagDropdown
          tags={tags}
          selected={filters.tags}
          onChange={onTagsChange}
          label={t.tagDropdownLabel}
          searchPlaceholder={t.tagSearchPlaceholder}
          clearFilterAriaLabel={t.tagClearFilterAriaLabel}
          clearSearchAriaLabel={t.tagClearSearchAriaLabel}
          loadingText={t.tagLoading}
          noTagsFoundText={t.tagNoResults}
          loading={tagsLoading}
        />
      </div>
    </div>
  );
}
