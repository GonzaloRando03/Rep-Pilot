import { useState, useMemo } from "react";
import { AlertTriangle, FolderOpen, Plus } from "lucide-react";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { useProjects } from "../../shared/hooks/useProjects";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { ProjectCard } from "./components/ProjectCard";
import type { ProjectResponse } from "../../shared/lib/projects/projectsApi";
import "./ProjectsPage.css";

function groupProjects(
  projects: ProjectResponse[],
): Map<string, ProjectResponse[]> {
  const map = new Map<string, ProjectResponse[]>();
  for (const p of projects) {
    const key = p.group?.trim() || "";
    const list = map.get(key);
    if (list) {
      list.push(p);
    } else {
      map.set(key, [p]);
    }
  }
  return map;
}

export function ProjectsPage() {
  const t = useTranslation();
  const tp = t.projects;
  const { projects, isLoading, loadError } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const grouped = useMemo(() => groupProjects(projects), [projects]);
  const groupEntries = useMemo(
    () =>
      [...grouped.entries()].sort(([a], [b]) => {
        if (!a) return 1;
        if (!b) return -1;
        return a.localeCompare(b);
      }),
    [grouped],
  );

  return (
    <div className="projects-page">
      <header className="projects-page__header">
        <div>
          <h1 className="projects-page__title">{tp.title}</h1>
          <p className="projects-page__subtitle">{tp.subtitle}</p>
        </div>
        <button
          type="button"
          className="projects-page__add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={14} aria-hidden="true" />
          {tp.createButton}
        </button>
      </header>

      {loadError ? (
        <div
          className="projects-feedback projects-feedback--error"
          role="alert"
        >
          <AlertTriangle size={24} aria-hidden="true" />
          <div>
            <p className="projects-feedback__title">{tp.errorTitle}</p>
            <p className="projects-feedback__desc">{tp.errorDescription}</p>
          </div>
        </div>
      ) : isLoading ? (
        <section className="projects-grid" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="project-card project-card--skeleton">
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          ))}
        </section>
      ) : projects.length === 0 ? (
        <div className="projects-page__empty">
          <FolderOpen
            size={48}
            aria-hidden="true"
            className="projects-page__empty-icon"
          />
          <h2 className="projects-page__empty-title">{tp.emptyTitle}</h2>
          <p className="projects-page__empty-desc">{tp.emptyDescription}</p>
        </div>
      ) : (
        <div className="projects-sections" aria-label={tp.gridAriaLabel}>
          {groupEntries.map(([groupName, groupProjects]) => (
            <section
              key={groupName || "__ungrouped__"}
              className="projects-group"
            >
              {groupName && (
                <h2 className="projects-group__title">{groupName}</h2>
              )}
              {!groupName && groupEntries.length > 1 && (
                <h2 className="projects-group__title projects-group__title--muted">
                  {tp.ungroupedLabel}
                </h2>
              )}
              <div className="projects-grid">
                {groupProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} t={tp.card} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          t={tp.modal}
        />
      )}
    </div>
  );
}
