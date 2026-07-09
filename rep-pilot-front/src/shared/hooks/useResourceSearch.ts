import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "./useDebounce";
import {
  searchResources,
  type CatalogResource,
  type ResourceSearchResponse,
  type ResourceType,
} from "../lib/resources/resourcesApi";

export interface CatalogFilters {
  search: string;
  type: ResourceType | "";
  tags: string[];
  page: number;
}

export interface UseResourceSearchResult {
  filters: CatalogFilters;
  effectiveSearch: string;
  setSearch: (v: string) => void;
  setType: (v: ResourceType | "") => void;
  setTags: (v: string[]) => void;
  setPage: (v: number) => void;
  refresh: () => void;
  data: ResourceSearchResponse | null;
  resources: CatalogResource[];
  isLoading: boolean;
  error: string | null;
}

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

function readFiltersFromParams(params: URLSearchParams): CatalogFilters {
  return {
    search: params.get("search") ?? "",
    type: (params.get("type") as ResourceType | "") ?? "",
    tags: params.getAll("tag"),
    page: Math.max(1, Number(params.get("page") ?? "1") || 1),
  };
}

export function useResourceSearch(): UseResourceSearchResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>(() =>
    readFiltersFromParams(searchParams),
  );
  const [data, setData] = useState<ResourceSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const effectiveSearch = useDebounce(filters.search, DEBOUNCE_MS);

  // Sync internal state when URL changes externally (e.g. topbar navigation)
  useEffect(() => {
    setFilters(readFiltersFromParams(searchParams));
  }, [searchParams]);

  // Write filters back to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (effectiveSearch) params.set("search", effectiveSearch);
    if (filters.type) params.set("type", filters.type);
    filters.tags.forEach((tag) => params.append("tag", tag));
    if (filters.page > 1) params.set("page", String(filters.page));
    setSearchParams(params, { replace: true });
  }, [effectiveSearch, filters.type, filters.tags, filters.page]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setType = useCallback((type: ResourceType | "") => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setFilters((prev) => ({ ...prev, tags, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    searchResources({
      search: effectiveSearch || undefined,
      type: filters.type || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      page: filters.page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          setError(err?.message ?? "Error loading resources");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveSearch, filters.type, filters.tags, filters.page, refreshKey]);

  return {
    filters,
    effectiveSearch,
    setSearch,
    setType,
    setTags,
    setPage,
    refresh,
    data,
    resources: data?.data ?? [],
    isLoading,
    error,
  };
}

