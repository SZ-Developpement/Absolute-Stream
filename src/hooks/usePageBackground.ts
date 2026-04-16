import { usePathname } from "next/navigation";
import { pageDesign } from "@/data/pageDesign";

export function usePageBackground() {
  const pathname = usePathname();
  const page = pageDesign.find((p) =>
    p.exact ? pathname === `/${p.name}` : pathname.startsWith(`/${p.name}`),
  );
  return page?.src ?? null;
}
