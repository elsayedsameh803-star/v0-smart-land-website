import type { Dictionary } from "./dictionary-types";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default) as Promise<Dictionary>,
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default) as Promise<Dictionary>,
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  return locale === "ar" ? dictionaries.ar() : dictionaries.en();
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}