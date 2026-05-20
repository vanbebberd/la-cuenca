"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LANGS = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const [current, setCurrent] = useState("es");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    if (match) setCurrent(match[1]);
  }, []);

  function setLang(lang: string) {
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    setCurrent(lang);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
            current === l.code
              ? "text-emerald-700 bg-emerald-50"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
