import "./EmptyState.css";
import "./EmptyState.button.css";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <article className="empty-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{description}</p>
      {action && (
        <button type="button" className="deploy-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </article>
  );
}
