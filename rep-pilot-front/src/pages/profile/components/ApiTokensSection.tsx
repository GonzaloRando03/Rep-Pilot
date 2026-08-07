import { useState, useEffect, useCallback } from "react";
import {
  fetchApiTokens,
  createApiToken,
  revokeApiToken,
  type ApiTokenResponse,
  type CreatedApiTokenResponse,
} from "../../../shared/lib/auth/tokensApi";
import { useTranslation } from "../../../shared/hooks/useTranslation";
import "./ApiTokensSection.css";

export function ApiTokensSection() {
  const t = useTranslation().profile;
  const [tokens, setTokens] = useState<ApiTokenResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [newToken, setNewToken] = useState<CreatedApiTokenResponse | null>(
    null,
  );
  const [copyLabel, setCopyLabel] = useState(t.tokens?.copyButton ?? "Copiar");

  const loadTokens = useCallback(async () => {
    setError(false);
    try {
      const data = await fetchApiTokens();
      setTokens(data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createApiToken(createName.trim());
      setNewToken(result);
      setCreateName("");
      await loadTokens();
    } catch {
      // error handled by toast in apiFetch
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    try {
      await revokeApiToken(tokenId);
      await loadTokens();
    } catch {
      // error handled by toast in apiFetch
    }
  };

  const handleCopy = async () => {
    if (!newToken) return;
    try {
      await navigator.clipboard.writeText(newToken.plainToken);
      setCopyLabel(t.tokens?.copied ?? "¡Copiado!");
      setTimeout(() => setCopyLabel(t.tokens?.copyButton ?? "Copiar"), 2000);
    } catch {
      setCopyLabel(t.tokens?.copyError ?? "Error al copiar");
      setTimeout(() => setCopyLabel(t.tokens?.copyButton ?? "Copiar"), 2000);
    }
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return t.tokens?.neverUsed ?? "Nunca";
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="api-tokens">
      <h3 className="api-tokens__title">{t.tokens?.title ?? "API Tokens"}</h3>
      <p className="api-tokens__desc">
        {t.tokens?.description ??
          "Gestiona tokens de API para herramientas externas."}
      </p>

      {/* Nuevo token generado — aviso de copia única */}
      {newToken && (
        <div className="api-tokens__new-token" role="alert">
          <p className="api-tokens__new-token-warning">
            ⚠️{" "}
            {t.tokens?.oneTimeWarning ??
              "Este token solo se muestra una vez. Cópialo ahora:"}
          </p>
          <div className="api-tokens__new-token-row">
            <code className="api-tokens__new-token-code">
              {newToken.plainToken}
            </code>
            <button
              type="button"
              className="api-tokens__copy-btn"
              onClick={() => void handleCopy()}
            >
              {copyLabel}
            </button>
          </div>
          <button
            type="button"
            className="api-tokens__dismiss-btn"
            onClick={() => setNewToken(null)}
          >
            {t.tokens?.dismiss ?? "Entendido"}
          </button>
        </div>
      )}

      {/* Formulario de creación */}
      <div className="api-tokens__create">
        <input
          type="text"
          className="api-tokens__input"
          placeholder={
            t.tokens?.namePlaceholder ??
            "Nombre del token (ej: VS Code portátil)"
          }
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleCreate();
          }}
        />
        <button
          type="button"
          className="api-tokens__create-btn"
          onClick={() => void handleCreate()}
          disabled={isCreating || !createName.trim()}
        >
          {isCreating
            ? (t.tokens?.creating ?? "Creando...")
            : (t.tokens?.createButton ?? "Generar token")}
        </button>
      </div>

      {/* Lista de tokens */}
      {isLoading && (
        <p className="api-tokens__loading">
          {t.tokens?.loading ?? "Cargando tokens..."}
        </p>
      )}

      {error && !isLoading && (
        <p className="api-tokens__error">
          {t.tokens?.loadError ?? "Error al cargar los tokens."}
        </p>
      )}

      {!isLoading && !error && tokens.length === 0 && (
        <p className="api-tokens__empty">
          {t.tokens?.empty ??
            "No tienes tokens de API. Genera uno para conectar la extensión de VS Code."}
        </p>
      )}

      {!isLoading && !error && tokens.length > 0 && (
        <ul className="api-tokens__list">
          {tokens.map((token) => (
            <li key={token.id} className="api-tokens__item">
              <div className="api-tokens__item-info">
                <span className="api-tokens__item-name">{token.name}</span>
                <span className="api-tokens__item-prefix">
                  ...{token.prefix}
                </span>
                <span className="api-tokens__item-dates">
                  {t.tokens?.lastUsed ?? "Último uso"}:{" "}
                  {formatDate(token.lastUsedAt)}
                  {" · "}
                  {t.tokens?.created ?? "Creado"}: {formatDate(token.createdAt)}
                </span>
              </div>
              <button
                type="button"
                className="api-tokens__revoke-btn"
                onClick={() => void handleRevoke(token.id)}
              >
                {t.tokens?.revoke ?? "Revocar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
