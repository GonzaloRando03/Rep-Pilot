import {
  User,
  AtSign,
  Mail,
  Shield,
  Languages,
  AlertTriangle,
  Star,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userStorage } from "../../shared/lib/auth/userStorage";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { useStarredResources } from "../../shared/hooks/useStarredResources";
import { useTwoFactor } from "../../shared/hooks/useTwoFactor";
import { usePasswordChange } from "../../shared/hooks/usePasswordChange";
import { LANGUAGE_LABELS } from "../../shared/lib/language/Language";
import { ResourceCard } from "../../shared/ui/ResourceCard/ResourceCard";
import { TwoFactorSetupModal } from "./components/TwoFactorSetupModal";
import { TwoFactorDisableModal } from "./components/TwoFactorDisableModal";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ApiTokensSection } from "./components/ApiTokensSection";
import "./ProfilePage.css";

export function ProfilePage() {
  const t = useTranslation().profile;
  const user = userStorage.get();
  const navigate = useNavigate();
  const { resources: starred, isLoading, error } = useStarredResources();
  const {
    twoFactorEnabled,
    setupOpen,
    setupQrUri,
    isConfirming,
    setupError,
    setupIsLoading,
    disableOpen,
    isDisabling,
    disableError,
    openSetup,
    closeSetup,
    confirmSetup,
    openDisable,
    closeDisable,
    confirmDisable,
  } = useTwoFactor();
  const {
    isOpen: passwordChangeOpen,
    isChanging: isChangingPassword,
    error: passwordChangeError,
    open: openPasswordChange,
    close: closePasswordChange,
    submit: submitPasswordChange,
  } = usePasswordChange();

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          <User size={40} aria-hidden="true" />
        </div>

        <div className="profile-card__info">
          <h2 className="profile-card__name">{user.name}</h2>
          {user.isAdmin && (
            <span className="profile-card__admin-badge">{t.adminBadge}</span>
          )}
        </div>

        <dl className="profile-card__fields">
          <div className="profile-card__field">
            <dt>
              <AtSign size={14} aria-hidden="true" />
              {t.username}
            </dt>
            <dd>{user.username}</dd>
          </div>

          <div className="profile-card__field">
            <dt>
              <Mail size={14} aria-hidden="true" />
              {t.email}
            </dt>
            <dd>{user.email}</dd>
          </div>

          <div className="profile-card__field">
            <dt>
              <Shield size={14} aria-hidden="true" />
              {t.role}
            </dt>
            <dd>{user.isAdmin ? t.roleAdmin : t.roleUser}</dd>
          </div>

          <div className="profile-card__field">
            <dt>
              <Languages size={14} aria-hidden="true" />
              {t.language}
            </dt>
            <dd>{LANGUAGE_LABELS[user.language]}</dd>
          </div>
        </dl>
      </div>

      <section className="profile-security">
        <h3 className="profile-security__title">
          <Lock size={16} aria-hidden="true" />
          {t.security.title}
        </h3>

        <div className="profile-security__row">
          <div className="profile-security__info">
            <span className="profile-security__label">
              {t.security.passwordLabel}
            </span>
            <span className="profile-security__status">
              {t.security.passwordDescription}
            </span>
          </div>
          <button
            type="button"
            className="profile-security__btn profile-security__btn--primary"
            onClick={openPasswordChange}
          >
            {t.security.changePasswordButton}
          </button>
        </div>

        <div className="profile-security__row">
          <div className="profile-security__info">
            <span className="profile-security__label">
              {t.security.twoFactorLabel}
            </span>
            <span
              className={`profile-security__status${twoFactorEnabled ? " profile-security__status--on" : ""}`}
            >
              {twoFactorEnabled ? (
                <CheckCircle size={12} aria-hidden="true" />
              ) : (
                <XCircle size={12} aria-hidden="true" />
              )}
              {twoFactorEnabled
                ? t.security.twoFactorEnabled
                : t.security.twoFactorDisabled}
            </span>
          </div>

          {twoFactorEnabled ? (
            <button
              type="button"
              className="profile-security__btn profile-security__btn--danger"
              onClick={openDisable}
            >
              {t.security.disableButton}
            </button>
          ) : (
            <button
              type="button"
              className="profile-security__btn profile-security__btn--primary"
              onClick={() => {
                void openSetup();
              }}
              disabled={setupIsLoading}
              aria-busy={setupIsLoading}
            >
              {setupIsLoading ? t.security.enabling : t.security.enableButton}
            </button>
          )}
        </div>
      </section>

      <ApiTokensSection />

      <section className="profile-starred">
        <h3 className="profile-starred__title">
          <Star size={16} aria-hidden="true" />
          {t.starredTitle}
        </h3>

        {isLoading && (
          <div className="profile-starred__grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <ResourceCard key={i} loading />
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="profile-starred__empty">
            <AlertTriangle size={20} aria-hidden="true" />
            <p>{t.starredError}</p>
          </div>
        )}

        {!isLoading && !error && starred.length === 0 && (
          <div className="profile-starred__empty">
            <Star size={20} aria-hidden="true" />
            <p>{t.starredEmpty}</p>
          </div>
        )}

        {!isLoading && !error && starred.length > 0 && (
          <div className="profile-starred__grid">
            {starred.map((resource) => (
              <ResourceCard
                key={resource.id}
                name={resource.name}
                type={resource.type}
                description={resource.description}
                tags={resource.tags.map((tag) => tag.name)}
                stars={resource.stars.length}
                createdAt={resource.createdAt}
                onClick={() => navigate(`/resources/${resource.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {setupOpen && (
        <TwoFactorSetupModal
          qrUri={setupQrUri}
          isConfirming={isConfirming}
          confirmError={setupError}
          onClose={closeSetup}
          onConfirm={confirmSetup}
        />
      )}

      {disableOpen && (
        <TwoFactorDisableModal
          isDisabling={isDisabling}
          disableError={disableError}
          onClose={closeDisable}
          onConfirm={confirmDisable}
        />
      )}

      {passwordChangeOpen && (
        <ChangePasswordModal
          isChanging={isChangingPassword}
          submitError={passwordChangeError}
          onClose={closePasswordChange}
          onSubmit={submitPasswordChange}
        />
      )}
    </div>
  );
}
