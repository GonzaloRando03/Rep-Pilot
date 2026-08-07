import { GitBranch, Upload } from "lucide-react";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./Step0SourceSelect.css";

export type SourceType = "git" | "upload";

interface Step0SourceSelectProps {
  t: Translations["catalog"]["addResource"]["step0"];
  onSelect: (type: SourceType) => void;
}

export function Step0SourceSelect({ t, onSelect }: Step0SourceSelectProps) {
  return (
    <div className="step0-source">
      <p className="step0-source__heading">{t.heading}</p>
      <div className="step0-source__options">
        <button
          type="button"
          className="step0-source__option"
          onClick={() => onSelect("git")}
        >
          <span className="step0-source__option-icon">
            <GitBranch size={24} aria-hidden="true" />
          </span>
          <span className="step0-source__option-body">
            <span className="step0-source__option-title">{t.git.title}</span>
            <span className="step0-source__option-description">
              {t.git.description}
            </span>
          </span>
        </button>

        <button
          type="button"
          className="step0-source__option"
          onClick={() => onSelect("upload")}
        >
          <span className="step0-source__option-icon">
            <Upload size={24} aria-hidden="true" />
          </span>
          <span className="step0-source__option-body">
            <span className="step0-source__option-title">{t.upload.title}</span>
            <span className="step0-source__option-description">
              {t.upload.description}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
