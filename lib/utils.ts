import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceRangeLabel(range: string | null): string {
  const map: Record<string, string> = {
    BUDGET: "$",
    MODERATE: "$$",
    EXPENSIVE: "$$$",
    LUXURY: "$$$$",
  };
  return range ? map[range] ?? "" : "";
}

export function levelFromLifetime(lifetime: number): string {
  if (lifetime >= 10000) return "diamond";
  if (lifetime >= 5000) return "gold";
  if (lifetime >= 1000) return "silver";
  return "bronze";
}

export function uberDeepLink(lat: number, lng: number, name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encoded}`;
}
