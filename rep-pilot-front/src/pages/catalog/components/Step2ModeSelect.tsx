import { Bot, Layers, Package, Plug } from "lucide-react";
import type { RepositoryScanResponse } from "../../../shared/lib/resources/repositoryApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./Step2ModeSelect.css";

export type AddMode = "individual" | "agent" | "kit" | "mcp";

interface ModeOption {
  id: AddMode;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step2ModeSelectProps {
  scanResult: RepositoryScanResponse;
  t: Translations["catalog"]["addResource"]["step2"];
  onSelect: (mode: AddMode) => void;
}

export function Step2ModeSelect({
  scanResult,
  t,
  onSelect,
}: Step2ModeSelectProps) {
  const total =
    scanResult.agents.length +
    scanResult.skills.length +
    scanResult.instructions.length;

  const options: ModeOption[] = [];

  if (total > 0) {
    options.push({
      id: "individual",
      icon: <Layers size={20} aria-hidden="true" />,
      title: t.individual.title,
      description: t.individual.description,
    });
  }

  if (scanResult.agents.length > 0) {
    options.push({
      id: "agent",
      icon: <Bot size={20} aria-hidden="true" />,
      title: t.agent.title,
      description: t.agent.description,
    });
  }

  if (total > 1) {
    options.push({
      id: "kit",
      icon: <Package size={20} aria-hidden="true" />,
      title: t.kit.title,
      description: t.kit.description,
    });
  }

  if (total === 0) {
    options.push({
      id: "mcp",
      icon: <Plug size={20} aria-hidden="true" />,
      title: t.mcp.title,
      description: t.mcp.description,
    });
  }

  return (
    <div className="step2">
      <p className="step2__heading">{t.heading}</p>
      <div className="step2__options">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="step2__option"
            onClick={() => onSelect(opt.id)}
          >
            <span className="step2__option-icon">{opt.icon}</span>
            <span className="step2__option-body">
              <span className="step2__option-title">{opt.title}</span>
              <span className="step2__option-description">
                {opt.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
