import { Trash2 } from "lucide-react";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import type { GitInstance } from "../../../shared/lib/config/configApi";
import "./GitInstanceCard.css";

interface GitInstanceCardTranslations {
  instanceLabel: (n: number) => string;
  fields: { url: string; username: string; token: string };
  placeholders: { url: string; username: string; token: string };
  removeAriaLabel: string;
}

interface GitInstanceCardProps {
  instance: GitInstance;
  index: number;
  onUpdate: (id: string, field: keyof GitInstance, value: string) => void;
  onRemove: (id: string) => void;
  t: GitInstanceCardTranslations;
}

export function GitInstanceCard({
  instance,
  index,
  onUpdate,
  onRemove,
  t,
}: GitInstanceCardProps) {
  return (
    <article
      className="git-instance-card"
      aria-label={t.instanceLabel(index + 1)}
    >
      <div className="git-instance-card__header">
        <span className="git-instance-card__label">
          {t.instanceLabel(index + 1)}
        </span>
        <button
          type="button"
          className="git-instance-card__remove"
          onClick={() => onRemove(instance.id)}
          aria-label={t.removeAriaLabel}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="git-instance-card__fields">
        <FormInput
          id={`git-url-${instance.id}`}
          label={t.fields.url}
          value={instance.url}
          onChange={(v) => onUpdate(instance.id, "url", v)}
          placeholder={t.placeholders.url}
          autoComplete="off"
        />
        <FormInput
          id={`git-username-${instance.id}`}
          label={t.fields.username}
          value={instance.username}
          onChange={(v) => onUpdate(instance.id, "username", v)}
          placeholder={t.placeholders.username}
          autoComplete="off"
        />
        <FormInput
          id={`git-token-${instance.id}`}
          label={t.fields.token}
          type="password"
          value={instance.token}
          onChange={(v) => onUpdate(instance.id, "token", v)}
          placeholder={t.placeholders.token}
          autoComplete="new-password"
        />
      </div>
    </article>
  );
}
