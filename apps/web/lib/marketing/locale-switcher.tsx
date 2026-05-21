"use client";

import { useRouter, usePathname } from "next/navigation";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "pt", label: "PT" },
  { code: "de", label: "DE" },
] as const;

export function LocaleSwitcher({ currentLocale = "en" }: { currentLocale?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(locale: string) {
    // Store preference in cookie and reload — lightweight approach for v1
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((locale) => (
        <button
          key={locale.code}
          onClick={() => handleChange(locale.code)}
          className="px-2 py-0.5 text-xs font-semibold rounded transition hover:opacity-80"
          style={{
            color: locale.code === currentLocale ? "#2F5D62" : "#5E6472",
            background: locale.code === currentLocale ? "#EFE7DA" : "transparent",
          }}
        >
          {locale.label}
        </button>
      ))}
    </div>
  );
}
