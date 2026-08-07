import { useNavigate } from "react-router-dom";
import { Calendar, Folder, Users } from "lucide-react";
import type { ProjectResponse } from "../../../shared/lib/projects/projectsApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./ProjectCard.css";

interface ProjectCardProps {
  project: ProjectResponse;
  t: Translations["projects"]["card"];
}

export function ProjectCard({ project, t }: ProjectCardProps) {
  const navigate = useNavigate();
  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <article
      className="project-card project-card--clickable"
      onClick={() => navigate(`/projects/${project.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/projects/${project.id}`);
        }
      }}
      aria-label={`${project.name} — ${project.rootFolderName}`}
    >
      <div className="project-card__header">
        <h3 className="project-card__name">{project.name}</h3>
        <span className="project-card__root-badge">
          <Folder size={12} aria-hidden="true" />
          {project.rootFolderName}
        </span>
      </div>

      <div className="project-card__meta">
        <span className="project-card__meta-item">
          <Users size={13} aria-hidden="true" />
          {t.membersCount(project.members.length)}
        </span>
        <span className="project-card__meta-item">
          <Calendar size={13} aria-hidden="true" />
          {formattedDate}
        </span>
      </div>

      <div className="project-card__footer">
        <span className="project-card__created-by">
          {t.createdBy} {project.createdBy.name}
        </span>
        <div className="project-card__members">
          {project.members.slice(0, 3).map((m) => (
            <span key={m.id} className="project-card__member-chip">
              {m.name || m.username}
            </span>
          ))}
          {project.members.length > 3 && (
            <span className="project-card__member-more">
              +{project.members.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
