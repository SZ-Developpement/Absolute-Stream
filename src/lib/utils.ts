// ============================================================================
// Helper `cn` — concatène des classes Tailwind proprement
// ----------------------------------------------------------------------------
// Utilisé partout pour combiner des classes conditionnelles :
//   cn("px-4", isActive && "bg-blue-500", className)
//
// - clsx : gère les conditions (false / null / undefined ignorés)
// - twMerge : résout les conflits Tailwind (ex: "p-2 p-4" → "p-4")
// ============================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
