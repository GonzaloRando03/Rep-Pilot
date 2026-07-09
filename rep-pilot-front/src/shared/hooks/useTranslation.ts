import { useLanguage } from "../lib/i18n/LanguageContext";
import { translations } from "../lib/i18n/Translations";
import type { Translations } from "../lib/i18n/Translations";

export function useTranslation(): Translations {
  const { language } = useLanguage();
  return translations[language];
}
