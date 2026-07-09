import { Languages, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Language, LANGUAGE_LABELS } from "../../lib/language/Language";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import "./Topbar.css";

interface TopbarProps {
  title: string;
  onMenuToggle: () => void;
  onLogout?: () => void;
  onLanguageChange?: (language: Language) => void;
  onSearch?: (query: string) => void;
  onProfile?: () => void;
}

export function Topbar({
  title,
  onMenuToggle,
  onLogout,
  onLanguageChange,
  onSearch,
  onProfile,
}: TopbarProps) {
  const { language } = useLanguage();
  const t = useTranslation();
  const [searchValue, setSearchValue] = useState("");

  function handleLanguageToggle() {
    if (!onLanguageChange) return;
    const next = language === Language.Es ? Language.En : Language.Es;
    onLanguageChange(next);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchValue.trim());
      setSearchValue("");
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          type="button"
          className="menu-toggle-btn"
          aria-label={t.topbar.menuAriaLabel}
          onClick={onMenuToggle}
        >
          <Menu aria-hidden size={20} strokeWidth={1.8} />
        </button>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search" aria-label={t.common.search.placeholder}>
          <Search aria-hidden size={15} strokeWidth={1.8} className="search-icon" />
          <input
            type="search"
            name="search"
            placeholder={t.common.search.placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </label>
        {onLanguageChange && (
          <button
            type="button"
            className="user-btn language-btn"
            aria-label={t.topbar.languageAriaLabel(LANGUAGE_LABELS[language])}
            onClick={handleLanguageToggle}
          >
            <Languages aria-hidden size={16} strokeWidth={1.9} />
            <span className="language-label">{LANGUAGE_LABELS[language]}</span>
          </button>
        )}
        <button
          type="button"
          className="user-btn"
          aria-label={t.topbar.userAriaLabel}
          onClick={onProfile}
        >
          <UserRound aria-hidden size={18} strokeWidth={1.9} />
        </button>
        {onLogout && (
          <button
            type="button"
            className="user-btn"
            aria-label={t.topbar.logoutAriaLabel}
            onClick={onLogout}
          >
            <LogOut aria-hidden size={18} strokeWidth={1.9} />
          </button>
        )}
      </div>
    </header>
  );
}
