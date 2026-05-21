import { usePathname } from "next/navigation";
import { pageDesign } from "@/constants/page-design";

export function usePageBackground() {
  const pathname = usePathname();
  const page = pageDesign.find((p) => {
    const path = p.name === "home" ? "/" : `/${p.name}`;
    return p.exact ? pathname === path : pathname.startsWith(`/${p.name}`);
  });
  return page?.src ?? null;
}
