import { X } from "lucide-react";
import "./Sidebar.css";
import type { LucideIcon } from "lucide-react";
import repPilotLogo from "../.././../assets/reppilot.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  icon: LucideIcon;
  externalUrl?: string;
}

interface SidebarProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, isOpen, onClose }: SidebarProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleNavigate(item: NavItem) {
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.path);
    }
    onClose();
  }

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop" aria-hidden onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="app-brand-title">
              <img
                src={repPilotLogo}
                alt="Rep-Pilot logo"
                className="app-brand-logo"
              />
              <span className="app-brand-name">REP-PILOT</span>
            </div>
            <p className="app-brand-sub">{t.sidebar.brandSub}</p>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            aria-label={t.sidebar.closeAriaLabel}
            onClick={onClose}
          >
            <X aria-hidden size={18} strokeWidth={1.8} />
          </button>
        </div>

        <nav aria-label={t.sidebar.navAriaLabel} className="menu">
          {items.map((item) => {
            const { key, path, label, icon: Icon, externalUrl } = item;
            return (
              <button
                key={key}
                type="button"
                className={`menu-item ${!externalUrl && pathname === path ? "active" : ""}`}
                onClick={() => handleNavigate(item)}
              >
                <Icon
                  className="menu-item-icon"
                  aria-hidden
                  size={16}
                  strokeWidth={1.8}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
