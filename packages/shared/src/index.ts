export const appName = "GetPostFlow";

export const supportedLocales = ["en", "es", "fr", "pt", "de"] as const;

export const localeLabels: Record<(typeof supportedLocales)[number], string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  de: "German"
};

export * from "./platforms";
export * from "./pricing";
export * from "./integrations";
