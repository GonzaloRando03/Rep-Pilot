import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { fetchProjectGroups } from "../../lib/projects/projectsApi";
import "./GroupSelect.css";

interface GroupSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  createLabel: string;
  loadingText: string;
  noResultsText: string;
  disabled?: boolean;
}

export function GroupSelect({
  value,
  onChange,
  label,
  placeholder,
  createLabel,
  loadingText,
  noResultsText,
  disabled = false,
}: GroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchProjectGroups()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [open]);

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

  const searchLower = search.toLowerCase().trim();
  const filtered = groups.filter((g) => g.toLowerCase().includes(searchLower));
  const exactMatch = groups.some((g) => g.toLowerCase() === searchLower);
  const showCreate = searchLower.length > 0 && !exactMatch;

  function select(groupName: string) {
    onChange(groupName);
    setSearch("");
    setOpen(false);
  }

  function clear() {
    onChange("");
    setSearch("");
  }

  return (
    <div className="group-select" ref={containerRef}>
      <label className="group-select__label">{label}</label>

      <button
        type="button"
        className={[
          "group-select__trigger",
          open ? "group-select__trigger--open" : "",
          value ? "group-select__trigger--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="group-select__value">{value || placeholder}</span>
        {value && (
          <span
            className="group-select__clear"
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                clear();
              }
            }}
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
        <ChevronDown
          className={[
            "group-select__chevron",
            open ? "group-select__chevron--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          size={14}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="group-select__panel" role="listbox">
          <div className="group-select__search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="group-select__search"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={placeholder}
            />
            {search && (
              <button
                type="button"
                className="group-select__search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </div>

          <ul className="group-select__list">
            {loading ? (
              <li className="group-select__empty">{loadingText}</li>
            ) : (
              <>
                {showCreate && (
                  <li className="group-select__item group-select__item--create">
                    <button
                      type="button"
                      className="group-select__create-btn"
                      onClick={() => select(searchLower)}
                    >
                      <Plus size={14} />
                      <span>
                        {createLabel} <strong>"{searchLower}"</strong>
                      </span>
                    </button>
                  </li>
                )}

                {filtered.length === 0 && !showCreate ? (
                  <li className="group-select__empty">{noResultsText}</li>
                ) : (
                  filtered.map((groupName) => (
                    <li
                      key={groupName}
                      className={[
                        "group-select__item",
                        value === groupName
                          ? "group-select__item--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="option"
                      aria-selected={value === groupName}
                      onClick={() => select(groupName)}
                    >
                      <span className="group-select__item-name">
                        {groupName}
                      </span>
                    </li>
                  ))
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
