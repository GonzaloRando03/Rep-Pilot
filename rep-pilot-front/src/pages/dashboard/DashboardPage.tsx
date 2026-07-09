import { useNavigate } from "react-router-dom";
import { useResourceSummary } from "../../shared/hooks/useResourceSummary";
import { useResourceHighlights } from "../../shared/hooks/useResourceHighlights";
import { KpiCard } from "../../shared/ui/KpiCard/KpiCard";
import "./DashboardPage.css";
import { ResourceCard } from "../../shared/ui/ResourceCard/ResourceCard";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { useLanguage } from "../../shared/lib/i18n/LanguageContext";
import { formatRelativeTime } from "../../shared/lib/date/formatRelativeTime";

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useResourceSummary();
  const { data: highlights, isLoading: highlightsLoading } =
    useResourceHighlights();
  const t = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const kpiItems = [
    {
      label: t.dashboard.kpi.totalResources,
      value: summaryLoading ? "—" : String(summary?.totalRecord ?? 0),
      meta: t.dashboard.kpi.totalResourcesMeta,
    },
    {
      label: t.dashboard.kpi.agents,
      value: summaryLoading ? "—" : String(summary?.totalAgents ?? 0),
      meta: t.dashboard.kpi.agentsMeta,
    },
    {
      label: t.dashboard.kpi.skills,
      value: summaryLoading ? "—" : String(summary?.totalSkills ?? 0),
      meta: t.dashboard.kpi.skillsMeta,
    },
    {
      label: t.dashboard.kpi.mcpServers,
      value: summaryLoading ? "—" : String(summary?.totalMcp ?? 0),
      meta: t.dashboard.kpi.mcpServersMeta,
    },
  ];

  return (
    <>
      <section className="kpi-grid" aria-label={t.dashboard.kpiSection}>
        {kpiItems.map((item) => (
          <KpiCard key={item.label} {...item} loading={summaryLoading} />
        ))}
      </section>

      <section
        className="content-grid"
        aria-label={t.dashboard.activitySection}
      >
        <div className="featured-column">
          <div className="section-heading">
            <h3>{t.dashboard.featured.heading}</h3>
            <button
              type="button"
              className="ghost-link"
              onClick={() => navigate("/catalog")}
            >
              {t.dashboard.featured.browseCatalog}
            </button>
          </div>

          <div className="featured-grid">
            {highlightsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <ResourceCard key={i} loading />
              ))
            ) : (highlights?.bestResources ?? []).length === 0 ? (
              <p className="featured-empty">{t.dashboard.featured.empty}</p>
            ) : (
              (highlights?.bestResources ?? []).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  name={resource.name}
                  type={resource.type}
                  description={resource.description}
                  tags={resource.tags.map((t) =>
                    typeof t === "string" ? t : t.name,
                  )}
                  onClick={() => navigate(`/resources/${resource.id}`)}
                />
              ))
            )}
          </div>
        </div>

        <aside className="recent-column">
          <h3>{t.dashboard.recent.heading}</h3>
          <ul className="recent-list">
            {highlightsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="recent-item recent-item--skeleton">
                  <div>
                    <p className="recent-name skeleton-line" />
                    <p className="recent-type skeleton-line skeleton-line--short" />
                  </div>
                </li>
              ))
            ) : (highlights?.lastResources ?? []).length === 0 ? (
              <p className="recent-empty">{t.dashboard.recent.empty}</p>
            ) : (
              (highlights?.lastResources ?? []).map((item) => (
                <li
                  key={item.id}
                  className="recent-item"
                  onClick={() => navigate(`/resources/${item.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      navigate(`/resources/${item.id}`);
                  }}
                >
                  <div>
                    <p className="recent-name">{item.name}</p>
                    <p className="recent-type">{item.type}</p>
                  </div>
                  <span className="recent-age">
                    {formatRelativeTime(item.createdAt, language)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </aside>
      </section>
    </>
  );
}
