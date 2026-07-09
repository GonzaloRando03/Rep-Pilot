export const Language = {
  En: "en",
  Es: "es",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.En]: "EN",
  [Language.Es]: "ES",
};
