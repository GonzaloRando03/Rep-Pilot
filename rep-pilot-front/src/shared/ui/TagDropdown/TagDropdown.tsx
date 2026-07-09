import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Tag } from "../../lib/resources/tagsApi";
import "./TagDropdown.css";

interface TagDropdownProps {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
  label: string;
  searchPlaceholder: string;
  clearFilterAriaLabel: string;
  clearSearchAriaLabel: string;
  loadingText: string;
  noTagsFoundText: string;
  loading?: boolean;
}

export function TagDropdown({
  tags,
  selected,
  onChange,
  label,
  searchPlaceholder,
  clearFilterAriaLabel,
  clearSearchAriaLabel,
  loadingText,
  noTagsFoundText,
  loading = false,
}: TagDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const buttonLabel =
    selected.length > 0 ? `${label} (${selected.length})` : label;

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  function clearAll() {
    onChange([]);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="tag-dropdown" ref={containerRef}>
      <button
        type="button"
        className={[
          "tag-dropdown__trigger",
          open ? "tag-dropdown__trigger--open" : "",
          selected.length > 0 ? "tag-dropdown__trigger--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
      >
        <span className="tag-dropdown__label">{buttonLabel}</span>
        {selected.length > 0 && (
          <span
            className="tag-dropdown__clear"
            role="button"
            aria-label={clearFilterAriaLabel}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                clearAll();
              }
            }}
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
        <ChevronDown
          className={[
            "tag-dropdown__chevron",
            open ? "tag-dropdown__chevron--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          size={14}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="tag-dropdown__panel"
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="tag-dropdown__search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="tag-dropdown__search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={searchPlaceholder}
            />
            {search && (
              <button
                type="button"
                className="tag-dropdown__search-clear"
                onClick={() => setSearch("")}
                aria-label={clearSearchAriaLabel}
              >
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </div>

          <ul className="tag-dropdown__list">
            {loading ? (
              <li className="tag-dropdown__empty">{loadingText}</li>
            ) : filtered.length === 0 ? (
              <li className="tag-dropdown__empty">{noTagsFoundText}</li>
            ) : (
              filtered.map((tag) => {
                const checked = selected.includes(tag.id);
                return (
                  <li
                    key={tag.id}
                    className="tag-dropdown__item"
                    role="option"
                    aria-selected={checked}
                  >
                    <label className="tag-dropdown__item-label">
                      <input
                        type="checkbox"
                        className="tag-dropdown__checkbox"
                        checked={checked}
                        onChange={() => toggle(tag.id)}
                      />
                      <span className="tag-dropdown__item-name">
                        {tag.name}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
