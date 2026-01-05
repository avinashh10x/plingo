import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function htmlToPlainText(html: string) {
  if (!html) return "";
  // Browser-only utility (this app runs client-side)
  if (typeof window === "undefined") return html;

  const el = document.createElement("div");
  el.innerHTML = html;

  const text = el.textContent ?? el.innerText ?? "";
  return text.replace(/\s+/g, " ").trim();
}
