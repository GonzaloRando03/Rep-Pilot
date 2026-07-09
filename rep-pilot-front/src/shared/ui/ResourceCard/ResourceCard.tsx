import { Star } from "lucide-react";
import { TagChip } from "../TagChip/TagChip";
import { getResourceTypeLabel } from "../../lib/resources/resourcesApi";
import "./ResourceCard.css";

interface ResourceCardProps {
  name?: string;
  type?: string;
  description?: string;
  tags?: string[];
  stars?: number;
  createdAt?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function ResourceCard({
  name,
  type,
  description,
  tags = [],
  stars,
  createdAt,
  loading = false,
  onClick,
}: ResourceCardProps) {
  if (loading) {
    return (
      <article className="resource-card resource-card--skeleton">
        <p className="resource-type-badge skeleton-line skeleton-line--short" />
        <h4 className="skeleton-line" />
        <p className="resource-description skeleton-line" />
        <p className="skeleton-line skeleton-line--short" />
      </article>
    );
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : undefined;

  return (
    <article
      className={`resource-card${onClick ? " resource-card--clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <div className="resource-card__header">
        {type && (
          <span className={`resource-type-badge resource-type-badge--${type}`}>
            {getResourceTypeLabel(type)}
          </span>
        )}
        {stars !== undefined && (
          <span className="resource-stars" aria-label={`${stars} stars`}>
            <Star size={13} aria-hidden="true" />
            {stars}
          </span>
        )}
      </div>
      <h4>{name}</h4>
      <p className="resource-description">{description}</p>
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      )}
      {formattedDate && <p className="resource-date">{formattedDate}</p>}
    </article>
  );
}
