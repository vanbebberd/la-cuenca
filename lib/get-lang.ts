import { cookies } from "next/headers";
import type { Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  return v === "en" || v === "pt" ? v : "es";
}
